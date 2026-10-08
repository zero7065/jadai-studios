'use client';

import React from 'react';
import { StudioAudio } from '@/lib/watermark';
import {
  Radio,
  PenTool,
  BarChart3,
  Settings,
  Sparkles,
  ArrowLeft,
  Crown,
} from 'lucide-react';

interface SignalNavProps {
  currentTab: 'radar' | 'content' | 'analytics' | 'settings' | 'pricing' | 'home' | 'social';
  onNavigate?: (path: string) => void;
  onOpenInstall?: () => void;
}

export const SignalNav: React.FC<SignalNavProps> = ({ currentTab, onNavigate, onOpenInstall }) => {
  const tabs = [
    { id: 'radar', label: 'Radar', path: '/signal/radar', icon: Radio },
    { id: 'social', label: 'Social Audit', path: '/signal/social', icon: Sparkles },
    { id: 'content', label: 'Content', path: '/signal/content', icon: PenTool },
    { id: 'analytics', label: 'Analytics', path: '/signal/analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', path: '/signal/settings', icon: Settings },
  ];

  const handleNav = (path: string) => {
    StudioAudio.playClick();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050404]/90 border-b border-[rgba(201,168,76,0.2)] backdrop-blur-xl px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand / Home Link */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNav('/signal')}
            className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                JADAI SIGNAL
              </div>
              <div className="text-[10px] font-mono text-zinc-500">Distribution OS</div>
            </div>
          </button>

          <span className="hidden md:inline text-zinc-700">|</span>

          {/* Return to Core Studio */}
          <button
            onClick={() => handleNav('/')}
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Studio Surface</span>
          </button>
        </div>

        {/* Center: Main Nav Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded-full p-1 shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNav(tab.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Install Independently & Pricing */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenInstall && (
            <button
              onClick={onOpenInstall}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer bg-zinc-900 border border-[rgba(201,168,76,0.25)] text-[#e8c96a] hover:border-[#C9A84C]"
              title="Install Signal as independent standalone app or container"
            >
              <span className="hidden sm:inline">Install Independent</span>
              <span className="sm:hidden">Install</span>
            </button>
          )}

          <button
            onClick={() => handleNav('/signal/pricing')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer border ${
              currentTab === 'pricing'
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Signal Pro $29</span>
            <span className="sm:hidden">Plans</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SignalNav;
