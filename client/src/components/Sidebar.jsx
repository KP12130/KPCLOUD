import React from 'react';

const Sidebar = () => {
    const menuItems = [
        { name: 'My Files', icon: '📁', active: true },
        { name: 'Recent', icon: '🕒', active: false },
        { name: 'Starred', icon: '⭐', active: false },
        { name: 'Trash', icon: '🗑️', active: false },
    ];

    return (
        <aside className="w-64 h-full glass-panel border-r border-cyan-900/30 flex flex-col py-6">
            <div className="px-6 mb-8 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.5)]"></div>
                <span className="text-xl font-bold neon-text-blue">KPCloud</span>
            </div>

            <button className="mx-4 mb-8 py-3 glass-panel neon-border hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                <span className="text-xl leading-none">+</span> NEW
            </button>

            <nav className="flex-1">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`sidebar-item ${item.active ? 'active' : ''}`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium">{item.name}</span>
                    </div>
                ))}
            </nav>

            <div className="px-6 mt-auto">
                <div className="p-4 glass-panel border border-cyan-900/20">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-2 uppercase tracking-widest">
                        <span>Storage</span>
                        <span>42%</span>
                    </div>
                    <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 w-[42%] shadow-[0_0_8px_rgba(0,243,255,0.6)]"></div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">6.4 GB of 15 GB used</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
