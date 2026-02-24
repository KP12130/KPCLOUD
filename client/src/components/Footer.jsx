import React from 'react';

const Footer = () => {
    return (
        <footer className="px-8 py-12 border-t border-white/5 bg-black/50 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold neon-text-blue">KPCloud</span>
                        <span className="text-[10px] text-white/20">PART OF THE KP-ECOSYSTEM</span>
                    </div>
                    <p className="text-[10px] text-white/40 tracking-widest uppercase">
                        &copy; 2026 KP-Industries. All protocols enforced.
                    </p>
                </div>

                <div className="flex gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 uppercase">KPHUB</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#39ff14]"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 uppercase">KPCloud</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_#00f3ff] animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 uppercase">AntiGravity IDE</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#39ff14]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/[0.02] text-center">
                <span className="text-[9px] text-white/10 tracking-[0.5em] uppercase">
                    Authorized Access Only . Encryption Active . Matrix Secure
                </span>
            </div>
        </footer>
    );
};

export default Footer;
