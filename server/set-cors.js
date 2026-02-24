require('dotenv').config();
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'kpcloud';

async function setCors() {
    try {
        const command = new PutBucketCorsCommand({
            Bucket: BUCKET_NAME,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ["*"],
                        AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                        AllowedOrigins: ["*"], // Allows any origin, adjust for production if needed
                        ExposeHeaders: ["ETag"],
                        MaxAgeSeconds: 3600
                    }
                ]
            }
        });
        await s3.send(command);
        console.log(`CORS configured successfully on bucket: ${BUCKET_NAME}`);
    } catch (error) {
        console.error("Error setting CORS:", error);
    }
}

setCors();
