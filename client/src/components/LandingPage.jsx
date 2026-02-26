import React from 'react';

const LandingPage = ({ onLogin }) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#030303] flex flex-col items-center justify-center font-mono">
            {/* Cinematic Background */}
            <div className="mesh-gradient opacity-60"></div>
            <div className="bg-grid opacity-30"></div>
            <div className="fixed inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-[-1]"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-7xl px-6 py-20 flex flex-col items-center text-center">

                {/* Badge */}
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(0,243,255,0.1)]">
                        The Future of Storage is Here
                    </span>
                </div>

                {/* Hero Title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] text-white overflow-hidden">
                    <div className="reveal-text">SECURE THE</div>
                    <div className="reveal-text text-gradient-cyan">DIGITAL GRID.</div>
                </h1>

                {/* Subtitle */}
                <p className="max-w-2xl text-gray-400 text-sm md:text-base mb-12 leading-relaxed animate-in fade-in duration-1000 delay-300">
                    Experience the next generation of cloud storage.
                    Built on R2 edge architecture with biometric-grade security
                    and a cinematic interface designed for the focused mind.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-24 animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    <button
                        onClick={onLogin}
                        className="group relative px-10 py-4 bg-cyan-500 text-black font-bold text-sm tracking-widest uppercase rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,243,255,0.3)]"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        Access my Grid
                    </button>

                    <button className="px-10 py-4 bg-white/5 border border-white/10 text-white font-medium text-sm tracking-widest uppercase rounded-full hover:bg-white/10 transition-all backdrop-blur-md">
                        View Documentation
                    </button>
                </div>

                {/* Feature Highlight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
                    {[
                        { title: 'Infinite Edge', desc: 'S3-compatible R2 storage with lightning-fast latency across the globe.', icon: '⚡' },
                        { title: 'Steel Auth', desc: 'Military-grade Google Cloud Armor & Biometric Firebase authentication.', icon: '🛡️' },
                        { title: 'Cinematic UX', desc: 'Focus-inspired interface with real-time media previews and smart trash.', icon: '✨' }
                    ].map((f, i) => (
                        <div key={i} className="landing-card p-8 rounded-3xl text-left group">
                            <span className="text-3xl mb-6 block animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{f.icon}</span>
                            <h3 className="text-white font-bold text-lg mb-3 tracking-wide uppercase group-hover:text-cyan-400 transition-colors">{f.title}</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

            </div>

            {/* Decorative Elements */}
            <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
    );
};

export default LandingPage;
