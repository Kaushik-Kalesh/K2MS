const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
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

        const command = new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME,
            Prefix: 'images/'
        });

        const response = await s3.send(command);
        const files = (response.Contents || []).map(item => item.Key.replace('images/', ''));

        return res.status(200).json(files);
    } catch (e) {
        console.error('List images error:', e);
        return res.status(500).json({ error: e.message });
    }
};
