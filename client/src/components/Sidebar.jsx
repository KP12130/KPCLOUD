import React, { useState, useEffect, useRef } from 'react';

const Sidebar = ({ currentMenu, setCurrentMenu, onOpenStore, kpcBalance }) => {
    const [storage, setStorage] = useState(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const folderInputRef = useRef(null);

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const response = await fetch('/api/storage');
                const data = await response.json();
                setStorage(data);
            } catch (error) {
                console.error("Error fetching storage:", error);
            }
        };

        fetchStorage();

        // Also refresh storage when files change
        window.addEventListener('fileUploaded', fetchStorage);
        return () => window.removeEventListener('fileUploaded', fetchStorage);
    }, []);

    // Calculate daily burn rate: 0 KPC for 1GB or less, 5 KPC per additional GB
    const calculateBurnRate = () => {
        if (!storage) return 0;
        const usedGB = parseFloat(storage.usedGB);
        if (usedGB <= 1) return 0;
        return Math.ceil(usedGB - 1) * 5;
    };

    const burnRate = calculateBurnRate();

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);
        let successCount = 0;

        // Calculate total bytes for progress bar
        let totalBytes = 0;
        for (let i = 0; i < files.length; i++) {
            totalBytes += files[i].size;
        }
        let uploadedBytes = 0;

        try {
            // Upload files sequentially to avoid overloading the browser for huge folders
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const filePath = file.webkitRelativePath || file.name;

                // 1. Get Presigned URL
                const presignRes = await fetch('/api/upload/presign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: filePath, contentType: file.type || 'application/octet-stream' })
                });

                if (!presignRes.ok) throw new Error("Failed to get presigned URL");
                const { url } = await presignRes.json();

                // 2. Upload via XMLHttpRequest for progress tracking
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', url, true);
                    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const currentFileProgress = event.loaded;
                            const overallProgress = Math.round(((uploadedBytes + currentFileProgress) / totalBytes) * 100);
                            setUploadProgress(Math.min(overallProgress, 100));
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status === 200 || xhr.status === 201) {
                            uploadedBytes += file.size; // commit the size
                            successCount++;
                            resolve();
                        } else {
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    };

                    xhr.onerror = () => reject(new Error("XHR Error"));
                    xhr.send(file);
                });
            }

            if (successCount > 0) {
                window.dispatchEvent(new Event('fileUploaded'));
            }
        } catch (error) {
            console.error("Error uploading:", error);
            alert("Upload failed. Ensure R2 is configured correctly.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
            e.target.value = null; // reset input
        }
    };

    const menuItems = [
        { name: 'My Data', icon: '☁️' },
        { name: 'Recent Activity', icon: '🕒' },
        { name: 'Starred', icon: '⭐' },
        { name: 'Trash Bin', icon: '🗑️' }
    ];

    return (
        <aside className="w-56 lg:w-64 flex flex-col pt-4 mx-2 border-r border-cyan-900/40">
            {/* Upload Buttons */}
            <div className="px-4 mb-6 space-y-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleUpload}
                    multiple
                />
                <input
                    type="file"
                    ref={folderInputRef}
                    style={{ display: 'none' }}
                    onChange={handleUpload}
                    webkitdirectory=""
                    directory=""
                    multiple
                />
                <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className={`w-full py-2.5 px-4 bg-cyan-950/40 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2 text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(0,243,255,0.05)] rounded-xl ${uploading ? 'opacity-80 cursor-wait' : ''} relative overflow-hidden`}
                >
                    {uploading && (
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-cyan-500/30 transition-all duration-300 z-0"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    )}
                    <span className="text-lg leading-none -mt-0.5 relative z-10">{uploading ? '...' : '+'}</span>
                    <span className="relative z-10">{uploading ? `Uploading... ${uploadProgress}%` : 'Upload File(s)'}</span>
                </button>
                <button
                    onClick={() => folderInputRef.current.click()}
                    disabled={uploading}
                    className={`w-full py-2.5 px-4 bg-cyan-950/20 border border-cyan-400/10 text-cyan-400/80 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 text-xs font-medium tracking-wide rounded-xl ${uploading ? 'opacity-80 cursor-wait' : ''} relative overflow-hidden`}
                >
                    {uploading && (
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-cyan-500/20 transition-all duration-300 z-0"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    )}
                    <span className="relative z-10">📁 {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Folder'}</span>
                </button>
            </div>

            {/* Economy Card */}
            <div className="px-4 mb-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_15px_rgba(0,243,255,0.05)]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">KPC Balance</span>
                        <div className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold border border-emerald-500/30 animate-pulse">LIVE</div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h2.45c.14.93 1.05 1.51 2.5 1.51 1.48 0 2.45-.66 2.45-1.63 0-1.11-1.07-1.48-2.65-1.94-2.1-.64-4.08-1.58-4.08-4.07 0-1.92 1.43-3.13 3.27-3.48V3.13h2.67v1.94c1.69.31 2.94 1.41 3.12 3.19h-2.43c-.15-.84-1-1.45-2.28-1.45-1.37 0-2.3.69-2.3 1.63 0 1.02.99 1.4 2.8 1.99 2.16.66 3.93 1.62 3.93 4.04 0 2.05-1.51 3.18-3.51 3.62z" /></svg>
                        <span className="text-xl font-bold text-white font-mono">{(kpcBalance || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Daily Burn:</span>
                        <span className={`font-bold ${burnRate > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                            -{burnRate} KPC / day
                        </span>
                    </div>
                    <button
                        onClick={onOpenStore}
                        className="w-full mt-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/40 rounded-lg transition-all uppercase tracking-tighter"
                    >
                        Topup KPC Store
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        onClick={() => setCurrentMenu(item.name)}
                        className={`flex items-center gap-4 px-4 py-2 rounded-full cursor-pointer transition-colors ${item.name === currentMenu
                            ? 'bg-cyan-500/15 text-cyan-400'
                            : 'text-gray-400 hover:bg-cyan-500/5 hover:text-gray-200'
                            }`}
                    >
                        <span className="text-base opacity-90">{item.icon}</span>
                        <span className="font-medium text-[13px]">{item.name}</span>
                    </div>
                ))}
            </nav>

            {/* Storage Area */}
            <div className="px-6 mt-auto mb-0 border-t border-cyan-900/20 pt-4">
                <div className="flex items-center gap-2 text-gray-400 mb-3">
                    <span>☁️</span> <span className="text-xs font-medium uppercase tracking-widest opacity-60">Storage Status</span>
                </div>

                {storage ? (
                    <>
                        <div className="h-1 bg-cyan-950 rounded-full overflow-hidden border border-cyan-900/30 relative">
                            <div
                                className={`h-full transition-all duration-1000 ${storage.percentage > 90
                                    ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse'
                                    : 'bg-cyan-500 shadow-[0_0_5px_rgba(0,243,255,0.5)]'
                                    }`}
                                style={{ width: `${storage.percentage}%` }}
                            ></div>
                        </div>
                        <p className={`text-[10px] mt-2 font-mono transition-colors ${storage.percentage > 90 ? 'text-rose-400 font-bold' : 'text-gray-500'}`}>
                            {storage.usedGB} GB used (Free: 1GB)
                        </p>
                    </>
                ) : (
                    <div className="animate-pulse h-1 bg-cyan-900/50 rounded-full w-full"></div>
                )}

                {storage && (
                    <div className="mt-4 flex flex-col items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
                        <span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest leading-none mb-1">R2 Footprint</span>
                        <span className="text-[10px] text-cyan-500/70 font-mono">
                            {storage.rawTotalBytes === 0 ? '0 B' :
                                (storage.rawTotalBytes / (1024 * 1024)).toFixed(2) + ' MB'}
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
