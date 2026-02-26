import React, { useState, useEffect } from 'react';

const ActivityLogs = ({ uid }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`/api/logs?uid=${uid}`);
                const data = await response.json();
                setLogs(data);
            } catch (err) {
                console.error("Failed to fetch logs:", err);
            } finally {
                setLoading(false);
            }
        };

        if (uid) fetchLogs();
    }, [uid]);

    const getActionStyle = (action) => {
        switch (action) {
            case 'UPLOAD_STARTED': return { icon: '📤', color: 'text-green-400', bg: 'bg-green-500/10' };
            case 'MOVE_TO_TRASH': return { icon: '🗑️', color: 'text-amber-400', bg: 'bg-amber-500/10' };
            case 'PERMANENT_DELETE': return { icon: '💀', color: 'text-rose-500', bg: 'bg-rose-500/10' };
            case 'RESTORE': return { icon: '🔄', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
            case 'SHARE_LINK': return { icon: '🔗', color: 'text-blue-400', bg: 'bg-blue-500/10' };
            case 'BILLING_RENEWAL': return { icon: '💳', color: 'text-purple-400', bg: 'bg-purple-500/10' };
            case 'BILLING_SUSPENSION': return { icon: '🚫', color: 'text-rose-400', bg: 'bg-rose-500/10' };
            case 'BILLING_RECOVERY': return { icon: '⚡', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
            case 'AUTO_PURGE': return { icon: '🧹', color: 'text-rose-600', bg: 'bg-rose-600/10' };
            case 'PREVIEW': return { icon: '👁️', color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
            default: return { icon: '📝', color: 'text-gray-400', bg: 'bg-gray-500/10' };
        }
    };

    const formatTimestamp = (ts) => {
        const date = new Date(ts);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-4"></div>
                <span className="text-cyan-500 text-xs font-bold tracking-[0.3em] uppercase">Syncing Activity Grid...</span>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                <span className="text-4xl mb-4">📭</span>
                <p className="font-medium">No activity recorded on the grid yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {logs.map((log) => {
                const style = getActionStyle(log.action);
                return (
                    <div key={log.id} className="group relative flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-110`}>
                            {style.icon}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${style.color}`}>
                                    {log.action.replace(/_/g, ' ')}
                                </h4>
                                <span className="text-[10px] font-mono text-gray-600">
                                    {formatTimestamp(log.timestamp)}
                                </span>
                            </div>
                            <p className="text-white text-sm font-medium truncate">
                                {log.details.filename || log.details.path || (log.action.includes('BILLING') ? `Subscription Event: ${log.details.reason || 'Renewal'}` : 'System Action')}
                            </p>
                            {log.details.cost && (
                                <p className="text-[10px] text-purple-400 mt-1 uppercase tracking-widest font-bold">
                                    Cost: {log.details.cost} KPC
                                </p>
                            )}
                        </div>

                        {/* Status Light */}
                        <div className={`w-1 h-8 rounded-full ${style.bg.replace('/10', '/40')} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivityLogs;
