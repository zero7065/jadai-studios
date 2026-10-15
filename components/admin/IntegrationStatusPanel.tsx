'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { Plug, RefreshCw, CheckCircle2, XCircle, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

interface Integration {
  id: string;
  label: string;
  envVars: string[];
  live: boolean;
  hint: string | null;
  impact: string;
  getFrom: string;
}

interface IntegrationsResponse {
  success: boolean;
  appUrl: string | null;
  integrations: Integration[];
  liveCount: number;
  totalCount: number;
}

export const IntegrationStatusPanel: React.FC = () => {
  const [data, setData] = useState<IntegrationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/integrations', { headers: { Accept: 'application/json' } });
      const json = await res.json();
      if (json.success) setData(json);
    } catch {
      showToast('Could not reach the integrations endpoint', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copyVar = (name: string) => {
    navigator.clipboard.writeText(name);
    showToast(`Copied ${name} — paste this into .env`, 'success');
  };

  const missing = data ? data.integrations.filter((i) => !i.live) : [];

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plug className="w-5 h-5 text-[#C9A84C]" />
          <h2 className="text-base font-display text-[#f5f3f0]">Integration Status</h2>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-xs font-mono text-[#8a6e2a]">
              {data.liveCount}/{data.totalCount} live
            </span>
          )}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && !data && (
        <p className="text-xs font-mono text-[#8a6e2a]">Reading server environment…</p>
      )}

      {data && (
        <>
          {missing.length > 0 && (
            <div className="p-3 rounded border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.06)] text-xs text-[#c4c0bb]">
              <span className="text-[#e8c96a] font-semibold">
                {missing.length} integration{missing.length > 1 ? 's' : ''} running in fallback mode.
              </span>{' '}
              The platform works without them, but cloud sync, real payments, or AI redundancy are limited until you add the keys below.
            </div>
          )}

          <div className="space-y-3">
            {data.integrations.map((intg) => (
              <div
                key={intg.id}
                className={`p-4 rounded border ${
                  intg.live
                    ? 'border-[rgba(201,168,76,0.15)] bg-[#050404]'
                    : 'border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.04)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {intg.live ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#C9A84C] shrink-0" />
                      )}
                      <span className="text-sm font-display font-semibold text-[#f5f3f0]">{intg.label}</span>
                      <StatusBadge status={intg.live ? 'Live' : 'Placeholder'} variant={intg.live ? 'gold' : 'crimson'} />
                    </div>
                    <p className="text-xs text-[#c4c0bb] pl-6">{intg.impact}</p>
                    {intg.hint && (
                      <p className="text-[11px] font-mono text-[#8a6e2a] pl-6">Detected: {intg.hint}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pl-6 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {intg.envVars.map((v) => (
                      <button
                        key={v}
                        onClick={() => copyVar(v)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-[11px] font-mono text-[#e8c96a] hover:border-[#C9A84C] transition-colors cursor-pointer"
                        title="Click to copy env var name"
                      >
                        <Copy className="w-3 h-3" />
                        {v}
                      </button>
                    ))}
                  </div>
                  <a
                    href={intg.getFrom}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors"
                  >
                    Get from: {intg.getFrom}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
};

export default IntegrationStatusPanel;
