import React from 'react';
import { cn } from '@/lib/utils';

const LandingHeader = () => {

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all">
            <div className="mx-auto flex py-4 min-h-[5rem] max-w-7xl items-center justify-between px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="AEME Logo" className="h-20 md:h-24 w-auto" />
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <a href="#projet-gestionnaires" className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors tracking-wide uppercase">Projet des Gestionnaires</a>
                    <a href="#impact" className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors tracking-wide uppercase">Cartographie</a>
                    <a href="#contact" className="text-xs font-semibold text-gray-600 hover:text-primary transition-colors tracking-wide uppercase">Contact</a>
                </nav>

                <div className="flex items-center gap-4">
                    <a
                        href="https://aeme.sn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "inline-flex items-center justify-center rounded-none bg-primary text-white hover:bg-primary/90 shadow-none",
                            "px-6 py-5 text-xs font-bold uppercase tracking-wider transition-all h-full"
                        )}
                    >
                        Site officiel de l’AEME
                    </a>
                </div>
            </div>
        </header>
    );
};

export default LandingHeader;
