import React from 'react';

const FileList = () => {
    const files = [
        { id: 1, name: 'database_shard_01.dat', size: '124 MB', type: 'DATA' },
        { id: 2, name: 'vector_graphics_final.svg', size: '2.4 MB', type: 'ASSET' },
        { id: 3, name: 'encrypted_vault_entry.key', size: '4 KB', type: 'CORE' },
    ];

    return (
        <div className="px-8 mt-12 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-widest uppercase opacity-40 flex items-center gap-2">
                    <span className="w-1 h-4 bg-cyan-400 inline-block"></span>
                    Active_Transmission_Log
                </h2>
                <span className="text-[10px] text-cyan-400/50">3 FILES DETECTED</span>
            </div>

            <div className="space-y-4">
                {files.map((file) => (
                    <div key={file.id} className="glass group hover:bg-white/[0.05] transition-all duration-300 p-4 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-cyan-400/30 transition-colors">
                                <span className="text-[10px] font-bold text-white/30 group-hover:neon-text-blue">{file.type}</span>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white/90">{file.name}</div>
                                <div className="text-[10px] text-white/30 uppercase tracking-tighter">{file.size}</div>
                            </div>
                        </div>

                        <button className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_15px_#00f3ff] transition-all">
                            GENERATE_LINK
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;
