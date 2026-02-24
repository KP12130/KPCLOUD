import React, { useState, useEffect } from 'react';

const Sidebar = () => {
    const [storage, setStorage] = useState(null);

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const response = await fetch('/api/storage');
                const data = await response.json();
                setStorage(data);
            } catch (error) {
                console.error("Error fetching storage:", error);
            }
        };

        fetchStorage();
    }, []);

    const menuItems = [
        { name: 'My Data', icon: '☁️', active: true },
        { name: 'Recent Activity', icon: '🕒', active: false },
        { name: 'Starred', icon: '⭐', active: false },
        { name: 'Trash Bin', icon: '🗑️', active: false },
    ];

    return (
        <aside className="w-64 h-full flex flex-col py-4 z-10 shrink-0 border-r border-transparent">
            {/* New Button */}
            <div className="px-4 mb-6">
                <button className="py-3 px-6 bg-cyan-950/40 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2 text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(0,243,255,0.05)] rounded-2xl">
                    <span className="text-xl leading-none -mt-0.5">+</span> Upload
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`flex items-center gap-4 px-4 py-2 rounded-full cursor-pointer transition-colors ${item.active
                                ? 'bg-cyan-500/15 text-cyan-400'
                                : 'text-gray-400 hover:bg-cyan-500/5 hover:text-gray-200'
                            }`}
                    >
                        <span className="text-base opacity-90">{item.icon}</span>
                        <span className="font-medium text-[13px]">{item.name}</span>
                    </div>
                ))}
            </nav>

            {/* Storage Area */}
            <div className="px-6 mt-auto mb-4">
                <div className="flex items-center gap-2 text-gray-400 mb-3 hover:text-cyan-400 cursor-pointer transition-colors">
                    <span>☁️</span> <span className="text-sm font-medium">Storage Allocation</span>
                </div>

                {storage ? (
                    <>
                        <div className="h-1.5 bg-cyan-950 rounded-full overflow-hidden border border-cyan-900/30 relative">
                            <div
                                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.8)] transition-all duration-1000"
                                style={{ width: `${storage.percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 font-sans tracking-wide">
                            {storage.usedGB} GB / {storage.totalGB} GB used ({storage.tier})
                        </p>
                    </>
                ) : (
                    <div className="animate-pulse h-1.5 bg-cyan-900/50 rounded-full w-full"></div>
                )}

                <button className="mt-4 w-full py-2 border border-cyan-800 rounded-full text-xs text-cyan-400 font-medium hover:bg-cyan-900/30 transition-colors">
                    Expand Core Storage
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
