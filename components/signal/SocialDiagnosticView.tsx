'use client';

import React, { useState } from 'react';
import { AlertTriangle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';

const PLATFORMS = [
  { id: 'x', name: 'X (Twitter)' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'threads', name: 'Threads' },
] as const;

const getUserIdentity = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem('jadai_user_session');
    if (!raw) return {};
    const s = JSON.parse(raw);
    const h: Record<string, string> = {};
    if (s?.email) h['x-user-email'] = s.email;
    if (s?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.id)) {
      h['x-builder-id'] = s.id;
    }
    return h;
  } catch {
    return {};
  }
};

interface DiagnosticResult {
  handle: string;
  platform: string;
  analysis: string;
  provider?: string;
  generatedAt: string;
  disclaimer: string;
}

export const SocialDiagnosticView: React.FC = () => {
  const [handleInput, setHandleInput] = useState('');
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]['id']>('x');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticResult | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const { showToast } = useToast();

  const runDiagnostic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanHandle = handleInput.trim().replace(/^@/, '');
    if (!cleanHandle) {
      showToast('Enter the handle you want audited.', 'error');
      return;
    }
    setLoading(true);
    setNeedsUpgrade(false);
    setReport(null);
    try {
      StudioAudio.playClick();
    } catch {}

    try {
      const res = await fetch('/api/signal/social-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getUserIdentity() },
        body: JSON.stringify({ handle: cleanHandle, platform }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 402) {
        setNeedsUpgrade(true);
        return;
      }
      if (!res.ok || !data?.success) {
        showToast(data?.error || 'Diagnostic failed.', 'error');
        return;
      }
      setReport(data as DiagnosticResult);
    } catch {
      showToast('Diagnostic engine unreachable — check your connection and retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sections = report?.analysis
    ? report.analysis
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[rgba(201,168,76,0.2)] pb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#C0392B]">Positioning Audit</span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">Social Diagnostic</h1>
        <p className="text-xs font-mono text-[#8a6e2a] mt-1">
          AI structural audit of a handle&apos;s positioning — honest analysis, never fabricated analytics.
        </p>
      </div>

      {/* Input */}
      <GlassCard className="p-5">
        <form onSubmit={runDiagnostic} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
              <input
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="@handle or profile name"
                maxLength={64}
                className="w-full bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.25)] rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-[#f5f3f0] placeholder:text-[#5c564c] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`px-3 py-2 rounded-lg text-[11px] font-mono uppercase tracking-wider border transition-colors ${
                    platform === p.id
                      ? 'bg-[rgba(201,168,76,0.18)] border-[#C9A84C] text-[#e8c96a]'
                      : 'bg-transparent border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#c4c0bb]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            <Sparkles className={`w-4 h-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Running structural audit…' : 'Run Diagnostic'}
          </Button>
        </form>
      </GlassCard>

      {/* Upgrade gate */}
      {needsUpgrade && (
        <GlassCard className="p-5 border-[rgba(192,57,43,0.4)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#C0392B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-[#f5f3f0] font-semibold">Signal Pro required</p>
              <p className="text-xs font-mono text-[#8a6e2a]">
                Diagnostics are part of the Signal Pro toolkit. Subscribe to unlock audits, radar, and the outbound agents.
              </p>
              <a
                href="/signal/pricing"
                className="inline-block mt-2 text-xs font-mono text-[#e8c96a] underline underline-offset-4 hover:text-[#f5f3f0]"
              >
                View Signal pricing →
              </a>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Result */}
      {report && (
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Audit · {report.handle} · {report.platform.toUpperCase()}
              </span>
              <p className="text-[10px] font-mono text-[#5c564c]">
                Generated {new Date(report.generatedAt).toLocaleString()}
                {report.provider ? ` · provider: ${report.provider}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(201,168,76,0.07)] border border-[rgba(201,168,76,0.2)]">
            <ShieldCheck className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
            <p className="text-[11px] font-mono text-[#c4c0bb]">{report.disclaimer}</p>
          </div>

          <div className="space-y-4">
            {sections.map((section, i) => {
              const lines = section.split('\n');
              const title = lines[0]?.replace(/[:#*]/g, '').trim();
              const body = lines.slice(1).join('\n').trim() || lines[0];
              return (
                <div key={i} className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">{title}</h3>
                  <p className="text-sm text-[#e6e2dc] leading-relaxed whitespace-pre-wrap">{body}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {!report && !needsUpgrade && (
        <p className="text-xs font-mono text-[#5c564c] text-center py-6">
          Enter a handle above. Results are AI-generated positioning guidance — Signal never fabricates
          follower counts or engagement metrics.
        </p>
      )}
    </div>
  );
};

export default SocialDiagnosticView;
