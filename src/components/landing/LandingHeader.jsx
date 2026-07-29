import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const LandingHeader = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();

    const handleAction = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            login();
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="AEME Logo" className="h-10 w-auto" />
                    <div className="hidden md:flex flex-col">
                        <span className="text-sm font-bold text-gray-900 tracking-tight">AEME</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Energy Manager</span>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <a href="#mission" className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors tracking-wide uppercase">Mission</a>
                    <a href="#capacites" className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors tracking-wide uppercase">Capacités</a>
                    <a href="#impact" className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors tracking-wide uppercase">Impact National</a>
                </nav>

                <div className="flex items-center gap-4">
                    <Button 
                        onClick={handleAction}
                        className={cn(
                            "rounded-none bg-primary text-white hover:bg-primary/90 shadow-none",
                            "px-6 py-5 text-xs font-bold uppercase tracking-wider transition-all"
                        )}
                    >
                        {isAuthenticated ? "Mon Tableau de Bord" : "Espace Gestionnaire"}
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default LandingHeader;
