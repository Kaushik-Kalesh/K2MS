import { getS3Client } from '$lib/server/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import path from 'path';

export const load = async () => {
    let content = {};
    let portfolio = [];

    const s3 = getS3Client();

    const fetchFromR2 = async (key) => {
        try {
            const command = new GetObjectCommand({
                Bucket: env.R2_BUCKET_NAME,
                Key: key
            });
            const response = await s3.send(command);
            const str = await response.Body.transformToString();
            return JSON.parse(str);
        } catch (e) {
            console.error(`Failed to fetch ${key} from R2:`, e);
            return null;
        }
    };

    const fetchLocal = async (filename) => {
        try {
            const dataPath = path.resolve(process.cwd(), 'data', filename);
            const data = await fs.readFile(dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error(`Failed to read local ${filename}:`, e);
            return null;
        }
    };

    if (s3 && env.R2_BUCKET_NAME) {
        content = await fetchFromR2('content.json') || {};
        portfolio = await fetchFromR2('portfolio.json') || [];
    } else {
        // Fallback to local data/ folder if R2 is not configured
        content = await fetchLocal('content.json') || {};
        portfolio = await fetchLocal('portfolio.json') || [];
    }

    return {
        content,
        portfolio
    };
};
