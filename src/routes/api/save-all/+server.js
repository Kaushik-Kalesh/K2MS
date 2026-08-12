import { json } from '@sveltejs/kit';
import { getS3Client } from '$lib/server/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import path from 'path';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { content, portfolio } = body;

        const s3 = getS3Client();

        if (s3 && env.R2_BUCKET_NAME) {
            if (content) {
                await s3.send(new PutObjectCommand({
                    Bucket: env.R2_BUCKET_NAME,
                    Key: 'content.json',
                    Body: JSON.stringify(content, null, 2),
                    ContentType: 'application/json'
                }));
            }
            if (portfolio) {
                await s3.send(new PutObjectCommand({
                    Bucket: env.R2_BUCKET_NAME,
                    Key: 'portfolio.json',
                    Body: JSON.stringify(portfolio, null, 2),
                    ContentType: 'application/json'
                }));
            }
        } else {
            // Local fallback
            const dataDir = path.resolve(process.cwd(), 'data');
            await fs.mkdir(dataDir, { recursive: true });
            
            if (content) {
                await fs.writeFile(path.join(dataDir, 'content.json'), JSON.stringify(content, null, 2));
            }
            if (portfolio) {
                await fs.writeFile(path.join(dataDir, 'portfolio.json'), JSON.stringify(portfolio, null, 2));
            }
        }

        return json({ success: true });
    } catch (e) {
        console.error('Error saving data:', e);
        return json({ success: false, error: e.message }, { status: 500 });
    }
};
