import React from 'react';

const Header = ({ kpcBalance, onOpenStore, user, onSignIn, onSignOut, onSearch }) => {
    return (
        <header className="h-16 w-full flex items-center justify-between px-4 z-20 shrink-0">
            {/* Logo Area */}
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
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                        className="w-full bg-cyan-950/20 border border-white/5 rounded-full py-3 px-12 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/40 transition-all text-white placeholder-gray-500 shadow-inner"
                    />
                </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2 pr-2">
                {/* KPC Balance Display */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/30 border border-cyan-500/20 rounded-full mr-2 shadow-[0_0_15px_rgba(0,243,255,0.05)]">
                    <span className="text-emerald-400 text-sm">💎</span>
                    <span className="text-sm font-bold text-white font-mono">{(kpcBalance || 0).toLocaleString()}</span>
                    <button
                        onClick={onOpenStore}
                        className="ml-1.5 w-5 h-5 flex items-center justify-center bg-cyan-500 text-black rounded-full font-bold text-xs hover:bg-cyan-400 transition-all shadow-[0_0_10px_rgba(0,243,255,0.5)] active:scale-95"
                    >
                        +
                    </button>
                </div>

                <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-2">
                    <button title="Ecosystem Settings" className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </button>
                </div>

                {user ? (
                    <div className="flex items-center gap-3">
                        <div
                            title={`Logged in as ${user.displayName}`}
                            onClick={onSignOut}
                            className="w-9 h-9 rounded-full border-2 border-cyan-400/50 overflow-hidden shadow-[0_0_15px_rgba(0,243,255,0.3)] cursor-pointer hover:border-rose-500/50 transition-all group relative"
                        >
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover group-hover:opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-bold text-white uppercase">Exit</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onSignIn}
                        className="px-4 py-1.5 bg-cyan-500 text-black font-bold text-xs rounded-full hover:bg-cyan-400 transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                    >
                        SIGN IN
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
