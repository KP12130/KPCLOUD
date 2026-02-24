import React from 'react';

const Sidebar = () => {
    const menuItems = [
        { name: 'My Files', icon: '📁', active: true },
        { name: 'Recent', icon: '🕒', active: false },
        { name: 'Starred', icon: '⭐', active: false },
        { name: 'Trash', icon: '🗑️', active: false },
    ];

    return (
        <aside className="w-64 h-full glass-panel border-r border-cyan-900/30 flex flex-col py-8 z-20">
            <div className="px-6 mb-12 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-700/30 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tighter neon-text-blue">KPCloud</span>
                    <span className="text-[8px] text-cyan-500/50 uppercase tracking-[0.4em] -mt-1 ml-0.5">Operative Tier</span>
                </div>
            </div>

            <button className="mx-6 mb-8 py-3.5 glass-panel border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] shadow-[0_0_10px_rgba(0,243,255,0.05)]">
                <span className="text-lg leading-none">+</span> TRANSMIT DATA
            </button>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`sidebar-item ${item.active ? 'active' : ''}`}
                    >
                        <span className="text-lg opacity-80">{item.icon}</span>
                        <span className="font-bold uppercase tracking-wider">{item.name}</span>
                    </div>
                ))}
            </nav>

            <div className="px-6 mt-auto">
                <div className="p-5 glass-panel border border-cyan-900/20 bg-cyan-950/5">
                    <div className="flex justify-between text-[9px] text-cyan-500/80 mb-2 uppercase font-bold tracking-[0.1em]">
                        <span>Cloud Bandwidth</span>
                        <span>72%</span>
                    </div>
                    <div className="h-1 bg-cyan-950 rounded-full overflow-hidden border border-cyan-900/50">
                        <div className="h-full bg-cyan-400 w-[72%] shadow-[0_0_10px_rgba(0,243,255,0.8)]"></div>
                    </div>
                    <p className="text-[9px] text-gray-600 mt-3 font-mono">32.4 GB / 50 GB ALLOCATED</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
