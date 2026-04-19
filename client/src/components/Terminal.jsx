import React, { useState, useEffect, useRef } from 'react';

const Terminal = ({ isOpen, onClose, user, currentPath, onNavigate, onRefresh, currentMenu, onVaultToggle }) => {
    const [history, setHistory] = useState([
        { type: 'info', text: 'KPCloud Terminal v1.0.0 - Secure Operative Console' },
        { type: 'info', text: 'Type "help" for available commands.' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const addHistory = (text, type = 'output') => {
        setHistory(prev => [...prev, { type, text }]);
    };

    const handleCommand = async (cmd) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        addHistory(`> ${trimmed}`, 'input');
        const [action, ...args] = trimmed.split(' ');

        switch (action.toLowerCase()) {
            case 'help':
                addHistory('Available commands:');
                addHistory('  ls          - List files in current directory');
                addHistory('  cd [path]   - Change directory ("cd .." to go up)');
                addHistory('  rm [file]   - Move file to trash');
                addHistory('  vault       - Toggle high security vault');
                addHistory('  clear       - Clear terminal history');
                addHistory('  whoami      - Show current operative info');
                addHistory('  exit        - Close terminal');
                break;
            case 'ls':
                addHistory('Scanning directory...');
                try {
                    const response = await fetch(`/api/files?uid=${user.uid}`);
                    const files = await response.json();
                    const filtered = files.filter(f => f.fullPath.startsWith(currentPath) && f.fullPath !== currentPath);
                    if (filtered.length === 0) {
                        addHistory('Directory is empty.');
                    } else {
                        filtered.forEach(f => {
                            const displayName = f.name;
                            const type = f.isFolder ? '[DIR]' : '[FILE]';
                            addHistory(`${type.padEnd(8)} ${displayName}`);
                        });
                    }
                } catch (e) {
                    addHistory('Error: Failed to fetch file list.', 'error');
                }
                break;
            case 'cd':
                const target = args.join(' ');
                if (!target) {
                    onNavigate('');
                    addHistory('Moved to root.');
                } else if (target === '..') {
                    const parts = currentPath.split('/').filter(Boolean);
                    parts.pop();
                    const newPath = parts.length > 0 ? parts.join('/') + '/' : '';
                    onNavigate(newPath);
                    addHistory(`Moved to ${newPath || 'root'}.`);
                } else {
                    const newPath = currentPath + target + (target.endsWith('/') ? '' : '/');
                    onNavigate(newPath);
                    addHistory(`Moved to ${newPath}.`);
                }
                break;
            case 'vault':
                if (onVaultToggle) {
                    onVaultToggle();
                    addHistory('Toggling high security vault mode...', 'info');
                } else {
                    addHistory('Error: Vault access denied.', 'error');
                }
                break;
            case 'clear':
                setHistory([]);
                break;
            case 'whoami':
                addHistory(`Operative: ${user.displayName || 'Unknown'}`);
                addHistory(`UID: ${user.uid}`);
                addHistory(`Protocol: Encrypted/AES-256`);
                break;
            case 'exit':
                onClose();
                break;
            case 'rm':
                const fileName = args.join(' ');
                if (!fileName) {
                    addHistory('Error: Specify a file name to remove.', 'error');
                } else {
                    addHistory(`Deleting ${fileName}...`);
                    try {
                        const fullPath = currentPath + fileName;
                        const response = await fetch(`/api/delete/${encodeURIComponent(fullPath)}?uid=${user.uid}`, { method: 'DELETE' });
                        if (response.ok) {
                            addHistory(`Success: ${fileName} moved to trash.`);
                            onRefresh();
                        } else {
                            addHistory(`Error: Could not delete ${fileName}.`, 'error');
                        }
                    } catch (e) {
                        addHistory('Error: Network failure.', 'error');
                    }
                }
                break;
            default:
                addHistory(`Command not recognized: ${action}. Type "help" for options.`, 'error');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCommand(input);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[200] h-[40vh] bg-black/95 backdrop-blur-2xl border-t border-cyan-500/30 font-mono text-sm animate-in slide-in-from-bottom duration-300">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-cyan-950/20 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-cyan-500 font-bold tracking-tighter text-xs">OPERATIVE_CONSOLE_v1.0</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{currentPath || 'ROOT'}</span>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        [CLOSE]
                    </button>
                </div>
            </div>

            {/* History Area */}
            <div
                ref={scrollRef}
                className="p-4 h-[calc(100%-80px)] overflow-y-auto space-y-1 custom-scrollbar"
            >
                {history.map((line, i) => (
                    <div key={i} className={`
                        ${line.type === 'input' ? 'text-white font-bold' : ''}
                        ${line.type === 'info' ? 'text-cyan-500' : ''}
                        ${line.type === 'error' ? 'text-rose-500' : ''}
                        ${line.type === 'output' ? 'text-gray-300' : ''}
                    `}>
                        {line.text}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 flex items-center gap-2">
                <span className="text-cyan-400 font-bold">operative@grid:~$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-white selection:bg-cyan-500/50"
                    spellCheck="false"
                    autoFocus
                />
            </form>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 243, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 243, 255, 0.2);
                }
            `}</style>
        </div>
    );
};

export default Terminal;
