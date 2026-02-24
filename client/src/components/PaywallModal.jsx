import React, { useState } from 'react';

const PaywallModal = ({ onClose, onTopUp }) => {
    const [selectedPack, setSelectedPack] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const packs = [
        { id: 'vandor', name: 'Vándor Pack', price: '$1.99', desc: 'Alkalmi mentéshez.', kpc: 2000, bonus: 0, color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
        { id: 'lovag', name: 'Lovag Pack', price: '$4.99', desc: 'Átlagos felhasználóknak.', kpc: 5000, bonus: 500, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', popular: true },
        { id: 'uralkodo', name: 'Uralkodó Pack', price: '$9.99', desc: 'Hardcore júzereknek.', kpc: 10000, bonus: 2000, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
    ];

    const handlePurchase = async () => {
        if (!selectedPack) return;

        setIsProcessing(true);
        // Simulate an API call to process PayPal payment and add KPC
        setTimeout(() => {
            onTopUp(selectedPack.kpc + selectedPack.bonus);
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
                        KPC Store
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                        Top up your KP-Coin balance to secure extra storage over 1GB and unlock premium features.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    {packs.map((pack) => {
                        const isSelected = selectedPack?.id === pack.id;

                        return (
                            <div
                                key={pack.id}
                                onClick={() => setSelectedPack(pack)}
                                className={`
                                    relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                                    ${isSelected ? `scale-105 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${pack.border} ${pack.bg}` : ''}
                                    ${!isSelected ? 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5' : ''}
                                `}
                            >
                                {pack.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full text-white border border-cyan-400">
                                        Legjobb Ajánlat
                                    </div>
                                )}

                                <div className={`text-xl font-bold mb-1 ${pack.color}`}>{pack.name}</div>
                                <div className="text-xs text-gray-500 h-8 mb-4">{pack.desc}</div>

                                <div className="flex flex-col items-center justify-center bg-black/40 rounded-xl py-6 mb-6 border border-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-4xl font-bold text-white">{pack.kpc.toLocaleString()}</span>
                                        <span className="text-sm font-bold text-gray-400 mt-2">KPC</span>
                                    </div>
                                    {pack.bonus > 0 && (
                                        <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mt-2">
                                            +{pack.bonus.toLocaleString()} BONUS KPC
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-400">Price (Paypal)</span>
                                    <span className="text-2xl font-bold text-white">
                                        {pack.price}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-end border-t border-cyan-900/30 pt-6">
                    <button
                        onClick={handlePurchase}
                        disabled={!selectedPack || isProcessing}
                        className={`
                            px-10 py-3 rounded-xl font-bold tracking-wide transition-all relative overflow-hidden flex items-center justify-center min-w-[250px]
                            ${(!selectedPack || isProcessing)
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                                : `bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)]`}
                        `}
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : selectedPack ? (
                            `Buy ${selectedPack.name} (${selectedPack.price})`
                        ) : (
                            'Select a Package'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PaywallModal;
