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
            const handler = require('./api/data.js');
            await handler(req, res);
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        } else if (url === '/api/save-all' && req.method === 'POST') {
          try {
            // First run the Vercel handler to save to R2
            const handler = require('./api/save-all.js');
            await handler(req, res);
            
            // If it succeeds, also sync to local data/ for instant HMR in dev
            if (res.statusCode === 200 && req.body) {
              const { content, portfolio } = req.body;
              if (content) fsSync.writeFileSync(path.resolve(__dirname, 'data/content.json'), JSON.stringify(content, null, 2));
              if (portfolio) fsSync.writeFileSync(path.resolve(__dirname, 'data/portfolio.json'), JSON.stringify(portfolio, null, 2));
            }
          } catch (e) {
             console.error(e);
             if (!res.headersSent) {
               res.statusCode = 500;
               res.end(JSON.stringify({ error: 'Failed to run api/save-all.js' }));
             }
          }
        } else if (url === '/api/verify-pin' && req.method === 'POST') {
          try {
            const handler = require('./api/verify-pin.js');
            await handler(req, res);
          } catch (e) {
             console.error(e);
             res.statusCode = 500;
             res.end(JSON.stringify({ error: 'Failed to run api/verify-pin.js' }));
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