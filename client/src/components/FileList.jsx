import React, { useState } from 'react';

const FileList = () => {
    const [view, setView] = useState('grid'); // 'grid' or 'list'

    const files = [
        { id: 1, name: 'database_shard_01.dat', size: '124 MB', type: 'DATA', modified: '2 hours ago' },
        { id: 2, name: 'vector_graphics_final.svg', size: '2.4 MB', type: 'ASSET', modified: '5 hours ago' },
        { id: 3, name: 'encrypted_vault_entry.key', size: '4 KB', type: 'CORE', modified: '1 day ago' },
        { id: 4, name: 'system_log_dump.txt', size: '15 MB', type: 'DATA', modified: 'Oct 12, 2025' },
        { id: 5, name: 'blueprint_alpha.png', size: '8.2 MB', type: 'ASSET', modified: 'Oct 10, 2025' },
        { id: 6, name: 'auth_protocol_v2.pdf', size: '1.1 MB', type: 'CORE', modified: 'Oct 08, 2025' },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-cyan-900/20 pb-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
                    Active Transmission Log
                </h2>
                <div className="flex items-center gap-2 glass-panel p-1 rounded-lg">
                    <button
                        onClick={() => setView('list')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${view === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        LIST
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${view === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        GRID
                    </button>
                </div>
            </div>

            <div className={view === 'grid' ? 'file-grid' : 'file-list'}>
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={`glass-panel border-cyan-900/30 hover:border-cyan-500/50 transition-all cursor-pointer group ${view === 'grid' ? 'p-4 flex flex-col items-center text-center gap-4' : 'px-4 py-3 flex items-center gap-4'
                            }`}
                    >
                        {/* Icon Placeholder */}
                        <div className={`rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 ${view === 'grid' ? 'w-16 h-16 text-3xl' : 'w-10 h-10 text-xl'
                            }`}>
                            {file.type === 'DATA' ? '📊' : file.type === 'ASSET' ? '🖼️' : '🔑'}
                        </div>

                        <div className={`flex-1 min-w-0 ${view === 'grid' ? 'w-full' : ''}`}>
                            <div className="text-sm font-medium text-gray-200 truncate group-hover:text-cyan-400 transition-colors">
                                {file.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-tighter bg-cyan-500/5 px-1.5 rounded">{file.type}</span>
                                {view === 'list' && <span className="text-[10px] text-gray-500 font-mono">{file.size}</span>}
                                {view === 'list' && <span className="text-[10px] text-gray-600 ml-auto">{file.modified}</span>}
                                {view === 'grid' && <span className="text-[10px] text-gray-500 block mt-1">{file.size}</span>}
                            </div>
                        </div>

                        <button className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded whitespace-nowrap hover:bg-cyan-500/10 ${view === 'grid' ? 'w-full' : ''
                            }`}>
                            GENERATE LINK
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;
