import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FileText, 
    Video, 
    MessageSquare, 
    User, 
    ShieldCheck, 
    LogOut, 
    ChevronRight,
    MapPin,
    PanelLeftClose,
    PanelLeftOpen,
    Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout, isLoading } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { name: 'Tableau de Bord', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Mes Rapports',     path: '/reports',   icon: FileText },
        { name: 'Visioconférence', path: '/meetings',  icon: Video },
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
        <aside className={cn(
            "hidden md:flex flex-col bg-white border-r h-screen sticky top-0 z-40 shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out relative",
            isCollapsed ? "w-24" : "w-64"
        )}>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-10 h-8 w-8 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-primary hover:scale-105 transition-all z-50 focus:outline-none"
            >
                {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {/* Logo Section */}
            <div className={cn("p-6 pb-8 flex flex-col items-center justify-center transition-all flex-shrink-0", isCollapsed ? "px-2" : "px-8")}>
                <Link to="/dashboard" className="transition-all hover:opacity-90 active:scale-95">
                    <img src="/logo.png" alt="AEME Logo" className={cn("w-auto object-contain transition-all", isCollapsed ? "h-10" : "h-16")} />
                </Link>
                {!isCollapsed && (
                    <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] whitespace-nowrap">Sénégal Énergie</span>
                    </div>
                )}
            </div>

            {/* Navigation Section */}
            <nav className={cn("flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide", isCollapsed ? "px-3" : "px-5")}>
                <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 transition-all px-3", isCollapsed ? "opacity-0 h-0 m-0 overflow-hidden" : "pb-3 opacity-100")}>
                    Menu Principal
                </p>
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        title={isCollapsed ? item.name : undefined}
                        className={cn(
                            'group flex items-center rounded-xl text-sm font-semibold transition-all duration-300 relative',
                            isCollapsed ? "justify-center p-3" : "gap-3.5 px-4 py-3",
                            isActive(item.path)
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                        )}
                    >
                        <item.icon size={18} className={cn(
                            'transition-colors duration-300 shrink-0',
                            isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                        )} />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1 whitespace-nowrap font-bold text-xs">{item.name}</span>
                                {isActive(item.path) && <ChevronRight size={14} className="opacity-50 shrink-0" />}
                            </>
                        )}
                    </Link>
                ))}

                <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 transition-all px-3 pt-6", isCollapsed ? "opacity-0 h-0 m-0 overflow-hidden" : "pb-3 opacity-100")}>
                    Utilisateur
                </p>
                <Link
                    to="/profile"
                    title={isCollapsed ? 'Mon Profil' : undefined}
                    className={cn(
                        'group flex items-center rounded-xl text-sm font-semibold transition-all duration-300 relative',
                        isCollapsed ? "justify-center p-3" : "gap-3.5 px-4 py-3",
                        isActive('/profile')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                    )}
                >
                    <User size={18} className={cn(
                        'transition-colors duration-300 shrink-0',
                        isActive('/profile') ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                    )} />
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 whitespace-nowrap font-bold text-xs">Mon Profil</span>
                            {isActive('/profile') && <ChevronRight size={14} className="opacity-50 shrink-0" />}
                        </>
                    )}
                </Link>
            </nav>

            {/* User Profile Section (Link only) */}
            <div className={cn("border-t bg-gray-50/50 transition-all flex-shrink-0", isCollapsed ? "p-3" : "p-6")}>
                <Link to="/profile" className={cn(
                    "flex items-center rounded-2xl border-2 border-white bg-white shadow-sm hover:border-primary/20 transition-all group",
                    isCollapsed ? "justify-center p-2" : "gap-3.5 p-3"
                )}>
                    <Avatar className="h-10 w-10 ring-2 ring-gray-50 shrink-0">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                            {user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                                {isLoading ? '...' : (user?.fullName ?? 'Utilisateur')}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter truncate opacity-60">
                                {user?.role?.replace('_', ' ') || 'Energy Manager'}
                            </p>
                        </div>
                    )}
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
