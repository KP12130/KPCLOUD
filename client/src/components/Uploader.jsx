import React, { useState } from 'react';

const Uploader = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`glass-panel p-8 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 cursor-pointer
            ${isHovered ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(0,243,255,0.1)]' : 'border-cyan-900/30'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`w-12 h-12 mb-4 rounded-full border border-cyan-500/30 flex items-center justify-center transition-all
            ${isHovered ? 'bg-cyan-500/20 shadow-[0_0_10px_#00f3ff]' : 'bg-cyan-500/5'}`}>
                <svg className={`w-6 h-6 ${isHovered ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>

            <p className={`text-sm font-bold tracking-widest ${isHovered ? 'text-cyan-400' : 'text-gray-400'}`}>
                {isHovered ? 'RELEASE_TO_UPLOAD' : 'DRAG_&_DROP_TRANSMISSION'}
            </p>
            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-tighter">Encrypted uplink active</p>

            {isHovered && (
                <div className="mt-4 px-4 py-1 bg-cyan-500/10 border border-cyan-400/50 text-[9px] text-cyan-400 tracking-[0.3em] uppercase animate-pulse">
                    Syncing with Grid...
                </div>
            )}
        </div>
    );
};

export default Uploader;
