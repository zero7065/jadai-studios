import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import CodeBlock from '../../components/ui/CodeBlock';
import { Activity, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import type { ScanResult } from '../../lib/diagnostics/scanner';

export default function DiagnosticPage() {
  const [url, setUrl] = useState('https://jadai.dev');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/modules/diagnostic?action=scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to complete scan');
      }
      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Scan failed to complete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[rgba(201,168,76,0.2)] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C9A84C]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Diagnostic Engine</span>
          </div>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Site Reliability & Architecture Scanner</h1>
          <p className="text-sm text-[#c4c0bb] mt-1">
            Zero-fluff audit: Core Web Vitals, TLS security, accessibility compliance, and AI remediation guide.
          </p>
        </div>
        <StatusBadge status="Live" variant="gold" />
      </div>

      {/* Scanner Input */}
      <GlassCard className="p-6">
        <form onSubmit={handleRunScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#f5f3f0] font-mono text-sm placeholder-[#4a4744] focus:outline-none focus:border-[#C9A84C]"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[#050404] border-t-transparent rounded-full animate-spin" />
                Scanning Target...
              </span>
            ) : (
              'Execute Full Diagnostic'
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded bg-[rgba(192,57,43,0.15)] border border-[#C0392B] text-xs text-[#f5f3f0] font-mono">
            {error}
          </div>
        )}
      </GlassCard>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Score Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Performance', val: result.scores.performance, color: '#C9A84C' },
              { label: 'SEO Audit', val: result.scores.seo, color: '#e8c96a' },
              { label: 'Accessibility', val: result.scores.accessibility, color: '#C9A84C' },
              { label: 'Best Practices', val: result.scores.bestPractices, color: '#8a6e2a' },
            ].map((s) => (
              <GlassCard key={s.label} className="p-4 text-center">
                <div className="text-3xl font-display font-bold text-[#f5f3f0]">{s.val}</div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#8a6e2a] mt-1">{s.label}</div>
              </GlassCard>
            ))}
          </div>

          {/* Vitals & SSL */}
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#C9A84C]">
                <Zap className="w-4 h-4" />
                <h3 className="text-sm font-mono uppercase tracking-wider">Core Web Vitals</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
                <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)]">
                  <div className="text-[#8a6e2a]">FCP (First Contentful)</div>
                  <div className="text-base text-[#f5f3f0] mt-0.5">{result.metrics.fcp}</div>
                </div>
                <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)]">
                  <div className="text-[#8a6e2a]">LCP (Largest Contentful)</div>
                  <div className="text-base text-[#f5f3f0] mt-0.5">{result.metrics.lcp}</div>
                </div>
                <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)]">
                  <div className="text-[#8a6e2a]">CLS (Layout Shift)</div>
                  <div className="text-base text-[#f5f3f0] mt-0.5">{result.metrics.cls}</div>
                </div>
                <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)]">
                  <div className="text-[#8a6e2a]">TBT (Blocking Time)</div>
                  <div className="text-base text-[#f5f3f0] mt-0.5">{result.metrics.tbt}</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#C9A84C]">
                <ShieldCheck className="w-4 h-4" />
                <h3 className="text-sm font-mono uppercase tracking-wider">Security & Domain</h3>
              </div>
              <div className="space-y-2 text-xs font-mono pt-2">
                <div className="flex justify-between py-1 border-b border-[rgba(201,168,76,0.1)]">
                  <span className="text-[#8a6e2a]">TLS Certificate</span>
                  <span className="text-[#f5f3f0]">{result.ssl.grade} ({result.ssl.expiry})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(201,168,76,0.1)]">
                  <span className="text-[#8a6e2a]">Issuer</span>
                  <span className="text-[#f5f3f0]">{result.ssl.issuer || 'Trusted Certificate Authority'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(201,168,76,0.1)]">
                  <span className="text-[#8a6e2a]">Domain Registration</span>
                  <span className="text-[#f5f3f0]">{result.domain.registered_at || 'Active'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8a6e2a]">Payload Size</span>
                  <span className="text-[#f5f3f0]">{result.resources.total_size_kb} KB ({result.resources.total_requests} requests)</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* AI Fix Guide */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#C9A84C]">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-base font-display tracking-wider">PRIME Architectural Fix Guide</h2>
            </div>
            <CodeBlock
              code={result.fix_guide}
              language="markdown"
              title="PRIME_REMEDIATION_GUIDE.MD"
            />
          </GlassCard>
        </div>
      )}
    </div>
  );
}
