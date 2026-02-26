import React, { useState, useEffect } from 'react';

const MediaPreview = ({ item, uid, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const response = await fetch(`/api/preview/${encodeURIComponent(item.fullPath)}?uid=${uid}`);
                const data = await response.json();
                if (data.url) {
                    setPreviewUrl(data.url);
                } else {
                    setError("Could not generate preview.");
                }
            } catch (err) {
                setError("Network error fetching preview.");
            } finally {
                setLoading(false);
            }
        };

        if (item && uid) fetchPreview();
    }, [item, uid]);

    if (!item) return null;

    const isImage = item.type === 'IMAGE';
    const isVideo = item.type === 'VIDEO';

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
            {/* Close Trigger (Backdrop) */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Main Container */}
            <div className="relative w-[90vw] h-[85vh] flex flex-col items-center justify-center p-4 lg:p-8 z-10 pointer-events-none">

                {/* Top Control Bar */}
                <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex flex-col">
                        <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-1">Grid Media Viewer</span>
                        <h2 className="text-white text-lg font-medium truncate max-w-[50vw]">{item.displayName || item.name}</h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-rose-500 hover:border-rose-400 hover:rotate-90 transition-all duration-300 shadow-xl"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Content Area */}
                <div className="w-full h-full flex items-center justify-center pointer-events-auto mt-12 overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#030303]">
                    {loading && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
                            <span className="text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase">Decrypting Media...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-6 py-4 rounded-xl flex flex-col items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            <span className="font-bold uppercase tracking-wider">{error}</span>
                            <button onClick={onClose} className="mt-4 text-xs text-white underline opacity-60">Back to Grid</button>
                        </div>
                    )}

                    {previewUrl && isImage && (
                        <img
                            src={previewUrl}
                            alt={item.name}
                            className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500 select-none shadow-2xl"
                        />
                    )}

                    {previewUrl && isVideo && (
                        <video
                            src={previewUrl}
                            controls
                            autoPlay
                            className="max-w-full max-h-full rounded-lg shadow-2xl"
                        />
                    )}

                    {!isImage && !isVideo && !loading && !error && (
                        <div className="text-gray-500 flex flex-col items-center gap-4">
                            <span className="text-6xl">📜</span>
                            <span className="text-sm">Preview not available for this file type.</span>
                            <button onClick={onClose} className="text-cyan-400 underline">Back to Grid</button>
                        </div>
                    )}
                </div>

                {/* Bottom Info bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-md flex items-center gap-8 pointer-events-auto">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Size</span>
                        <span className="text-xs text-cyan-300 font-mono">{item.size}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Modified</span>
                        <span className="text-xs text-cyan-300 font-mono">{item.modified}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaPreview;
