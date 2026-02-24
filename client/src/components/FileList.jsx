import React, { useState } from 'react';

const FileList = () => {
    const [view, setView] = useState('grid');

    // Realistic Data
    const files = [
        { id: 1, name: 'kp_core_engine_v4.2.bin', size: '1.4 GB', type: 'SYSTEM', modified: 'Oct 24, 2025' },
        { id: 2, name: 'encryption_keys_prod.vault', size: '12 KB', type: 'ENCRYPTED', modified: '2 hours ago' },
        { id: 3, name: 'security_protocol_delta.pdf', size: '4.8 MB', type: 'DOCUMENT', modified: '5 hours ago' },
        { id: 4, name: 'kphub_resource_assets.pkg', size: '842 MB', type: 'ARCHIVE', modified: 'Oct 20, 2025' },
        { id: 5, name: 'firewall_logs_node_01.txt', size: '64 MB', type: 'LOG', modified: 'Oct 18, 2025' },
        { id: 6, name: 'interface_mockup_final.psd', size: '156 MB', type: 'DESIGN', modified: 'Oct 15, 2025' },
        { id: 7, name: 'grid_automation_script.sh', size: '15 KB', type: 'SCRIPT', modified: 'Oct 12, 2025' },
        { id: 8, name: 'quantum_database_export.sql', size: '2.1 GB', type: 'SYSTEM', modified: 'Oct 10, 2025' },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-cyan-900/20 pb-4">
                <h2 className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-cyan-500 rounded-full shadow-[0_0_8px_#00f3ff]"></span>
                    Authorized File Access
                </h2>
                <div className="flex items-center gap-2 glass-panel p-1 rounded-lg border-cyan-500/10">
                    <button
                        onClick={() => setView('list')}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all tracking-widest ${view === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        LIST
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all tracking-widest ${view === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        GRID
                    </button>
                </div>
            </div>

            <div className={view === 'grid' ? 'file-grid' : 'file-list'}>
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={`glass-panel border-cyan-900/30 hover:border-cyan-500/50 transition-all cursor-pointer group relative overflow-hidden ${view === 'grid' ? 'p-6 flex flex-col items-center text-center gap-4' : 'px-4 py-3 flex items-center gap-4'
                            }`}
                    >
                        {/* Background Glow on Hover */}
                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                        {/* Icon */}
                        <div className={`rounded bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center shrink-0 shadow-inner ${view === 'grid' ? 'w-20 h-20 text-4xl' : 'w-10 h-10 text-xl'
                            }`}>
                            {file.type === 'SYSTEM' ? '⚙️' : file.type === 'ENCRYPTED' ? '🔐' : file.type === 'DOCUMENT' ? '📋' : file.type === 'ARCHIVE' ? '📦' : file.type === 'LOG' ? '📝' : file.type === 'DESIGN' ? '🎨' : '📜'}
                        </div>

                        <div className={`flex-1 min-w-0 z-10 ${view === 'grid' ? 'w-full' : ''}`}>
                            <div className="text-xs font-medium text-gray-200 truncate group-hover:text-cyan-400 transition-colors tracking-tight">
                                {file.name}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-tighter bg-cyan-500/10 px-1.5 rounded border border-cyan-500/20">{file.type}</span>
                                {view === 'list' && <span className="text-[9px] text-gray-500 font-mono">{file.size}</span>}
                                {view === 'list' && <span className="text-[9px] text-gray-600 ml-auto uppercase">{file.modified}</span>}
                                {view === 'grid' && <span className="text-[9px] text-gray-500 block mt-1">{file.size} • {file.modified}</span>}
                            </div>
                        </div>

                        <button className={`z-10 opacity-0 group-hover:opacity-100 transition-all text-[9px] font-bold text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded whitespace-nowrap hover:bg-cyan-500/20 uppercase tracking-widest ${view === 'grid' ? 'w-full mt-2' : ''
                            }`}>
                            Transmit Link
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;
