'use client';

import React, { useState, useEffect } from 'react';
import SignalNav from './SignalNav';
import RadarView from './RadarView';
import ContentView from './ContentView';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';
import PricingView from './PricingView';
import SocialDiagnosticView from './SocialDiagnosticView';
import SignalInstallModal from './SignalInstallModal';
import SignalLandingPage from '../../app/(site)/signal/page';

interface SignalAppProps {
  initialPath?: string;
  onNavigate?: (path: string) => void;
}

export const SignalApp: React.FC<SignalAppProps> = ({
  initialPath = '/signal',
  onNavigate,
}) => {
  // Determine active tab from URL path
  const getTabFromPath = (path: string) => {
    if (path.includes('/social')) return 'social';
    if (path.includes('/radar')) return 'radar';
    if (path.includes('/content')) return 'content';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/pricing')) return 'pricing';
    return 'home';
  };

  const [currentTab, setCurrentTab] = useState<'home' | 'radar' | 'content' | 'analytics' | 'settings' | 'pricing' | 'social'>(
    getTabFromPath(initialPath)
  );
  const [installModalOpen, setInstallModalOpen] = useState(false);

  useEffect(() => {
    setCurrentTab(getTabFromPath(initialPath));
  }, [initialPath]);

  const handleTabChange = (newPath: string) => {
    const nextTab = getTabFromPath(newPath);
    setCurrentTab(nextTab);
    if (onNavigate) {
      onNavigate(newPath);
    } else {
      window.history.pushState({}, '', newPath);
    }
  };

  // If on home landing tab, render the full hero landing page
  if (currentTab === 'home') {
    return <SignalLandingPage onNavigate={handleTabChange} />;
  }

  return (
    <div className="min-h-screen bg-[#050404] text-[#f5f3f0] selection:bg-amber-500 selection:text-black relative">
      {/* Top ambient gold lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-[450px] h-[450px] bg-[radial-gradient(circle_at_center,rgba(192,57,43,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Signal Topbar */}
      <SignalNav
        currentTab={currentTab}
        onNavigate={handleTabChange}
        onOpenInstall={() => setInstallModalOpen(true)}
      />

      {/* Main Tab Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10">
        {currentTab === 'social' && <SocialDiagnosticView />}
        {currentTab === 'radar' && <RadarView onNavigate={handleTabChange} />}
        {currentTab === 'content' && <ContentView onNavigate={handleTabChange} />}
        {currentTab === 'analytics' && <AnalyticsView onNavigate={handleTabChange} />}
        {currentTab === 'settings' && <SettingsView onNavigate={handleTabChange} />}
        {currentTab === 'pricing' && <PricingView onNavigate={handleTabChange} />}
      </main>

      {/* Independent Installation Modal */}
      <SignalInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
};

export default SignalApp;
