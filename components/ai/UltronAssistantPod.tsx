'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EdgeGlow from '../ui/EdgeGlow';
import { StudioAudio } from '../../lib/watermark';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  ArrowRight,
  ExternalLink,
  RotateCw,
  Compass,
  MapPin,
  Globe,
  Navigation,
  CheckCircle,
  Layers,
  BookOpen,
  ShoppingBag,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface UltronAssistantPodProps {
  onNavigate?: (path: string) => void;
}

interface GroundingSource {
  title?: string;
  url?: string;
  snippet?: string;
  sourceType: 'web' | 'map';
  placeAddress?: string;
  rating?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionPath?: string;
  actionLabel?: string;
  timestamp: string;
  groundingSources?: GroundingSource[];
  groundingMode?: 'search' | 'maps' | 'standard';
}

const ROTATING_SUGGESTIONS = [
  { text: 'Search live global news & AI benchmarks', path: 'search' },
  { text: 'Find directions to Jadai Studios Prime Node in Lagos or Jos', path: 'maps' },
  { text: 'Audit site speed, SEO & security in Sentinel', path: '/playground/sentinel' },
  { text: "Read tonight's Book of Lies 9:47 PM transmission", path: '/book-of-lies' },
  { text: 'Explore Lens / Aperture photography starter', path: '/marketplace' },
  { text: 'Draft an enterprise software contract in Forge', path: '/playground/forge' },
  { text: 'Synthesize a Donghua anime character in Mirage', path: '/playground/mirage' },
  { text: 'Review dual-currency Paystack checkout', path: '/upgrade' },
];

export const UltronAssistantPod: React.FC<UltronAssistantPodProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [groundingMode, setGroundingMode] = useState<'standard' | 'search' | 'maps'>('search');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ultron Intelligence online. I am grounded in real-time Google Search data for current events and real-time Google Maps data for physical hubs and routes.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundingMode: 'standard',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Try to acquire user geolocation once on component mount for Google Maps grounding
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Default to Lagos / Jos coordinates if denied
          setUserLocation({ latitude: 6.4281, longitude: 3.4219 });
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Auto-rotate 8 suggestions every 5.5s
  useEffect(() => {
    if (isOpen) return;
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % ROTATING_SUGGESTIONS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const activeSuggestion = ROTATING_SUGGESTIONS[suggestionIndex];

  const handleOpenPod = () => {
    StudioAudio.playSuccessArpeggio();
    setIsOpen(true);
  };

  const handleClosePod = () => {
    StudioAudio.playClick();
    setIsOpen(false);
  };

  const handleSuggestionClick = (sug: typeof activeSuggestion) => {
    StudioAudio.playClick();
    if (sug.path === 'search') {
      setGroundingMode('search');
      setInput('What are the latest breakthroughs in high-performance web systems today?');
    } else if (sug.path === 'maps') {
      setGroundingMode('maps');
      setInput('Show directions and travel times to Jadai Studios tech corridor in Lagos and Jos.');
    } else {
      setInput(sug.text);
    }
    setIsOpen(true);
  };

  const routeIntentMap: Array<{ keywords: string[]; path: string; label: string; reply: string }> = [
    {
      keywords: ['forge', 'doc', 'document', 'pdf', 'ocr', 'editor'],
      path: '/playground/forge',
      label: 'Open FORGE Media & Doc Editor',
      reply: 'Routing you directly to FORGE—upload up to 10 documents or images for OCR layout reconstruction and Canva-style editing.',
    },
    {
      keywords: ['oracle', 'prime', 'socratic'],
      path: '/oracle',
      label: 'Open PRIME Oracle Console',
      reply: 'Connecting you to the PRIME Living Intelligence console with persistent IndexedDB memory.',
    },
    {
      keywords: ['mirage', 'image', 'picture', 'anime', 'donghua', 'generate image', 'logo', 'visual'],
      path: '/playground/mirage',
      label: 'Open MIRAGE Vision Studio',
      reply: 'Navigating to MIRAGE—generate high-definition 4K visuals, Donghua characters, and architectural blueprints with multi-API fallback.',
    },
    {
      keywords: ['sentinel', 'audit', 'diagnostic', 'speed', 'health', 'lighthouse', 'shorten', 'link'],
      path: '/playground/sentinel',
      label: 'Open SENTINEL Site Shield',
      reply: 'Launching SENTINEL for Core Web Vitals diagnostics, RDAP domain conflict checks, and link cloaking.',
    },
    {
      keywords: ['book of lies', 'lies', 'parable', 'sin', 'canon', 'story', 'chapter', 'episodes'],
      path: '/book-of-lies',
      label: 'Enter The Book of Lies Hall',
      reply: 'Unlocking The Book of Lies canon—40+ serialized parables exploring pride, moral hazards, and system fragility.',
    },
    {
      keywords: ['template', 'marketplace', 'starter', 'aperture', 'vendor', 'shelter', 'bloom', 'glow'],
      path: '/marketplace',
      label: 'Explore Marketplace',
      reply: 'Opening the 5 flagship starters in the Marketplace: Lens, Commerce, Sanctuary, Flora, and Radiance.',
    },
    {
      keywords: ['community', 'network', 'post', 'feed', 'architects', 'profiles'],
      path: '/community',
      label: 'Open Member Community',
      reply: 'Navigating to the Architect Community feed and creator profiles.',
    },
    {
      keywords: ['workspace', 'draft', 'save', 'project', 'account'],
      path: '/account/workspace',
      label: 'Open Draft Workspace',
      reply: 'Accessing your continuous draft workspace preserving state across all 4 creation tools.',
    },
    {
      keywords: ['pricing', 'upgrade', 'paystack', 'tier', 'subscription'],
      path: '/upgrade',
      label: 'View Membership Tiers',
      reply: 'Presenting membership tiers and dual-currency Paystack checkout with 3-month loyalty milestones.',
    },
    {
      keywords: ['home', 'homepage', 'surface'],
      path: '/',
      label: 'Return to Surface',
      reply: 'Returning to the homepage surface.',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    StudioAudio.playClick();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const lower = query.toLowerCase();

    // Check for direct navigation intent first if standard mode or matching clear keywords
    const matchedIntent = routeIntentMap.find((item) =>
      item.keywords.some((kw) => lower.includes(kw))
    );

    if (matchedIntent && !lower.includes('where') && !lower.includes('news') && !lower.includes('map') && !lower.includes('route')) {
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: matchedIntent.reply,
          actionPath: matchedIntent.path,
          actionLabel: matchedIntent.label,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setLoading(false);
        StudioAudio.playSuccessArpeggio();

        if (onNavigate) {
          setTimeout(() => {
            onNavigate(matchedIntent.path);
          }, 1200);
        }
      }, 500);
      return;
    }

    // Determine if this is a Google Maps or Google Search grounded query
    const isMapsQuery =
      groundingMode === 'maps' ||
      lower.includes('map') ||
      lower.includes('route') ||
      lower.includes('direction') ||
      lower.includes('navigate') ||
      lower.includes('where is') ||
      lower.includes('location') ||
      lower.includes('lagos') ||
      lower.includes('jos') ||
      lower.includes('abuja') ||
      lower.includes('distance');

    const effectiveMode = isMapsQuery ? 'maps' : groundingMode;

    try {
      if (effectiveMode === 'maps' || effectiveMode === 'search') {
        const res = await fetch('/api/ai/grounded', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            mode: effectiveMode,
            location: userLocation,
            systemPrompt:
              effectiveMode === 'maps'
                ? 'You are Ultron Spatial Navigator for Jadai Studios. Provide accurate geographic data, routes, physical studio coordinates in Nigeria and global nodes, and travel times.'
                : 'You are Ultron Grounded Truth Agent for Jadai Studios. Discuss current events, cite recent news, and fact-check technical claims with live web accuracy.',
          }),
        });

        const data = await res.json();
        const replyText = data.text || 'Grounded intelligence retrieved successfully.';
        const sources = data.sources || [];

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundingSources: sources,
          groundingMode: effectiveMode,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        StudioAudio.playSuccessArpeggio();
      } else {
        // Standard chat fallback
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            systemPrompt:
              'You are Ultron, the Chief Digital Navigator and AI Intelligence of Jadai Studios in Jos, Nigeria. Speak with concise authority, mathematical precision, and sovereign clarity.',
            moduleSlug: 'oracle',
          }),
        });

        const data = await res.json();
        const replyText =
          data.data?.text ||
          data.text ||
          data.response ||
          'Understood. You can access Forge for editing, Mirage for visuals, Sentinel for diagnostics, and Book of Lies for our philosophical canon.';

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        StudioAudio.playSuccessArpeggio();
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          'Signal received. Jadai Studios is operating with full redundancy. You can browse the 40+ Book of Lies episodes or launch Sentinel diagnostics.',
        actionPath: '/playground',
        actionLabel: 'Explore Playground',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* -------------------------------------------------------------------
          1. FLOATING HOLOGRAPHIC ULTRON POD & ROTATING TICKER
         ------------------------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Animated Rotating Suggestions Pill */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10 }}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0a0908]/90 border border-[rgba(201,168,76,0.35)] shadow-2xl backdrop-blur-xl cursor-pointer hover:border-[#C9A84C] transition-all group"
            onClick={() => handleSuggestionClick(activeSuggestion)}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] animate-pulse" />
            <span className="text-xs font-mono text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors max-w-[280px] truncate">
              {activeSuggestion.text}
            </span>
            <span className="text-[10px] font-mono text-[#8a6e2a] px-1.5 py-0.5 rounded bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.2)]">
              Ask AI
            </span>
          </motion.div>
        )}

        {/* 3D Holographic Pod Orb Button */}
        <motion.button
          type="button"
          onClick={isOpen ? handleClosePod : handleOpenPod}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-2xl group focus:outline-none"
          title="Toggle Ultron AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8a6e2a] via-[#C9A84C] to-[#e8c96a] opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all animate-pulse" />
          <div className="absolute -inset-1 rounded-full border border-[rgba(201,168,76,0.5)] border-dashed animate-spin [animation-duration:14s]" />
          <div className="relative w-full h-full rounded-full bg-[#0a0908] border border-[#C9A84C] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.25)_0%,transparent_70%)]" />
            {isOpen ? (
              <X className="w-6 h-6 text-[#f5f3f0] relative z-10 transition-transform group-hover:rotate-90 duration-300" />
            ) : (
              <Bot className="w-6 h-6 text-[#e8c96a] relative z-10 group-hover:scale-110 transition-transform duration-300" />
            )}
            <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_8px_#34d399]" />
          </div>
        </motion.button>
      </div>

      {/* -------------------------------------------------------------------
          2. EXPANDABLE GLASS DRAWER
         ------------------------------------------------------------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed z-50 rounded-3xl bg-[#0a0908]/95 border border-[rgba(201,168,76,0.35)] shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden ${
              isExpanded
                ? 'inset-4 sm:inset-10 max-w-4xl mx-auto max-h-[92vh]'
                : 'bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[460px] h-[600px] max-h-[82vh]'
            }`}
          >
            <EdgeGlow color="gold" />

            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-[rgba(201,168,76,0.2)] bg-[#050404]/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#e8c96a]">
                  <Bot className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-sm text-[#f5f3f0]">
                      Ultron Navigator
                    </h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Grounded AI
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#8a6e2a]">
                    Google Search & Maps • Real-Time Truth & Routes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg text-[#8a6e2a] hover:text-[#C9A84C] hover:bg-white/5 transition-colors cursor-pointer"
                  title={isExpanded ? 'Restore window size' : 'Expand full view'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleClosePod}
                  className="p-1.5 rounded-lg text-[#8a6e2a] hover:text-[#C0392B] hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Selectors */}
            <div className="px-4 py-2 bg-[#050404] border-b border-[rgba(201,168,76,0.15)] flex items-center justify-between gap-2 text-[10px] font-mono">
              <span className="text-[#8a6e2a]">Grounding Engine:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    StudioAudio.playClick();
                    setGroundingMode('search');
                  }}
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    groundingMode === 'search'
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Globe className="w-3 h-3" /> Live Search
                </button>

                <button
                  onClick={() => {
                    StudioAudio.playClick();
                    setGroundingMode('maps');
                  }}
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    groundingMode === 'maps'
                      ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <MapPin className="w-3 h-3" /> Google Maps
                </button>

                <button
                  onClick={() => {
                    StudioAudio.playClick();
                    setGroundingMode('standard');
                  }}
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    groundingMode === 'standard'
                      ? 'bg-[#C9A84C] text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Core AI
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {messages.map((m) => {
                const isAi = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                        isAi
                          ? 'bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]'
                          : 'bg-[rgba(201,168,76,0.2)] border border-[rgba(201,168,76,0.4)] text-[#e8c96a]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>

                      {/* Grounding Citations Chips */}
                      {m.groundingSources && m.groundingSources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                            {m.groundingMode === 'maps' ? (
                              <>
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span>Verified Google Maps Places & Routes:</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-3 h-3 text-amber-400" />
                                <span>Verified Google Search Citations:</span>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {m.groundingSources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500 text-[10px] text-zinc-300 hover:text-white transition-all max-w-full truncate"
                              >
                                {src.sourceType === 'map' ? (
                                  <Navigation className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <ExternalLink className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                )}
                                <span className="truncate">{src.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Direct Deep-Link Action Button */}
                      {m.actionPath && (
                        <div className="pt-2 mt-2 border-t border-[rgba(201,168,76,0.2)]">
                          <button
                            type="button"
                            onClick={() => {
                              StudioAudio.playSuccessArpeggio();
                              if (onNavigate) {
                                onNavigate(m.actionPath!);
                              } else {
                                window.location.href = m.actionPath!;
                              }
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C9A84C] text-[#050404] font-bold text-[11px] hover:bg-[#e8c96a] transition-colors cursor-pointer"
                          >
                            <span>{m.actionLabel || 'Proceed to Room'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-[#8a6e2a] px-1">{m.timestamp}</span>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#050404] border border-[rgba(201,168,76,0.2)] text-xs text-[#e8c96a] max-w-[240px]">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-[#C9A84C]" />
                  <span>
                    {groundingMode === 'maps'
                      ? 'Fetching Google Maps routes & places...'
                      : groundingMode === 'search'
                      ? 'Grounding in live Google Search results...'
                      : 'Synthesizing response...'}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#050404] border-t border-[rgba(201,168,76,0.2)] flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  groundingMode === 'maps'
                    ? 'Search places, routes, directions (e.g. Lagos to Jos)...'
                    : groundingMode === 'search'
                    ? 'Fact-check current news, rates, live tech data...'
                    : 'Ask Ultron or command a destination...'
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] placeholder-[#8a6e2a] text-xs font-mono focus:outline-none focus:border-[#C9A84C]"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#e8c96a] to-[#C9A84C] text-[#050404] font-bold hover:opacity-95 disabled:opacity-30 transition-all cursor-pointer"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UltronAssistantPod;
