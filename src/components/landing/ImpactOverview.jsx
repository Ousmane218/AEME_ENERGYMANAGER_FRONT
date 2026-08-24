import React from 'react';

const ImpactOverview = () => {
    return (
        <section id="impact" className="w-full bg-gray-50 py-24 border-y border-gray-200">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="font-heading text-3xl md:text-4xl text-gray-900 mb-4">
                        Couverture Nationale
                    </h2>
                    <p className="text-gray-500 font-sans max-w-2xl text-base">
                        Données de déploiement de la plateforme sur le territoire sénégalais.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-gray-200 bg-white">
                    {/* Metric 1 */}
                    <div className="border-b border-r border-gray-200 p-8 md:p-12 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-12">Régions Administratives</span>
                        <div>
                            <span className="font-heading text-5xl md:text-6xl text-primary block mb-2">14</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Sur le territoire</span>
                        </div>
                    </div>
                    
                    {/* Metric 2 */}
                    <div className="border-b border-r border-gray-200 p-8 md:p-12 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-12">Réseau d'experts</span>
                        <div>
                            <span className="font-heading text-5xl md:text-6xl text-gray-900 block mb-2">255</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Gestionnaires actifs</span>
                        </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="border-b border-r border-gray-200 p-8 md:p-12 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-12">Suivi Énergétique</span>
                        <div>
                            <span className="font-heading text-5xl md:text-6xl text-accent block mb-2">200+</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Structures publiques</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImpactOverview;
