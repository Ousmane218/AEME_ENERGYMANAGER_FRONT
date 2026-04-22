import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Video, MessageSquare, User, Menu, X, LogOut, ShieldCheck, ChevronRight, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

const Navbar = ({ isMobileOnly = false }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout, isLoading } = useAuth();

    if (!isMobileMenuOpen) {
        if (!isMobileOnly) {
            // Desktop uses Sidebar, so we only show the mobile trigger bar here
            return (
                <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50">
                    <Link to="/dashboard">
                        <img src="/logo.png" alt="AEME Logo" className="h-10 w-auto" />
                    </Link>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="h-10 w-10 text-primary hover:bg-primary/5"
                    >
                        <Menu size={24} />
                    </Button>
                </div>
            );
        } else {
            return (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="h-10 w-10 text-primary hover:bg-primary/5"
                >
                    <Menu size={24} />
                </Button>
            );
        }
    }

    const navItems = [
        { name: 'Tableau de Bord', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Mes Rapports',     path: '/reports',   icon: FileText },
        { name: 'Réunions',         path: '/meetings',  icon: Video },
        { name: 'Messagerie',       path: '/chat',      icon: MessageSquare },
        { name: 'Carte',            path: '/map',       icon: MapPin },
    ];

    if (user?.isAdmin) {
        navItems.push({ name: 'Gestionnaires', path: '/admin/users', icon: ShieldCheck });
        navItems.push({ name: 'Structures',   path: '/admin/structures', icon: Building2 });
    }

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Full Screen Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in fade-in slide-in-from-top duration-300">
                    {/* Overlay Header */}
                    <div className="flex items-center justify-between px-6 py-6 border-b">
                        <img src="/logo.png" alt="AEME Logo" className="h-12 w-auto" />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="h-10 w-10 text-gray-400 hover:text-primary transition-colors"
                        >
                            <X size={24} />
                        </Button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
                         <p className="px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Navigation</p>
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    'flex items-center gap-5 px-5 py-4 rounded-2xl text-base font-bold transition-all',
                                    isActive(item.path)
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                                )}
                            >
                                <item.icon size={22} className={cn(
                                    isActive(item.path) ? 'text-white' : 'text-primary/60'
                                )} />
                                <span className="flex-1">{item.name}</span>
                                <ChevronRight size={18} className="opacity-30" />
                            </Link>
                        ))}

                        <p className="px-4 pt-10 pb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Compte</p>
                        <Link
                            to="/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                'flex items-center gap-5 px-5 py-4 rounded-2xl text-base font-bold transition-all',
                                isActive('/profile')
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                            )}
                        >
                            <User size={22} className={cn(
                                isActive('/profile') ? 'text-white' : 'text-primary/60'
                            )} />
                            <span className="flex-1">Mon Profil</span>
                            <ChevronRight size={18} className="opacity-30" />
                        </Link>
                    </nav>

                    {/* Overlay Footer */}
                    <div className="p-6 border-t bg-gray-50/50 space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border shadow-sm">
                            <Avatar className="h-12 w-12 border-2 border-primary/10">
                                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                    {user?.fullName?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {isLoading ? '...' : (user?.fullName ?? 'Utilisateur')}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                    {user?.role?.replace('_', ' ') || 'Energy Manager'}
                                </p>
                            </div>
                        </div>

                        <Button 
                            variant="destructive" 
                            className="w-full h-14 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-red-100"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                logout();
                            }}
                        >
                            <LogOut className="mr-3 h-5 w-5" /> Déconnexion
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;