'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Navigation, Compass } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';
import { askPrime, primeWelcome } from '../../lib/ai/memory';

export interface GuideBeeProps {
  onNavigate?: (path: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  target?: string;
  targetPath?: string;
}

const DESTINATION_MAP: Record<string, { path: string; selector: string; label: string }> = {
  forge: { path: '/playground/forge', selector: '#bento-forge', label: 'FORGE' },
  mirage: { path: '/playground/mirage', selector: '#bento-mirage', label: 'MIRAGE' },
  oracle: { path: '/oracle', selector: '#bento-oracle', label: 'PRIME Oracle' },
  sentinel: { path: '/playground/sentinel', selector: '#bento-sentinel', label: 'SENTINEL' },
  'book of lies': { path: '/book-of-lies', selector: 'a[href="/book-of-lies"]', label: 'The Book of Lies' },
  canon: { path: '/book-of-lies', selector: 'a[href="/book-of-lies"]', label: 'The Book of Lies' },
  marketplace: { path: '/marketplace', selector: 'a[href="/marketplace"]', label: 'Marketplace' },
  templates: { path: '/marketplace', selector: 'a[href="/marketplace"]', label: 'Marketplace' },
  community: { path: '/community', selector: 'a[href="/community"]', label: 'Community Hub' },
  hub: { path: '/hub', selector: 'a[href="/hub"]', label: 'Community Hub' },
  signal: { path: '/signal', selector: 'a[href="/signal"]', label: 'Jadai Signal' },
  radar: { path: '/signal/radar', selector: 'a[href="/signal"]', label: 'Jadai Signal Radar' },
  about: { path: '/about', selector: 'a[href="/about"]', label: 'Studio Doctrine' },
  doctrine: { path: '/about', selector: 'a[href="/about"]', label: 'Studio Doctrine' },
  home: { path: '/', selector: 'a[href="/"]', label: 'Home' },
  surface: { path: '/', selector: 'a[href="/"]', label: 'Home' },
  pricing: { path: '/upgrade', selector: 'a[href="/upgrade"]', label: 'Pricing Tiers' },
  upgrade: { path: '/upgrade', selector: 'a[href="/upgrade"]', label: 'Pricing Tiers' },
};

export const GuideBee: React.FC<GuideBeeProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState<'zen' | 'curious' | 'excited'>('zen');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load persistent context from localStorage with legacy migration
  useEffect(() => {
    try {
      let stored = localStorage.getItem('guide_context');
      if (!stored) {
        const legacy = localStorage.getItem('prime_guide_context');
        if (legacy) {
          stored = legacy;
          localStorage.setItem('guide_context', legacy);
          localStorage.removeItem('prime_guide_context');
        }
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-5));
        }
      } else {
        // Personalized opener — reads builder memory so GUIDE greets by name when known
        void primeWelcome('GUIDE', 'guide').then((line) => {
          setMessages((prev) => (prev.length === 0 ? [{ role: 'assistant', content: line }] : prev));
        });
      }
    } catch {}

    // On first load: show floating tooltip after 4 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);

    // Auto-dismiss tooltip after 5 seconds
    const dismissTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 9000);

    return () => {
      clearTimeout(tooltipTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  // Save messages to localStorage (max 20)
  const saveContext = (newMessages: Message[]) => {
    try {
      const trimmed = newMessages.slice(-20);
      localStorage.setItem('guide_context', JSON.stringify(trimmed));
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const highlightAndNavigate = (targetSelector: string, targetPath: string) => {
    // 1. Try finding target element in current DOM
    let el = document.querySelector(targetSelector);
    if (!el) {
      // Fallback searches
      if (targetPath.includes('forge')) el = document.getElementById('bento-forge') || document.querySelector('a[href*="forge"]');
      else if (targetPath.includes('mirage')) el = document.getElementById('bento-mirage') || document.querySelector('a[href*="mirage"]');
      else if (targetPath.includes('sentinel')) el = document.getElementById('bento-sentinel') || document.querySelector('a[href*="sentinel"]');
      else if (targetPath.includes('oracle')) el = document.getElementById('bento-oracle') || document.querySelector('a[href*="oracle"]');
    }

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('prime-target');
      setTimeout(() => {
        el?.classList.remove('prime-target');
      }, 2000);
    }

    // Close panel
    setIsOpen(false);

    // Navigate after 800ms
    setTimeout(() => {
      if (onNavigate) {
        onNavigate(targetPath);
      } else {
        window.location.href = targetPath;
      }
    }, 800);
  };

  const parseDestination = (text: string): { path: string; selector: string; label: string } | null => {
    const lower = text.toLowerCase();
    for (const [key, value] of Object.entries(DESTINATION_MAP)) {
      if (lower.includes(key)) {
        return value;
      }
    }
    return null;
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    try {
      StudioAudio.playClick();
    } catch {}

    const userMsg: Message = { role: 'user', content: query };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setMood('curious');

    try {
      // Unified memory transport — also fixes the old systemInstruction / data.text mismatch
      // that silently routed every GUIDE reply through the deterministic fallback.
      const result = await askPrime({
        prompt: `User asking for studio direction: "${query}"`,
        systemPrompt:
          'You are GUIDE, the navigation guide for Jadai Studios. You give extremely short answers (max 2 sentences). You always end with a direction: the exact page or tool name the user needs. Available destinations: Home, FORGE, PRIME Oracle, MIRAGE, SENTINEL, Book of Lies, Marketplace, Community, Signal, Studio Doctrine, Pricing.',
        moduleSlug: 'guide',
        scope: 'guide',
      });

      let assistantText = result.text;

      // Empty output, provider error, or graceful chain fallback → GUIDE's own deterministic routing
      if (!assistantText || result.error || result.provider === 'graceful_fallback') {
        const dest = parseDestination(query);
        if (dest) {
          assistantText = `That's ${dest.label}. I'll take you there. →`;
        } else {
          assistantText = "Tell me what you're looking for and I'll point you there. What do you need?";
        }
      }

      const dest = parseDestination(assistantText) || parseDestination(query);
      const assistantMsg: Message = {
        role: 'assistant',
        content: assistantText,
        target: dest?.selector,
        targetPath: dest?.path,
      };

      const finalMessages = [...updated, assistantMsg];
      setMessages(finalMessages);
      saveContext(finalMessages);
      setMood('excited');

      if (dest) {
        try {
          StudioAudio.playSuccessArpeggio();
        } catch {}
        setTimeout(() => {
          highlightAndNavigate(dest.selector, dest.path);
        }, 1200);
      }
    } catch {
      // Fallback
      const dest = parseDestination(query);
      const fallbackMsg: Message = {
        role: 'assistant',
        content: dest
          ? `That's ${dest.label}. I'll take you there. →`
          : "Tell me what you're looking for and I'll point you there. What do you need?",
        target: dest?.selector,
        targetPath: dest?.path,
      };
      const finalMessages = [...updated, fallbackMsg];
      setMessages(finalMessages);
      saveContext(finalMessages);

      if (dest) {
        setTimeout(() => {
          highlightAndNavigate(dest.selector, dest.path);
        }, 800);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMood('zen'), 3000);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[95] select-none">
      {/* -------------------------------------------------------------
          1. PROACTIVE FLOATING TOOLTIP
         ------------------------------------------------------------- */}
      {showTooltip && !isOpen && (
        <div
          onClick={() => {
            setShowTooltip(false);
            setIsOpen(true);
          }}
          className="absolute bottom-14 right-0 w-64 p-3 rounded-2xl bg-[#0a0908]/95 border border-[rgba(201,168,76,0.35)] shadow-2xl backdrop-blur-xl cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 text-left"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-[#D4AF37] mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-[#C9A84C]" />
              GUIDE
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs font-mono text-[#f5f3f0] leading-snug">
            Need help finding something? Tap me ⬡
          </p>
        </div>
      )}

      {/* -------------------------------------------------------------
          2. EXPANDED SLIDE-UP CHAT PANEL (300px wide, 400px tall max)
         ------------------------------------------------------------- */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-[300px] sm:w-[320px] max-h-[400px] h-[390px] rounded-2xl bg-[#0a0908]/95 border border-[rgba(201,168,76,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col overflow-hidden text-left animate-in fade-in slide-in-from-bottom-3">
          {/* Header */}
          <div className="p-3 border-b border-[rgba(201,168,76,0.18)] flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#C0392B] flex items-center justify-center text-white text-[10px] font-bold">
                ⬡
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#f5f3f0] block leading-tight">GUIDE</span>
                <span className="text-[9px] font-mono text-[#D4AF37]">
                  {mood === 'excited' ? 'Excited to guide' : mood === 'curious' ? 'Thinking...' : 'Navigation Assistant'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs font-mono">
            {messages.length === 0 && (
              <div className="text-center py-6 text-zinc-400 space-y-2">
                <Compass className="w-6 h-6 text-[#C9A84C] mx-auto opacity-60" />
                <p className="text-[11px] leading-relaxed">
                  Where do you need to go? Ask for any tool, document editor, parables, or pricing.
                </p>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[#f5f3f0]'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200'
                  }`}
                >
                  {m.content}
                </div>
                {m.targetPath && (
                  <button
                    onClick={() => highlightAndNavigate(m.target || '', m.targetPath || '')}
                    className="mt-1 text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Jump now →</span>
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                <span>GUIDE is routing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2 border-t border-[rgba(201,168,76,0.15)] bg-black/60 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Where do you need to go?"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#C9A84C]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-1.5 rounded-lg bg-[#C9A84C] text-black hover:bg-[#e8c96a] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* -------------------------------------------------------------
          3. FLOATING CIRCULAR GUIDE BEE (36px mobile / 44px desktop)
         ------------------------------------------------------------- */}
      <div
        onClick={() => {
          setShowTooltip(false);
          setIsOpen(!isOpen);
          try {
            StudioAudio.playClick();
          } catch {}
        }}
        title="GUIDE Navigation Assistant"
        className="w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 relative group"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #C9A84C 0%, #C0392B 90%)',
          animation: 'beeBob 3s ease-in-out infinite, beePulse 2.5s ease-in-out infinite',
        }}
      >
        {/* Metatron Sigil SVG at 18px */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[18px] h-[18px] text-[#050404]"
        >
          <circle cx="20" cy="20" r="18" stroke="#050404" strokeWidth="1.5" />
          <polygon points="20,4 34,28 6,28" stroke="#050404" strokeWidth="1.2" />
          <polygon points="20,36 34,12 6,12" stroke="#050404" strokeWidth="1.2" />
          <circle cx="20" cy="20" r="4" fill="#050404" />
        </svg>

        {/* Playful mood indicator */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
      </div>
    </div>
  );
};

export default GuideBee;
