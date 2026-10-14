'use client';
// components/ai/PageAiDock.tsx
// A compact, page-aware AI assistant docked on every non-admin page.
//
// Unlike Oracle (a full chat workspace), this is a lightweight "ask about this
// page" panel. It streams via askPrimeStream (so it inherits server-side memory
// + RAG retrieval) and is primed with a per-route context so its answers are
// about whatever the builder is looking at.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Loader2 } from 'lucide-react';
import { askPrimeStream } from '../../lib/ai/memory';

export interface PageContext {
  /** Short label for the dock chip. */
  label: string;
  /** System prompt priming the model on what this page is + how to help. */
  system: string;
  /** 2-3 suggested taps. */
  suggestions: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PageAiDock({ context }: { context: PageContext }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput('');
      setMessages((m) => [...m, { role: 'user', content: q }]);
      setBusy(true);

      let assistant = '';
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const result = await askPrimeStream({
        prompt: q,
        systemPrompt: context.system,
        scope: `dock:${context.label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        history,
        ephemeral: true,
        onToken: (delta) => {
          assistant += delta;
          setMessages((m) => {
            const next = [...m];
            if (next[next.length - 1]?.role === 'assistant' && next[next.length - 1]?.content === assistant.slice(0, -delta.length)) {
              next[next.length - 1] = { role: 'assistant', content: assistant };
            } else if (next[next.length - 1]?.role !== 'assistant' || assistant.length === delta.length) {
              next.push({ role: 'assistant', content: assistant });
            } else {
              next[next.length - 1] = { role: 'assistant', content: assistant };
            }
            return next;
          });
        },
      });

      if (!assistant && result.text) {
        setMessages((m) => [...m, { role: 'assistant', content: result.text }]);
      } else if (!assistant && result.error) {
        setMessages((m) => [...m, { role: 'assistant', content: `⚠ ${result.error}` }]);
      }
      setBusy(false);
    },
    [busy, context, messages]
  );

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask AI about this page"
        className="fixed bottom-24 left-4 z-[900] flex items-center gap-2 rounded-full border border-[rgba(201,168,76,0.45)] bg-[#0a0908]/90 px-3.5 py-2 text-[12px] text-[#e8c96a] shadow-[0_10px_30px_rgba(0,0,0,0.7)] backdrop-blur hover:border-[#C9A84C] hover:bg-[#12100e] transition-all"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">{context.label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-40 left-4 z-[901] flex w-[min(360px,90vw)] flex-col overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.35)] bg-[#0a0908]/97 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.2)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e8c96a]" />
                <span className="text-[13px] font-medium text-[#f3efe6]">{context.label}</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-[#8a8580] hover:text-[#e8c96a]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 max-h-[280px] min-h-[120px]">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-[12px] text-[#8a8580]">Ask anything about this page.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {context.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-[rgba(201,168,76,0.3)] px-2.5 py-1 text-[11px] text-[#b6b1a9] hover:border-[#C9A84C] hover:text-[#e8c96a] transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                  <span
                    className={
                      m.role === 'user'
                        ? 'inline-block rounded-lg bg-[rgba(201,168,76,0.15)] px-2.5 py-1.5 text-[12px] text-[#e8c96a] whitespace-pre-wrap'
                        : 'inline-block text-[12.5px] leading-relaxed text-[#c4c0bb] whitespace-pre-wrap text-left'
                    }
                  >
                    {m.content}
                  </span>
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-1.5 text-[#8a8580]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[11px]">thinking…</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[rgba(201,168,76,0.2)] px-3 py-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask…"
                  className="flex-1 bg-transparent text-[12.5px] text-[#f3efe6] placeholder:text-[#5c5854] outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="text-[#e8c96a] disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
