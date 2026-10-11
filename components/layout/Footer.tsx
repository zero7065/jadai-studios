'use client';

import React, { useState, useEffect } from 'react';
import EdgeGlow from '../ui/EdgeGlow';
import { Send, CheckCircle2, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';
import { getCustomization } from '../../lib/data/customization';

export interface FounderBubble {
  id: string;
  label: string;
  category: string;
  tooltip: string;
}

const DEFAULT_BUBBLES: FounderBubble[] = [
  { id: 'b1', label: 'Relational Database Schema', category: 'Backend', tooltip: '20+ table idempotent PostgreSQL architecture with Row-Level Security' },
  { id: 'b2', label: 'Multi-Tier AI Redundancy', category: 'Intelligence', tooltip: 'Groq primary to Gemini fallback to SHA-256 local cache' },
  { id: 'b3', label: 'Offline-First PWAs', category: 'Frontend', tooltip: 'IndexedDB local stores with background sync for fluctuating networks' },
  { id: 'b4', label: 'Clean Production Code', category: 'Discipline', tooltip: 'Every file is complete, runnable, and uncompromising. No placeholders.' },
  { id: 'b5', label: 'Paystack Multi-Currency', category: 'Fintech', tooltip: 'Dual NGN/USD checkout with HMAC-SHA512 webhook verification' },
  { id: 'b6', label: 'Book of Lies Canon', category: 'Philosophy', tooltip: 'Nightly 9:47 PM reflections on engineering, pride, and moral hazards' },
  { id: 'b7', label: 'Plateau Highlands Origin', category: 'Location', tooltip: 'Forged in Jos, Plateau State, Nigeria — engineered for the real world' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [customization, setCustomization] = useState(getCustomization());
  const [bubbles, setBubbles] = useState<FounderBubble[]>(DEFAULT_BUBBLES);

  // Load custom footer configuration
  useEffect(() => {
    const handleUpdate = () => setCustomization(getCustomization());
    window.addEventListener('jadai_customization_changed', handleUpdate);

    try {
      const storedBubbles = localStorage.getItem('jadai_footer_bubbles');
      if (storedBubbles) {
        setBubbles(JSON.parse(storedBubbles));
      }
    } catch {
      // Non-fatal
    }

    return () => window.removeEventListener('jadai_customization_changed', handleUpdate);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    StudioAudio.playClick();
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubscribed(true);
      setEmail('');
      StudioAudio.playSuccessArpeggio();
    } catch {
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full relative z-10 bg-[#0a0908]/80 text-[#c4c0bb] border-t border-[rgba(196,192,187,0.12)] backdrop-blur-2xl overflow-hidden select-none">
      {/* Background Graphic from Customization with Subtle Ash Grading */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none filter brightness-50 contrast-125 animate-atmosphere"
        style={{ backgroundImage: `url(${customization.footerBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050404] via-[#0a0908]/90 to-transparent pointer-events-none" />

      {/* Subtle Ash & Gold Drifting Dust Particle Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#c4c0bb]"
            style={{
              width: `${(i % 2) + 1.5}px`,
              height: `${(i % 2) + 1.5}px`,
              left: `${(i * 19 + 3) % 100}%`,
              top: `${(i * 13 + 7) % 100}%`,
              opacity: (i % 5 + 3) / 10,
              boxShadow: '0 0 5px rgba(196, 192, 187, 0.4)',
              animation: `particleFloat ${8 + (i % 6)}s ease-in-out infinite alternate`,
              animationDelay: `${(i % 6) * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Top Border Gradient — Refined Ash Shimmer */}
      <div className="relative z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(196,192,187,0.35)] to-transparent shadow-[0_0_12px_rgba(196,192,187,0.2)]" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* -------------------------------------------------------------
            STUDIO CREED & ORIGIN
           ------------------------------------------------------------- */}
        <div className="flex flex-col items-center text-center space-y-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold tracking-[0.3em] text-[#C9A84C] text-sm">
              JADAI STUDIOS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161514] text-[#c4c0bb] border border-[rgba(201,168,76,0.2)]">
              BUILD DIFFERENT
            </span>
          </div>
          <p className="text-xs font-mono text-[#8a857e]">
            Jos, Nigeria · Est. 2024
          </p>
        </div>

        {/* -------------------------------------------------------------
            SUBSCRIBE FORM (CENTER-BOTTOM)
           ------------------------------------------------------------- */}
        <div className="max-w-md mx-auto text-center space-y-3 pt-6 border-t border-[rgba(196,192,187,0.12)]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161514] border border-[rgba(196,192,187,0.2)] text-[#e8e4de] text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Studio Drops & Architectural Insights</span>
          </div>
          <h4 className="text-xl font-display font-bold text-[#f5f3f0]">
            Stay Anchored
          </h4>
          <p className="text-xs text-[#8a857e]">
            Receive new systems, philosophical reflections, and releases directly.
          </p>

          {subscribed ? (
            <div className="p-3 rounded-xl bg-[#1a1918] border border-[#C9A84C] text-[#e8c96a] text-xs font-mono flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
              <span>You are on the dispatch list.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@domain.com"
                className="flex-1 px-4 py-2 rounded-xl bg-[#050404]/90 border border-[rgba(196,192,187,0.2)] text-xs font-mono text-[#f5f3f0] placeholder-[#8a857e] focus:outline-none focus:border-[#C9A84C]"
              />
              <EdgeGlow intensity="subtle" color="gold" borderRadius={12}>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>{loading ? 'Joining...' : 'Subscribe'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </EdgeGlow>
            </form>
          )}
        </div>

        {/* -------------------------------------------------------------
            4-COLUMN MATRIX (Ash & Neutral Grey)
           ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-[rgba(196,192,187,0.12)] text-left">
          {/* Column 1: Studio */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#e8c96a] font-bold block">
              Studio
            </span>
            <ul className="space-y-2 text-xs font-mono text-[#8a857e]">
              <li><a href="/about" className="hover:text-[#f5f3f0] transition-colors">About & Origins</a></li>
              <li><a href="/services" className="hover:text-[#f5f3f0] transition-colors">Services & Pillars</a></li>
              <li><a href="/work" className="hover:text-[#f5f3f0] transition-colors">Selected Works</a></li>
              <li><a href="/dream-forge" className="hover:text-[#f5f3f0] transition-colors">Dream Forge</a></li>
              <li><span className="text-[#635f59]">Jos Highlands, Nigeria</span></li>
            </ul>
          </div>

          {/* Column 2: Products (previews hosted by this app) */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#e8c96a] font-bold block">
              Products
            </span>
            <ul className="space-y-2 text-xs font-mono text-[#8a857e]">
              <li><a href="/previews/exampadi/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#f5f3f0] transition-colors">ExamPadi AI</a></li>
              <li><a href="/work" className="hover:text-[#f5f3f0] transition-colors">ATHENA Intelligence</a></li>
              <li><a href="/marketplace" className="hover:text-[#f5f3f0] transition-colors">Forge Prime Templates</a></li>
              <li><a href="/marketplace" className="hover:text-[#f5f3f0] transition-colors">Ghostwriter System</a></li>
              <li><a href="/book-of-lies" className="hover:text-[#f5f3f0] transition-colors">The Book of Lies</a></li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#e8c96a] font-bold block">
              Connect
            </span>
            <ul className="space-y-2 text-xs font-mono text-[#8a857e]">
              <li><a href="https://twitter.com/hudsonstylez" target="_blank" rel="noopener noreferrer" className="hover:text-[#f5f3f0] transition-colors">Twitter // @hudsonstylez</a></li>
              <li><a href="https://instagram.com/jadaistudios" target="_blank" rel="noopener noreferrer" className="hover:text-[#f5f3f0] transition-colors">Instagram // @jadaistudios</a></li>
              <li><a href="/contact" className="hover:text-[#f5f3f0] transition-colors">Direct Inquiries</a></li>
              <li><a href="mailto:jadaistudiosoffcl@gmail.com" className="hover:text-[#f5f3f0] transition-colors">Studio Email</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#e8c96a] font-bold block">
              Legal
            </span>
            <ul className="space-y-2 text-xs font-mono text-[#8a857e]">
              <li><a href="/legal/terms" className="hover:text-[#f5f3f0] transition-colors">Terms of Service</a></li>
              <li><a href="/legal/privacy" className="hover:text-[#f5f3f0] transition-colors">Privacy Policy</a></li>
              <li><a href="/legal/cookies" className="hover:text-[#f5f3f0] transition-colors">Cookie Policy</a></li>
              <li><span className="text-[#635f59]">Encrypted Integrity</span></li>
            </ul>
          </div>
        </div>

        {/* -------------------------------------------------------------
            WATERMARK
           ------------------------------------------------------------- */}
        <div className="pt-8 border-t border-[rgba(196,192,187,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs font-mono text-[#8a857e]">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold tracking-[0.2em] text-[#f5f3f0]">
              JADAI STUDIOS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#161514] text-[#c4c0bb] border border-[rgba(196,192,187,0.2)]">
              BUILD DIFFERENT
            </span>
          </div>

          <div>
            © 2026 Jadai Studios · Build Different · ⬡
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bubbleDrift {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-2px); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
