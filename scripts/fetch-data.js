const fs = require('fs');
const path = require('path');

const R2_URL = process.env.R2_PUBLIC_URL || 'https://r2.k2ms.in';

const https = require('https');

async function fetchAndSave(filename) {
  return new Promise((resolve) => {
    https.get(`${R2_URL}/${filename}`, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`Failed to fetch ${filename} from R2, HTTP ${res.statusCode}`);
        return resolve();
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          fs.writeFileSync(path.join(__dirname, '../data', filename), JSON.stringify(JSON.parse(data), null, 2));
          console.log(`Successfully downloaded ${filename}`);
        } catch (e) {
          console.warn(`Failed to parse/write ${filename}:`, e.message);
        }
        resolve();
      });
    }).on('error', (e) => {
      console.warn(`Failed to fetch ${filename} from R2, using local fallback:`, e.message);
      resolve();
    });
  });
}

async function main() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  
  await fetchAndSave('content.json');
  await fetchAndSave('portfolio.json');
}

main();
