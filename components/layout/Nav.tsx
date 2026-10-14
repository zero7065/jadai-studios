'use client';

import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import CurrencySwitcher from '../ui/CurrencySwitcher';
import PwaInstallButton from '../ui/PwaInstallButton';
import EdgeGlow from '../ui/EdgeGlow';
import SubscribeModal from './SubscribeModal';
import StudioGuideModal from '../tutorial/StudioGuideModal';
import { StudioAudio } from '../../lib/watermark';
import {
  Shield,
  Home,
  Layers,
  BookOpen,
  ShoppingBag,
  HelpCircle,
  Compass,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../providers/LanguageProvider';

export interface NavProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onQuickLogin?: () => void;
  onRecovery?: () => void;
  onAdminTrigger?: () => void;
}

export const Nav: React.FC<NavProps> = ({
  currentPath = '/',
  onNavigate,
  onQuickLogin,
  onRecovery,
  onAdminTrigger,
}) => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Auto-show tutorial 2s after first visit if not seen
    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('jadai_tour_seen');
      if (!tourSeen) {
        const timer = setTimeout(() => {
          setGuideOpen(true);
        }, 2000);
        return () => {
          window.removeEventListener('scroll', handleScroll);
          clearTimeout(timer);
        };
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenVault = (e: React.MouseEvent) => {
    e.preventDefault();
    StudioAudio.playClick();
    window.dispatchEvent(new CustomEvent('jadai_toggle_vault'));
  };

  // 4 Max Primary Nav items with authentic resonant naming
  const navLinks = [
    { label: 'Creation Tools', path: '/services', icon: Layers },
    { label: 'Hall of Art', path: '/book-of-lies', icon: BookOpen },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { label: 'Studio Doctrine', path: '/about', icon: Compass },
  ];

  const handleLinkClick = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    StudioAudio.playClick();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-[90] w-full border-b transition-all duration-300 ${
          scrolled
            ? 'h-14 bg-[rgba(5,4,4,0.92)] backdrop-blur-2xl border-[rgba(201,168,76,0.25)] shadow-xl'
            : 'h-18 bg-[rgba(5,4,4,0.65)] backdrop-blur-xl border-[rgba(201,168,76,0.15)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Left: Home Sigil Icon + JADAI STUDIOS Logo */}
          <div className="shrink-0 flex items-center gap-2">
            {/* Quick Home Return Icon */}
            <button
              type="button"
              onClick={(e) => handleLinkClick('/', e)}
              className={`p-2 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(10,9,8,0.8)] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#050404] transition-all cursor-pointer ${
                currentPath === '/' ? 'bg-[rgba(201,168,76,0.15)] text-[#e8c96a]' : ''
              }`}
              title="Return Home"
              aria-label="Home"
            >
              <Home className="w-[18px] h-[18px]" />
            </button>

            <Logo
              onAdminTrigger={onAdminTrigger}
              onQuickLogin={onQuickLogin}
              onRecovery={onRecovery}
              onHomeClick={() => handleLinkClick('/')}
              size={scrolled ? 'sm' : 'md'}
            />
          </div>

          {/* Center: 4 Max Primary Nav Pills */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1.5 glass rounded-full px-3 py-1 border-[rgba(201,168,76,0.2)] shadow-md backdrop-blur-md"
          >
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              if (isActive) {
                return (
                  <EdgeGlow key={link.path} intensity="subtle" color="gold" borderRadius="9999px">
                    <a
                      href={link.path}
                      onClick={(e) => handleLinkClick(link.path, e)}
                      className="px-3.5 py-1 text-xs font-mono tracking-wider rounded-full cursor-pointer bg-gradient-to-r from-[#e8c96a] to-[#C9A84C] text-[#050404] font-bold shadow-[0_0_12px_rgba(201,168,76,0.35)]"
                    >
                      {link.label}
                    </a>
                  </EdgeGlow>
                );
              }

              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleLinkClick(link.path, e)}
                  className="px-3 py-1 text-xs font-mono tracking-wider transition-colors duration-200 rounded-full cursor-pointer text-[#c4c0bb] hover:text-[#f5f3f0] hover:bg-white/5"
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Header Actions: [Currency] [PWA App] [Language] [Theme Toggle] [Vault Knob] */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 1. Global Currency Switcher ($ USD / ₦ NGN) */}
            <CurrencySwitcher />

            {/* 2. PWA App Install */}
            <div className="hidden sm:block">
              <PwaInstallButton compact={true} />
            </div>

            {/* 3. Language */}
            <LanguageSwitcher />

            {/* 4. Theme Toggle */}
            <ThemeToggle />

            {/* 5. Vault Knob */}
            <button
              type="button"
              onClick={handleOpenVault}
              data-tour="nav-vault"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[rgba(201,168,76,0.4)] bg-[rgba(15,14,12,0.85)] text-[#e8c96a] hover:bg-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] transition-all flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(201,168,76,0.2)] active:scale-95"
              title="Vault Knob"
              aria-label="Vault Knob"
            >
              <Shield className="w-[18px] h-[18px] text-[#C9A84C]" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------
          MOBILE-FIRST PHONE NAVIGATION DOCK (Ergonomic Thumb Bar)
         --------------------------------------------------------------------- */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[89] bg-[#0a0908]/95 border-t border-[rgba(201,168,76,0.25)] backdrop-blur-2xl px-4 py-2 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
        <button
          type="button"
          onClick={() => handleLinkClick('/')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentPath === '/' ? 'text-[#e8c96a]' : 'text-[#8a6e2a]'
          }`}
        >
          <Home className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-mono uppercase">Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('/services')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentPath.startsWith('/services') || currentPath.startsWith('/playground')
              ? 'text-[#e8c96a]'
              : 'text-[#8a6e2a]'
          }`}
        >
          <Layers className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-mono uppercase">Tools</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('/book-of-lies')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentPath.startsWith('/book-of-lies') ? 'text-[#e8c96a]' : 'text-[#8a6e2a]'
          }`}
        >
          <BookOpen className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-mono uppercase">Art</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('/marketplace')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentPath.startsWith('/marketplace') ? 'text-[#e8c96a]' : 'text-[#8a6e2a]'
          }`}
        >
          <ShoppingBag className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-mono uppercase">Market</span>
        </button>

        <button
          type="button"
          onClick={() => handleLinkClick('/signal')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            currentPath.startsWith('/signal') ? 'text-[#e8c96a]' : 'text-[#8a6e2a]'
          }`}
        >
          <Radio className="w-[18px] h-[18px] animate-pulse" />
          <span className="text-[9px] font-mono uppercase">Signal</span>
        </button>

        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-mono uppercase">Guide</span>
        </button>
      </div>

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />

      {/* Interactive Studio Guide Modal */}
      <StudioGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};

export default Nav;
