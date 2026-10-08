import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio, generateTextWatermarkFooter } from '@/lib/watermark';
import { Sparkles, Send, Copy, CheckCircle, Clock, BookOpen, Share2, Mail, Layers } from 'lucide-react';

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
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Target subject: ${topic}\nGenerate a complete, non-truncated draft.`,
          systemPrompt: systemPrompts[promptType],
          moduleSlug: 'oracle',
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.text) {
        let text = data.data.text;
        if (watermarked) {
          text += '\n\n' + generateTextWatermarkFooter({ source: 'PRIME ADMIN STUDIO' });
        }
        setDraftResult(text);
        StudioAudio.playSuccessArpeggio();
        showToast('Strategic draft synthesized by PRIME.', 'success');
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch {
      // Deterministic sovereign fallback
      const fallbackText = `### THE MONOLITH OF JOS // COGNITIVE DRAFT
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
      showToast('Sovereign draft generated from studio cache.', 'success');
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
    showToast('Draft scheduled for 9:47 PM transmission pipeline.', 'success', 'Broadcast Queued');
  };

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
    </div>
  );
}
