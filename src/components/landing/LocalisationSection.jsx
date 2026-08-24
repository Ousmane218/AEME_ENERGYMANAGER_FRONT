import React from 'react';

const LocalisationSection = () => {
    return (
        <section className="w-full bg-primary text-white py-20 px-8 lg:px-16 overflow-hidden">
            <div className="mx-auto max-w-7xl flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24 shadow-sm">
                <div className="w-full lg:w-1/2 aspect-video relative overflow-hidden group shadow-md border border-white/10 bg-white/5">
                    <img
                        src="/carte.jpeg"
                        alt="Cartographie Nationale"
                        className="object-cover object-center w-full h-full opacity-90 transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-100"
                    />
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
        </section>
    );
};

export default LocalisationSection;
