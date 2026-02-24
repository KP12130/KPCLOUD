import React, { useState } from 'react';

const Uploader = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="px-8 mb-16">
            <div
                className={`glass p-12 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-500 cursor-pointer
          ${isHovered ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_30px_rgba(0,243,255,0.2)]' : 'border-white/10'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={`w-16 h-16 mb-6 rounded-full border-2 flex items-center justify-center transition-all duration-500
          ${isHovered ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_#00f3ff]' : 'border-white/20 text-white/40'}`}>
                    <svg className={`w-8 h-8 transition-colors duration-500 ${isHovered ? 'text-cyan-400' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>

                <h3 className={`text-xl font-bold mb-2 transition-colors duration-500 ${isHovered ? 'neon-text-blue' : 'text-white/80'}`}>
                    {isHovered ? 'SYSTEM_READY_TO_UPLOAD' : 'DRAG_&_DROP_FILES'}
                </h3>
                <p className="text-secondary text-sm">Max file size: <span className="text-white/40">256MB per transmission</span></p>

                {isHovered && (
                    <div className="mt-8 px-6 py-2 bg-cyan-500/10 border border-cyan-400/50 text-cyan-400 text-[10px] tracking-[0.2em] uppercase animate-pulse">
                        Grid Access Authorized
                    </div>
                )}
            </div>

            <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 12px;
        }
      `}</style>
        </div>
    );
};

export default Uploader;
