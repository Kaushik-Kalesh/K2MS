const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${process.env.ADMIN_PIN}`) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    }

    try {
        const { filename, base64Data, contentType } = req.body;
        
        if (!filename || !base64Data) {
            return res.status(400).json({ error: 'Filename and base64Data are required' });
        }

        const s3 = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });

        if (!process.env.R2_BUCKET_NAME) {
            return res.status(500).json({ error: 'R2 not configured' });
        }

        const ext = path.extname(filename);
        const base = path.basename(filename, ext);
        const uniqueFilename = `${base}_${Date.now()}${ext}`;
        
        const buffer = Buffer.from(base64Data, 'base64');

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: `images/${uniqueFilename}`,
            Body: buffer,
            ContentType: contentType || 'application/octet-stream'
        });

        await s3.send(command);

        return res.status(200).json({ success: true, filename: uniqueFilename, url: `${process.env.R2_PUBLIC_URL}/images/${uniqueFilename}` });
    } catch (e) {
        console.error('Upload error:', e);
        return res.status(500).json({ error: e.message });
    }
};
