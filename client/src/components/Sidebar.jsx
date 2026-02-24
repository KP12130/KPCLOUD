import React, { useState, useEffect, useRef } from 'react';

const Sidebar = ({ currentMenu, setCurrentMenu, onOpenPaywall }) => {
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
        { name: 'Trash Bin', icon: '🗑️' },
    ];

    return (
        <aside className="w-64 h-full flex flex-col py-4 z-10 shrink-0 border-r border-transparent">
            {/* New Button */}
            <div className="px-4 mb-6 flex flex-col gap-2 relative">
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
            <div className="px-6 mt-auto mb-4">
                <div className="flex items-center gap-2 text-gray-400 mb-3 hover:text-cyan-400 cursor-pointer transition-colors">
                    <span>☁️</span> <span className="text-sm font-medium">Storage Allocation</span>
                </div>

                {storage ? (
                    <>
                        <div className="h-1.5 bg-cyan-950 rounded-full overflow-hidden border border-cyan-900/30 relative">
                            <div
                                className={`h-full transition-all duration-1000 ${storage.percentage > 90
                                    ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse'
                                    : 'bg-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.8)]'
                                    }`}
                                style={{ width: `${storage.percentage}%` }}
                            ></div>
                        </div>
                        <p className={`text-[11px] mt-2 font-sans tracking-wide transition-colors ${storage.percentage > 90 ? 'text-rose-400 font-bold' : 'text-gray-500'}`}>
                            {storage.usedGB} GB / {storage.totalGB} GB used ({storage.tier})
                        </p>
                    </>
                ) : (
                    <div className="animate-pulse h-1.5 bg-cyan-900/50 rounded-full w-full"></div>
                )}

                <button
                    onClick={onOpenPaywall}
                    className="mt-4 w-full py-2 border border-cyan-800 rounded-full text-xs text-cyan-400 font-medium hover:bg-cyan-900/30 transition-colors"
                >
                    Expand Core Storage
                </button>

                {storage && (
                    <div className="mt-6 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest leading-none mb-1">R2 Bucket Footprint</span>
                        <span className="text-xs text-cyan-300 font-mono">
                            {storage.rawTotalBytes === 0 ? '0 B' :
                                (storage.rawTotalBytes / (1024 * 1024)).toFixed(2) + ' MB'}
                            <span className="text-[9px] text-gray-500 ml-1">({storage.rawTotalBytes.toLocaleString()} B)</span>
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
