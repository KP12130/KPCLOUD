import React, { useState, useEffect } from 'react';

const FileList = () => {
    const [view, setView] = useState('list');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            // Fetch from the Express backend
            const response = await fetch('/api/files');
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error("Error fetching files from server:", error);
            setFiles([]); // Handle error gracefully
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();

        const handleUploadEvent = () => fetchFiles();
        window.addEventListener('fileUploaded', handleUploadEvent);
        return () => window.removeEventListener('fileUploaded', handleUploadEvent);
    }, []);

    const handleDownload = async (filename) => {
        try {
            const response = await fetch(`/api/download/${filename}`);
            const data = await response.json();
            if (data.url) {
                const a = document.createElement('a');
                a.href = data.url;
                a.download = filename; // Suggests a filename
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

        try {
            const response = await fetch(`/api/delete/${filename}`, { method: 'DELETE' });
            if (response.ok) {
                fetchFiles();
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SYSTEM': return '⚙️';
            case 'ENCRYPTED': return '🔐';
            case 'DOCUMENT': return '📋';
            case 'ARCHIVE': return '📦';
            case 'LOG': return '📝';
            case 'DESIGN': return '🎨';
            case 'IMAGE': return '🖼️';
            default: return '📜';
        }
    }

    return (
        <div className="flex flex-col w-full h-full pb-20 relative z-20">
            {/* Action Bar (View toggles) */}
            <div className="flex items-center justify-between mb-2 px-2 relative z-30">
                <div className="text-sm font-medium text-gray-400">Files</div>
                <div className="flex items-center gap-1 bg-cyan-950/20 p-1 rounded-lg border border-cyan-900/30">
                    <button
                        onClick={() => setView('list')}
                        className={`p-1.5 rounded-md transition-all z-40 relative cursor-pointer ${view === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title="List view"
                    >
                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        className={`p-1.5 rounded-md transition-all z-40 relative cursor-pointer ${view === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Grid view"
                    >
                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
                        <span className="text-cyan-400 text-sm font-bold tracking-[0.2em] uppercase">Connecting to Grid...</span>
                    </div>
                </div>
            ) : view === 'list' ? (
                /* List View - Google Drive Table Style */
                <div className="w-full text-sm">
                    {/* Table Header */}
                    <div className="flex items-center px-4 py-3 border-b border-cyan-900/40 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="flex-[3] min-w-0 pr-4">Name</div>
                        <div className="flex-1 hidden md:block px-2">Owner</div>
                        <div className="flex-1 hidden sm:block px-2">Last modified</div>
                        <div className="flex-1 px-2">File size</div>
                        <div className="w-20"></div>
                    </div>

                    {/* Table Rows */}
                    <div className="flex flex-col mt-1">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="group flex items-center px-4 py-3 hover:bg-cyan-500/10 border-b border-cyan-900/10 cursor-pointer rounded-lg transition-colors"
                            >
                                {/* Name & Icon */}
                                <div className="flex-[3] min-w-0 pr-4 flex items-center gap-4">
                                    <div className="text-xl opacity-80">{getIcon(file.type)}</div>
                                    <span className="font-medium text-gray-200 truncate group-hover:text-cyan-400 transition-colors">
                                        {file.name}
                                    </span>
                                </div>

                                {/* Owner */}
                                <div className="flex-1 hidden md:block px-2 text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-cyan-900 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                                            {file.owner === 'me' ? 'KP' : file.owner[0]}
                                        </div>
                                        {file.owner}
                                    </div>
                                </div>

                                {/* Modified Date */}
                                <div className="flex-1 hidden sm:block px-2 text-gray-400">
                                    {file.modified}
                                </div>

                                {/* Size */}
                                <div className="flex-1 px-2 text-gray-400">
                                    {file.size}
                                </div>

                                {/* Actions */}
                                <div className="w-20 flex justify-end gap-1 pr-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }} className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-cyan-500/20 text-cyan-400 transition-all" title="Download">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }} className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500 transition-all" title="Delete">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {files.length === 0 && <div className="py-8 text-center text-gray-500 text-sm">No files uploaded yet.</div>}
                    </div>
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-2">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="group flex flex-col glass-panel bg-cyan-950/20 border border-cyan-900/30 hover:border-cyan-500/50 hover:bg-cyan-900/30 rounded-2xl cursor-pointer transition-all overflow-hidden relative"
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10">
                                <button onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }} className="p-1.5 rounded-full bg-cyan-900/80 hover:bg-cyan-500 text-cyan-50 transition-colors shadow-lg shadow-black/50" title="Download">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }} className="p-1.5 rounded-full bg-red-900/80 hover:bg-red-500 text-red-50 transition-colors shadow-lg shadow-black/50" title="Delete">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                            <div className="h-32 flex items-center justify-center bg-black/40 border-b border-cyan-900/20 relative">
                                <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                                    {getIcon(file.type)}
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <div className="text-lg opacity-80">{getIcon(file.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-200 truncate group-hover:text-cyan-400 transition-colors" title={file.name}>
                                        {file.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{file.size}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {files.length === 0 && <div className="col-span-full py-8 text-center text-gray-500 text-sm">No files uploaded yet.</div>}
                </div>
            )}
        </div>
    );
};

export default FileList;
