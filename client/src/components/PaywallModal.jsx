import React, { useState } from 'react';

const PaywallModal = ({ onClose, currentTier, onUpgrade }) => {
    const [selectedTier, setSelectedTier] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const tiers = [
        { name: 'Citizen', price: 0, gb: 5, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
        { name: 'Operative', price: 50, gb: 50, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
        { name: 'Commander', price: 150, gb: 250, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
        { name: 'Titan', price: 500, gb: 'Uncapped', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
    ];

    const handleUpgrade = async () => {
        if (!selectedTier || selectedTier.name === currentTier) return;

        setIsProcessing(true);
        // Simulate an API call to deduct KPC and upgrade rank
        setTimeout(() => {
            onUpgrade(selectedTier.name);
            setIsProcessing(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-[#071318]/90 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.15)] overflow-hidden flex flex-col pt-8 pb-6 px-8 animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
                        Expand Core Storage
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                        Upgrade your KPCloud rank using KPC to permanently increase your data allocation on the Grid.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {tiers.map((tier) => {
                        const isCurrent = currentTier === tier.name;
                        const isSelected = selectedTier?.name === tier.name;

                        return (
                            <div
                                key={tier.name}
                                onClick={() => !isCurrent && setSelectedTier(tier)}
                                className={`
                                    relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300
                                    ${isCurrent ? 'opacity-50 cursor-not-allowed bg-black/40 border-gray-800' : 'cursor-pointer'}
                                    ${isSelected && !isCurrent ? `scale-105 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${tier.border} ${tier.bg}` : ''}
                                    ${!isSelected && !isCurrent ? 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5' : ''}
                                `}
                            >
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-gray-400 border border-gray-700">
                                        Current Rank
                                    </div>
                                )}

                                <div className={`text-xl font-bold mb-4 ${isCurrent ? 'text-gray-500' : tier.color}`}>{tier.name}</div>

                                <div className="flex items-end mb-6">
                                    <span className="text-3xl font-bold text-white mr-2">{tier.gb}</span>
                                    {tier.gb !== 'Uncapped' && <span className="text-sm text-gray-400 mb-1">GB Limit</span>}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-400">Cost</span>
                                    <span className={`text-lg font-bold flex items-center gap-1.5 ${isCurrent ? 'text-gray-500' : 'text-emerald-400'}`}>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h2.45c.14.93 1.05 1.51 2.5 1.51 1.48 0 2.45-.66 2.45-1.63 0-1.11-1.07-1.48-2.65-1.94-2.1-.64-4.08-1.58-4.08-4.07 0-1.92 1.43-3.13 3.27-3.48V3.13h2.67v1.94c1.69.31 2.94 1.41 3.12 3.19h-2.43c-.15-.84-1-1.45-2.28-1.45-1.37 0-2.3.69-2.3 1.63 0 1.02.99 1.4 2.8 1.99 2.16.66 3.93 1.62 3.93 4.04 0 2.05-1.51 3.18-3.51 3.62z" /></svg>
                                        {tier.price === 0 ? 'Free' : tier.price}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleUpgrade}
                        disabled={!selectedTier || isProcessing || selectedTier.name === currentTier}
                        className={`
                            px-8 py-3 rounded-xl font-bold tracking-wide transition-all relative overflow-hidden flex items-center justify-center min-w-[200px]
                            ${(!selectedTier || isProcessing || selectedTier.name === currentTier)
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                                : `bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)]`}
                        `}
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-500 border-t-white animate-spin"></div>
                                <span>Authorizing...</span>
                            </div>
                        ) : selectedTier ? (
                            `Purchase ${selectedTier.name} Rank`
                        ) : (
                            'Select a Rank'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaywallModal;
