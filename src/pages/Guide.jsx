import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userGuide } from '../data/userGuide';
import {
    ArrowLeft, ArrowRight, BookOpen, User, Shield, List, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Guide = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // States: 'roles', 'sommaire', 'lecture'
    const [view, setView] = useState('roles');
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Auto-select role visual cue
    const userRole = user?.role?.toUpperCase();
    const recommendedRoleKey = userRole === 'ADMIN' ? 'administrateur' : userRole === 'GESTIONNAIRE' ? 'gestionnaire' : null;

    const handleRoleSelect = (roleKey) => {
        setSelectedRole(roleKey);
        setView('sommaire');
    };

    const handleSectionSelect = (index) => {
        setSelectedSectionIndex(index);
        setCurrentStepIndex(0);
        setView('lecture');
    };

    const goToSommaire = () => {
        setView('sommaire');
        setSelectedSectionIndex(null);
    };

    const goToRoles = () => {
        setView('roles');
        setSelectedRole(null);
        setSelectedSectionIndex(null);
    };

    const handleNext = () => {
        if (!selectedRole || selectedSectionIndex === null) return;
        const totalSteps = userGuide[selectedRole].sections[selectedSectionIndex].steps.length;
        if (currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Render Roles Selection
    if (view === 'roles') {
        return (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 py-8 px-4">
                <div className="flex flex-col items-center text-center space-y-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-900 absolute top-8 left-8 hidden md:flex items-center gap-2">
                        <ArrowLeft size={16} /> Retour au tableau de bord
                    </Button>
                    <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-2">
                        <BookOpen size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Guide Utilisateur</h1>
                    <p className="text-muted-foreground font-medium max-w-lg">Bienvenue dans le guide d’utilisation d’Energy Manager. Sélectionnez votre profil pour commencer.</p>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                    <p className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest">Qui êtes-vous ?</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card
                            onClick={() => handleRoleSelect('gestionnaire')}
                            className={cn(
                                "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 group overflow-hidden",
                                recommendedRoleKey === 'gestionnaire' ? "border-primary/50 shadow-md" : "border-gray-100 hover:border-primary/30"
                            )}
                        >
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <User size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black uppercase text-gray-900">Gestionnaire</h2>
                                    {recommendedRoleKey === 'gestionnaire' && (
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none uppercase tracking-widest text-[9px] font-black">Votre Profil</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            onClick={() => handleRoleSelect('administrateur')}
                            className={cn(
                                "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 group overflow-hidden",
                                recommendedRoleKey === 'administrateur' ? "border-primary/50 shadow-md" : "border-gray-100 hover:border-primary/30"
                            )}
                        >
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black uppercase text-gray-900">Administrateur</h2>
                                    {recommendedRoleKey === 'administrateur' && (
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none uppercase tracking-widest text-[9px] font-black">Votre Profil</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-center md:hidden pt-8">
                        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-400">
                            <ArrowLeft size={16} className="mr-2" /> Retour au tableau de bord
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Sommaire
    if (view === 'sommaire' && selectedRole) {
        const sections = userGuide[selectedRole].sections;

        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-right-4 fade-in duration-300 py-8 px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="sm" onClick={goToRoles} className="text-gray-400 hover:text-gray-900 h-8 px-2 -ml-2">
                                <ArrowLeft size={14} className="mr-1" /> Changer de profil
                            </Button>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase flex items-center gap-3">
                            Guide <span className="text-primary">{userGuide[selectedRole].label}</span>
                        </h1>
                        <p className="text-muted-foreground font-medium">Sélectionnez une rubrique pour consulter les actions disponibles.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/dashboard')} className="hidden md:flex rounded-xl">
                        Retour au tableau de bord
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((section, idx) => (
                        <Card
                            key={idx}
                            onClick={() => handleSectionSelect(idx)}
                            className="cursor-pointer border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all group overflow-hidden bg-white/50 backdrop-blur-sm"
                        >
                            <CardHeader className="p-6 border-b border-gray-50 bg-gray-50/50 group-hover:bg-primary/5 transition-colors">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-900 flex items-center gap-3">
                                    <List size={16} className="text-primary/60" /> {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    {section.steps.slice(0, 3).map((step, sIdx) => (
                                        <div key={sIdx} className="flex items-start gap-2 text-xs text-gray-600">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                            <span className="line-clamp-1">{step.label}</span>
                                        </div>
                                    ))}
                                    {section.steps.length > 3 && (
                                        <p className="text-[10px] font-bold text-gray-400 italic pt-2">
                                            + {section.steps.length - 3} autres actions...
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center md:hidden pt-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-400">
                        Retour au tableau de bord
                    </Button>
                </div>
            </div>
        );
    }

    // Render Lecture (Fiche détaillée)
    if (view === 'lecture' && selectedRole && selectedSectionIndex !== null) {
        const section = userGuide[selectedRole].sections[selectedSectionIndex];
        const step = section.steps[currentStepIndex];
        const totalSteps = section.steps.length;

        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 py-12 px-4 h-full flex flex-col justify-center min-h-[80vh]">
                <div className="flex items-center justify-between mb-2">
                    <Button variant="ghost" size="sm" onClick={goToSommaire} className="text-gray-400 hover:text-gray-900">
                        <ArrowLeft size={16} className="mr-2" /> Retour au sommaire
                    </Button>
                    <Badge variant="outline" className="font-black tracking-widest uppercase text-[10px] border-gray-200 text-gray-500 hidden sm:inline-flex">
                        {section.title}
                    </Badge>
                </div>

                <div key={currentStepIndex} className="animate-in slide-in-from-right-4 fade-in duration-300">
                    <Card className="border-none shadow-2xl shadow-black/5 bg-white overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-100 flex flex-row items-center justify-between gap-4">
                            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 leading-tight">
                                {step.label}
                            </CardTitle>
                            <div className="text-xs font-black text-gray-400 bg-gray-100/80 px-3 py-1 rounded-lg shrink-0">
                                {currentStepIndex + 1} / {totalSteps}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12">
                            {step.description && (
                                <p className="text-sm md:text-base text-gray-600 mb-8 max-w-2xl leading-relaxed">
                                    {step.description}
                                </p>
                            )}
                            <div className="bg-primary/5 rounded-2xl p-6 md:p-8 border border-primary/10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-6">Chemin d'accès</p>
                                <div className="flex flex-wrap items-center gap-y-4 gap-x-2">
                                    {step.path.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-sm md:text-base font-bold text-gray-800 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                                {p}
                                            </span>
                                            {i < step.path.length - 1 && (
                                                <ChevronRight size={18} className="text-primary/40" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 pb-8 sm:pb-0 gap-6 sm:gap-0">
                    {/* Mobile Navigation Buttons */}
                    <div className="flex w-full sm:hidden items-center justify-between gap-4 order-1">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handlePrev}
                            disabled={currentStepIndex === 0}
                            className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1"
                        >
                            <ArrowLeft size={16} className="mr-2" /> Précédent
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            onClick={handleNext}
                            disabled={currentStepIndex === totalSteps - 1}
                            className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1 bg-primary hover:bg-primary/90"
                        >
                            Suivant <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>

                    {/* Desktop Previous Button */}
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePrev}
                        disabled={currentStepIndex === 0}
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] w-32 hidden sm:flex"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Précédent
                    </Button>

                    {/* Progress Indicator */}
                    <div className="flex gap-1 justify-center w-full sm:w-auto order-2 sm:order-none">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    i === currentStepIndex ? "w-6 bg-primary" : "w-2 bg-gray-200"
                                )}
                            />
                        ))}
                    </div>

                    {/* Desktop Next Button */}
                    <Button
                        variant="default"
                        size="lg"
                        onClick={handleNext}
                        disabled={currentStepIndex === totalSteps - 1}
                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] w-32 bg-primary hover:bg-primary/90 hidden sm:flex"
                    >
                        Suivant <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};

export default Guide;
