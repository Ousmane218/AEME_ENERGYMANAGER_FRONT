import React from 'react';

const LocalisationSection = () => {
    return (
        <section id="impact" className="w-full bg-primary text-white py-24 px-6 lg:px-8 overflow-hidden">
            <div className="mx-auto max-w-7xl flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24 shadow-sm mb-20">
                <div className="w-full lg:w-1/2 aspect-video relative overflow-hidden group shadow-md border border-white/10 bg-white/5">
                    <img
                        src="/carte.jpeg"
                        alt="Cartographie Nationale"
                        className="object-cover object-center w-full h-full opacity-90 transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-100"
                    />
                </div>
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4">02. Cartographie</span>
                    <h3 className="font-heading text-3xl md:text-4xl text-white mb-6">
                        Cartographie nationale
                    </h3>
                    <p className="text-gray-200 font-sans leading-relaxed text-lg">
                        Visualisation des structures et des gestionnaires à travers les régions. Un outil d'aide à la décision pour identifier les points de consommation stratégiques sur le territoire sénégalais.
                    </p>
                </div>
            </div>

            {/* Merged Stats Grid from ImpactOverview */}
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-[2rem] shadow-2xl shadow-black/10 overflow-hidden">
                    {/* Metric 1 */}
                    <div className="border-b md:border-b-0 md:border-r border-gray-100 p-8 md:p-12 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-12">Régions Administratives</span>
                        <div>
                            <span className="font-heading text-5xl md:text-6xl text-primary block mb-2">14</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Sur le territoire</span>
                        </div>
                    </div>
                    
                    {/* Metric 2 */}
                    <div className="border-b md:border-b-0 md:border-r border-gray-100 p-8 md:p-12 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-12">Réseau d'experts</span>
                        <div>
                            <span className="font-heading text-5xl md:text-6xl text-gray-900 block mb-2">255</span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Gestionnaires actifs</span>
                        </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="p-8 md:p-12 flex flex-col justify-between hover:bg-gray-50 transition-colors">
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

export default LocalisationSection;
