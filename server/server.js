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

const admin = require('firebase-admin');
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper: Send Email via Resend
const sendEmail = async (to, subject, html) => {
    if (!resend || !to) {
        console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
        return;
    }
    try {
        await resend.emails.send({
            from: 'KPHub <noreply@kpcloud.online>', // Verified domain
            to: [to],
            subject: subject,
            html: html
        });
        console.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
        console.error("Email failed:", err);
    }
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        }),
    });
}
const db = admin.firestore();

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
const { ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, CopyObjectCommand } = require('@aws-sdk/client-s3');
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

// Helper: Get user storage stats (used bytes & quota)
const getUserStorageStats = async (uid) => {
    // 1. Get Quota from Firestore
    let totalGB = 1;
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            totalGB = userDoc.data().monthlyQuota || 1;
        }
    } catch (err) {
        console.error("Quota fetch error:", err);
    }

    // 2. Calculate Used Bytes from R2
    let totalBytesUsed = 0;
    if (s3) {
        let isTruncated = true;
        let continuationToken = undefined;
        while (isTruncated) {
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: `${uid}/`,
                ContinuationToken: continuationToken
            });
            const response = await s3.send(command);
            const items = response.Contents || [];
            items.forEach(item => totalBytesUsed += item.Size);
            isTruncated = response.IsTruncated;
            continuationToken = response.NextContinuationToken;
        }
    }

    const totalQuotaBytes = totalGB * 1024 * 1024 * 1024;
    return {
        usedBytes: totalBytesUsed,
        quotaBytes: totalQuotaBytes,
        quotaGB: totalGB,
        remainingBytes: Math.max(0, totalQuotaBytes - totalBytesUsed)
    };
};

// --- EMERGENCY PROTOCOL & BILLING CORE ---

// Helper: Process Billing & Purge
const processBilling = async (uid) => {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return;

    const data = userSnap.data();
    const now = Date.now();
    const lastBilling = data.lastBillingDate || now;
    const msSinceBilling = now - lastBilling;

    // --- 30-DAY SUBSCRIPTION LOGIC ---
    const monthlyQuota = data.monthlyQuota || 1;
    const paidGB = Math.max(0, monthlyQuota - 1);
    const monthlyCost = paidGB * 25;

    // 1. Anniversary Check (Run logic if 30 days passed or no billing history)
    if (msSinceBilling >= 30 * 24 * 60 * 60 * 1000 || !data.lastBillingDate) {
        if ((data.kpcBalance || 0) >= monthlyCost) {
            // Renewal Success: Deduct and restart 30-day cycle
            const updates = {
                kpcBalance: (data.kpcBalance || 0) - monthlyCost,
                lastBillingDate: now,
                kpc_status: 'active',
                suspension_start_date: admin.firestore.FieldValue.delete(),
                auto_delete_date: admin.firestore.FieldValue.delete(),
                email_sent_warning_1: admin.firestore.FieldValue.delete(),
                email_sent_warning_final: admin.firestore.FieldValue.delete()
            };
            await userRef.update(updates);
            console.log(`Subscription Renewed for ${uid} (-${monthlyCost} KPC)`);
        } else if (data.kpc_status !== 'suspended' && data.kpc_status !== 'deleted') {
            // Renewal Failure: Suspend Account
            const updates = {
                kpc_status: 'suspended',
                suspension_start_date: now,
                auto_delete_date: now + (15 * 24 * 60 * 60 * 1000)
            };
            await userRef.update(updates);

            // Phase 1 Email
            await sendEmail(data.email, "🛑 RENDSZERÜZENET: Fiókod zárolásra került!", `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ff4444; border-radius: 10px;">
                    <h2 style="color: #cc0000;">Sikertelen megújítás: Elfogyott a KPC-d.</h2>
                    <p>A havi tárhelydíjat nem tudtuk levonni, ezért fiókod zárolásra került.</p>
                    <p><strong>Hátralévő idő az adatmegsemmisítésig: 15 nap.</strong></p>
                    <p>Kérlek töltsd fel az egyenlegedet (min. ${monthlyCost} KPC) a zárolás feloldásához!</p>
                </div>
            `);
        }
    }
    // 2. Recovery Check (If suspended/deleted but user now has funds)
    else if ((data.kpc_status === 'suspended' || data.kpc_status === 'deleted') && (data.kpcBalance || 0) >= monthlyCost) {
        const updates = {
            kpcBalance: (data.kpcBalance || 0) - monthlyCost,
            lastBillingDate: now,
            kpc_status: 'active',
            suspension_start_date: admin.firestore.FieldValue.delete(),
            auto_delete_date: admin.firestore.FieldValue.delete(),
            email_sent_warning_1: admin.firestore.FieldValue.delete(),
            email_sent_warning_final: admin.firestore.FieldValue.delete()
        };
        await userRef.update(updates);
        console.log(`User ${uid} recovered from suspension via top-up.`);
    }

    // --- PHASED EMAIL NOTIFICATIONS (Warnings) ---
    if (data.kpc_status === 'suspended' && data.suspension_start_date) {
        const daysSuspended = (now - data.suspension_start_date) / (1000 * 60 * 60 * 24);

        // Phase 2: 7th Day Warning
        if (daysSuspended >= 7 && !data.email_sent_warning_1) {
            await sendEmail(data.email, "⚠️ FIGYELEM: Már csak 8 napod maradt!", `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ffaa00; border-radius: 10px;">
                    <h2>A KPHub szerverei még őrzik az adataidat.</h2>
                    <p>A türelmi idő felénél járunk. Ha nem töltöd fel az egyenleged, a fájljaid <strong>8 nap múlva</strong> véglegesen törlődnek.</p>
                </div>
            `);
            await userRef.update({ email_sent_warning_1: true });
        }

        // Phase 3: 13th Day Final Warning
        if (daysSuspended >= 13 && !data.email_sent_warning_final) {
            await sendEmail(data.email, "🚨 UTOLSÓ ESÉLY: 48 óra a törlésig!", `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ff0000; border-radius: 10px; background: #fffcfc;">
                    <h1 style="color: #ff0000;">48 ÓRA MARADT!</h1>
                    <p>Ez az utolsó automatikus üzenetünk. Holnapután éjfélkor a rendszerünk elindítja az automatikus adatmegsemmisítést.</p>
                    <p><strong>Ezt követően az adatok visszaállíthatatlanok lesznek.</strong></p>
                </div>
            `);
            await userRef.update({ email_sent_warning_final: true });
        }
    }

    // --- AUTO-PURGE LOGIC (Phase 4) ---
    if (data.kpc_status === 'suspended' && data.auto_delete_date && now > data.auto_delete_date) {
        console.log(`PURGING USER DATA for ${uid} (Quota expired)`);
        try {
            const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${uid}/` });
            const listRes = await s3.send(listCommand);
            const objects = listRes.Contents || [];

            if (objects.length > 0) {
                const deleteCommand = new DeleteObjectsCommand({
                    Bucket: BUCKET_NAME,
                    Delete: { Objects: objects.map(o => ({ Key: o.Key })) }
                });
                await s3.send(deleteCommand);
            }

            await sendEmail(data.email, "🗑️ Adatok törölve.", `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>A türelmi idő lejárt, a tárhelyedet felszabadítottuk.</h2>
                    <p>A fiókod megmaradt, így a jövőben bármikor újra használhatod a KPHub-ot, de a korábbi fájljaid már nem érhetőek el.</p>
                </div>
            `);

            await userRef.update({
                kpc_status: 'deleted',
                monthlyQuota: 1,
                kpcBalance: 0,
                email_sent_warning_1: admin.firestore.FieldValue.delete(),
                email_sent_warning_final: admin.firestore.FieldValue.delete()
            });
        } catch (purgeErr) {
            console.error("Purge failed for user:", uid, purgeErr);
        }
    }
};

// Middleware: Guard against suspended users
const billingGuard = async (req, res, next) => {
    const uid = req.query.uid || req.body.uid;
    if (!uid) return next();

    try {
        const userSnap = await db.collection('users').doc(uid).get();
        if (userSnap.exists) {
            const data = userSnap.data();

            // Allow only storage and topup if suspended
            const path = req.path;
            const isReadOp = path === '/api/files' || path === '/api/storage';
            const isPaymentOp = path === '/api/topup' || path === '/api/upload/presign' || path === '/api/upload';

            if (data.kpc_status === 'suspended' || data.kpc_status === 'deleted') {
                // Block downloads and deletes
                if (path.startsWith('/api/download') || path.startsWith('/api/delete') || path.startsWith('/api/upload')) {
                    return res.status(403).json({
                        error: 'Account Suspended',
                        status: data.kpc_status,
                        auto_delete_date: data.auto_delete_date
                    });
                }
            }
        }
    } catch (err) {
        console.error("Guard Error:", err);
    }
    next();
};

app.use(billingGuard);


// API: Get Files from R2
app.get('/api/files', async (req, res) => {
    try {
        const uid = req.query.uid;
        if (!uid) return res.status(400).json({ error: 'UID is required' });
        const prefix = `${uid}/`;

        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix
        });

        const response = await s3.send(command);
        const items = response.Contents || [];

        const r2Files = items.map((item, index) => {
            const sizeInBytes = item.Size;
            let formattedSize = sizeInBytes + ' B';
            if (sizeInBytes > 1024 * 1024) formattedSize = (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
            else if (sizeInBytes > 1024) formattedSize = (sizeInBytes / 1024).toFixed(1) + ' KB';

            // Strip the uid/ prefix for the UI
            const relativeName = item.Key.startsWith(prefix) ? item.Key.substring(prefix.length) : item.Key;

            return {
                id: item.ETag || index + 1,
                name: relativeName,
                size: formattedSize,
                sizeBytes: sizeInBytes,
                type: getFileType(relativeName),
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
        const uid = req.body.uid;
        if (!uid) return res.status(400).json({ error: 'UID is required' });

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // --- Quota Check ---
        const stats = await getUserStorageStats(uid);
        if (req.file.size > stats.remainingBytes) {
            return res.status(403).json({
                error: 'Storage quota exceeded',
                usedGB: (stats.usedBytes / (1024 ** 3)).toFixed(3),
                totalGB: stats.quotaGB
            });
        }
        // -------------------

        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const uploadKey = `${uid}/${req.body.path || req.file.originalname}`;
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
        const uid = req.query.uid;
        if (!uid) return res.status(400).json({ error: 'UID is required' });

        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const fullKey = `${uid}/${req.params.filename}`;
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fullKey,
            ResponseContentDisposition: `attachment; filename="${req.params.filename.split('/').pop()}"`
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
        const uid = req.query.uid;
        if (!uid) return res.status(400).json({ error: 'UID is required' });

        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const relativePrefix = req.params.folderPath;
        const fullPrefix = `${uid}/${relativePrefix}`;
        if (!relativePrefix.endsWith('/')) {
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
                Prefix: fullPrefix,
                ContinuationToken: continuationToken
            });
            const response = await s3.send(listCommand);

            if (response.Contents) {
                for (const item of response.Contents) {
                    if (item.Key === fullPrefix) continue; // Skip the folder itself if it exists as an object

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
                    const relativePath = item.Key.substring(fullPrefix.length);
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
        const folderName = relativePrefix.split('/').filter(Boolean).pop() || 'folder';
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
        const { filename, contentType, uid, fileSize } = req.body;
        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }
        if (!uid) return res.status(400).json({ error: 'UID is required' });
        if (!fileSize) return res.status(400).json({ error: 'FileSize is required for quota check' });

        // --- Quota Check ---
        const stats = await getUserStorageStats(uid);
        if (fileSize > stats.remainingBytes) {
            return res.status(403).json({
                error: 'Storage quota exceeded',
                usedGB: (stats.usedBytes / (1024 ** 3)).toFixed(3),
                totalGB: stats.quotaGB
            });
        }
        // -------------------

        if (!s3) {
            return res.status(500).json({ error: 'R2 Client not initialized' });
        }

        const fullKey = `${uid}/${filename}`;
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fullKey,
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

// API: Trash File or Folder (Move to .trash/)
app.delete('/api/delete/:filename(*)', async (req, res) => {
    try {
        const uid = req.query.uid;
        const permanent = req.query.permanent === 'true';
        if (!uid) return res.status(400).json({ error: 'UID is required' });

        if (!s3) return res.status(500).json({ error: 'R2 Client not initialized' });

        const filename = req.params.filename;
        const fullKey = `${uid}/${filename}`;
        const isFolder = filename.endsWith('/');

        // Helper: Move (Copy + Delete) or Delete
        const processItem = async (key) => {
            if (permanent) {
                await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
            } else {
                // Skip if already in trash
                if (key.includes('/.trash/')) return;

                const trashKey = key.replace(`${uid}/`, `${uid}/.trash/`);
                await s3.send(new CopyObjectCommand({
                    Bucket: BUCKET_NAME,
                    CopySource: `${BUCKET_NAME}/${key}`,
                    Key: trashKey
                }));
                await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
            }
        };

        if (isFolder) {
            let isTruncated = true;
            let continuationToken = undefined;
            while (isTruncated) {
                const listRes = await s3.send(new ListObjectsV2Command({
                    Bucket: BUCKET_NAME,
                    Prefix: fullKey,
                    ContinuationToken: continuationToken
                }));
                if (listRes.Contents) {
                    for (const item of listRes.Contents) {
                        await processItem(item.Key);
                    }
                }
                isTruncated = listRes.IsTruncated;
                continuationToken = listRes.NextContinuationToken;
            }
        } else {
            await processItem(fullKey);
        }

        res.json({ message: permanent ? 'Deleted permanently' : 'Moved to trash' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: 'Failed to process deletion' });
    }
});

// API: List Trash
app.get('/api/trash', async (req, res) => {
    try {
        const uid = req.query.uid;
        if (!uid) return res.status(400).json({ error: 'UID is required' });
        const prefix = `${uid}/.trash/`;

        const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: prefix });
        const response = await s3.send(command);
        const items = response.Contents || [];

        const trashFiles = items.map((item, index) => {
            const relativeName = item.Key.substring(prefix.length);
            return {
                id: item.ETag || index + 1,
                name: relativeName,
                size: (item.Size / 1024).toFixed(1) + ' KB',
                sizeBytes: item.Size,
                type: getFileType(relativeName),
                modified: item.LastModified ? item.LastModified.toLocaleDateString() : 'N/A',
                isTrash: true
            };
        });

        res.json(trashFiles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list trash' });
    }
});

// API: Restore from Trash
app.post('/api/trash/restore', async (req, res) => {
    try {
        const { uid, filename } = req.body;
        if (!uid || !filename) return res.status(400).json({ error: 'UID and filename required' });

        const trashKey = `${uid}/.trash/${filename}`;
        const targetKey = `${uid}/${filename}`;
        const isFolder = filename.endsWith('/');

        const restoreItem = async (tKey) => {
            const originalKey = tKey.replace(`${uid}/.trash/`, `${uid}/`);
            await s3.send(new CopyObjectCommand({
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/${tKey}`,
                Key: originalKey
            }));
            await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: tKey }));
        };

        if (isFolder) {
            let isTruncated = true;
            let token = undefined;
            while (isTruncated) {
                const list = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: trashKey, ContinuationToken: token }));
                if (list.Contents) {
                    for (const item of list.Contents) await restoreItem(item.Key);
                }
                isTruncated = list.IsTruncated;
                token = list.NextContinuationToken;
            }
        } else {
            await restoreItem(trashKey);
        }

        res.json({ message: 'Restored successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Restore failed' });
    }
});

// API: Empty Trash
app.delete('/api/trash/empty', async (req, res) => {
    try {
        const uid = req.query.uid;
        if (!uid) return res.status(400).json({ error: 'UID is required' });

        const prefix = `${uid}/.trash/`;
        let isTruncated = true;
        let token = undefined;

        while (isTruncated) {
            const list = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: prefix, ContinuationToken: token }));
            if (list.Contents && list.Contents.length > 0) {
                await s3.send(new DeleteObjectsCommand({
                    Bucket: BUCKET_NAME,
                    Delete: { Objects: list.Contents.map(o => ({ Key: o.Key })), Quiet: true }
                }));
            }
            isTruncated = list.IsTruncated;
            token = list.NextContinuationToken;
        }

        res.json({ message: 'Trash emptied permanently' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to empty trash' });
    }
});

// API: Share File (Pre-signed URL)
app.post('/api/share', async (req, res) => {
    try {
        const { uid, filename } = req.body;
        const fullKey = `${uid}/${filename}`;
        const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: fullKey });
        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 * 7 }); // 7 Days
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: 'Share link generation failed' });
    }
});

// API: Get Storage Allocation
app.get('/api/storage', async (req, res) => {
    try {
        const uid = req.query.uid;
        if (!uid) return res.status(400).json({ error: 'UID is required' });

        // Trigger billing processing on storage check
        await processBilling(uid);

        const userSnap = await db.collection('users').doc(uid).get();
        const userData = userSnap.data() || {};

        const stats = await getUserStorageStats(uid);
        const usedGB = (stats.usedBytes / (1024 * 1024 * 1024)).toFixed(3);
        const percentage = Math.min(((usedGB / stats.quotaGB) * 100), 100).toFixed(1);

        res.json({
            tier: 'Operative',
            usedGB,
            totalGB: stats.quotaGB,
            percentage,
            rawTotalBytes: stats.usedBytes,
            kpc_status: userData.kpc_status || 'active',
            auto_delete_date: userData.auto_delete_date || null,
            suspension_start_date: userData.suspension_start_date || null
        });
    } catch (error) {
        console.error("Storage Error:", error);
        res.status(500).json({ error: 'Failed to get storage info' });
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
