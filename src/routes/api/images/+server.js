import { json } from '@sveltejs/kit';
import { getS3Client } from '$lib/server/s3';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

export const GET = async () => {
    const s3 = getS3Client();

    if (!s3 || !env.R2_BUCKET_NAME) {
        return json({ error: 'R2 not configured', images: [] }, { status: 500 });
    }

    try {
        const command = new ListObjectsV2Command({
            Bucket: env.R2_BUCKET_NAME,
            Prefix: 'images/'
        });

        const response = await s3.send(command);
        const images = [];

        if (response.Contents) {
            for (const item of response.Contents) {
                if (item.Key !== 'images/') {
                    images.push(item.Key.replace('images/', ''));
                }
            }
        }

        return json({ images });
    } catch (e) {
        console.error('Failed to list images:', e);
        return json({ error: e.message, images: [] }, { status: 500 });
    }
};
