import React from 'react';

const MissionStatement = () => {
    return (
        <section id="mission" className="w-full bg-gray-50 py-24 lg:py-32 border-t border-gray-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    
                    {/* Left: Oversized Statement */}
                    <div className="w-full lg:w-[65%] animate-in slide-in-from-left-8 duration-1000 fade-in">
                        <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl text-gray-900 leading-tight">
                            Mieux connaître les consommations pour mieux maîtriser l’énergie publique.
                        </h2>
                    </div>

                    {/* Right: Context */}
                    <div className="w-full lg:w-[35%] flex flex-col gap-8 animate-in slide-in-from-right-8 duration-1000 fade-in delay-200">
                        <div className="w-12 h-1 bg-primary mb-4" />
                        <p className="text-base text-gray-600 leading-relaxed font-sans">
                            L’Agence pour l'Economie et la Maîtrise de l'Energie a pour mission de promouvoir l’utilisation rationnelle de l’énergie, l’efficacité énergétique et le développement des énergies renouvelables.
                        </p>
                        <p className="text-base text-gray-600 leading-relaxed font-sans">
                            Cette plateforme centralise le suivi des gestionnaires de l'énergie pour garantir la maîtrise des factures et l'application des meilleures pratiques dans les bâtiments publics sénégalais.
                        </p>
                        
                        {/* Placeholder Small Image */}
                        <div className="aspect-square w-full mt-4 bg-gray-200 overflow-hidden relative">
                            <img 
                                src="https://images.unsplash.com/photo-1541888081622-1d57574b5936?q=80&w=800&auto=format&fit=crop" 
                                alt="Administration" 
                                className="object-cover w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700 hover:scale-105"
                            />
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-white text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1">AEME</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MissionStatement;
