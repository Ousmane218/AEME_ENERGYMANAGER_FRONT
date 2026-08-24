import React from 'react';
import { Mail, Phone } from 'lucide-react';

const ContactSection = () => {
    return (
        <section id="contact" className="w-full bg-white py-24 lg:py-32 relative overflow-hidden border-t border-gray-100">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-12 px-5 py-2 bg-primary/5 rounded-full border border-primary/10">
                    Contact Officiel
                </span>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch justify-center mb-12 w-full max-w-4xl">
                    {/* Email Card */}
                    <a
                        href="mailto:contacts@aeme.gouv.sn"
                        className="group flex flex-col items-center p-8 md:p-10 bg-gray-50/50 hover:bg-white rounded-3xl border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 w-full md:w-1/2"
                    >
                        <div className="w-14 h-14 bg-white group-hover:bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:border-transparent group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                            <Mail size={24} className="text-gray-400 group-hover:text-primary transition-colors duration-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Courriel</span>
                        <span className="font-heading text-xl md:text-2xl text-gray-900 group-hover:text-primary transition-colors duration-300 truncate w-full">
                            contacts@aeme.gouv.sn
                        </span>
                    </a>

                    {/* Phone Card */}
                    <a
                        href="tel:+221338232666"
                        className="group flex flex-col items-center p-8 md:p-10 bg-gray-50/50 hover:bg-white rounded-3xl border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 w-full md:w-1/2"
                    >
                        <div className="w-14 h-14 bg-white group-hover:bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:border-transparent group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                            <Phone size={24} className="text-gray-400 group-hover:text-primary transition-colors duration-500" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Téléphone</span>
                        <span className="font-heading text-xl md:text-2xl text-gray-900 group-hover:text-primary transition-colors duration-300">
                            +221 33 823 26 66
                        </span>
                    </a>
                </div>



                <div className="mt-24 w-full flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-8">
                    <img src="/logo.png" alt="AEME" className="h-16 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                        © {new Date().getFullYear()} Agence pour l'Economie et la Maîtrise de l'Energie
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
