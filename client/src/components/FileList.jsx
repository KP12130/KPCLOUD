import React, { useState, useEffect, useMemo } from 'react';

const FileList = ({ currentMenu = 'My Data', user, kpcStatus, onPreview, searchQuery = '' }) => {
    const [view, setView] = useState('list');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState('');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });

    const isPreviewable = (item) => {
        return item && (item.type === 'IMAGE' || item.type === 'VIDEO');
    };

    const handleItemAction = (item) => {
        if (item.isFolder) {
            setCurrentPath(item.fullPath);
        } else if (isPreviewable(item)) {
            onPreview(item);
        }
    };

    const [starredFiles, setStarredFiles] = useState(() => {
        try { return JSON.parse(localStorage.getItem('kpcloud_starred')) || {}; } catch { return {}; }
    });

    const toggleStar = (item) => {
        if (item.isFolder) return;
        const newStarred = { ...starredFiles };
        if (newStarred[item.fullPath]) {
            delete newStarred[item.fullPath];
        } else {
            newStarred[item.fullPath] = true;
        }
        setStarredFiles(newStarred);
        localStorage.setItem('kpcloud_starred', JSON.stringify(newStarred));
    };

    const fetchFiles = async () => {
        if (!user) {
            setFiles([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const isTrashView = currentMenu === 'Trash Bin';
            const endpoint = isTrashView ? `/api/trash?uid=${user.uid}` : `/api/files?uid=${user.uid}`;
            const response = await fetch(endpoint);
            const data = await response.json();

            if (Array.isArray(data)) {
                setFiles(data);
            } else {
                setFiles([]);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();

        const handleUploadEvent = () => fetchFiles();
        window.addEventListener('fileUploaded', handleUploadEvent);

        const handleClickOutside = () => setContextMenu({ visible: false, x: 0, y: 0, item: null });
        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('fileUploaded', handleUploadEvent);
            window.removeEventListener('click', handleClickOutside);
        };
    }, [user, currentMenu]);

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            item: item
        });
    };

    const handleDownload = async (item) => {
        try {
            if (item.isFolder) {
                // Trigger native browser download behavior for the zip endpoint
                window.location.href = `/api/download-folder/${encodeURIComponent(item.fullPath)}?uid=${user.uid}`;
                return;
            }

            const response = await fetch(`/api/download/${encodeURIComponent(item.fullPath)}?uid=${user.uid}`);
            const data = await response.json();
            if (data.url) {
                const a = document.createElement('a');
                a.href = data.url;
                a.download = item.name; // Suggests a filename
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const handleDelete = async (item, permanent = false) => {
        const itemType = item.isFolder ? "folder and all its contents" : "file";
        const msg = permanent
            ? `ARE YOU SURE? This ${itemType} will be PERMANENTLY DELETED and cannot be recovered.`
            : `Move this ${itemType} to Trash?`;

        if (!window.confirm(msg)) return;

        try {
            const response = await fetch(`/api/delete/${encodeURIComponent(item.fullPath)}?uid=${user.uid}&permanent=${permanent}`, { method: 'DELETE' });
            if (response.ok) {
                fetchFiles();
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleRestore = async (item) => {
        try {
            const response = await fetch('/api/trash/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, filename: item.name }) // in trash, name is relative path
            });
            if (response.ok) fetchFiles();
        } catch (error) {
            console.error("Restore error:", error);
        }
    };

    const handleShare = async (item) => {
        try {
            const response = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, filename: item.fullPath })
            });
            const { url } = await response.json();
            if (url) {
                await navigator.clipboard.writeText(url);
                alert("Share link copied to clipboard! (Valid for 7 days)");
            }
        } catch (error) {
            console.error("Share error:", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'FOLDER': return '📁';
            case 'SYSTEM': return '⚙️';
            case 'ENCRYPTED': return '🔐';
            case 'DOCUMENT': return '📋';
            case 'ARCHIVE': return '📦';
            case 'LOG': return '📝';
            case 'DESIGN': return '🎨';
            case 'IMAGE': return '🖼️';
            case 'VIDEO': return '🎬';
            default: return '📜';
        }
    }

    const displayItems = useMemo(() => {
        // --- GLOBAL SEARCH OVERRIDE ---
        if (searchQuery && searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            return files.filter(file =>
                file.name.toLowerCase().includes(query)
            ).map(file => ({
                ...file,
                displayName: file.name.split('/').pop() || file.name,
                isFolder: false, // In search results, show as files
                fullPath: file.name
            }));
        }

        if (currentMenu === 'Trash Bin') {
            return files.map((file, idx) => ({
                ...file,
                id: `trash-${idx}`,
                displayName: file.name.endsWith('/') ? file.name.slice(0, -1) : file.name,
                isFolder: file.name.endsWith('/'),
                fullPath: file.name, // in trash view, fullPath is the path within .trash/
                isTrash: true
            }));
        }

        if (currentMenu === 'Starred') {
            return files.filter(file => starredFiles[file.name]).map(file => ({
                ...file,
                displayName: file.name.split('/').pop(),
                isFolder: false,
                fullPath: file.name
            }));
        }

        if (currentMenu === 'Recent Activity') {
            return [...files].reverse().slice(0, 30).map(file => ({
                ...file,
                displayName: file.name.split('/').pop() || file.name,
                isFolder: false,
                fullPath: file.name
            }));
        }

        const folders = new Map();
        const items = [];

        files.forEach(file => {
            if (file.name.startsWith(currentPath)) {
                const relativePath = file.name.slice(currentPath.length);
                const slashIndex = relativePath.indexOf('/');

                if (slashIndex !== -1) {
                    // It's in a subfolder
                    const folderName = relativePath.slice(0, slashIndex);
                    if (!folders.has(folderName)) {
                        folders.set(folderName, {
                            id: `folder-${currentPath}${folderName}`,
                            name: folderName,
                            displayName: folderName,
                            fullPath: `${currentPath}${folderName}/`,
                            type: 'FOLDER',
                            isFolder: true,
                            size: '--',
                            modified: '--',
                            owner: '--'
                        });
                    }
                } else {
                    // It's a file in current directory
                    if (relativePath !== '') {
                        items.push({
                            ...file,
                            displayName: relativePath,
                            isFolder: false,
                            fullPath: file.name
                        });
                    }
                }
            }
        });

        // Folders first, then files
        return [...Array.from(folders.values()), ...items];
    }, [files, currentPath, currentMenu, starredFiles, searchQuery]);

    return (
        <div className="flex flex-col w-full h-full pb-20 relative z-20">
            {/* Action Bar (View toggles & Breadcrumbs) */}
            <div className="flex items-center justify-between mb-2 px-2 relative z-30">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400 max-w-[60%] overflow-hidden truncate">
                    <button
                        onClick={() => setCurrentPath('')}
                        className={`hover:text-cyan-400 transition-colors ${currentPath === '' ? 'text-cyan-400' : ''}`}
                        disabled={currentMenu !== 'My Data'}
                    >
                        {currentMenu}
                    </button>
                    {currentMenu === 'My Data' && currentPath.split('/').filter(Boolean).map((part, index, arr) => {
                        const pathSoFar = arr.slice(0, index + 1).join('/') + '/';
                        return (
                            <React.Fragment key={pathSoFar}>
                                <span>/</span>
                                <button
                                    onClick={() => setCurrentPath(pathSoFar)}
                                    className={`hover:text-cyan-400 transition-colors ${pathSoFar === currentPath ? 'text-cyan-400' : ''}`}
                                >
                                    {part}
                                </button>
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    {currentMenu === 'Trash Bin' && files.length > 0 && (
                        <button
                            onClick={async () => {
                                if (window.confirm("Empty entire trash permanently? This cannot be undone.")) {
                                    try {
                                        await fetch(`/api/trash/empty?uid=${user.uid}`, { method: 'DELETE' });
                                        fetchFiles();
                                    } catch (err) { console.error(err); }
                                }
                            }}
                            className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full hover:bg-rose-500 hover:text-white transition-all font-bold tracking-widest uppercase mr-2"
                        >
                            Empty Trash
                        </button>
                    )}
                    <div className="flex items-center gap-1 bg-cyan-950/20 p-1 rounded-lg border border-cyan-900/30">
                        <button
                            onClick={() => setView('list')}
                            className={`p-1.5 rounded-md transition-all z-40 relative cursor-pointer ${view === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                            title="List view"
                        >
                            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                        </button>
                        <button
                            onClick={() => setView('grid')}
                            className={`p-1.5 rounded-md transition-all z-40 relative cursor-pointer ${view === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Grid view"
                        >
                            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
                        <span className="text-cyan-400 text-sm font-bold tracking-[0.2em] uppercase">Connecting to Grid...</span>
                    </div>
                </div>
            ) : view === 'list' ? (
                /* List View - Google Drive Table Style */
                <div className="w-full text-sm select-none">
                    {/* Table Header */}
                    <div className="flex items-center px-4 py-3 border-b border-cyan-900/40 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="flex-[3] min-w-0 pr-4">Name</div>
                        <div className="flex-1 hidden md:block px-2">Owner</div>
                        <div className="flex-1 hidden sm:block px-2">Last modified</div>
                        <div className="flex-1 px-2">File size</div>
                        <div className="w-20"></div>
                    </div>

                    {/* Table Rows */}
                    <div className="flex flex-col mt-1">
                        {displayItems.map((item) => (
                            <div
                                key={item.id}
                                onDoubleClick={() => handleItemAction(item)}
                                onContextMenu={(e) => handleContextMenu(e, item)}
                                className={`group flex items-center px-4 py-3 border-b border-cyan-900/20 border-l-2 border-l-transparent hover:bg-cyan-900/30 hover:shadow-[inset_0_0_20px_rgba(0,243,255,0.15)] hover:border-l-cyan-400 transition-all ${item.isFolder ? 'cursor-pointer' : ''}`}
                            >
                                {/* Name & Icon */}
                                <div className="flex-[3] min-w-0 pr-4 flex items-center gap-4">
                                    <div className="text-xl opacity-80 relative">
                                        {getIcon(item.type)}
                                        {starredFiles[item.fullPath] && <span className="absolute -bottom-1 -right-1 text-[10px]">⭐</span>}
                                    </div>
                                    <span className="font-medium text-gray-200 truncate group-hover:text-cyan-400 transition-colors">
                                        {item.displayName || item.name}
                                    </span>
                                </div>

                                {/* Owner */}
                                <div className="flex-1 hidden md:block px-2 text-gray-400">
                                    {item.isFolder ? '--' : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-cyan-900 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                                                {item.owner === 'me' ? 'KP' : item.owner[0]}
                                            </div>
                                            {item.owner}
                                        </div>
                                    )}
                                </div>

                                {/* Modified Date */}
                                <div className="flex-1 hidden sm:block px-2 text-gray-400">
                                    {item.modified}
                                </div>

                                {/* Size */}
                                <div className="flex-1 px-2 text-gray-400">
                                    {item.size}
                                </div>

                                {/* Actions */}
                                <div className="w-20 flex justify-end gap-1 pr-1">
                                    {currentMenu === 'Trash Bin' ? (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); handleRestore(item); }} className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-green-500/20 text-green-400 transition-all" title="Restore">
                                                <span>🔄</span>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item, true); }} className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500 transition-all" title="Delete Forever">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); handleDownload(item); }} className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-cyan-500/20 text-cyan-400 transition-all" title="Download">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500 transition-all" title="Delete">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {displayItems.length === 0 && (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                {currentMenu === 'Trash Bin' ? 'Trash is automatically emptied every 30 days.' : (currentMenu === 'Starred' ? 'No starred files yet.' : 'Folder is empty.')}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-2 select-none">
                    {displayItems.map((item) => (
                        <div
                            key={item.id}
                            onDoubleClick={() => handleItemAction(item)}
                            onContextMenu={(e) => handleContextMenu(e, item)}
                            className={`group flex flex-col glass-panel bg-cyan-950/20 border border-cyan-900/30 hover:border-cyan-400/50 hover:bg-cyan-900/40 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] rounded-2xl transition-all overflow-hidden relative ${item.isFolder ? 'cursor-pointer' : ''}`}
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10">
                                <button onClick={(e) => { e.stopPropagation(); handleDownload(item); }} className="p-1.5 rounded-full bg-cyan-900/80 hover:bg-cyan-500 text-cyan-50 transition-colors shadow-lg shadow-black/50" title={item.isFolder ? "Download as ZIP" : "Download"}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} className="p-1.5 rounded-full bg-red-900/80 hover:bg-red-500 text-red-50 transition-colors shadow-lg shadow-black/50" title="Delete">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                            <div className="h-32 flex items-center justify-center bg-black/40 border-b border-cyan-900/20 relative">
                                {starredFiles[item.fullPath] && <span className="absolute top-2 left-2 text-sm z-10">⭐</span>}
                                <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                                    {getIcon(item.type)}
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <div className="text-lg opacity-80">{getIcon(item.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-200 truncate group-hover:text-cyan-400 transition-colors" title={item.displayName || item.name}>
                                        {item.displayName || item.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{item.size}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {displayItems.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-500 text-sm">
                            {currentMenu === 'Trash Bin' ? 'Trash is automatically emptied every 30 days.' : (currentMenu === 'Starred' ? 'No starred files yet.' : 'Folder is empty.')}
                        </div>
                    )}
                </div>
            )}

            {/* Custom Context Menu */}
            {contextMenu.visible && contextMenu.item && (
                <div
                    className="fixed z-50 bg-[#071318] border border-cyan-500/50 rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.2)] py-2 min-w-[200px] text-sm text-gray-300 backdrop-blur-md"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 mb-2 border-b border-cyan-900/50 flex flex-col">
                        <span className="font-bold text-cyan-400 truncate w-full">{contextMenu.item.displayName || contextMenu.item.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{contextMenu.item.type}</span>
                    </div>

                    {currentMenu === 'Trash Bin' ? (
                        <>
                            <button
                                onClick={() => { handleRestore(contextMenu.item); setContextMenu({ ...contextMenu, visible: false }); }}
                                className="w-full text-left px-4 py-2 hover:bg-green-500/20 hover:text-green-300 transition-colors flex items-center gap-3"
                            >
                                <span>🔄</span> Restore
                            </button>
                            <button
                                onClick={() => { handleDelete(contextMenu.item, true); setContextMenu({ ...contextMenu, visible: false }); }}
                                className="w-full text-left px-4 py-2 hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-3"
                            >
                                <span>🗑️</span> Delete Permanently
                            </button>
                        </>
                    ) : (
                        <>
                            {isPreviewable(contextMenu.item) && (
                                <button
                                    onClick={() => { onPreview(contextMenu.item); setContextMenu({ ...contextMenu, visible: false }); }}
                                    className="w-full text-left px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-200 transition-colors flex items-center gap-3 font-bold"
                                >
                                    <span>👁️</span> Preview
                                </button>
                            )}
                            <button
                                onClick={() => { handleDownload(contextMenu.item); setContextMenu({ ...contextMenu, visible: false }); }}
                                className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors flex items-center gap-3"
                            >
                                <span>📥</span> Download {contextMenu.item.isFolder && "as ZIP"}
                            </button>
                            <button
                                onClick={() => { handleShare(contextMenu.item); setContextMenu({ ...contextMenu, visible: false }); }}
                                className="w-full text-left px-4 py-2 hover:bg-blue-500/20 hover:text-blue-300 transition-colors flex items-center gap-3"
                            >
                                <span>🔗</span> Share Link
                            </button>
                            {!contextMenu.item.isFolder && (
                                <button
                                    onClick={() => { toggleStar(contextMenu.item); setContextMenu({ ...contextMenu, visible: false }); }}
                                    className="w-full text-left px-4 py-2 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors flex items-center gap-3"
                                >
                                    <span>⭐</span> {starredFiles[contextMenu.item.fullPath] ? 'Unstar' : 'Star'}
                                </button>
                            )}
                            <button
                                onClick={() => { handleDelete(contextMenu.item); setContextMenu({ ...contextMenu, visible: false }); }}
                                className="w-full text-left px-4 py-2 hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-3"
                            >
                                <span>🗑️</span> Move to Trash
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileList;
