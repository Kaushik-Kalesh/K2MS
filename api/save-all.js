const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.ADMIN_PIN}`) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }

  try {
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const { content, portfolio } = req.body;
    
    if (content) {
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: 'content.json',
        Body: JSON.stringify(content, null, 2),
        ContentType: 'application/json',
      }));
    }
    
    if (portfolio) {
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: 'portfolio.json',
        Body: JSON.stringify(portfolio, null, 2),
        ContentType: 'application/json',
      }));
    }

    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      try {
        await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' });
        console.log('Triggered Vercel Deploy Hook');
      } catch (err) {
        console.error('Failed to trigger deploy hook:', err);
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error saving to R2:', err);
    res.status(500).json({ success: false, error: 'Failed to save to R2' });
  }
};
