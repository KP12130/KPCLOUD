import React from 'react';

const Header = () => {
    return (
        <header className="h-16 w-full flex items-center justify-between px-4 z-20 shrink-0">
            {/* Logo Area (matches Sidebar width typically, or just natural width) */}
            <div className="w-60 flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-900/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                    <div className="w-4 h-4 rounded-sm bg-cyan-400 animate-pulse"></div>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">KP<span className="text-cyan-500">Cloud</span></span>
            </div>

            {/* Central Search Bar */}
            <div className="flex-1 max-w-3xl px-6">
                <div className="relative w-full group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search in KPCloud..."
                        className="w-full bg-cyan-950/20 border border-white/5 rounded-full py-3 px-12 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/40 transition-all text-white placeholder-gray-500 shadow-inner"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                    </span>
                </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2 pr-2">
                <button className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </button>

                <div className="w-8 h-8 ml-4 rounded-full bg-cyan-700 border-2 border-cyan-400/50 flex flex-col items-center justify-center text-white relative shadow-[0_0_10px_rgba(0,243,255,0.3)] cursor-pointer hover:border-cyan-300 transition-colors">
                    <span className="text-xs font-bold font-sans">KP</span>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#030303]"></div>
                </div>
            </div>
        </header>
    );
};

export default Header;
