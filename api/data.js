module.exports = async function handler(req, res) {
  try {
    const r2Url = process.env.R2_PUBLIC_URL || 'https://r2.k2ms.in';
    
    const [contentRes, portfolioRes] = await Promise.all([
      fetch(`${r2Url}/content.json`),
      fetch(`${r2Url}/portfolio.json`)
    ]);

    if (!contentRes.ok || !portfolioRes.ok) {
      throw new Error(`Failed to fetch from R2. Content: ${contentRes.status}, Portfolio: ${portfolioRes.status}`);
    }

    const content = await contentRes.json();
    const portfolio = await portfolioRes.json();
    
    res.status(200).json({ content, portfolio });
  } catch (err) {
    console.error('API Data Fetch Error:', err);
    res.status(500).json({ error: err.message });
  }
};
