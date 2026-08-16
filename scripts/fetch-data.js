const fs = require('fs');
const path = require('path');

const R2_URL = process.env.R2_PUBLIC_URL || 'https://r2.k2ms.in';

async function fetchAndSave(filename) {
  try {
    const res = await fetch(`${R2_URL}/${filename}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    fs.writeFileSync(path.join(__dirname, '../data', filename), JSON.stringify(data, null, 2));
    console.log(`Successfully downloaded ${filename}`);
  } catch (e) {
    console.warn(`Failed to fetch ${filename} from R2, using local fallback:`, e.message);
  }
}

async function main() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  
  await fetchAndSave('content.json');
  await fetchAndSave('portfolio.json');
}

main();
