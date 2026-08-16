import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import 'dotenv/config';
import fsSync from 'node:fs';

function figmaDataApi(): Plugin {
  return {
    name: 'figma-data-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/api/data' && req.method === 'GET') {
          try {
            const content = fsSync.readFileSync(path.resolve(__dirname, 'data/content.json'), 'utf-8');
            const portfolio = fsSync.readFileSync(path.resolve(__dirname, 'data/portfolio.json'), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              content: JSON.parse(content),
              portfolio: JSON.parse(portfolio)
            }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        } else if (url === '/api/save-all' && req.method === 'POST') {
          const auth = req.headers.authorization;
          if (!auth || auth !== `Bearer ${process.env.ADMIN_PIN}`) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'UNAUTHORIZED' }));
            return;
          }
          let body = '';
          req.on('data', chunk => { body += chunk.toString() });
          req.on('end', async () => {
            try {
              const { content, portfolio } = JSON.parse(body);
              if (content) {
                fsSync.writeFileSync(path.resolve(__dirname, 'data/content.json'), JSON.stringify(content, null, 2));
              }
              if (portfolio) {
                fsSync.writeFileSync(path.resolve(__dirname, 'data/portfolio.json'), JSON.stringify(portfolio, null, 2));
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        } else if (url === '/api/images' && req.method === 'GET') {
          try {
            const handler = require('./api/images.js');
            await handler(req, res);
          } catch (e) {
             console.error(e);
             res.statusCode = 500;
             res.end(JSON.stringify({ error: 'Failed to run api/images.js' }));
          }
        } else if (url === '/api/upload-image' && req.method === 'POST') {
          try {
            const handler = require('./api/upload-image.js');
            await handler(req, res);
          } catch (e) {
             console.error(e);
             res.statusCode = 500;
             res.end(JSON.stringify({ error: 'Failed to run api/upload-image.js' }));
          }
        } else if (url === '/api/contact' && req.method === 'POST') {
          try {
            const handler = require('./api/contact.js');
            await handler(req, res);
          } catch (e) {
             console.error(e);
             res.statusCode = 500;
             res.end(JSON.stringify({ error: 'Failed to run api/contact.js' }));
          }
        } else {
          next();
        }
      });
    }
  };
}

function htmlSeoPlugin(): Plugin {
  return {
    name: 'html-seo-plugin',
    transformIndexHtml(html) {
      const contentData = JSON.parse(fsSync.readFileSync(path.resolve(__dirname, 'data/content.json'), 'utf-8'));
      return html
        .replace('<!-- SEO:title -->', contentData.metaTitle)
        .replace('<!-- SEO:description -->', contentData.metaDescription)
        .replace('<!-- SEO:ogTitle -->', contentData.metaOgTitle)
        .replace('<!-- SEO:ogDescription -->', contentData.metaOgDescription)
        .replace('<!-- SEO:ogImage -->', contentData.ogImageUrl);
    }
  };
}

export default defineConfig(({ mode }) => {
  const emitSourcemaps = mode === 'development';

  return {
    publicDir: 'static',
    define: {
      'process.env.R2_PUBLIC_URL': JSON.stringify(process.env.R2_PUBLIC_URL || 'https://r2.k2ms.in'),
    },
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      htmlSeoPlugin(),
      figmaDataApi()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
    },
  };
});