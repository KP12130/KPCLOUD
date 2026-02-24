require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

process.on('uncaughtException', (err) => {
    console.error('FATAL UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
    process.exit(1);
});

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the client build
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', project: 'KPCloud', grid_sync: true });
});

const { s3 } = require('./config/r2');
const { ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const JSZip = require('jszip');
const upload = multer({ storage: multer.memoryStorage() });

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'kp-cloud-storage';

// Helper to determine file type from extension
const getFileType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) return 'SCRIPT';
    if (['.css', '.scss', '.html'].includes(ext)) return 'DESIGN';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'IMAGE';
    if (['.pdf', '.txt', '.doc', '.docx', '.md'].includes(ext)) return 'DOCUMENT';
    if (['.zip', '.tar', '.gz', '.rar'].includes(ext)) return 'ARCHIVE';
    if (['.json', '.yaml', '.xml', 'config'].includes(ext)) return 'SYSTEM';
    return 'DOCUMENT';
};

// API: Get Files from R2
app.get('/api/files', async (req, res) => {
    try {
        console.log("--> GET /api/files endpoint hit");
        if (!s3) {
            console.error("s3 client is undefined. Are R2 env vars set? (ACCESS_KEY_ID, SECRET_ACCESS_KEY, ACCOUNT_ID)");
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        console.log(`Executing ListObjectsV2Command for bucket: ${BUCKET_NAME}`);
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
        });

        const response = await s3.send(command);
        const items = response.Contents || [];

        const r2Files = items.map((item, index) => {
            const sizeInBytes = item.Size;
            let formattedSize = sizeInBytes + ' B';
            if (sizeInBytes > 1024 * 1024) formattedSize = (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
            else if (sizeInBytes > 1024) formattedSize = (sizeInBytes / 1024).toFixed(1) + ' KB';

            return {
                id: item.ETag || index + 1,
                name: item.Key,
                size: formattedSize,
                sizeBytes: sizeInBytes,
                type: getFileType(item.Key),
                modified: item.LastModified ? item.LastModified.toLocaleDateString() : new Date().toLocaleDateString(),
                owner: 'me'
            };
        });

        res.json(r2Files);
    } catch (error) {
        console.error("Failed to list objects in /api/files:", error.message, error.stack);
        res.status(500).json({ error: 'Failed to read from R2', details: error.message });
    }
});

// API: Upload File to R2
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        console.log("--> POST /api/upload endpoint hit");
        if (!req.file) {
            console.warn("No file object received in req.file");
            return res.status(400).json({ error: 'No file uploaded' });
        }
        if (!s3) {
            console.error("s3 client is undefined during upload.");
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const uploadKey = req.body.path || req.file.originalname;
        console.log(`Executing PutObjectCommand for file: ${uploadKey}`);
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uploadKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        });

        await s3.send(command);
        console.log("Upload successful:", uploadKey);
        res.json({ message: 'Upload successful', filename: uploadKey });
    } catch (error) {
        console.error("Upload Error in /api/upload:", error.message, error.stack);
        res.status(500).json({ error: 'Failed to upload to R2', details: error.message });
    }
});

// API: Download File from R2
app.get('/api/download/:filename(*)', async (req, res) => {
    try {
        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: req.params.filename,
            ResponseContentDisposition: `attachment; filename="${req.params.filename}"`
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        res.json({ url });
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ error: 'Failed to generate download link' });
    }
});

// API: Download Entire Folder as ZIP
app.get('/api/download-folder/:folderPath(*)', async (req, res) => {
    try {
        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const prefix = req.params.folderPath;
        if (!prefix.endsWith('/')) {
            return res.status(400).json({ error: 'FolderPath must end with a slash' });
        }

        const zip = new JSZip();
        let isTruncated = true;
        let continuationToken = undefined;
        let fileCount = 0;

        // Fetch all objects in the folder
        while (isTruncated) {
            const listCommand = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: prefix,
                ContinuationToken: continuationToken
            });
            const response = await s3.send(listCommand);

            if (response.Contents) {
                for (const item of response.Contents) {
                    if (item.Key === prefix) continue; // Skip the folder itself if it exists as an object

                    const getCommand = new GetObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: item.Key
                    });

                    const fileResponse = await s3.send(getCommand);
                    const streamToBuffer = async (stream) => {
                        return new Promise((resolve, reject) => {
                            const chunks = [];
                            stream.on('data', chunk => chunks.push(chunk));
                            stream.once('end', () => resolve(Buffer.concat(chunks)));
                            stream.once('error', reject);
                        });
                    };

                    const fileBuffer = await streamToBuffer(fileResponse.Body);
                    // Determine relative path inside the zip
                    const relativePath = item.Key.substring(prefix.length);
                    zip.file(relativePath, fileBuffer);
                    fileCount++;
                }
            }
            isTruncated = response.IsTruncated;
            continuationToken = response.NextContinuationToken;
        }

        if (fileCount === 0) {
            return res.status(404).json({ error: 'Folder is empty or not found' });
        }

        // Generate zip buffer
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

        // Return zip as attachment
        const folderName = prefix.split('/').filter(Boolean).pop() || 'folder';
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
        res.send(zipBuffer);

    } catch (error) {
        console.error("Folder Zip Error:", error);
        res.status(500).json({ error: 'Failed to generate folder zip' });
    }
});

// API: Generate Pre-signed URL for direct R2 Upload
app.post('/api/upload/presign', async (req, res) => {
    try {
        const { filename, contentType } = req.body;
        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }
        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename,
            ContentType: contentType || 'application/octet-stream'
        });

        // Generate a URL valid for 1 hour
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        res.json({ url, key: filename });
    } catch (error) {
        console.error("Presign URL Error:", error);
        res.status(500).json({ error: 'Failed to generate pre-signed URL' });
    }
});

// API: Delete File or Folder from R2
app.delete('/api/delete/:filename(*)', async (req, res) => {
    try {
        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const target = req.params.filename;
        const isFolder = target.endsWith('/');

        if (isFolder) {
            // Recursive Folder Deletion
            let isTruncated = true;
            let continuationToken = undefined;

            while (isTruncated) {
                const listCommand = new ListObjectsV2Command({
                    Bucket: BUCKET_NAME,
                    Prefix: target,
                    ContinuationToken: continuationToken
                });

                const response = await s3.send(listCommand);

                if (response.Contents && response.Contents.length > 0) {
                    const deleteCommand = new DeleteObjectsCommand({
                        Bucket: BUCKET_NAME,
                        Delete: {
                            Objects: response.Contents.map(item => ({ Key: item.Key })),
                            Quiet: true
                        }
                    });
                    await s3.send(deleteCommand);
                }

                isTruncated = response.IsTruncated;
                continuationToken = response.NextContinuationToken;
            }
            res.json({ message: 'Folder and contents deleted successfully' });
        } else {
            // Single File Deletion
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: target,
            });
            await s3.send(command);
            res.json({ message: 'File deleted successfully' });
        }
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: 'Failed to delete item(s)' });
    }
});

// API: Get Storage Allocation
app.get('/api/storage', async (req, res) => {
    try {
        if (!s3) {
            return res.json({ tier: 'Operative', usedGB: 0, totalGB: 50, percentage: 0 });
        }

        // Note: For a very large bucket, ListObjectsV2 might be too slow.
        // For this demo, we assume the bucket is small enough to list all.
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
        });

        const response = await s3.send(command);
        const items = response.Contents || [];

        let totalBytes = 0;
        items.forEach(item => {
            totalBytes += item.Size;
        });

        const usedGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(3);
        const totalGB = 1;
        const percentage = ((usedGB / totalGB) * 100).toFixed(2);

        res.json({
            tier: 'Operative',
            usedGB: parseFloat(usedGB),
            totalGB: totalGB,
            percentage: parseFloat(percentage)
        });
    } catch (error) {
        console.error("Storage Error:", error);
        res.json({ tier: 'Operative', usedGB: 0, totalGB: 50, percentage: 0 });
    }
});

// SPA Catch-all
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not Found' });
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`KPCloud Grid active on http://0.0.0.0:${PORT}`);
});
