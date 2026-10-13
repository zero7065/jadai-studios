'use client';

import React, { useState, useEffect } from 'react';
import Futuristic12DCanvas from './Futuristic12DCanvas';
import Sigil from './Sigil';
import AuthModal from '../auth/AuthModal';
import { StudioAudio } from '../../lib/watermark';
import {
  Compass,
  Radio,
  FileText,
  Palette,
  Shield,
  ShoppingBag,
  LogIn,
  UserCheck,
  CreditCard,
  Download,
  X,
} from 'lucide-react';

export interface Interactive3DSigilHeroProps {
  onNavigate?: (path: string) => void;
  onEnter?: () => void;
}

export const Interactive3DSigilHero: React.FC<Interactive3DSigilHeroProps> = ({
  onNavigate,
  onEnter,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialState, setAuthInitialState] = useState<'signin' | 'register' | 'guest'>('signin');
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  const openAuthWithState = (state: 'signin' | 'register' | 'guest') => {
    try {
      StudioAudio.playClick();
    } catch {}
    setAuthInitialState(state);
    setAuthModalOpen(true);
  };

  const FOUNDRY_SERVICES = [
    {
      id: 'oracle',
      name: 'PRIME Oracle',
      tag: 'Strategic Mind',
      path: '/oracle',
      icon: Compass,
      color: '#C9A84C',
    },
    {
      id: 'write',
      name: 'Story Codex',
      tag: 'Ghostwriter',
      path: '/write',
      icon: FileText,
      color: '#D4A574',
    },
    {
      id: 'create',
      name: 'Creative Studio',
      tag: 'Visual Engine',
      path: '/create',
      icon: Palette,
      color: '#E8B4B8',
    },
    {
      id: 'sentinel',
      name: 'Site Sentinel',
      tag: 'Speed & Vitals',
      path: '/playground/sentinel',
      icon: Shield,
      color: '#2ECC71',
    },
    {
      id: 'signal',
      name: 'Signal Radar',
      tag: 'Telemetry',
      path: '/signal',
      icon: Radio,
      color: '#60A5FA',
    },
    {
      id: 'marketplace',
      name: 'Templates Hub',
      tag: 'Foundry Code',
      path: '/hub',
      icon: ShoppingBag,
      color: '#E67E22',
    },
  ];

  return (
    <div className="relative w-full min-h-[640px] md:min-h-[720px] flex flex-col items-center justify-center overflow-hidden py-10 px-4">
      {/* Ambient cosmic backdrop — capped particles, reduced-motion aware */}
      <div className="absolute inset-0 z-0" style={{ contain: 'layout style paint' }}>
        <Futuristic12DCanvas />
      </div>

      {/* Pricing shortcut pill */}
      <div className="relative z-10 flex flex-wrap items-center justify-center mb-6 px-4 py-2 rounded-full bg-[rgba(10,9,8,0.75)] border border-[rgba(201,168,76,0.3)]">
        <a
          href="/pricing"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/pricing');
            }
          }}
          className="px-3 py-1 rounded-full bg-gradient-to-r from-[#C9A84C]/20 to-[#e8c96a]/20 border border-[#C9A84C]/50 hover:border-[#C9A84C] text-[#f5f3f0] hover:text-[#C9A84C] text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <CreditCard className="w-3 h-3 text-[#C9A84C]" />
          <span>Subscription Plans & Unlimited Access</span>
        </a>
      </div>

      {/* Central sigil card */}
      <div className="relative z-20 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-[rgba(10,9,8,0.45)] border border-[rgba(201,168,76,0.3)] shadow-[0_30px_90px_rgba(0,0,0,0.85)] max-w-lg w-full">
        {/* Slow decorative ring behind the sigil (opacity-only spin) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-[rgba(201,168,76,0.18)] border-dashed"
            style={{ animation: 'jadaiSigilSpin90 90s linear infinite' }}
          />
        </div>

        {/* THE sigil — hover expands + ripple + tooltip; double-click opens Guide Bee */}
        <div className="relative flex items-center justify-center my-1">
          <Sigil size={180} />
        </div>

        <div className="mt-4 text-center space-y-1">
          <div className="inline-block px-3 py-0.5 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-[10px] font-mono tracking-[0.25em] text-[#C9A84C] uppercase font-bold">
            BUILD DIFFERENT
          </div>

          <h1
            className="text-2xl sm:text-3xl font-display font-black tracking-[0.25em] text-[#f5f3f0] uppercase m-0"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            JADAI STUDIOS
          </h1>
          <p className="text-[11px] font-mono text-[#C9A84C] tracking-[0.25em] uppercase">
            Creative Foundry & High-Tier Software
          </p>
          <p className="text-[10px] font-mono text-[#8a6e2a] tracking-wider">
            Jos, Nigeria & Global
          </p>
        </div>

        {/* Auth actions */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 w-full pt-3 border-t border-[rgba(201,168,76,0.2)]">
          <button
            type="button"
            onClick={() => openAuthWithState('signin')}
            className="px-5 py-2 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] font-display font-bold text-xs tracking-[0.15em] uppercase shadow-[0_0_20px_rgba(201,168,76,0.45)] transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
            style={{ fontFamily: 'Cinzel, serif', transform: 'translateZ(0)' }}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>ENTER STUDIO</span>
          </button>

          <button
            type="button"
            onClick={() => openAuthWithState('signin')}
            className="px-4 py-2 rounded-full border border-[rgba(201,168,76,0.4)] hover:border-[#C9A84C] bg-black/60 hover:bg-black/90 text-[#f5f3f0] font-mono text-xs flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
            title="Continue with Google"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.9l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17c1.8 3.7 5.6 6.5 10.1 6.5z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => openAuthWithState('guest')}
            className="px-3.5 py-2 rounded-full border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-[#a8a49e] hover:text-[#f5f3f0] font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            title="Explore without creating an account"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Explore as Guest</span>
          </button>
        </div>
      </div>

      {/* Services bar */}
      <div className="relative z-20 mt-8 w-full max-w-4xl px-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {FOUNDRY_SERVICES.map((serv) => (
            <a
              key={serv.id}
              href={serv.path}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(serv.path);
                }
                StudioAudio.playClick();
              }}
              className="p-3 rounded-2xl bg-[rgba(10,9,8,0.7)] border border-[rgba(201,168,76,0.22)] hover:border-[#C9A84C] hover:bg-[#12100d] transition-colors flex flex-col items-center text-center group cursor-pointer"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${serv.color}35 0%, #050404 80%)`,
                  border: `1px solid ${serv.color}50`,
                }}
              >
                <serv.icon className="w-4 h-4 text-[#f5f3f0]" />
              </div>
              <span className="text-xs font-serif font-bold text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors leading-tight">
                {serv.name}
              </span>
              <span className="text-[10px] font-mono text-[#8a857e] mt-0.5">{serv.tag}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-3 mt-8">
        <button
          onClick={() => {
            try {
              StudioAudio.playClick();
            } catch {}
            if (onEnter) {
              onEnter();
            } else if (onNavigate) {
              onNavigate('/services');
            } else {
              const sec = document.getElementById('studio-tools-section');
              if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="px-8 py-3 rounded-full bg-[#C9A84C] text-[#050404] font-display font-bold text-xs tracking-[0.2em] uppercase hover:bg-[#e8c96a] shadow-[0_0_25px_rgba(201,168,76,0.45)] transition-colors cursor-pointer active:scale-95"
          style={{ fontFamily: 'Cinzel, serif', transform: 'translateZ(0)' }}
        >
          EXPLORE FOUNDRY INSTRUMENTS →
        </button>

        <a
          href="/pricing"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/pricing');
            }
          }}
          className="px-6 py-3 rounded-full bg-[#0a0908] border border-[rgba(201,168,76,0.3)] text-[#f5f3f0] hover:text-[#C9A84C] hover:border-[#C9A84C] font-mono text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-2"
        >
          <CreditCard className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span>VIEW SUBSCRIPTION PLANS</span>
        </a>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        initialState={authInitialState}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setShowPwaBanner(true);
        }}
      />

      {showPwaBanner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[95] w-full max-w-md p-4 rounded-3xl bg-[rgba(10,9,8,0.92)] border border-[rgba(201,168,76,0.5)] shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C] shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-[#f5f3f0]">
                Install Jadai Studios App
              </p>
              <p className="text-[11px] font-sans text-[#a8a49e] leading-tight">
                Add to home screen for instant offline sync and standalone window.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                StudioAudio.playClick();
                setShowPwaBanner(false);
              }}
              className="p-1.5 rounded-full text-[#8a857e] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interactive3DSigilHero;
