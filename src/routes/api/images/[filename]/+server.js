import { getS3Client } from '$lib/server/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export const GET = async ({ params }) => {
    const s3 = getS3Client();
    
    // If public URL is set, redirect directly to Cloudflare R2
    if (env.R2_PUBLIC_URL) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: `${env.R2_PUBLIC_URL}/images/${params.filename}`
            }
        });
    }

    if (!s3 || !env.R2_BUCKET_NAME) {
        throw error(500, 'R2 not configured');
    }

    try {
        const command = new GetObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: `images/${params.filename}`
        });

        const response = await s3.send(command);

        // Convert the readable stream to a web stream
        return new Response(response.Body, {
            headers: {
                'Content-Type': response.ContentType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000'
            }
        });
    } catch (e) {
        console.error('Failed to get image:', e);
        throw error(404, 'Image not found');
    }
};
