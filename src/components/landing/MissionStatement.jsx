import React from 'react';
import { CheckCircle2, Target, Award, MonitorSmartphone, GraduationCap } from 'lucide-react';

const MissionStatement = () => {
    return (
        <section id="projet-gestionnaires" className="w-full bg-white py-24 lg:py-32 border-t border-gray-100 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-70 pointer-events-none" />
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16">
                    
                    {/* Left: Intro & Perspectives */}
                    <div className="w-full lg:w-[40%] flex flex-col gap-10 animate-in slide-in-from-left-8 duration-1000 fade-in">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-1 bg-primary" />
                                <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Le Projet</span>
                            </div>
                            <h2 className="font-heading text-3xl md:text-5xl text-gray-900 leading-tight mb-6">
                                Déploiement National des Gestionnaires de l'Énergie
                            </h2>
                            <p className="text-base text-gray-600 leading-relaxed font-sans mb-4">
                                L’AEME développe le projet de mise en place de gestionnaires de l’énergie au niveau national qui est également inscrit dans son nouveau <strong>Plan Stratégique de Développement (PSD) 2025-2029</strong>.
                            </p>
                            <p className="text-base text-gray-600 leading-relaxed font-sans">
                                Ce projet constitue une priorité des autorités comme en atteste les décisions n°02 et n°04 de la réunion interministérielle sur l’économie d’énergie du 30 août 2025, avec un objectif global de <strong>9000 gestionnaires de l’énergie</strong> à mettre en place.
                            </p>
                        </div>
                        
                        {/* Perspectives section */}
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                            <h3 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-3 relative z-10">
                                <Target className="w-6 h-6 text-primary" />
                                Perspectives
                            </h3>
                            <ul className="space-y-4 relative z-10">
                                <li className="flex items-start gap-3">
                                    <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-600">Instaurer le prix des meilleurs gestionnaires de l’énergie pour encourager leur engagement et motivation.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MonitorSmartphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-600">Mettre en place une application digitale d’interconnexion, de suivi et d’accompagnement.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <GraduationCap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-600">Faire du « gestionnaire de l’énergie » un nouveau corps de métier dans l’administration publique.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Roles & Interventions */}
                    <div className="w-full lg:w-[60%] flex flex-col gap-8 animate-in slide-in-from-right-8 duration-1000 fade-in delay-200">
                        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                                Rôle & Interventions
                            </h3>
                            <p className="text-base text-gray-600 leading-relaxed font-sans mb-6 pb-6 border-b border-gray-100">
                                Les gestionnaires de l’énergie sont spécialement destinés aux bâtiments, infrastructures et édifices administratifs en vue d’accompagner la politique de l’État pour la rationalisation des dépenses publiques d’électricité. Ils servent de garants des installations (climatisation, éclairage, bureautique, etc.) et aux différentes énergies et fluides pour en assurer le suivi et la gestion efficiente.
                            </p>
                            
                            <p className="text-sm font-semibold text-gray-900 mb-6">
                                Leurs interventions consistent notamment à :
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {[
                                    "La mise en place d’un cadastre énergétique",
                                    "La tenue de la comptabilité énergétique",
                                    "Le suivi et l’analyse de la facturation d’électricité",
                                    "La coordination avec l’AEME et Senelec (abonnements, corrections, redressements)",
                                    "La contribution aux spécifications techniques des commandes pour les performances énergétiques",
                                    "La vulgarisation et mise en application des réglementations",
                                    "La sensibilisation du personnel sur l'utilisation rationnelle",
                                    "Le suivi des performances et de la bonne utilisation des équipements",
                                    "Le suivi et la gestion des applications digitales de contrôle des consommations",
                                    "Le suivi du respect de l’exploitation et de la maintenance des installations"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MissionStatement;
