const express = require('express');
const cors = require('cors');
const path = require('path');
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
const { ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
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

        console.log(`Executing PutObjectCommand for file: ${req.file.originalname}`);
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: req.file.originalname,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        });

        await s3.send(command);
        console.log("Upload successful");
        res.json({ message: 'Upload successful', filename: req.file.originalname });
    } catch (error) {
        console.error("Upload Error in /api/upload:", error.message, error.stack);
        res.status(500).json({ error: 'Failed to upload to R2', details: error.message });
    }
});

// API: Download File from R2
app.get('/api/download/:filename', async (req, res) => {
    try {
        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: req.params.filename,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        res.json({ url });
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ error: 'Failed to generate download link' });
    }
});

// API: Delete File from R2
app.delete('/api/delete/:filename', async (req, res) => {
    try {
        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: req.params.filename,
        });
        await s3.send(command);
        res.json({ message: 'File deleted' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: 'Failed to delete file' });
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
        const totalGB = 50;
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
