import React, { useState } from 'react';

const ConverterHub = ({ onClose, onTopUp, kpcBalance, currentQuota = 1 }) => {
    const [activeTab, setActiveTab] = useState('converter'); // 'store' or 'converter'
    const [selectedPack, setSelectedPack] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Converter State
    const [targetQuota, setTargetQuota] = useState(currentQuota);
    const [features, setFeatures] = useState({
        highSpeed: false,
        apiAccess: false,
        protection: false
    });

    const packs = [
        { id: 'vandor', name: 'Vándor Pack', price: '$1.99', desc: 'Alkalmi mentéshez.', kpc: 2000, color: 'text-gray-300' },
        { id: 'lovag', name: 'Lovag Pack', price: '$4.99', desc: 'Átlagos felhasználóknak.', kpc: 5000, bonus: 500, color: 'text-cyan-400', popular: true },
        { id: 'uralkodo', name: 'Uralkodó Pack', price: '$9.99', desc: 'Hardcore júzereknek.', kpc: 10000, bonus: 2000, color: 'text-amber-400' }
    ];

    const calculateMonthlyCost = () => {
        const storageCost = Math.max(0, targetQuota - 1) * 150;
        const featuresCost = (features.highSpeed ? 100 : 0) + (features.apiAccess ? 1000 : 0) + (features.protection ? 50 : 0);
        return storageCost + featuresCost;
    };

    const handlePurchase = () => {
        if (!selectedPack) return;
        setIsProcessing(true);
        setTimeout(() => {
            onTopUp(selectedPack.kpc + (selectedPack.bonus || 0));
            setIsProcessing(false);
            setActiveTab('converter');
        }, 1500);
    };

    const handleApplyConfig = () => {
        const cost = calculateMonthlyCost();
        if (kpcBalance < cost) {
            alert("Inszignifikáns KPC egyenleg! Kérlek töltsd fel a számládat.");
            setActiveTab('store');
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            alert(`Konfiguráció alkalmazva! Új kvóta: ${targetQuota} GB.`);
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl bg-[#071318]/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(0,243,255,0.2)] overflow-hidden flex flex-col min-h-[600px] animate-in zoom-in-95 duration-300">

                {/* Header Section */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-cyan-900/40 bg-cyan-950/20">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            KP<span className="text-cyan-400">Converter</span> Hub
                        </h2>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setActiveTab('converter')}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'converter' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                ⚡ Storage Converter
                            </button>
                            <button
                                onClick={() => setActiveTab('store')}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'store' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                💎 KPC Store
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full border border-cyan-500/20">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Balance:</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono">💎 {kpcBalance.toLocaleString()}</span>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {activeTab === 'store' ? (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-2">Top-up KP-Coins</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">Vásárolj KPC csomagokat a Birodalmi PayPal szekción keresztül az egyenleged feltöltéséhez.</p>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    {packs.map(pack => (
                                        <div
                                            key={pack.id}
                                            onClick={() => setSelectedPack(pack)}
                                            className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPack?.id === pack.id ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]' : 'border-white/5 bg-black/40 hover:border-white/20'}`}
                                        >
                                            <div className={`text-lg font-bold mb-1 ${pack.color}`}>{pack.name}</div>
                                            <div className="text-2xl font-bold text-white mb-4">💎 {(pack.kpc + (pack.bonus || 0)).toLocaleString()}</div>
                                            <div className="text-sm text-gray-400 mb-6">{pack.desc}</div>
                                            <div className="text-xl font-bold text-cyan-400 border-t border-white/5 pt-4">{pack.price}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-left-4 duration-300">
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold text-white mb-2">System Configurator</h3>
                                    <p className="text-sm text-gray-400 leadling-relaxed">Adjust your cloud resources. Costs are deducted monthly from your KPC balance.</p>
                                </div>

                                {/* Slider Section */}
                                <div className="mb-12 bg-black/40 p-8 rounded-3xl border border-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Target Storage Quota</div>
                                            <div className="text-4xl font-black text-white">{targetQuota} <span className="text-lg text-cyan-500">GB</span></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Storage Cost</div>
                                            <div className="text-2xl font-bold text-emerald-400 font-mono">-{Math.max(0, targetQuota - 1) * 150} KPC</div>
                                            <div className="text-[10px] text-gray-600">Per Month</div>
                                        </div>
                                    </div>

                                    <input
                                        type="range"
                                        min="1"
                                        max="500"
                                        step="1"
                                        value={targetQuota}
                                        onChange={(e) => setTargetQuota(parseInt(e.target.value))}
                                        className="w-full h-2 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                                    />
                                    <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                                        <span>1 GB (Free)</span>
                                        <span>100 GB</span>
                                        <span>250 GB</span>
                                        <span>500 GB (Titan)</span>
                                    </div>
                                </div>

                                {/* Feature Toggles */}
                                <div className="grid grid-cols-3 gap-6">
                                    {[
                                        { id: 'highSpeed', name: 'High-Speed Upload', cost: 100, icon: '🚀' },
                                        { id: 'apiAccess', name: 'Developer API', cost: 1000, icon: '🛠️' },
                                        { id: 'protection', name: 'Link Protection', cost: 50, icon: '🛡️' }
                                    ].map(feat => (
                                        <div
                                            key={feat.id}
                                            onClick={() => setFeatures(prev => ({ ...prev, [feat.id]: !prev[feat.id] }))}
                                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${features[feat.id] ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                                        >
                                            <span className="text-2xl">{feat.icon}</span>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white">{feat.name}</div>
                                                <div className="text-[10px] text-emerald-400 font-bold">+{feat.cost} KPC</div>
                                            </div>
                                            <div className={`w-5 h-5 rounded border ${features[feat.id] ? 'bg-emerald-500 border-emerald-400' : 'border-white/20'} flex items-center justify-center`}>
                                                {features[feat.id] && <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Summary */}
                    <div className="w-80 border-l border-cyan-900/40 bg-black/40 p-8 flex flex-col">
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Order Summary</h4>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Current Balance</span>
                                    <span className="text-white font-mono">💎 {kpcBalance.toLocaleString()}</span>
                                </div>
                                {activeTab === 'converter' ? (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Target Quota</span>
                                            <span className="text-cyan-400 font-bold">{targetQuota} GB</span>
                                        </div>
                                        <div className="border-t border-white/5 pt-4">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span className="text-white">Monthly Total</span>
                                                <span className="text-emerald-400 font-mono">-{calculateMonthlyCost()} KPC</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Selected Pack</span>
                                            <span className="text-cyan-400 font-bold">{selectedPack?.name || 'None'}</span>
                                        </div>
                                        <div className="border-t border-white/5 pt-4">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span className="text-white">Price</span>
                                                <span className="text-cyan-400">{selectedPack?.price || '$0.00'}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            disabled={isProcessing || (activeTab === 'store' && !selectedPack)}
                            onClick={activeTab === 'store' ? handlePurchase : handleApplyConfig}
                            className={`w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-sm transition-all shadow-lg active:scale-[0.98] ${isProcessing ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/20'}`}
                        >
                            {isProcessing ? 'Processing Transaction...' : (activeTab === 'store' ? 'Proceed to PayPal' : 'Apply Configuration')}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ConverterHub;
