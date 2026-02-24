const { S3Client } = require('@aws-sdk/client-s3');

let s3;

try {
    if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ACCOUNT_ID) {
        s3 = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });
        console.log("Cloudflare R2 Client Grid Authorized.");
    }
} catch (error) {
    console.warn("R2 Config Error:", error.message);
}

module.exports = { s3 };
