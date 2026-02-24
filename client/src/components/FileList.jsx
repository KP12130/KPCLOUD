import React, { useState, useEffect } from 'react';

const FileList = () => {
    const [view, setView] = useState('list');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                // Fetch from the Express backend
                const response = await fetch('/api/files');
                const data = await response.json();
                setFiles(data);
            } catch (error) {
                console.error("Error fetching files from server:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'SYSTEM': return '⚙️';
            case 'ENCRYPTED': return '🔐';
            case 'DOCUMENT': return '📋';
            case 'ARCHIVE': return '📦';
            case 'LOG': return '📝';
            case 'DESIGN': return '🎨';
            default: return '📜';
        }
    }

    return (
        <div className="flex flex-col w-full h-full pb-20">
            {/* Action Bar (View toggles) */}
            <div className="flex items-center justify-between mb-2 px-2">
                <div className="text-sm font-medium text-gray-400">Files</div>
                <div className="flex items-center gap-1 bg-cyan-950/20 p-1 rounded-lg border border-cyan-900/30">
                    <button
                        onClick={() => setView('list')}
                        className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title="List view"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Grid view"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
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
                        <div className="w-12"></div>
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

                                {/* Actions (More options) */}
                                <div className="w-12 flex justify-end">
                                    <button className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-cyan-500/20 text-cyan-400 transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-2">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="group flex flex-col glass-panel bg-cyan-950/20 border border-cyan-900/30 hover:border-cyan-500/50 hover:bg-cyan-900/30 rounded-2xl cursor-pointer transition-all overflow-hidden"
                        >
                            <div className="h-32 flex items-center justify-center bg-black/40 border-b border-cyan-900/20 relative">
                                <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                                    {getIcon(file.type)}
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <div className="text-lg opacity-80">{getIcon(file.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-200 truncate group-hover:text-cyan-400 transition-colors">
                                        {file.name}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileList;
