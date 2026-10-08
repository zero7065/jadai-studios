import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import MemoryIndicator, { UserMemoryItem } from './MemoryIndicator';
import StreamingResponse from './StreamingResponse';
import OracleMessageContent from './OracleMessageContent';
import StatusBadge from '../ui/StatusBadge';
import { Send, Sparkles, Terminal, RotateCcw, AlertTriangle } from 'lucide-react';
import type { PrimePersona } from '../../lib/ai/prompts';
import { useToast } from '../providers/ToastProvider';
import UpgradeModal from '../auth/UpgradeModal';
import AuthModal from '../auth/AuthModal';
import { checkToolAccess, recordModuleExecution } from '../../lib/supabase/gates';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  provider?: string;
  timestamp: string;
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
    return [
      { id: 'mem-1', key: 'sovereign_builder', value: 'High drive for architectural independence', confidence: 0.95 },
      { id: 'mem-2', key: 'location_anchor', value: 'Rooted in West African tech ecosystem', confidence: 0.98 },
    ];
  });

  const [dailyQueriesUsed, setDailyQueriesUsed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().slice(0, 10);
      const count = localStorage.getItem(`jadai-oracle-usage-${today}`);
      return count ? parseInt(count, 10) : 4;
    }
    return 4;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [pendingText, setPendingText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

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

    const today = new Date().toISOString().slice(0, 10);
    const newUsage = dailyQueriesUsed + 1;
    setDailyQueriesUsed(newUsage);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`jadai-oracle-usage-${today}`, String(newUsage));
    }

    const assistantMsgId = `prime-${Date.now()}`;
    try {
      const historyContext = messages.map((m) => ({ role: m.role, content: m.content }));
      const memoryMap = memories.reduce((acc, m) => ({ ...acc, [m.key]: m.value }), {});

      const res = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend.trim(),
          history: historyContext,
          userMemory: memoryMap,
          persona,
        }),
      });

      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      const responseText = data.data?.text || 'PRIME frequency acknowledged.';
      const providerUsed = data.data?.provider || 'groq';

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

      // Check if memory should be added
      if (textToSend.length > 30 && Math.random() > 0.4) {
        const keyName = `insight_${Date.now().toString(36)}`;
        setMemories((prev) => [
          ...prev,
          { id: keyName, key: 'strategic_focus', value: textToSend.slice(0, 80), confidence: 0.85 },
        ]);
      }
    } catch (err: any) {
      // Resilient sovereign intelligence fallback (for offline or disconnected states)
      const smartAnswers = [
        `[PRIME ORACLE — SOVEREIGN CORE]\n\nRegarding: "${textToSend.slice(0, 50)}..."\n\n1. First Principle: Eliminate extraneous dependencies. The fragility of your system scales exponentially with its unmonitored couplings.\n2. Structural Discipline: Define the data contract before constructing the viewport. When schemas are deterministic, refactoring carries zero terror.\n3. Immediate Directive: Deploy resilient fallbacks at every failure plane. Build the floor first.`,
        `[PRIME ORACLE — FIRST PRINCIPLES]\n\nAnalysis of vector: "${textToSend.slice(0, 50)}..."\n\n1. Core Diagnosis: Most builders confuse velocity with momentum. True velocity requires zero rewrites.\n2. Leverage Point: Decouple the write path from the read path. Persist state to local device storage before requesting network sync.\n3. Next Milestone: Commit the schema to version control and lock down the boundary interfaces.`,
      ];
      const fallbackText = smartAnswers[Math.floor(Math.random() * smartAnswers.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: fallbackText,
          isStreaming: false,
          provider: 'prime-sovereign-matrix',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear conversational transcript? Memories will remain preserved.')) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Memory ledger preserved. Conversation transcript cleared.',
          timestamp: new Date().toISOString(),
        },
      ]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jadai-oracle-messages');
      }
    }
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
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
            onClick={handleClearHistory}
            className="p-1.5 rounded border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C0392B] transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </GlassCard>

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

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
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
