import React from 'react';

const InstitutionalFooter = () => {
    return (
        <footer className="w-full bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Logo & ID */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <img src="/logo.png" alt="AEME Logo" className="h-12 w-auto mb-6" />
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                            Agence pour l'Economie et la Maîtrise de l'Energie. <br />
                            Ministère de l'Énergie, Sénégal.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-6">Plateforme</h4>
                        <ul className="space-y-4">
                            <li><a href="#mission" className="text-sm text-gray-600 hover:text-primary transition-colors">Mission</a></li>
                            <li><a href="#capacites" className="text-sm text-gray-600 hover:text-primary transition-colors">Capacités</a></li>
                            <li><a href="#impact" className="text-sm text-gray-600 hover:text-primary transition-colors">Impact National</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-6">Contact Officiel</h4>
                        <a 
                            href="mailto:info@aeme.sn" 
                            className="font-heading text-3xl md:text-4xl text-gray-900 hover:text-primary transition-colors block mb-4"
                        >
                            info@aeme.sn
                        </a>
                        <p className="text-sm text-gray-600">
                            Service d'assistance technique de la plateforme.
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        © {new Date().getFullYear()} Agence pour l'Economie et la Maîtrise de l'Energie (AEME)
                    </p>
                    <p className="text-[10px] font-medium text-gray-400">
                        Plateforme nationale de gestion de l'énergie.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default InstitutionalFooter;
