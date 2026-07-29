import React from 'react';
import { FileText, MapPin, Users } from 'lucide-react';

const PlatformCapabilities = () => {
    return (
        <section id="capacites" className="w-full bg-white py-24 lg:py-32 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-32">
                
                {/* Capability 1: Rapports (Left Image, Right Text) */}
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="w-full lg:w-1/2 relative">
                        <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative group shadow-sm border border-gray-100">
                            {/* Placeholder: Admin doing reporting */}
                            <img 
                                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop" 
                                alt="Saisie de rapports énergétiques" 
                                className="object-cover w-full h-full transition-transform duration-[10s] group-hover:scale-105"
                            />
                            <div className="absolute top-6 left-6 bg-white p-3 shadow-md">
                                <FileText className="text-primary" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">01. Suivi Analytique</span>
                        <h3 className="font-heading text-3xl md:text-4xl text-gray-900 mb-6">
                            Rapports et consommations
                        </h3>
                        <p className="text-gray-600 font-sans leading-relaxed text-lg">
                            Saisie, consultation et suivi des rapports énergétiques. La plateforme simplifie la remontée des données depuis toutes les structures gouvernementales vers les équipes centrales de l'AEME.
                        </p>
                    </div>
                </div>

                {/* Capability 2: Cartographie (Full Width Green background variation) */}
                <div className="relative w-full bg-primary text-white py-20 px-8 lg:px-16 flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24 shadow-sm">
                    {/* Abstract Map Preview Component Representation */}
                    <div className="w-full lg:w-1/2 aspect-video bg-white/5 border border-white/10 relative overflow-hidden backdrop-blur-sm flex items-center justify-center p-8 group">
                         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                         <div className="bg-white/10 p-4 backdrop-blur-md border border-white/20 transition-transform duration-700 group-hover:-translate-y-2">
                             <div className="flex items-center gap-4 mb-4 border-b border-white/20 pb-4">
                                <MapPin className="text-accent" size={24} />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-white">Couverture Nationale</p>
                                    <p className="text-xs text-gray-300">Aperçu cartographique</p>
                                </div>
                             </div>
                             <div className="w-48 h-2 bg-white/20 rounded-full mb-2" />
                             <div className="w-32 h-2 bg-white/10 rounded-full" />
                         </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4">02. Localisation</span>
                        <h3 className="font-heading text-3xl md:text-4xl text-white mb-6">
                            Cartographie nationale
                        </h3>
                        <p className="text-gray-200 font-sans leading-relaxed text-lg">
                            Visualisation des structures et des gestionnaires à travers les régions. Un outil d'aide à la décision pour identifier les points de consommation stratégiques sur le territoire sénégalais.
                        </p>
                    </div>
                </div>

                {/* Capability 3: Réseau (Left Text, Right Abstract UI) */}
                <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">03. Collaboration</span>
                        <h3 className="font-heading text-3xl md:text-4xl text-gray-900 mb-6">
                            Coordination du réseau
                        </h3>
                        <p className="text-gray-600 font-sans leading-relaxed text-lg">
                            Communication, réunions et circulation de l’information entre les acteurs. Un espace d'échange sécurisé pour partager les directives, les bonnes pratiques et alerter sur les anomalies.
                        </p>
                    </div>
                    <div className="w-full lg:w-1/2 relative">
                        <div className="aspect-square max-w-md ml-auto bg-gray-50 border border-gray-100 p-8 flex flex-col gap-6 relative shadow-sm">
                             {/* Abstract UI representation of chat/users */}
                             <div className="flex items-center gap-4 bg-white p-4 shadow-sm border border-gray-100 transition-transform duration-500 hover:translate-x-2">
                                <div className="h-10 w-10 bg-primary/10 rounded-none flex items-center justify-center text-primary"><Users size={20} /></div>
                                <div className="flex-1">
                                    <div className="w-24 h-2 bg-gray-200 mb-2" />
                                    <div className="w-16 h-2 bg-gray-100" />
                                </div>
                             </div>
                             <div className="flex items-center gap-4 bg-white p-4 shadow-sm border border-gray-100 transition-transform duration-500 delay-100 hover:translate-x-2">
                                <div className="h-10 w-10 bg-accent/10 rounded-none flex items-center justify-center text-accent"><Users size={20} /></div>
                                <div className="flex-1">
                                    <div className="w-32 h-2 bg-gray-200 mb-2" />
                                    <div className="w-20 h-2 bg-gray-100" />
                                </div>
                             </div>
                             <div className="flex items-center gap-4 bg-white p-4 shadow-sm border border-gray-100 transition-transform duration-500 delay-200 hover:translate-x-2">
                                <div className="h-10 w-10 bg-gray-100 rounded-none flex items-center justify-center text-gray-400"><Users size={20} /></div>
                                <div className="flex-1">
                                    <div className="w-20 h-2 bg-gray-200 mb-2" />
                                    <div className="w-12 h-2 bg-gray-100" />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PlatformCapabilities;
