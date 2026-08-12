import { json } from '@sveltejs/kit';
import { getS3Client } from '$lib/server/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import path from 'path';

export const POST = async ({ request }) => {
    const s3 = getS3Client();

    if (!s3 || !env.R2_BUCKET_NAME) {
        return json({ error: 'R2 not configured' }, { status: 500 });
    }

    try {
        const data = await request.formData();
        const file = data.get('image');

        if (!file || !(file instanceof File)) {
            return json({ error: 'No image provided' }, { status: 400 });
        }

        const ext = path.extname(file.name);
        const base = path.basename(file.name, ext);
        const uniqueFilename = `${base}_${Date.now()}${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const command = new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: `images/${uniqueFilename}`,
            Body: buffer,
            ContentType: file.type
        });

        await s3.send(command);

        return json({ success: true, filename: uniqueFilename });
    } catch (e) {
        console.error('Upload error:', e);
        return json({ error: e.message }, { status: 500 });
    }
};
