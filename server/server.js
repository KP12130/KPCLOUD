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

// Mock Database for Files
const MOCK_FILES = [
    { id: 1, name: 'kp_core_engine_v4.2.bin', size: '1.4 GB', type: 'SYSTEM', modified: 'Oct 24, 2025', owner: 'me' },
    { id: 2, name: 'encryption_keys_prod.vault', size: '12 KB', type: 'ENCRYPTED', modified: '2 hours ago', owner: 'me' },
    { id: 3, name: 'security_protocol_delta.pdf', size: '4.8 MB', type: 'DOCUMENT', modified: '5 hours ago', owner: 'me' },
    { id: 4, name: 'kphub_resource_assets.pkg', size: '842 MB', type: 'ARCHIVE', modified: 'Oct 20, 2025', owner: 'System' },
    { id: 5, name: 'firewall_logs_node_01.txt', size: '64 MB', type: 'LOG', modified: 'Oct 18, 2025', owner: 'Network' },
    { id: 6, name: 'interface_mockup_final.psd', size: '156 MB', type: 'DESIGN', modified: 'Oct 15, 2025', owner: 'me' },
    { id: 7, name: 'grid_automation_script.sh', size: '15 KB', type: 'SCRIPT', modified: 'Oct 12, 2025', owner: 'System' },
    { id: 8, name: 'quantum_database_export.sql', size: '2.1 GB', type: 'SYSTEM', modified: 'Oct 10, 2025', owner: 'me' }
];

// API: Get Files
app.get('/api/files', (req, res) => {
    // Simulated network delay
    setTimeout(() => {
        res.json(MOCK_FILES);
    }, 300);
});

// API: Get Storage Allocation
app.get('/api/storage', (req, res) => {
    res.json({
        tier: 'Operative',
        usedGB: 32.4,
        totalGB: 50,
        percentage: 64.8 // (32.4 / 50) * 100
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
