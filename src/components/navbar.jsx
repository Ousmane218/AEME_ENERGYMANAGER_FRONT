import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Video, MessageSquare, User, Menu, X, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout, isLoading } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Reports',   path: '/reports',   icon: FileText },
        { name: 'Meetings',  path: '/meetings',  icon: Video },
        { name: 'Chat',      path: '/chat',      icon: MessageSquare },
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <nav className="bg-[#003366] text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img src="/logo.png" alt="AEME Logo" className="h-10 w-auto" />
                        <span className="font-bold text-xl tracking-tight text-white">AEME</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={clsx(
                                        'px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors',
                                        isActive(item.path)
                                            ? 'bg-[#002244] text-[#FFCC00]'
                                            : 'hover:bg-[#004080] text-gray-200'
                                    )}
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Profile */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold">
                                {isLoading ? '...' : (user?.fullName ?? 'Utilisateur')}
                            </span>
                            <span className="text-xs text-gray-300">Energy Manager</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-[#003366]">
                            <User size={20} />
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-1 text-xs text-gray-300 hover:text-red-400 transition-colors"
                        >
                            <LogOut size={16} />
                            Déconnexion
                        </button>
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="bg-[#002244] inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-[#004080] focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#002244]">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    'block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3',
                                    isActive(item.path)
                                        ? 'bg-[#003366] text-[#FFCC00]'
                                        : 'text-gray-300 hover:bg-[#004080] hover:text-white'
                                )}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        ))}

                        {/* Mobile Profile */}
                        <div className="border-t border-gray-700 mt-4 pt-4 pb-2">
                            <div className="flex items-center justify-between px-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-[#003366]">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white">
                                            {isLoading ? '...' : (user?.fullName ?? 'Utilisateur')}
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">Energy Manager</div>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1 text-sm text-gray-300 hover:text-red-400 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;