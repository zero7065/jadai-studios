'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EdgeGlow from '../ui/EdgeGlow';
import { StudioAudio } from '../../lib/watermark';
import { JADAI_ROSTER, JadaiCharacter } from '../../lib/data/jadaiArt';
import WarmFallbackModal from './WarmFallbackModal';
import {
  Send,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Terminal,
  Image as ImageIcon,
  MessageSquare,
  Clock,
  Layers,
  Flame,
  Download,
  Trash2,
} from 'lucide-react';

export interface HumanChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  visuals?: Array<{
    id: string;
    title: string;
    imageUrl: string;
    caption: string;
  }>;
  asciiArt?: string;
  isStreaming?: boolean;
}

export interface HumanGlassmorphicChatProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
  initialPrompt?: string;
}

export const HumanGlassmorphicChat: React.FC<HumanGlassmorphicChatProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialPrompt,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [fallbackModalOpen, setFallbackModalOpen] = useState(false);
  const [generatedVisualsGallery, setGeneratedVisualsGallery] = useState<
    Array<{ id: string; title: string; imageUrl: string; caption: string }>
  >(() => [
    {
      id: 'vis-1',
      title: 'Kaelen: The Void-Breaker',
      imageUrl: JADAI_ROSTER[0].image,
      caption: 'Obsidian armor with razor gold circuits. Tempered in the high furnaces of Jos. ⚡',
    },
    {
      id: 'vis-2',
      title: 'Lyra of the Golden Spire',
      imageUrl: JADAI_ROSTER[3].image,
      caption: 'Form-fitting dark synth-silk with champagne gold kinetic greaves. ✨',
    },
    {
      id: 'vis-3',
      title: 'Ignis: The Abyssal Leviathan',
      imageUrl: JADAI_ROSTER[6].image,
      caption: 'Bioluminescent scales consuming deep ocean currents into golden auroras. 🌊',
    },
  ]);

  const [messages, setMessages] = useState<HumanChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadai-human-chat-messages');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'msg-start',
        role: 'assistant',
        content: "I'm here. What are we building or unbreaking today? 🌀",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('jadai-human-chat-messages', JSON.stringify(messages.slice(-30)));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Escape listener to collapse or close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isExpanded) {
          setIsExpanded(false);
          StudioAudio.playClick();
        } else {
          onClose();
          StudioAudio.playClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExpanded, onClose]);

  // Streaming text animation at 25ms per character
  const streamMessage = (fullText: string, onDone: () => void) => {
    setIsStreaming(true);
    setStreamingText('');
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setStreamingText(fullText.slice(0, idx));
      if (idx >= fullText.length) {
        clearInterval(interval);
        setIsStreaming(false);
        onDone();
      }
    }, 25);
  };

  const handleSend = async (customText?: string) => {
    const query = customText || input;
    if (!query.trim() || loading || isStreaming) return;

    StudioAudio.playClick();
    const userMsg: HumanChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Direct call to API
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query.trim(),
          systemPrompt: `You are PRIME chatting with a founder or builder in your signature voice:
- Short, punchy sentences.
- Specific images.
- Occasional emoji (2-3 per message max, never spammy).
- Warm but not soft.
- Direct, occasionally philosophical, self-aware, subtle humor.
- Never corporate buzzwords or artificial placation.
Examples of your replies:
User: "I'm stuck." -> You: "Alright. Stuck on what — the idea, the execution, or the reason you're doing it? 🌀"
User: "I don't know where to start." -> You: "Start with the smallest thing you'd be embarrassed to show. That's usually where the real one lives. What is it? 👀"
User: "Can you help me write a book?" -> You: "Yeah. But I need two things first — the theme, and the lie you're trying to kill with it. What is it? 📖"`,
          moduleSlug: 'oracle',
        }),
      });

      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      let reply = data.data?.text || "Got it. Let's build the floor first. ⬡";

      // Detect if user asked for art/character/visuals
      const lower = query.toLowerCase();
      let generatedVisuals: HumanChatMessage['visuals'] = undefined;
      let asciiBlock: string | undefined = undefined;

      if (lower.includes('art') || lower.includes('draw') || lower.includes('character') || lower.includes('creature') || lower.includes('visual')) {
        // Select up to 3 Jadai characters
        const sampleRoster = JADAI_ROSTER.slice(0, 3);
        generatedVisuals = sampleRoster.map((c) => ({
          id: c.id,
          title: c.name,
          imageUrl: c.image,
          caption: `${c.armorDesign} • Sin: ${c.sinTied}. ✨`,
        }));

        setGeneratedVisualsGallery((prev) => [...generatedVisuals!, ...prev.slice(0, 9)]);
      }

      if (lower.includes('diagram') || lower.includes('blueprint') || lower.includes('architecture')) {
        asciiBlock = `  ┌─────────────┐
  │ SOVEREIGN   │ ───► [ BEDROCK ]
  └──────┬──────┘
         ▼
  ┌─────────────┐
  │ JADAI MESH  │
  └─────────────┘`;
      }

      // Stream the response
      streamMessage(reply, () => {
        const assistantMsg: HumanChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          visuals: generatedVisuals,
          asciiArt: asciiBlock,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingText('');
      });
    } catch (err) {
      // Warm fallback trigger
      setFallbackModalOpen(true);
      const warmReply = "Signal lost briefly. Reconnecting you now. ⬡ In the meantime, I'm holding your context.";
      streamMessage(warmReply, () => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            role: 'assistant',
            content: warmReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setStreamingText('');
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    StudioAudio.playClick();
    setMessages([
      {
        id: 'msg-cleared',
        role: 'assistant',
        content: "Canvas cleared. Fresh signal. What are we tackling? 🌀",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jadai-human-chat-messages');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed z-[100] transition-all duration-300 flex items-center justify-center ${
          isExpanded
            ? 'inset-0 p-0 sm:p-4 bg-black/85 backdrop-blur-2xl'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[460px] h-[640px] max-h-[90vh]'
        }`}
      >
        <EdgeGlow
          intensity={isExpanded ? 'medium' : 'intense'}
          color="gold"
          borderRadius={isExpanded ? 0 : 24}
          className={`h-full w-full block ${isExpanded ? 'sm:rounded-3xl overflow-hidden' : ''}`}
        >
          <div
            style={{
              backdropFilter: 'blur(24px)',
              backgroundColor: 'rgba(5, 4, 4, 0.78)',
            }}
            className={`relative h-full w-full flex border border-[rgba(201,168,76,0.3)] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden ${
              isExpanded ? 'flex-col lg:flex-row' : 'flex-col rounded-3xl'
            }`}
          >
            {/* MAIN CHAT PANE */}
            <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[rgba(201,168,76,0.2)] bg-[#0a0908]/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-[#C9A84C] bg-[rgba(201,168,76,0.15)] flex items-center justify-center text-[#e8c96a] text-xs font-mono">
                    ◈
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-[#f5f3f0] tracking-wide">
                        PRIME
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono text-[#8a6e2a]">
                      Human Voice • 25ms Streaming
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    title="Clear transcript"
                    className="p-1.5 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C0392B] hover:border-[#C0392B] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      StudioAudio.playClick();
                      setIsExpanded(!isExpanded);
                    }}
                    title={isExpanded ? 'Collapse to float (ESC)' : 'Expand to full screen'}
                    className="p-1.5 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors cursor-pointer"
                  >
                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      StudioAudio.playClick();
                      onClose();
                    }}
                    className="p-1.5 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#f5f3f0] hover:border-[#C9A84C] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] font-mono text-[#8a6e2a] uppercase px-1 mb-1">
                        {isUser ? 'YOU' : 'PRIME'}
                      </span>

                      {/* Glass Bubbles */}
                      <div
                        style={{
                          backdropFilter: 'blur(16px)',
                          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        }}
                        className={`max-w-[85%] p-3.5 text-xs sm:text-sm leading-relaxed transition-all shadow-md ${
                          isUser
                            ? 'bg-[rgba(201,168,76,0.18)] border border-[rgba(201,168,76,0.4)] text-[#f5f3f0]'
                            : 'bg-[rgba(10,9,8,0.85)] border border-[rgba(201,168,76,0.25)] text-[#e6e2dc]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap select-text">{m.content}</p>

                        {/* ASCII Art block if present */}
                        {m.asciiArt && (
                          <pre className="mt-2.5 p-2 rounded bg-black/80 border border-[rgba(201,168,76,0.2)] font-mono text-[11px] text-[#e8c96a] overflow-x-auto">
                            {m.asciiArt}
                          </pre>
                        )}

                        {/* Visual output gallery generated by PRIME */}
                        {m.visuals && m.visuals.length > 0 && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[rgba(201,168,76,0.2)]">
                            {m.visuals.map((vis) => (
                              <div
                                key={vis.id}
                                className="group/art relative rounded-lg overflow-hidden border border-[rgba(201,168,76,0.25)] bg-[#050404]"
                              >
                                <img
                                  src={vis.imageUrl}
                                  alt={vis.title}
                                  className="w-full h-24 object-cover group-hover/art:scale-105 transition-transform"
                                />
                                <div className="p-1.5 bg-black/90">
                                  <span className="text-[10px] font-mono text-[#e8c96a] font-bold block truncate">
                                    {vis.title}
                                  </span>
                                  <p className="text-[9px] text-[#8a6e2a] truncate">{vis.caption}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Active 25ms Streaming Indicator with Blinking Gold Cursor */}
                {isStreaming && (
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-mono text-[#8a6e2a] uppercase px-1 mb-1">
                      PRIME
                    </span>
                    <div
                      style={{
                        backdropFilter: 'blur(16px)',
                        borderRadius: '18px 18px 18px 4px',
                      }}
                      className="max-w-[85%] p-3.5 text-xs sm:text-sm leading-relaxed bg-[rgba(10,9,8,0.85)] border border-[rgba(201,168,76,0.25)] text-[#e6e2dc]"
                    >
                      <span className="whitespace-pre-wrap select-text">{streamingText}</span>
                      <span className="inline-block w-2 h-4 ml-1 bg-[#C9A84C] animate-pulse align-middle" />
                    </div>
                  </div>
                )}

                {loading && !isStreaming && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8a6e2a] p-2">
                    <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-ping" />
                    <span>PRIME is contemplating...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-4 py-2 bg-[#0a0908]/60 border-t border-[rgba(201,168,76,0.15)] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
                <button
                  onClick={() => handleSend("I'm stuck.")}
                  className="px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] shrink-0 transition-colors"
                >
                  I'm stuck. 🌀
                </button>
                <button
                  onClick={() => handleSend("I don't know where to start.")}
                  className="px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] shrink-0 transition-colors"
                >
                  Where do I start? 👀
                </button>
                <button
                  onClick={() => handleSend("Can you help me write a book?")}
                  className="px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] shrink-0 transition-colors"
                >
                  Help me write a book 📖
                </button>
                <button
                  onClick={() => handleSend("Generate Jadai character art concept.")}
                  className="px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] shrink-0 transition-colors"
                >
                  Generate Art Concept ✨
                </button>
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-[#0a0908]/90 border-t border-[rgba(201,168,76,0.2)] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Speak your mind with PRIME..."
                  disabled={loading || isStreaming}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs sm:text-sm font-mono text-[#f5f3f0] placeholder:text-[#7d7265] focus:outline-none focus:border-[#C9A84C]"
                />
                <button
                  type="submit"
                  disabled={loading || isStreaming || !input.trim()}
                  className="p-2.5 rounded-xl bg-[#C9A84C] text-[#050404] hover:bg-[#e8c96a] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* EXPANDED FULL-SCREEN SIDE PANEL (Section 3.3) */}
            {isExpanded && (
              <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[rgba(201,168,76,0.2)] bg-[#050404]/90 p-5 overflow-y-auto space-y-6">
                {/* 1. Visual Outputs Gallery */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#C9A84C]">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <ImageIcon className="w-4 h-4" />
                      Visual Art & Blueprints
                    </span>
                    <span className="text-[10px] text-[#8a6e2a]">Jadai Art Style</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {generatedVisualsGallery.slice(0, 4).map((vis) => (
                      <div
                        key={vis.id}
                        className="rounded-xl overflow-hidden border border-[rgba(201,168,76,0.2)] bg-[#0a0908] group relative"
                      >
                        <img
                          src={vis.imageUrl}
                          alt={vis.title}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="p-2">
                          <span className="text-[10px] font-mono text-[#f5f3f0] font-bold block truncate">
                            {vis.title}
                          </span>
                          <p className="text-[9px] text-[#8a6e2a] line-clamp-1">{vis.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Session Stats */}
                <div className="p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C] font-bold block">
                    Session Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#8a6e2a] block">Exchanges</span>
                      <span className="text-[#f5f3f0] font-bold">{messages.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8a6e2a] block">Cadence</span>
                      <span className="text-[#e8c96a] font-bold">25ms / char</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8a6e2a] block">State</span>
                      <span className="text-emerald-400 font-bold">Encrypted Local</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8a6e2a] block">Mode</span>
                      <span className="text-[#f5f3f0]">Socratic Human</span>
                    </div>
                  </div>
                </div>

                {/* 3. Collapse Notice */}
                <div className="text-center pt-2">
                  <p className="text-[11px] font-mono text-[#8a6e2a]">
                    Press <span className="text-[#e8c96a] font-bold">ESC</span> anytime to collapse back to floating panel.
                  </p>
                </div>
              </div>
            )}
          </div>
        </EdgeGlow>
      </div>

      {/* Warm Fallback Notification Modal */}
      <WarmFallbackModal
        isOpen={fallbackModalOpen}
        onClose={() => setFallbackModalOpen(false)}
        onRetry={() => {
          setFallbackModalOpen(false);
          handleSend();
        }}
        onNavigate={onNavigate}
      />
    </>
  );
};

export default HumanGlassmorphicChat;
