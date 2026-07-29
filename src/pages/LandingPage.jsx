import React, { useEffect } from 'react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingHero from '../components/landing/LandingHero';
import MissionStatement from '../components/landing/MissionStatement';
import PlatformCapabilities from '../components/landing/PlatformCapabilities';
import ImpactOverview from '../components/landing/ImpactOverview';
import InstitutionalFooter from '../components/landing/InstitutionalFooter';

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
                <PlatformCapabilities />
                <ImpactOverview />
            </main>
            <InstitutionalFooter />
        </div>
    );
};

export default LandingPage;
