import React from 'react';

const Hero = () => {
    return (
        <div className="relative pt-20 pb-16 px-8 text-center flex flex-col items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full -z-10"></div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Dominate the Cloud with <span className="neon-text-blue">KPCloud</span>
            </h1>

            <p className="text-lg md:text-xl text-secondary max-w-2xl mb-12">
                Secure, fast, and stylish storage in the <span className="text-white hover:neon-text-green cursor-default transition-all">KPHUB ecosystem</span>.
                Your files, decentralized and armored.
            </p>

            <div className="flex gap-4">
                <div className="px-1 py-1 rounded-sm bg-cyan-500/20 border border-cyan-500/50">
                    <div className="px-4 py-1 text-xs text-cyan-400 uppercase tracking-widest bg-cyan-900/40">
                        Storage Grid: Stable
                    </div>
                </div>
                <div className="px-1 py-1 rounded-sm bg-white/5 border border-white/10 text-xs text-white/40 uppercase tracking-widest flex items-center px-4">
                    v1.0.4-beta
                </div>
            </div>
        </div>
    );
};

export default Hero;
