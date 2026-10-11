import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio, generateTextWatermarkFooter } from '@/lib/watermark';
import { askPrime } from '@/lib/ai/memory';
import { Sparkles, Send, Copy, CheckCircle, Clock, BookOpen, Share2, Mail, Layers, Brain, RefreshCw } from 'lucide-react';

interface MemoryRow {
  builder_id: string;
  type: string;
  key: string;
  value: string;
  confidence: number;
  source_module: string | null;
  updated_at: string;
}

interface MessageRow {
  builder_id: string;
  scope: string;
  role: string;
  content: string;
  created_at: string;
}

export default function AdminPrimeStudioPage() {
  const [promptType, setPromptType] = useState<'bol' | 'social' | 'newsletter' | 'lore' | 'blog'>('bol');
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState<string | null>(null);
  const [watermarked, setWatermarked] = useState(true);
  const { showToast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Specify a subject or strategic premise', 'error');
      return;
    }

    setGenerating(true);
    StudioAudio.playClick();

    const systemPrompts = {
      bol: 'You are PRIME, the Chief Architect and Philosopher of Jadai Studios in Jos, Nigeria. Generate a serialized Book of Lies fiction episode exploring moral hazards, engineering discipline, and pride. Format with: Title, Sin Category, Act, Epigraph, and Full Narrative.',
      social: 'You are PRIME at Jadai Studios. Generate 3 punchy, high-signal posts for X (Twitter) and LinkedIn adhering to the sovereign engineering motto: "Build the floor." No marketing fluff. Strict technical authority.',
      newsletter: 'You are PRIME at Jadai Studios. Write a weekly architectural dispatch to engineers and founders. Focus on offline resilience, defensive schemas, and failure modes.',
      lore: 'You are PRIME at Jadai Studios. Generate deep architectural lore for an elite software template starter kit.',
      blog: 'You are PRIME at Jadai Studios. Write a comprehensive technical breakdown of multi-tier AI fallback pipelines and sub-second edge routing.',
    };

    try {
      const result = await askPrime({
        prompt: `Target subject: ${topic}\nGenerate a complete, non-truncated draft.`,
        systemPrompt: systemPrompts[promptType],
        moduleSlug: 'oracle',
        scope: 'admin-prime',
      });
      if (result.text && !result.error && result.provider !== 'graceful_fallback') {
        let text = result.text;
        if (watermarked) {
          text += '\n\n' + generateTextWatermarkFooter({ source: 'PRIME ADMIN STUDIO' });
        }
        setDraftResult(text);
        StudioAudio.playSuccessArpeggio();
        showToast('Strategic draft synthesized by PRIME.', 'success');
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (aiErr: any) {
      // Deterministic sovereign fallback — clearly labelled, never passed off as AI output
      const fallbackText = `> DETERMINISTIC TEMPLATE — PRIME was unreachable (${aiErr?.message || 'no provider'}). Standing studio scaffold, not a generated draft.

### THE MONOLITH OF JOS // COGNITIVE DRAFT
Subject: ${topic}
Type: ${promptType.toUpperCase()}
Timestamp: ${new Date().toISOString()}

1. The Foundation Invariant:
Software is not an abstract cloud apparition; it is an industrial machine operating under physical constraints. When telecommunications flicker and voltage sags, only defensive architectures maintain tenant continuity.

2. The Four Tenets:
- Never assume an external vendor will honor 99.99% uptime.
- Store state locally before committing to the network wire.
- RLS policies must be written with the assumption that every client is adversarial.
- Build the floor. Then build the next floor.

${watermarked ? generateTextWatermarkFooter({ source: 'PRIME FALLBACK CORE' }) : ''}`;

      setDraftResult(fallbackText);
      StudioAudio.playSuccessArpeggio();
      showToast('PRIME unreachable — showing the deterministic studio template.', 'info', 'Template Mode');
    } finally {
      setGenerating(false);
    }
  };

  const copyDraft = () => {
    if (!draftResult) return;
    navigator.clipboard.writeText(draftResult);
    showToast('Draft copied to clipboard.', 'success');
  };

  const publishToQueue = () => {
    showToast('Transmission queue is not wired yet — copy the draft and publish manually.', 'info', 'Queue Unavailable');
  };

  // Memory Matrix — what PRIME has learned across all surfaces
  const [memories, setMemories] = useState<MemoryRow[]>([]);
  const [memoryMessages, setMemoryMessages] = useState<MessageRow[]>([]);
  const [memoryNote, setMemoryNote] = useState<string | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(false);

  const loadMemoryMatrix = async () => {
    setMemoryLoading(true);
    try {
      const res = await fetch('/api/admin/ai-memory');
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories || []);
        setMemoryMessages(data.messages || []);
        setMemoryNote(
          data.memoryError
            ? `Memory tables unreachable — run the latest lib/supabase/schema.sql (${data.memoryError})`
            : null
        );
      } else {
        setMemoryNote(data.error || 'Memory matrix unavailable');
      }
    } catch {
      setMemoryNote('Memory matrix unreachable');
    } finally {
      setMemoryLoading(false);
    }
  };

  useEffect(() => {
    void loadMemoryMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Socratic Generation Engine</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">PRIME AI Admin Studio</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Synthesize Book of Lies transmissions, sovereign technical essays, and social transmissions with watermarking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Form */}
        <GlassCard className="lg:col-span-5 p-6 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1.5">Generation Directive</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bol', label: 'Book of Lies', icon: BookOpen },
                  { id: 'social', label: 'X & LinkedIn', icon: Share2 },
                  { id: 'newsletter', label: 'Newsletter', icon: Mail },
                  { id: 'lore', label: 'Template Lore', icon: Layers },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPromptType(item.id as any)}
                      className={`p-2.5 rounded border text-left flex items-center gap-2 transition-colors ${
                        promptType === item.id
                          ? 'bg-[rgba(201,168,76,0.15)] border-[#C9A84C] text-[#f5f3f0]'
                          : 'bg-[#050404] border-[rgba(201,168,76,0.15)] text-[#c4c0bb] hover:border-[#C9A84C]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#C9A84C]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">
                Strategic Subject / Premise
              </label>
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why software without offline fallback is a breach of fiduciary duty..."
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] placeholder-[#4a4744]"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="wm"
                checked={watermarked}
                onChange={(e) => setWatermarked(e.target.checked)}
                className="accent-[#C9A84C]"
              />
              <label htmlFor="wm" className="text-[#c4c0bb] cursor-pointer">
                Append Sovereign Cryptographic Watermark Footer
              </label>
            </div>

            <Button variant="primary" size="md" className="w-full" disabled={generating} type="submit">
              <Sparkles className={`w-3.5 h-3.5 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'PRIME Synthesizing...' : 'Synthesize Draft'}
            </Button>
          </form>
        </GlassCard>

        {/* Right Output Stage */}
        <GlassCard className="lg:col-span-7 p-6 space-y-4 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.2)] pb-3 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                PRIME Synthesized Output
              </span>
              {draftResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyDraft}
                    className="p-1 rounded text-[#8a6e2a] hover:text-[#C9A84C]"
                    title="Copy Draft"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <Button variant="outline" size="sm" onClick={publishToQueue}>
                    <Clock className="w-3 h-3 mr-1 text-[#C9A84C]" />
                    Queue 9:47 PM
                  </Button>
                </div>
              )}
            </div>

            {draftResult ? (
              <pre className="text-xs font-mono text-[#f5f3f0] whitespace-pre-wrap bg-[#050404] p-4 rounded border border-[rgba(201,168,76,0.2)] max-h-[460px] overflow-y-auto leading-relaxed">
                {draftResult}
              </pre>
            ) : (
              <div className="py-20 text-center space-y-3 font-mono text-xs text-[#8a6e2a]">
                <Sparkles className="w-8 h-8 mx-auto text-[#C9A84C] opacity-40 animate-pulse" />
                <p>PRIME awaits your directive. Select category and submit premise.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Memory Matrix — unified builder intelligence across every AI surface */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.2)] pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
              Memory Matrix — PRIME Builder Intelligence
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#8a6e2a]">
              {memories.length} facts · {memoryMessages.length} exchanges
            </span>
            <Button variant="outline" size="sm" onClick={loadMemoryMatrix} disabled={memoryLoading}>
              <RefreshCw className={`w-3 h-3 mr-1 ${memoryLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {memoryNote && (
          <p className="text-[11px] font-mono text-[#e8c96a] bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] rounded-lg px-3 py-2">
            {memoryNote}
          </p>
        )}

        {memories.length === 0 && !memoryNote ? (
          <p className="text-xs font-mono text-[#8a6e2a] py-6 text-center">
            No extracted facts yet. Extraction runs every 6th AI exchange across Oracle, Ultron, GUIDE, Writer, and the Playground tools.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
            {memories.map((m, i) => (
              <div
                key={`${m.builder_id}-${m.key}-${i}`}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.15)] text-[11px] font-mono"
              >
                <span className="px-1.5 py-0.5 rounded bg-[rgba(201,168,76,0.15)] text-[#C9A84C] uppercase text-[9px] shrink-0">
                  {m.type}
                </span>
                <div className="min-w-0">
                  <span className="text-[#f5f3f0] font-bold">{m.key}</span>
                  <span className="text-[#c4c0bb]"> — {m.value}</span>
                  <div className="text-[9px] text-[#8a6e2a] mt-0.5">
                    {m.builder_id.slice(0, 14)}… · {Math.round((m.confidence || 0) * 100)}%
                    {m.source_module ? ` · ${m.source_module}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {memoryMessages.length > 0 && (
          <div className="border-t border-[rgba(201,168,76,0.15)] pt-3 space-y-1.5 max-h-[220px] overflow-y-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
              Recent Transmissions
            </span>
            {memoryMessages.slice(-24).map((msg, i) => (
              <div key={i} className="flex gap-2 text-[10px] font-mono">
                <span className={msg.role === 'user' ? 'text-[#e8c96a]' : 'text-[#C9A84C]'}>
                  [{msg.scope}] {msg.role === 'user' ? 'BUILDER' : 'PRIME'}:
                </span>
                <span className="text-[#c4c0bb] truncate">{msg.content.slice(0, 160)}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
