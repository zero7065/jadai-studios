'use client';

import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Rocket,
  Building2,
  Globe,
  Target,
  Users,
  Mail,
  Send,
  Trash2,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface CampaignSummary {
  id: string;
  domain: string;
  company_name: string;
  current_step: number;
  status: string;
  created_at: string;
  updated_at: string;
  competitors: number;
  segments: number;
  prospects: number;
  contacts: number;
  emails_draft: number;
  emails_sent: number;
}

const STEP_META = [
  { n: 1, label: 'Analyze', icon: Building2 },
  { n: 2, label: 'Competitors', icon: Globe },
  { n: 3, label: 'ICP', icon: Target },
  { n: 4, label: 'Prospects', icon: Users },
  { n: 5, label: 'Contacts', icon: Mail },
  { n: 6, label: 'Emails', icon: Send },
] as const;

export default function AdminSignalPage() {
  const [summaries, setSummaries] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/signal/campaigns');
      const json = await resp.json();
      if (json?.success) {
        setSummaries(json.summaries || []);
      } else {
        showToast(json?.error || 'Failed to load campaigns', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this campaign and all of its prospects/contacts/emails?')) return;
    setDeletingId(id);
    try {
      const resp = await fetch(`/api/signal/campaigns/${id}`, { method: 'DELETE' });
      const json = await resp.json();
      if (json?.success) {
        showToast('Campaign deleted', 'success');
        setSummaries((prev) => prev.filter((s) => s.id !== id));
      } else {
        showToast(json?.error || 'Delete failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5" />
            Signal Outreach
          </span>
          <h1 className="text-2xl font-display font-bold text-[#f5f3f0] mt-1">Campaigns</h1>
          <p className="text-xs text-zinc-400 mt-1">
            6-step Explee-style outbound pipeline. Full UI lives at{' '}
            <a href="/signal/outreach" className="text-amber-400 hover:underline inline-flex items-center gap-1">
              /signal/outreach <ExternalLink className="w-3 h-3" />
            </a>
            .
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            StudioAudio.playClick();
            load();
          }}
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-zinc-500 font-mono text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading campaigns…
        </div>
      ) : summaries.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <Rocket className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500 font-mono">
            No campaigns yet. Launch one from the{' '}
            <a href="/signal/outreach" className="text-amber-400 hover:underline">Outreach Agent</a>.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {summaries.map((s) => (
            <GlassCard key={s.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-display font-bold text-[#f5f3f0] truncate">
                    {s.company_name || s.domain}
                  </h3>
                  <StatusBadge
                    status={s.status === 'completed' ? 'Completed' : 'Active'}
                    variant={s.status === 'completed' ? 'gold' : 'emerald'}
                  />
                </div>
                <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{s.domain}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Created {new Date(s.created_at).toLocaleString()} · Updated{' '}
                  {new Date(s.updated_at).toLocaleString()}
                </p>
              </div>

              {/* Step progress */}
              <div className="flex items-center gap-1 shrink-0">
                {STEP_META.map((step) => {
                  const Icon = step.icon;
                  const done = s.current_step >= step.n;
                  return (
                    <div
                      key={step.n}
                      title={`Step ${step.n}: ${step.label}`}
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        done ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  );
                })}
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[10px] font-mono text-zinc-500 shrink-0">
                <span>Comp: <span className="text-zinc-300">{s.competitors}</span></span>
                <span>Seg: <span className="text-zinc-300">{s.segments}</span></span>
                <span>Pros: <span className="text-zinc-300">{s.prospects}</span></span>
                <span>Cont: <span className="text-zinc-300">{s.contacts}</span></span>
                <span>Drafts: <span className="text-zinc-300">{s.emails_draft}</span></span>
                <span>Sent: <span className="text-emerald-400">{s.emails_sent}</span></span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(s.id)}
                disabled={deletingId === s.id}
                className="text-red-400 hover:text-red-300 shrink-0"
              >
                {deletingId === s.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
