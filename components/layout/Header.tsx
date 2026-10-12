'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Shield,
  User as UserIcon,
  LogOut,
  Menu,
  Bell,
  Users,
  Compass,
  Sparkles,
  Check,
  X,
  Radio,
} from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import AuthModal from '../auth/AuthModal';
import { StudioAudio } from '../../lib/watermark';

export interface HeaderProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onAdminTrigger?: () => void;
  onQuickLogin?: () => void;
  onRecovery?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath = '/',
  onNavigate,
  onAdminTrigger,
  onQuickLogin,
  onRecovery,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Live notification system
  const [unreadNotifications, setUnreadNotifications] = useState<
    Array<{ id: string; title: string; desc: string; time: string; read: boolean }>
  >([
    {
      id: 'notif-1',
      title: '70 Canonical Parables Synchronized',
      desc: 'The complete Book of Lies codex with 5D Grimoire projection is online.',
      time: 'Just now',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Foundry PWA Offline Mode Active',
      desc: 'Your creative drafts and manuscripts sync locally on-device.',
      time: '12m ago',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'PRIME Oracle v3.8 Active',
      desc: 'Adaptive first-principles architecture engine ready for review.',
      time: '1h ago',
      read: false,
    },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync user session state
  const syncSession = () => {
    try {
      const stored = localStorage.getItem('jadai_user_session');
      if (stored) {
        setUserSession(JSON.parse(stored));
      } else {
        setUserSession(null);
      }
    } catch {
      setUserSession(null);
    }
  };

  useEffect(() => {
    syncSession();

    const handleSessionUpdated = () => syncSession();
    const handleOpenAuth = () => setAuthModalOpen(true);

    window.addEventListener('jadai_session_updated', handleSessionUpdated);
    window.addEventListener('jadai_open_auth_modal', handleOpenAuth);
    window.addEventListener('storage', handleSessionUpdated);

    return () => {
      window.removeEventListener('jadai_session_updated', handleSessionUpdated);
      window.removeEventListener('jadai_open_auth_modal', handleOpenAuth);
      window.removeEventListener('storage', handleSessionUpdated);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLinkClick = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      StudioAudio.playClick();
    } catch {}
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleOpenCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      StudioAudio.playClick();
    } catch {}
    window.dispatchEvent(new CustomEvent('jadai_toggle_catalog'));
    window.dispatchEvent(new CustomEvent('jadai_toggle_vault'));
  };

  const handleSignOut = () => {
    try {
      StudioAudio.playClick();
    } catch {}
    localStorage.removeItem('jadai_user_session');
    setUserSession(null);
    setAccountMenuOpen(false);
    window.dispatchEvent(new CustomEvent('jadai_session_updated'));
  };

  const markAllNotifsRead = () => {
    try {
      StudioAudio.playClick();
    } catch {}
    setUnreadNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = unreadNotifications.filter((n) => !n.read).length;

  return (
    <>
      <header
        className={`sticky top-0 z-[90] w-full transition-all duration-300 select-none ${
          scrolled
            ? 'h-14 sm:h-16 bg-[rgba(5,4,4,0.85)] border-b border-[rgba(201,168,76,0.15)] shadow-lg'
            : 'h-14 sm:h-16 bg-[rgba(5,4,4,0.6)] border-b border-[rgba(196,192,187,0.06)]'
        }`}
        style={{
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Left: [Home Sigil] [JADAI STUDIOS] */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={(e) => handleLinkClick('/', e)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(10,9,8,0.7)] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#050404] transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              title="Home Sigil"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </button>

            <Logo
              onAdminTrigger={onAdminTrigger}
              onHomeClick={() => handleLinkClick('/')}
              size="sm"
            />
          </div>

          {/* Right: Default Screen Quick Access Bar: [Community] [Notifications] [Language] [Theme] [Account] [Menu] */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 1. Community Icon Trigger on Default Screen */}
            <button
              type="button"
              onClick={(e) => handleLinkClick('/community', e)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[rgba(201,168,76,0.25)] bg-[rgba(15,14,12,0.8)] text-[#e8c96a] hover:bg-[rgba(201,168,76,0.18)] hover:border-[#C9A84C] transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 group"
              title="Builder Community & Live Feed"
              aria-label="Community"
            >
              <Users className="w-4 h-4 text-[#C9A84C] transition-transform group-hover:scale-110" />
            </button>

            {/* 2. Notification Center */}
            <div className="relative" ref={notifMenuRef}>
              <button
                type="button"
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[rgba(201,168,76,0.25)] bg-[rgba(15,14,12,0.8)] text-[#e8c96a] hover:bg-[rgba(201,168,76,0.18)] hover:border-[#C9A84C] transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#C9A84C]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A84C] text-[#050404] text-[9px] font-mono font-bold flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-[#0a0908]/95 border border-[rgba(201,168,76,0.35)] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-3.5 z-50 font-mono text-xs backdrop-blur-2xl space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                      <span className="font-bold text-[#f5f3f0] text-xs">Transmissions & System</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        className="text-[10px] text-[#C9A84C] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {unreadNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          notif.read
                            ? 'bg-white/5 border-white/5 text-[#8a857e]'
                            : 'bg-[#14120e] border-[rgba(201,168,76,0.3)] text-[#e8c96a]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#f5f3f0]">
                          <span>{notif.title}</span>
                          <span className="text-[9px] text-[#8a857e] font-normal">{notif.time}</span>
                        </div>
                        <p className="text-[10px] text-[#a8a49e] font-sans mt-0.5 leading-snug">
                          {notif.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Language */}
            <LanguageSwitcher />

            {/* 4. Theme */}
            <ThemeToggle />

            {/* 5. Account / User Icon */}
            <div className="relative" ref={accountMenuRef}>
              {userSession ? (
                // Signed in: Avatar button
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[rgba(201,168,76,0.4)] overflow-hidden cursor-pointer hover:border-[#C9A84C] transition-all shadow-sm flex items-center justify-center bg-[rgba(15,14,12,0.8)] active:scale-95"
                  title={`Account: ${userSession.name || userSession.email}`}
                  aria-label="Account Menu"
                >
                  {userSession.avatar_url ? (
                    <img
                      src={userSession.avatar_url}
                      alt={userSession.name || 'User Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-mono font-bold text-[#e8c96a]">
                      {(userSession.name || userSession.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </button>
              ) : (
                // Signed out: Account icon
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(15,14,12,0.8)] text-[#e8c96a] hover:bg-[rgba(201,168,76,0.15)] hover:border-[#C9A84C] transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                  title="Sign In / Account"
                  aria-label="Account"
                >
                  <UserIcon className="w-4 h-4 text-[#C9A84C]" />
                </button>
              )}

              {/* Account Dropdown when signed in */}
              {userSession && accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0a0908]/95 border border-[rgba(201,168,76,0.3)] shadow-[0_12px_36px_rgba(0,0,0,0.8)] p-3 z-50 font-mono text-xs backdrop-blur-2xl">
                  <div className="border-b border-white/10 pb-2 mb-2">
                    <p className="font-bold text-[#f5f3f0] truncate">{userSession.name || 'Member'}</p>
                    <p className="text-[10px] text-[#8a857e] truncate">{userSession.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[9px] text-[#e8c96a]">
                      {userSession.provider === 'google'
                        ? 'Google Authenticated'
                        : userSession.isGuest
                          ? 'Guest Session'
                          : 'Verified Member'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-1.5 px-2 rounded-lg text-left text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Menu Trigger Button */}
            <button
              type="button"
              onClick={handleOpenCatalog}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[rgba(201,168,76,0.4)] bg-[rgba(15,14,12,0.85)] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] hover:border-[#C9A84C] transition-all flex flex-col items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(201,168,76,0.25)] active:scale-95 group"
              title="Open Catalog Menu"
              aria-label="Open Catalog Menu"
            >
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
              <span className="text-[7px] sm:text-[8px] font-mono font-bold tracking-wider uppercase mt-0.5 leading-none">
                MENU
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal with Verified Google Sign-In */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          syncSession();
        }}
      />
    </>
  );
};

export default Header;
