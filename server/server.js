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

const fs = require('fs');

// API: Get Real Files from standard folder
app.get('/api/files', (req, res) => {
    try {
        // Read the actual project client side source folder as a demo
        const targetDir = path.join(__dirname, '../client/src');

        if (!fs.existsSync(targetDir)) {
            return res.json([]);
        }

        const items = fs.readdirSync(targetDir);

        const realFiles = items.map((item, index) => {
            const itemPath = path.join(targetDir, item);
            const stats = fs.statSync(itemPath);
            const isDir = stats.isDirectory();

            // Format size
            const sizeInBytes = stats.size;
            let formattedSize = sizeInBytes + ' B';
            if (sizeInBytes > 1024 * 1024) formattedSize = (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
            else if (sizeInBytes > 1024) formattedSize = (sizeInBytes / 1024).toFixed(1) + ' KB';
            if (isDir) formattedSize = '--';

            // Determine Icon Type
            let fileType = 'DOCUMENT';
            if (isDir) fileType = 'ARCHIVE';
            else if (item.endsWith('.js') || item.endsWith('.jsx')) fileType = 'SCRIPT';
            else if (item.endsWith('.css')) fileType = 'DESIGN';
            else if (item.includes('config')) fileType = 'SYSTEM';

            return {
                id: index + 1,
                name: item,
                size: formattedSize,
                type: fileType,
                modified: stats.mtime.toLocaleDateString(),
                owner: 'me'
            };
        });

        res.json(realFiles);

    } catch (error) {
        console.error("Failed to read directory:", error);
        res.status(500).json({ error: 'Failed to read directory' });
    }
});

// API: Get Storage Allocation
app.get('/api/storage', (req, res) => {
    res.json({
        tier: 'Operative',
        usedGB: 1.2,
        totalGB: 50,
        percentage: 2.4
    });
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
