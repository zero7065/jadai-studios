import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import MemoryIndicator, { UserMemoryItem } from './MemoryIndicator';
import StreamingResponse from './StreamingResponse';
import OracleMessageContent from './OracleMessageContent';
import StatusBadge from '../ui/StatusBadge';
import { Send, Terminal, RotateCcw, Paperclip, Smile, ImageIcon, FileCode, Plus, FolderOpen } from 'lucide-react';
import type { PrimePersona } from '../../lib/ai/prompts';
import { useToast } from '../providers/ToastProvider';
import UpgradeModal from '../auth/UpgradeModal';
import AuthModal from '../auth/AuthModal';
import { checkToolAccess, recordModuleExecution, getActiveUser } from '../../lib/supabase/gates';
import { askPrime, fetchServerMemory, getBuilderId } from '../../lib/ai/memory';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  provider?: string;
  timestamp: string;
  artifact?: { id: string; title: string; type: string; previewUrl: string; downloadUrl: string };
  attachment?: { name: string; parsed: boolean; note?: string };
  image?: string;
  gif?: string;
}

export interface PrimeChatProps {
  initialPersona?: PrimePersona;
  initialMemories?: UserMemoryItem[];
  onOpenProfiling?: () => void;
}

const QUICK_PROMPTS = [
  "What is the single highest-leverage decision I should make today?",
  "Stress-test my current growth strategy for blind spots.",
  "How do I structure my team when resources are scarce?",
  "Refactor this architectural dilemma down to first principles.",
];

const EMOJIS = ['😀','😂','🥲','😍','🤩','😎','🤔','🤯','😱','🙌','👏','🔥','✨','⚡','💯','🚀','🛠','📈','📉','🧠','🤝','🙏','💪','🎯','🧩','💾','🔒','🗝','🌌','⭐'];

function welcomeMsg(persona: string): ChatMessage {
  return {
    id: 'msg-welcome',
    role: 'assistant',
    content: `I am PRIME. I observe your architectures, remember your decisions, and speak truth over comfort.\n\nMode: ${persona.toUpperCase()}. State your current challenge or vector of inquiry.`,
    isStreaming: false,
    provider: 'prime-core',
    timestamp: new Date().toISOString(),
  };
}

export const PrimeChat: React.FC<PrimeChatProps> = ({
  initialPersona = 'The Architect',
  initialMemories = [],
  onOpenProfiling,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadai-oracle-messages');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `I am PRIME. I observe your architectures, remember your decisions, and speak truth over comfort.\n\nMode: ${initialPersona.toUpperCase()}. State your current challenge or vector of inquiry.`,
        isStreaming: false,
        provider: 'prime-core',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState<PrimePersona>(initialPersona);
  const [memories, setMemories] = useState<UserMemoryItem[]>(() => {
    if (initialMemories.length > 0) return initialMemories;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadai-user-memories');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    // No fabricated default memories — start empty; real facts hydrate from server/localStorage.
    return [];
  });

  const [dailyQueriesUsed, setDailyQueriesUsed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().slice(0, 10);
      const count = localStorage.getItem(`jadai-oracle-usage-${today}`);
      return count ? parseInt(count, 10) : 0;
    }
    return 0;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [pendingText, setPendingText] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; updatedAt: string; messageCount: number }>>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [gifQuery, setGifQuery] = useState('');
  const [gifResults, setGifResults] = useState<Array<{ url: string; title: string }>>([]);
  const [gifLoading, setGifLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Tracks the user/assistant text of the exchange currently in flight so we can
  // persist it to the server session once a reply (or fallback) is produced.
  const pendingExchangeRef = useRef<{ user: string; assistant?: string; provider?: string } | null>(null);

  const refreshSessions = useCallback(async () => {
    try {
      const bid = getBuilderId();
      const res = await fetch(`/api/chat/sessions?builderId=${encodeURIComponent(bid)}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.sessions)) {
        setSessions(
          data.sessions.map((s: any) => ({
            id: s.id,
            title: s.title,
            updatedAt: s.updatedAt,
            messageCount: s.messages?.length ?? 0,
          }))
        );
      }
    } catch {}
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  // Close the emoji/gif picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const onClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [pickerOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jadai-oracle-messages', JSON.stringify(messages.slice(-20)));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jadai-user-memories', JSON.stringify(memories));
    }
  }, [memories]);

  // Hydrate the memory panel from the unified server-side memory layer
  useEffect(() => {
    let cancelled = false;
    void fetchServerMemory().then(({ facts }) => {
      if (cancelled || facts.length === 0) return;
      setMemories((prev) => {
        const seen = new Set(prev.map((m) => m.key));
        const merged = [...prev];
        for (const f of facts) {
          if (!seen.has(f.key)) {
            merged.push({ id: `srv-${f.key}`, key: f.key, value: f.value, confidence: f.confidence });
          }
        }
        return merged.slice(-14);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    // Subscription & Auth Gate Check
    const access = await checkToolAccess('oracle');
    if (!access.allowed) {
      setPendingText(textToSend);
      if (access.reason === 'unauthenticated') {
        setAuthModalOpen(true);
      } else {
        setUpgradeModalOpen(true);
      }
      return;
    }

    if (dailyQueriesUsed >= 50) {
      showToast("You've reached today's 50-message quota. PRIME will be here tomorrow at 00:00.", 'error', 'Quota Exceeded');
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    pendingExchangeRef.current = { user: textToSend.trim() };

    const today = new Date().toISOString().slice(0, 10);
    const newUsage = dailyQueriesUsed + 1;
    setDailyQueriesUsed(newUsage);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`jadai-oracle-usage-${today}`, String(newUsage));
    }

    const assistantMsgId = `prime-${Date.now()}`;
    try {
      const historyContext = messages.map((m) => ({ role: m.role, content: m.content }));

      // Unified transport — persona-aware, continuity protocol, persistent transcripts
      const result = await askPrime({
        prompt: textToSend.trim(),
        history: historyContext,
        memory: memories.map((m) => ({ key: m.key, value: m.value })),
        persona,
        scope: 'oracle',
        moduleSlug: 'oracle',
      });
      if (!result.text || result.error) {
        throw new Error(result.error || 'No response from PRIME');
      }

      const responseText = result.text;
      const providerUsed = result.provider || 'groq';

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: responseText,
        isStreaming: true,
        provider: providerUsed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      await recordModuleExecution('oracle', access.userEmail, access.userId);
      if (pendingExchangeRef.current) {
        pendingExchangeRef.current.assistant = responseText;
        pendingExchangeRef.current.provider = providerUsed;
        void persistExchange(sessionId, pendingExchangeRef.current.user, responseText, providerUsed);
        pendingExchangeRef.current = null;
      }

      // Check if memory should be added — deterministic upsert, not coin-flip
      if (textToSend.length > 30) {
        setMemories((prev) => {
          const filtered = prev.filter((m) => m.key !== 'strategic_focus');
          return [
            ...filtered,
            { id: `insight_${Date.now().toString(36)}`, key: 'strategic_focus', value: textToSend.slice(0, 80), confidence: 0.85 },
          ].slice(-14);
        });
      }
    } catch (err: any) {
      // Resilient sovereign intelligence fallback (for offline or disconnected states)
      const smartAnswers = [
        `[PRIME ORACLE — SOVEREIGN CORE]\n\nRegarding: "${textToSend.slice(0, 50)}..."\n\n1. First Principle: Eliminate extraneous dependencies. The fragility of your system scales exponentially with its unmonitored couplings.\n2. Structural Discipline: Define the data contract before constructing the viewport. When schemas are deterministic, refactoring carries zero terror.\n3. Immediate Directive: Deploy resilient fallbacks at every failure plane. Build the floor first.`,
        `[PRIME ORACLE — FIRST PRINCIPLES]\n\nAnalysis of vector: "${textToSend.slice(0, 50)}..."\n\n1. Core Diagnosis: Most builders confuse velocity with momentum. True velocity requires zero rewrites.\n2. Leverage Point: Decouple the write path from the read path. Persist state to local device storage before requesting network sync.\n3. Next Milestone: Commit the schema to version control and lock down the boundary interfaces.`,
      ];
      const fallbackText = smartAnswers[Math.floor(Math.random() * smartAnswers.length)];
      showToast(
        'PRIME is unreachable right now — the reply below is a canned offline study, not a live model answer. Retry when the signal returns.',
        'error',
        'Offline Mode'
      );
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: `[OFFLINE STUDY - not a live PRIME answer]\n\n${fallbackText}`,
          isStreaming: false,
          provider: 'offline-fallback',
          timestamp: new Date().toISOString(),
        },
      ]);
      if (pendingExchangeRef.current) {
        pendingExchangeRef.current.assistant = `[OFFLINE STUDY - not a live PRIME answer]\n\n${fallbackText}`;
        void persistExchange(sessionId, pendingExchangeRef.current.user, pendingExchangeRef.current.assistant, 'offline-fallback');
        pendingExchangeRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear conversational transcript? Memories will remain preserved.')) {
      setMessages([welcomeMsg(initialPersona)]);
      setSessionId(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jadai-oracle-messages');
      }
      void refreshSessions();
    }
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  // Persist a finished exchange (user + assistant) to the server session.
  const persistExchange = useCallback(
    async (sid: string | null, userContent: string, assistantContent: string, provider?: string) => {
      const bid = getBuilderId();
      let currentSid = sid;
      try {
        if (!currentSid) {
          const created = await fetch('/api/chat/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ builderId: bid, title: userContent.slice(0, 60) }),
          });
          const data = await created.json();
          if (data?.success && data.session?.id) {
            currentSid = data.session.id;
            setSessionId(currentSid);
          }
        }
        if (!currentSid) return;
        await fetch(`/api/chat/sessions/${currentSid}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            builderId: bid,
            messages: [
              { role: 'user', content: userContent.slice(0, 32000), createdAt: new Date().toISOString() },
              {
                role: 'assistant',
                content: assistantContent.slice(0, 32000),
                provider,
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        });
        void refreshSessions();
      } catch {}
    },
    [refreshSessions]
  );

  const loadSession = useCallback(
    async (sid: string) => {
      try {
        const bid = getBuilderId();
        const res = await fetch(`/api/chat/sessions/${sid}?builderId=${encodeURIComponent(bid)}`);
        const data = await res.json();
        if (data?.success && data.session) {
          const loaded: ChatMessage[] = (data.session.messages || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            provider: m.provider,
            timestamp: m.createdAt,
            isStreaming: false,
          }));
          setMessages(loaded.length ? loaded : [welcomeMsg(initialPersona)]);
          setSessionId(sid);
          setHistoryOpen(false);
        }
      } catch {
        showToast('Could not load that session.', 'error', 'Session');
      }
    },
    [initialPersona, showToast]
  );

  const startNewSession = useCallback(() => {
    setMessages([welcomeMsg(initialPersona)]);
    setSessionId(null);
    setHistoryOpen(false);
  }, [initialPersona]);

  // File upload -> server parses + indexes into the builder's RAG knowledge base.
  const handleFileUpload = async (file: File) => {
    const bid = getBuilderId();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('builderId', bid);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }
      const attachMsg: ChatMessage = {
        id: `att-${Date.now()}`,
        role: 'user',
        content: `📎 Uploaded "${data.title}" (${(data.bytes / 1024).toFixed(0)} KB)`,
        timestamp: new Date().toISOString(),
        attachment: { name: data.title, parsed: data.parsed, note: data.note },
      };
      setMessages((prev) => [...prev, attachMsg]);
      showToast(data.note, data.parsed ? 'success' : 'info', 'Upload Indexed');
      void persistExchange(sessionId, attachMsg.content, data.note, 'uploads');
    } catch (err: any) {
      showToast(err?.message || 'Upload failed.', 'error', 'Upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Artifact generation via /api/artifacts/generate -> attach a live preview card.
  const handleGenerateArtifact = async () => {
    const prompt = input.trim();
    if (prompt.length < 8) {
      showToast('Describe the artifact in at least 8 characters first.', 'info', 'Artifacts');
      return;
    }
    const access = await checkToolAccess('oracle');
    if (!access.allowed) {
      setPendingText(prompt);
      access.reason === 'unauthenticated' ? setAuthModalOpen(true) : setUpgradeModalOpen(true);
      return;
    }
    setGenerating(true);
    const bid = getBuilderId();
    try {
      const res = await fetch('/api/artifacts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ builderId: bid, prompt, type: 'website' }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || `Artifact generation failed (${res.status})`);
      const artMsg: ChatMessage = {
        id: `art-${Date.now()}`,
        role: 'assistant',
        content: `Generated artifact "${data.artifact.title}" via ${data.provider || 'AI'}.`,
        provider: data.provider || 'artifact',
        timestamp: new Date().toISOString(),
        artifact: {
          id: data.artifact.id,
          title: data.artifact.title,
          type: data.artifact.type,
          previewUrl: data.previewUrl,
          downloadUrl: data.downloadUrl,
        },
      };
      setMessages((prev) => [...prev, artMsg]);
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'user', content: `🛠 Generate artifact: ${prompt}`, timestamp: new Date().toISOString() },
      ]);
      setInput('');
      showToast(`"${data.artifact.title}" ready — live preview attached.`, 'success', 'Artifact');
      void persistExchange(sessionId, `🛠 Generate artifact: ${prompt}`, artMsg.content, data.provider);
    } catch (err: any) {
      showToast(err?.message || 'Artifact generation failed.', 'error', 'Artifacts');
    } finally {
      setGenerating(false);
    }
  };

  const searchGifs = async () => {
    const q = gifQuery.trim();
    if (!q) return;
    setGifLoading(true);
    try {
      const key = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';
      if (!key) {
        showToast(
          'GIF search needs a GIPHY API key. Set NEXT_PUBLIC_GIPHY_API_KEY in .env (get one free at developers.giphy.com). Emojis still work.',
          'error',
          'GIFs unavailable'
        );
        return;
      }
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(q)}&limit=12&rating=g&lang=en`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data?.meta && data.meta.status !== 200)) {
        const msg = data?.meta?.msg || `HTTP ${res.status}`;
        showToast(`GIF provider rejected the request (${msg}). Add or renew NEXT_PUBLIC_GIPHY_API_KEY.`, 'error', 'GIFs unavailable');
        return;
      }
      const items: Array<{ url: string; title: string }> = (data?.data || [])
        .map((g: any) => ({ url: g?.images?.fixed_width?.url, title: g?.title || q }))
        .filter((g: any) => !!g.url);
      setGifResults(items);
      if (!items.length) showToast('No GIFs found for that query.', 'info', 'GIFs');
    } catch {
      showToast('GIF search unavailable right now.', 'error', 'GIFs');
    } finally {
      setGifLoading(false);
    }
  };

  const insertGif = (url: string) => {
    const gifMsg: ChatMessage = {
      id: `gif-${Date.now()}`,
      role: 'user',
      content: '',
      timestamp: new Date().toISOString(),
      gif: url,
    };
    setMessages((prev) => [...prev, gifMsg]);
    setPickerOpen(false);
    setGifQuery('');
    setGifResults([]);
    void persistExchange(sessionId, '🎞 Sent a GIF', '📎 GIF shared', 'gif');
  };

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setPickerOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">
      {/* Top Header Card */}
      <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-[rgba(201,168,76,0.25)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#C9A84C] flex items-center justify-center text-[#C9A84C] font-mono text-sm">
            ◈
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-[#f5f3f0]">PRIME ORACLE</span>
              <StatusBadge status={persona} variant="gold" />
            </div>
            <span className="text-[11px] font-mono text-[#8a6e2a]">
              Quota: {dailyQueriesUsed}/50 today • 4-step AI fallback matrix active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MemoryIndicator
            memories={memories}
            onDeleteMemory={handleDeleteMemory}
          />

          {onOpenProfiling && (
            <button
              onClick={onOpenProfiling}
              className="p-1.5 rounded border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer text-xs font-mono"
              title="Re-run profiling questions"
            >
              Re-Profile
            </button>
          )}

          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${historyOpen ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C]'}`}
            title="Chat history"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={startNewSession}
            className="p-1.5 rounded border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer"
            title="New session"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C0392B] transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </GlassCard>

      {/* Session History Panel */}
      {historyOpen && (
        <GlassCard className="p-4 border-[rgba(201,168,76,0.25)]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-[#e8c96a]">SAVED SESSIONS ({sessions.length})</span>
            <button onClick={() => setHistoryOpen(false)} className="text-[#8a6e2a] hover:text-[#C9A84C] text-xs font-mono cursor-pointer">close</button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-[11px] font-mono text-[#8a6e2a]">No saved sessions yet. Start a conversation and it will be persisted here.</p>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded border text-[11px] font-mono cursor-pointer transition-colors ${
                    s.id === sessionId
                      ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.08)] text-[#f5f3f0]'
                      : 'border-[rgba(201,168,76,0.12)] text-[#c4c0bb] hover:border-[#C9A84C]'
                  }`}
                  onClick={() => loadSession(s.id)}
                >
                  <span className="truncate flex-1">{s.title || 'Untitled session'}</span>
                  <span className="text-[10px] text-[#8a6e2a] shrink-0">
                    {s.messageCount} msg • {new Date(s.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Terminal Chat Box */}
      <GlassCard className="p-4 sm:p-6 h-[560px] flex flex-col justify-between border-[rgba(201,168,76,0.25)] bg-[#050404]/90 relative overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-mono">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-[#8a6e2a] uppercase tracking-wider mb-1 px-1">
                  {isUser ? 'YOU' : `PRIME • ${m.provider || 'inference'}`}
                </div>

                <div
                  className={`max-w-[85%] rounded-[4px] p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.35)] text-[#f5f3f0]'
                      : 'bg-[#0a0908] border border-[rgba(74,71,68,0.3)] text-[#c4c0bb]'
                  }`}
                >
                  {!isUser && m.isStreaming ? (
                    <StreamingResponse
                      text={m.content}
                      isStreaming={true}
                      speedMs={20}
                      onFinish={() => {
                        m.isStreaming = false;
                      }}
                    />
                  ) : (
                    <OracleMessageContent content={m.content} />
                  )}

                  {m.attachment && (
                    <div className="mt-2 text-[11px] font-mono text-[#8a6e2a] border border-[rgba(201,168,76,0.2)] rounded px-2 py-1.5">
                      📎 {m.attachment.name}
                      <span className="block text-[10px] text-[#6b5520]">{m.attachment.note}</span>
                    </div>
                  )}

                  {m.image && (
                    <img src={m.image} alt="Generated" className="mt-2 max-w-[280px] rounded border border-[rgba(201,168,76,0.25)]" />
                  )}

                  {m.gif && <img src={m.gif} alt="GIF" className="mt-2 max-w-[220px] rounded border border-[rgba(201,168,76,0.25)]" />}

                  {m.artifact && (
                    <div className="mt-2 w-[320px] max-w-full rounded border border-[rgba(201,168,76,0.3)] bg-[#0a0908] overflow-hidden">
                      <iframe
                        src={m.artifact.previewUrl}
                        title={m.artifact.title}
                        sandbox="allow-scripts allow-modals allow-forms allow-popups"
                        className="w-full h-44 border-0 bg-white"
                      />
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-t border-[rgba(201,168,76,0.2)]">
                        <span className="truncate text-[11px] font-mono text-[#e8c96a]">{m.artifact.title}</span>
                        <a
                          href={m.artifact.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-[#C9A84C] hover:underline shrink-0"
                        >
                          open ↗
                        </a>
                        <a
                          href={m.artifact.downloadUrl}
                          className="text-[10px] font-mono text-[#8a6e2a] hover:text-[#C9A84C] shrink-0"
                        >
                          ↓ save
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#e8c96a] p-2">
              <span className="inline-block w-3 h-3 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
              <span>PRIME is synthesizing neural vectors...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar (when empty or on demand) */}
        <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] flex flex-wrap gap-1.5 mb-3">
          {QUICK_PROMPTS.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.15)] text-[#8a6e2a] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Emoji / GIF Picker */}
        {pickerOpen && (
          <div ref={pickerRef} className="mb-3 rounded border border-[rgba(201,168,76,0.25)] bg-[#0a0908] p-2.5">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setPickerOpen(false)}
                className="text-[10px] font-mono px-2 py-1 rounded border border-[rgba(201,168,76,0.2)] text-[#C9A84C] cursor-pointer"
              >
                EMOJI
              </button>
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  value={gifQuery}
                  onChange={(e) => setGifQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchGifs();
                    }
                  }}
                  placeholder="Search GIFs..."
                  className="flex-1 px-2 py-1 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#f5f3f0] font-mono text-[11px] focus:outline-none focus:border-[#C9A84C]"
                />
                <button
                  onClick={searchGifs}
                  disabled={gifLoading || !gifQuery.trim()}
                  className="text-[10px] font-mono px-2 py-1 rounded border border-[rgba(201,168,76,0.2)] text-[#C9A84C] disabled:opacity-40 cursor-pointer"
                >
                  {gifLoading ? '...' : 'GIF'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-1 max-h-20 overflow-y-auto">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => insertEmoji(em)}
                  className="text-lg hover:bg-[rgba(201,168,76,0.15)] rounded cursor-pointer leading-none"
                >
                  {em}
                </button>
              ))}
            </div>

            {gifResults.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 mt-2 max-h-40 overflow-y-auto">
                {gifResults.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => insertGif(g.url)}
                    className="rounded overflow-hidden border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] cursor-pointer"
                  >
                    <img src={g.url} alt={g.title} className="w-full h-16 object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".txt,.md,.pdf,.docx,.zip,.csv,.json,.log,.html,.png,.jpg,.jpeg,.gif,.webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            className="p-2 rounded border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer disabled:opacity-40"
            title="Upload a file (indexed into your knowledge base)"
          >
            {uploading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            disabled={loading}
            className={`p-2 rounded border transition-colors cursor-pointer disabled:opacity-40 ${pickerOpen ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C]'}`}
            title="Emoji & GIFs"
          >
            <Smile className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inquire with PRIME Oracle..."
              disabled={loading}
              className="w-full pl-9 pr-4 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-mono text-xs focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateArtifact}
            disabled={loading || generating || input.trim().length < 8}
            className="p-2 rounded border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer disabled:opacity-40"
            title="Generate a live-preview artifact from this prompt"
          >
            {generating ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileCode className="w-4 h-4" />
            )}
          </button>

          <Button type="submit" size="md" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </GlassCard>

      {/* Subscription Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        sourceTool="PRIME Oracle"
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (pendingText) {
            handleSend(pendingText);
          }
        }}
      />
    </div>
  );
};

export default PrimeChat;
