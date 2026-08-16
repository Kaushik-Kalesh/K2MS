module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.ADMIN_PIN}`) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  res.status(200).json({ success: true });
};
