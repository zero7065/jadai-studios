'use client';

import React, { useEffect, useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio, generateTextWatermarkFooter } from '@/lib/watermark';
import AnalyticsD3Dashboard from '@/components/admin/AnalyticsD3Dashboard';
import {
  Download,
  FileSpreadsheet,
} from 'lucide-react';

function formatUptime(sec: number): string {
  if (!Number.isFinite(sec)) return '—';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec % 60}s`;
  return `${sec}s`;
}

export default function AdminAnalyticsPage() {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((res) => {
        if (res?.success) {
          setStats(res);
          setLoadError(null);
        } else {
          setLoadError(res?.error || 'Analytics endpoint returned no data.');
        }
      })
      .catch(() => setLoadError('Server unreachable — analytics unavailable.'));
  }, []);

  const tel = stats?.telemetry;
  const signal = stats?.signal;

  const paystackLabel = !stats
    ? '—'
    : stats.paystack?.configured
      ? Array.isArray(stats.paystack.balance)
        ? stats.paystack.balance
            .map((b: any) => `${b.currency} ${(Number(b.balance) / 100).toFixed(2)}`)
            .join(' · ')
        : `Configured — ${stats.paystack.error || 'balance unavailable'}`
      : 'Not configured';

  // 1. Export CSV — built only from measured values.
  const handleExportCSV = () => {
    if (!stats) {
      showToast('Analytics not loaded yet — nothing to export.', 'error');
      return;
    }
    StudioAudio.playClick();
    const rows: string[][] = [['section', 'key', 'value']];
    rows.push(['telemetry', 'requests_since_boot', String(tel.requests)]);
    rows.push(['telemetry', 'errors_5xx', String(tel.errors5xx)]);
    rows.push(['telemetry', 'uptime_sec', String(tel.uptimeSec)]);
    rows.push(['telemetry', 'rss_mb', String(tel.rssMb)]);
    rows.push(['runtime', 'node', String(stats.runtime.node)]);
    rows.push(['runtime', 'env', String(stats.runtime.env)]);
    rows.push(['db', 'status', String(stats.db.status)]);
    rows.push(['paystack', 'configured', String(stats.paystack.configured)]);
    if (stats.paystack.error) rows.push(['paystack', 'error', String(stats.paystack.error)]);
    rows.push(['ai', 'openai', String(stats.ai.openai)]);
    rows.push(['ai', 'groq', String(stats.ai.groq)]);
    rows.push(['ai', 'gemini', String(stats.ai.gemini)]);
    if (signal) {
      rows.push(['signal', 'total_signals', String(signal.totalSignals)]);
      rows.push(['signal', 'messages_sent', String(signal.messagesSent)]);
      rows.push(['signal', 'replies', String(signal.replies)]);
      rows.push(['signal', 'conversions', String(signal.conversions)]);
    }
    (tel.topPaths || []).forEach((p: any) => rows.push(['top_route', p.path, String(p.count)]));

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => (cell.includes(',') ? `"${cell}"` : cell)).join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `jadai_real_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    StudioAudio.playSuccessArpeggio();
    showToast(`Exported ${rows.length - 1} measured rows.`, 'success');
  };

  // 2. Export text report — real numbers only, labelled as such.
  const handleExportReport = () => {
    if (!stats) {
      showToast('Analytics not loaded yet — nothing to export.', 'error');
      return;
    }
    setDownloading(true);
    StudioAudio.playClick();

    const report = `================================================================================
JADAI STUDIOS — REAL METRICS REPORT (measured, not estimated)
Generated: ${new Date().toISOString()}
================================================================================

1. SERVER TELEMETRY (this process, since boot)
- Requests handled: ${tel.requests}
- 5xx errors: ${tel.errors5xx}
- Uptime: ${formatUptime(tel.uptimeSec)} (${tel.uptimeSec}s)
- Memory RSS: ${tel.rssMb} MB
- Runtime: ${stats.runtime.node} (${stats.runtime.env})

2. INFRASTRUCTURE STATUS
- Database: ${stats.db.status}
- Paystack: ${stats.paystack.configured ? `configured${Array.isArray(stats.paystack.balance) ? ` — balance ${stats.paystack.balance.map((b: any) => `${b.currency} ${(Number(b.balance) / 100).toFixed(2)}`).join(', ')}` : ` — ${stats.paystack.error || 'balance unavailable'}`}` : 'not configured'}
- AI providers — openai: ${stats.ai.openai ? 'configured' : 'not configured'}, groq: ${stats.ai.groq ? 'configured' : 'not configured'}, gemini: ${stats.ai.gemini ? 'configured' : 'not configured'}

3. SIGNAL WORKSPACE FUNNEL (real store data)
- Total signals: ${signal?.totalSignals ?? 0}
- Outreach sent: ${signal?.messagesSent ?? 0}
- Replies: ${signal?.replies ?? 0}
- Conversions: ${signal?.conversions ?? 0}

4. TOP ROUTES SINCE BOOT
${(tel.topPaths || []).slice(0, 12).map((p: any) => `- ${p.path}: ${p.count} hits`).join('\n') || '- none yet'}

NOTE: No visitors/revenue/user-count analytics backend is connected yet, so
those figures are deliberately omitted rather than estimated.

${generateTextWatermarkFooter({ source: 'JADAI REAL METRICS EXPORT' })}`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jadai-real-metrics-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloading(false);
    StudioAudio.playSuccessArpeggio();
    showToast('Real metrics report exported.', 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
            Platform Performance
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">
            Analytics & Audit Ledger
          </h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Measured server telemetry, infrastructure status, and Signal funnel data — no estimated figures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
            <span>Export CSV Ledger</span>
          </Button>

          <EdgeGlow intensity="intense" color="gold" borderRadius="6px">
            <Button variant="primary" size="sm" onClick={handleExportReport} disabled={downloading}>
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>{downloading ? 'Compiling Report...' : 'Export Watermarked Report'}</span>
            </Button>
          </EdgeGlow>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-xs font-mono text-red-300">
          {loadError}
        </div>
      )}

      {/* 4 Stat Cards — real values only */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Requests (Since Boot)</span>
          <div className="text-2xl font-mono font-bold text-[#f5f3f0]">
            {tel ? tel.requests.toLocaleString() : '—'}
          </div>
          <span
            className={`text-[10px] font-mono flex items-center gap-0.5 ${
              tel && tel.errors5xx > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {tel
              ? tel.errors5xx > 0
                ? `${tel.errors5xx} 5xx errors`
                : 'Zero 5xx errors'
              : 'Awaiting telemetry'}
          </span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Paystack Balance</span>
          <div className="text-2xl font-mono font-bold text-[#e8c96a]">
            {stats ? (stats.paystack?.configured ? 'Live' : 'Off') : '—'}
          </div>
          <span className="text-[10px] font-mono text-[#8a6e2a] break-all">{paystackLabel}</span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Signal Conversions</span>
          <div className="text-2xl font-mono font-bold text-[#f5f3f0]">
            {signal ? signal.conversions : '—'}
          </div>
          <span className="text-[10px] font-mono text-[#8a6e2a]">
            {signal
              ? `${signal.messagesSent} sent · ${signal.replies} replies · ${signal.totalSignals} signals`
              : 'Workspace funnel unavailable'}
          </span>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Uptime & Runtime</span>
          <div className="text-2xl font-mono font-bold text-[#f5f3f0]">
            {tel ? formatUptime(tel.uptimeSec) : '—'}
          </div>
          <span className="text-[10px] font-mono text-[#8a6e2a]">
            {stats ? `${stats.runtime.node} · db: ${stats.db.status}` : 'Awaiting telemetry'}
          </span>
        </GlassCard>
      </div>

      {/* D3-based Interactive Dashboard (real server counters) */}
      <AnalyticsD3Dashboard />

      {/* Usage Distribution & Acquisition Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Routes */}
        <GlassCard className="lg:col-span-7 p-6 space-y-4">
          <h3 className="font-display font-bold text-sm text-[#f5f3f0]">Top Routes Since Boot</h3>
          <div className="space-y-3 font-mono text-xs">
            {!stats && <p className="text-[#8a6e2a]">{loadError || 'Loading measured route counters…'}</p>}
            {stats && (tel.topPaths || []).length === 0 && (
              <p className="text-[#8a6e2a]">No requests counted yet since boot.</p>
            )}
            {(tel?.topPaths || []).slice(0, 6).map((item: any) => {
              const maxCount = tel.topPaths[0]?.count || 1;
              return (
                <div key={item.path} className="space-y-1">
                  <div className="flex justify-between text-[#c4c0bb]">
                    <span className="truncate pr-2">{item.path}</span>
                    <span className="text-[#8a6e2a] shrink-0">{item.count} hits</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#050404] overflow-hidden border border-[rgba(201,168,76,0.2)]">
                    <div
                      className="h-full bg-gradient-to-r from-[#8a6e2a] to-[#C9A84C] rounded-full"
                      style={{ width: `${Math.max(4, Math.round((item.count / maxCount) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Infrastructure & Verification */}
        <GlassCard className="lg:col-span-5 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm text-[#f5f3f0]">Infrastructure Status</h3>
            <p className="text-xs text-[#c4c0bb]">
              Live checks from the server process — each value is queried at load time.
            </p>

            <div className="space-y-2 pt-2 font-mono text-xs">
              <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex justify-between">
                <span className="text-[#8a6e2a]">Database:</span>
                <span className={stats?.db?.status === 'connected' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {stats ? stats.db.status : '—'}
                </span>
              </div>
              <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex justify-between">
                <span className="text-[#8a6e2a]">Paystack:</span>
                <span className={stats?.paystack?.configured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {stats ? (stats.paystack.configured ? 'configured' : 'not configured') : '—'}
                </span>
              </div>
              <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex justify-between">
                <span className="text-[#8a6e2a]">AI providers:</span>
                <span className="text-[#f5f3f0]">
                  {stats
                    ? `openai ${stats.ai.openai ? '✓' : '✗'} · groq ${stats.ai.groq ? '✓' : '✗'} · gemini ${stats.ai.gemini ? '✓' : '✗'}`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)] text-center text-xs font-mono text-[#C9A84C]">
            No user/revenue analytics backend connected — those metrics are omitted, not estimated.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
