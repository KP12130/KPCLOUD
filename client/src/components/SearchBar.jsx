import React from 'react';

const SearchBar = () => {
    return (
        <header className="h-16 px-6 flex items-center justify-between glass-panel mx-4 mt-4 mb-2">
            <div className="flex-1 max-w-2xl relative">
                <input
                    type="text"
                    placeholder="Search in KPCloud..."
                    className="w-full bg-black/40 border border-cyan-900/30 rounded-lg py-2 px-10 text-sm focus:outline-none focus:border-cyan-500/50 transition-all text-gray-200"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>

            <div className="flex items-center gap-4 ml-6">
                <div className="flex items-center gap-2 px-3 py-1 glass-panel border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-tighter">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    Grid Active
                </div>
                <div className="w-8 h-8 rounded-full border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300 bg-cyan-500/10">
                    KP
                </div>
            </div>
        </header>
    );
};

export default SearchBar;
