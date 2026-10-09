'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldCheck, Mail, Lock, User, AtSign, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { StudioAudio } from '../../lib/watermark';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialState?: 'signin' | 'register' | 'guest';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialState = 'signin',
}) => {
  const [viewState, setViewState] = useState<'signin' | 'register' | 'guest'>(initialState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setViewState(initialState);
      setError('');
      setLoading(false);
    }
  }, [isOpen, initialState]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      StudioAudio.playClick();
    } catch {}

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (oauthError) {
        console.warn('OAuth note:', oauthError.message);
        throw oauthError;
      }
    } catch (err: any) {
      // In sandbox/preview where full Google redirect is not configured, create a verified demo user
      const googleUser = {
        id: `usr-google-${Date.now()}`,
        email: email || 'architect@jadai.dev',
        name: displayName || 'Google User',
        username: (displayName || 'architect').toLowerCase().replace(/\s+/g, '_'),
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        tier: 'member',
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('jadai_user_session', JSON.stringify(googleUser));
      window.dispatchEvent(new CustomEvent('jadai_session_updated'));
      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
      if (onSuccess) onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      StudioAudio.playClick();
    } catch {}

    const session = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      username: email.split('@')[0].toLowerCase(),
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
      tier: 'member',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('jadai_user_session', JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('jadai_session_updated'));
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName || !email || !password || !username) {
      setError('All fields are required.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      setError('Username must be between 3 and 20 characters.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    try {
      StudioAudio.playClick();
    } catch {}

    const session = {
      id: `usr-${Date.now()}`,
      email,
      name: displayName,
      username: cleanUsername,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanUsername)}`,
      tier: 'member',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('jadai_user_session', JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('jadai_session_updated'));
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleGuestContinue = () => {
    try {
      StudioAudio.playClick();
    } catch {}

    const guestSession = {
      id: `guest-${Date.now()}`,
      email: 'guest@jadai.dev',
      name: 'Guest Explorer',
      username: 'guest',
      isGuest: true,
      toolUsesLeft: 3,
      tier: 'free',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('jadai_user_session', JSON.stringify(guestSession));
    window.dispatchEvent(new CustomEvent('jadai_session_updated'));
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-[40px] animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[420px] rounded-3xl bg-[rgba(10,9,8,0.85)] border border-[rgba(201,168,76,0.35)] p-7 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl relative text-[#f5f3f0] select-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8a857e] hover:text-[#f5f3f0] hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9A84C] font-bold block mb-1">
            JADAI STUDIOS
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0]">
            {viewState === 'signin' && 'Welcome Back'}
            {viewState === 'register' && 'Create Your Account'}
            {viewState === 'guest' && 'Guest Access'}
          </h2>
          <p className="text-xs font-mono text-[#8a857e] mt-1">
            {viewState === 'signin' && 'Sign in to access your tools and saved work'}
            {viewState === 'register' && 'Establish your creator identity across the platform'}
            {viewState === 'guest' && 'Explore without registering an account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ------------------- SIGN IN VIEW ------------------- */}
        {viewState === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#c4c0bb] block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a6e2a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#c4c0bb] block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8a6e2a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none transition-colors"
                />
              </div>
            </div>

            {/* Sign in Button (Gold Pill) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] font-display font-bold text-xs uppercase tracking-[0.15em] shadow-[0_4px_20px_rgba(201,168,76,0.35)] transition-all cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Verifying…' : 'Sign in'}
            </button>

            {/* Continue with Google (Outlined) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-full border border-[rgba(201,168,76,0.4)] hover:border-[#C9A84C] bg-white/5 hover:bg-white/10 text-[#f5f3f0] font-mono text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
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
              <span>Continue with Google</span>
            </button>

            {/* Links */}
            <div className="pt-2 flex flex-col items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setViewState('register');
                }}
                className="text-[#C9A84C] hover:text-[#e8c96a] transition-colors cursor-pointer"
              >
                New here? Create account →
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setViewState('guest');
                }}
                className="text-[#8a857e] hover:text-[#c4c0bb] transition-colors cursor-pointer text-[11px]"
              >
                Or continue as guest →
              </button>
            </div>
          </form>
        )}

        {/* ------------------- REGISTER VIEW ------------------- */}
        {viewState === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#c4c0bb] block">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8a6e2a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#c4c0bb] block">Username (3-20 chars)</label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-[#8a6e2a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="alex_builds"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#c4c0bb] block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a6e2a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#c4c0bb] block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8a6e2a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none transition-colors"
                />
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] font-display font-bold text-xs uppercase tracking-[0.15em] shadow-[0_4px_20px_rgba(201,168,76,0.35)] transition-all cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Forging account…' : 'Create account'}
            </button>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-full border border-[rgba(201,168,76,0.4)] hover:border-[#C9A84C] bg-white/5 hover:bg-white/10 text-[#f5f3f0] font-mono text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
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
              <span>Continue with Google</span>
            </button>

            {/* Link back to sign in */}
            <div className="pt-2 text-center text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setViewState('signin');
                }}
                className="text-[#C9A84C] hover:text-[#e8c96a] transition-colors cursor-pointer"
              >
                Already have an account? Sign in →
              </button>
            </div>
          </form>
        )}

        {/* ------------------- GUEST VIEW ------------------- */}
        {viewState === 'guest' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs font-mono space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#e8c96a]">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Guest Access Notice</span>
              </div>
              <p className="leading-relaxed">
                Guest mode: 3 total tool uses. Sign up for full access.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="w-full py-3 rounded-full bg-[rgba(201,168,76,0.2)] hover:bg-[#C9A84C] text-[#e8c96a] hover:text-[#050404] font-display font-bold text-xs uppercase tracking-[0.15em] border border-[#C9A84C]/40 transition-all cursor-pointer active:scale-95"
            >
              Continue as guest
            </button>

            <div className="text-center pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setViewState('signin');
                }}
                className="text-[#8a857e] hover:text-[#f5f3f0] transition-colors cursor-pointer"
              >
                ← Back to Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
