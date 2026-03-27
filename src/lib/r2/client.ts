import { S3Client } from '@aws-sdk/client-s3';

// R2 Configuration - lazy initialization to avoid issues at module load time
let _r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!_r2Client) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKey = process.env.R2_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKey || !secretKey) {
      throw new Error('Missing R2 configuration: R2_ACCOUNT_ID, R2_ACCESS_KEY, and R2_SECRET_ACCESS_KEY are required');
    }

    _r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }
  return _r2Client;
}

// Export as both default and named export for compatibility
export { getR2Client as default };
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'neuroholistic-docs';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // e.g., pub-xxx.r2.dev
