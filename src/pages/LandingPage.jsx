import React, { useEffect } from 'react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingHero from '../components/landing/LandingHero';
import MissionStatement from '../components/landing/MissionStatement';
import LocalisationSection from '../components/landing/LocalisationSection';
import ImpactOverview from '../components/landing/ImpactOverview';
import ContactSection from '../components/landing/ContactSection';

const LandingPage = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary flex flex-col">
            <LandingHeader />
            <main className="flex-1 flex flex-col">
                <LandingHero />
                <MissionStatement />
                <LocalisationSection />
                <ImpactOverview />
            </main>
            <ContactSection />
        </div>
    );
};

export default LandingPage;
