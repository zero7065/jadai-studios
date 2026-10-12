'use client';
import React, { useState } from 'react';
import { ArrowLeft, Send, Copy, ExternalLink, Check, Sparkles, MessageSquare, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';

export function SignalHUD({
  signal,
  draft: initialDraft,
  onBack,
}: {
  signal: any;
  draft?: any;
  onBack?: () => void;
}) {
  const [draft, setDraft] = useState<any>(initialDraft);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState(draft?.message || '');
  const { showToast } = useToast();

  const score = signal.intent_score ?? signal.intentScore ?? 0;
  const author = signal.author_handle || signal.author || 'builder';

  const handleGenerateOutreach = async () => {
    setDrafting(true);
    StudioAudio.playClick();
    try {
      const res = await fetch('/api/signal/drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId: signal.id }),
      });
      const data = await res.json();
      if (data.draft) {
        setDraft(data.draft);
        setMessageText(data.draft.message);
        StudioAudio.playSuccessArpeggio();
        showToast('Closer outreach message drafted', 'success');
      }
    } catch {
      const fallback = `[UNSENT TEMPLATE — the outreach agent is offline; review before sending]\n\nSaw your note on ${signal.platform} regarding the tooling friction. Encountered the same bottleneck recently — happy to share how we addressed it if helpful.`;
      setDraft({ message: fallback, approach: 'helpful' });
      setMessageText(fallback);
      showToast('Agent offline — inserted an editable template instead.', 'info');
    } finally {
      setDrafting(false);
    }
  };

  const handleCopy = () => {
    if (!messageText) return;
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    StudioAudio.playClick();
    showToast('Outreach copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-[#f5f3f0]">
      {/* Back button */}
      <button
        onClick={onBack || (() => window.history.back())}
        className="inline-flex items-center gap-2 text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Signal Radar</span>
      </button>

      {/* Signal Overview Header */}
      <div className="p-6 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(201,168,76,0.15)] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-[rgba(201,168,76,0.15)] text-[#C9A84C] font-bold border border-[rgba(201,168,76,0.3)]">
              {signal.platform}
            </span>
            <span className="text-sm font-mono text-[#c4c0bb]">
              @{author}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1 rounded-full border border-red-500/40 bg-red-500/10 text-red-300 font-bold">
              {score}% Intent
            </span>
            {signal.source_url || signal.sourceUrl ? (
              <a
                href={signal.source_url || signal.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[#C9A84C] hover:underline flex items-center gap-1"
              >
                <span>View Original Post</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-[#8a6e2a]">Detected Words</h3>
          <p className="text-base text-[#f5f3f0] leading-relaxed font-sans bg-[#050404] p-4 rounded-xl border border-[rgba(201,168,76,0.15)]">
            "{signal.content}"
          </p>
        </div>

        {signal.reason && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
            <div className="p-3 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.12)]">
              <span className="text-[#8a6e2a] block mb-1">Pain Detection Reason:</span>
              <span className="text-[#c4c0bb]">{signal.reason}</span>
            </div>
            {signal.suggested_angle || signal.suggestedAngle ? (
              <div className="p-3 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.12)]">
                <span className="text-[#C9A84C] block mb-1">Recommended Angle:</span>
                <span className="text-[#c4c0bb]">{signal.suggested_angle || signal.suggestedAngle}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Outreach HUD Box */}
      <div className="p-6 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C9A84C]" />
            <h3 className="font-display font-bold text-base text-[#f5f3f0]">
              Closer Outreach Composer
            </h3>
          </div>

          <button
            onClick={handleGenerateOutreach}
            disabled={drafting}
            className="px-4 py-1.5 rounded-full bg-[rgba(201,168,76,0.15)] hover:bg-[#C9A84C] hover:text-[#050404] text-[#C9A84C] font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{drafting ? 'Synthesizing...' : 'Regenerate Draft'}</span>
          </button>
        </div>

        <p className="text-xs font-mono text-[#8a6e2a]">
          Strict rules: &lt;300 chars, quotes specific post details, zero sales pitch, builder voice.
        </p>

        <textarea
          rows={4}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Closer message will generate here..."
          className="w-full p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C]"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs font-mono text-[#8a6e2a]">
            {messageText.length} / 300 characters
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              disabled={!messageText}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-[rgba(201,168,76,0.3)] hover:border-[#C9A84C] text-[#c4c0bb] hover:text-[#f5f3f0] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Message'}</span>
            </button>

            {signal.source_url || signal.sourceUrl ? (
              <a
                href={signal.source_url || signal.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>Open & Send</span>
                <Send className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
