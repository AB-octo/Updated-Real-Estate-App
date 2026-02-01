import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: '📊', path: '/admin-dash' },
        { name: 'Properties', icon: '🏠', path: '/admin-dash?tab=all' },
        { name: 'Moderation', icon: '🛡️', path: '/admin-dash?tab=pending' },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6">
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        Estately Admin
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname + location.search === item.path || (location.pathname === item.path && !location.search && item.name === 'Dashboard')
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate">{user?.username}</p>
                                <p className="text-xs text-slate-500 truncate">Administrator</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full mt-2 flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors text-xs"
                    >
                        <span>←</span>
                        <span>View Main Site</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 px-8 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
                    <h2 className="text-lg font-bold">System Management</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-xs py-1 px-2 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                            Server Online
                        </span>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
