import React, { useState } from 'react';

const Settings = ({ user, kpcStatus, balance, onUpgrade }) => {
    const [activeTab, setActiveTab] = useState('Account');

    const tabs = [
        { name: 'Account', icon: '👤' },
        { name: 'Security', icon: '🛡️' },
        { name: 'Storage', icon: '📦' },
        { name: 'About', icon: 'ℹ️' }
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="mb-8 pl-2">
                <h2 className="text-sm font-bold tracking-[0.3em] text-cyan-500 uppercase mb-2">System Preferences</h2>
                <h1 className="text-3xl text-white font-bold tracking-tight">Settings</h1>
            </div>

            <div className="flex gap-8 flex-1 overflow-hidden">
                {/* Tabs Sidebar */}
                <div className="w-48 flex flex-col gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.name
                                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-white shadow-[0_0_15px_rgba(0,243,255,0.1)]'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-panel p-8 overflow-y-auto bg-black/20 border-white/5 rounded-3xl">

                    {activeTab === 'Account' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <section>
                                <h3 className="text-white font-bold uppercase tracking-widest text-[10px] opacity-40 mb-6">Profile Information</h3>
                                <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                                    <img src={user?.photoURL} alt="Profile" className="w-20 h-20 rounded-full border-2 border-cyan-500/30 p-1 shadow-2xl" />
                                    <div>
                                        <h4 className="text-white text-xl font-bold">{user?.displayName}</h4>
                                        <p className="text-gray-500 text-sm">{user?.email}</p>
                                        <div className="mt-3 flex gap-2">
                                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">Verified User</span>
                                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest">Early Access</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-white font-medium mb-4">Display Name</h4>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        defaultValue={user?.displayName}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white flex-1 focus:border-cyan-500/50 outline-none transition-all"
                                    />
                                    <button className="bg-white/10 px-6 py-2 rounded-xl text-white text-xs font-bold uppercase hover:bg-white/20 transition-all">Update</button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <section>
                                <h3 className="text-white font-bold uppercase tracking-widest text-[10px] opacity-40 mb-6">Advanced Protection</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <h4 className="text-white font-bold mb-1">Two-Factor Authentication</h4>
                                            <p className="text-gray-500 text-xs">Require a security code to access your grid from new devices.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-cyan-500/20 rounded-full relative border border-cyan-500/30 cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.5)]"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <h4 className="text-white font-bold mb-1">Session Lock</h4>
                                            <p className="text-gray-500 text-xs">Automatically lock the interface after 30 minutes of inactivity.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-white/10 rounded-full relative border border-white/5 cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white/40 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'Storage' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <section>
                                <h3 className="text-white font-bold uppercase tracking-widest text-[10px] opacity-40 mb-6">Resource Allocation</h3>
                                <div className="p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/10">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <span className="text-cyan-400 text-3xl font-bold">{kpcStatus?.quotaGB} GB</span>
                                            <span className="text-gray-500 text-sm ml-2">Total Quota</span>
                                        </div>
                                        <span className="text-gray-500 text-xs font-mono">Current Balance: {balance} KPC</span>
                                    </div>

                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-6">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                                            style={{ width: `${(kpcStatus?.usedBytes / (kpcStatus?.quotaGB * 1024 * 1024 * 1024)) * 100}%` }}
                                        ></div>
                                    </div>

                                    <button
                                        onClick={onUpgrade}
                                        className="w-full py-4 bg-cyan-500 text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Manage Plan & Quota
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'About' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <section className="text-center py-12">
                                <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">KPCLOUD <span className="text-cyan-500">GRID</span></h1>
                                <p className="text-gray-500 text-xs uppercase tracking-[0.5em] mb-8">Version 1.2.0-Alpha</p>
                                <div className="max-w-md mx-auto p-6 bg-white/5 rounded-2xl border border-white/5 text-gray-400 text-sm leading-relaxed">
                                    KPCloud is a next-generation decentralized edge storage protocol.
                                    Built with R2 technology and biometric security to ensure your data
                                    remains persistent, private, and always accessible.
                                </div>
                                <div className="mt-8 flex justify-center gap-4">
                                    <button className="text-cyan-400 text-xs font-bold uppercase tracking-widest hover:underline">Commit Logs</button>
                                    <span className="text-gray-700">|</span>
                                    <button className="text-cyan-400 text-xs font-bold uppercase tracking-widest hover:underline">Security Manifest</button>
                                </div>
                            </section>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;
