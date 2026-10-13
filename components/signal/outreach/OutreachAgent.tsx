'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Rocket,
  Building2,
  Target,
  Users,
  Mail,
  Send,
  Check,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Globe,
} from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';

const API = '/api/signal';

interface Competitor {
  id: string;
  domain: string;
  name: string;
  description: string;
  source: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  pain_point: string;
  estimated_size: string;
  icon: string;
}

interface Prospect {
  id: string;
  segment_id: string;
  company_name: string;
  domain: string;
  country: string;
  employees: string;
  monthly_traffic: string;
  relevance_score: number;
  source: string;
}

interface Contact {
  id: string;
  prospect_id: string;
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
  confidence_score: number;
  source: string;
}

interface Email {
  id: string;
  contact_id: string;
  subject: string;
  body: string;
  status: string;
}

interface Campaign {
  id: string;
  domain: string;
  company_name: string;
  company_description: string;
  category: string;
  location_hint: string;
  logo_url: string;
  current_step: number;
  status: string;
  competitors: Competitor[];
  segments: Segment[];
  prospects: Prospect[];
  contacts: Contact[];
  emails: Email[];
}

interface StepMeta {
  n: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const STEPS: StepMeta[] = [
  { n: 1, title: 'Analyze Company', subtitle: 'Research the business behind the domain', icon: Building2 },
  { n: 2, title: 'Discover Competitors', subtitle: 'Map the competitive landscape', icon: Globe },
  { n: 3, title: 'Define ICP Segments', subtitle: 'Build ideal-customer profiles', icon: Target },
  { n: 4, title: 'Source Prospects', subtitle: 'Find companies that match each segment', icon: Users },
  { n: 5, title: 'Enrich Contacts', subtitle: 'Identify decision-makers at each prospect', icon: Mail },
  { n: 6, title: 'Draft & Send Emails', subtitle: 'Personalized outreach, ready to launch', icon: Send },
];

async function api(path: string, init?: RequestInit) {
  const resp = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = await resp.json().catch(() => null);
  if (!resp.ok || !json?.success) {
    throw new Error(json?.error || `Request failed (${resp.status})`);
  }
  return json;
}

export const OutreachAgent: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [active, setActive] = useState<Campaign | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [expanded, setExpanded] = useState<number | null>(1);
  const [busyStep, setBusyStep] = useState<number | null>(null);
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      const json = await api('/campaigns');
      setCampaigns(json.campaigns || []);
      setActive((prev) => {
        if (!prev) return prev;
        const fresh = (json.campaigns || []).find((c: Campaign) => c.id === prev.id);
        return fresh || prev;
      });
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const createCampaign = async () => {
    const domain = domainInput.trim();
    if (!domain) return;
    setCreating(true);
    setError(null);
    try {
      const json = await api('/campaigns', { method: 'POST', body: JSON.stringify({ domain }) });
      setActive(json.campaign);
      setDomainInput('');
      setExpanded(1);
      await loadCampaigns();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const runStep = async (n: number, body?: Record<string, string>) => {
    if (!active) return;
    StudioAudio.playClick();
    setBusyStep(n);
    setError(null);
    try {
      const paths: Record<number, string> = {
        1: `/campaigns/${active.id}/analyze`,
        2: `/campaigns/${active.id}/competitors`,
        3: `/campaigns/${active.id}/icp`,
        4: `/campaigns/${active.id}/prospects`,
        5: `/campaigns/${active.id}/contacts`,
        6: `/campaigns/${active.id}/draft`,
      };
      const json = await api(paths[n], { method: 'POST', body: JSON.stringify(body || {}) });
      setActive(json.campaign);
      if (json.note) {
        setStepNotes((prev) => ({ ...prev, [n]: json.note }));
      }
      if (n < 6) setExpanded(n + 1);
      await loadCampaigns();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusyStep(null);
    }
  };

  const sendEmail = async (emailId: string) => {
    if (!active) return;
    try {
      const json = await api(`/campaigns/${active.id}/emails/${emailId}/send`, { method: 'POST' });
      setActive(json.campaign);
      if (json.mailto) {
        window.location.href = json.mailto;
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const stepDone = (n: number) => (active?.current_step || 0) >= n;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5" />
            Outreach Agent • 6-Step Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">
            Campaign Outbound
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Explee-style flow: analyze → competitors → ICP → prospects → contacts → emails.
          </p>
        </div>
      </div>

      {/* New campaign */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createCampaign()}
          placeholder="Enter target domain (e.g. stripe.com)"
          className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-mono text-[#f5f3f0] placeholder:text-zinc-600 focus:border-amber-500/50 outline-none"
        />
        <button
          onClick={createCampaign}
          disabled={creating || !domainInput.trim()}
          className="px-5 py-2.5 rounded-lg bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
          Launch Campaign
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-mono text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Campaign picker */}
      {campaigns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActive(c);
                setExpanded(Math.max(1, c.current_step || 1));
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono border transition-colors cursor-pointer ${
                active?.id === c.id
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {c.company_name || c.domain} · Step {c.current_step}/6
            </button>
          ))}
        </div>
      )}

      {/* No campaign empty state */}
      {!active && campaigns.length === 0 && (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
          <Rocket className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 font-mono">
            No campaigns yet. Enter a domain above to launch the 6-step outreach pipeline.
          </p>
        </div>
      )}

      {/* Active campaign accordion */}
      {active && (
        <div className="space-y-3">
          {/* Campaign header card */}
          <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-[rgba(201,168,76,0.25)] rounded-xl">
            {active.logo_url && (
              <img
                src={active.logo_url}
                alt=""
                className="w-10 h-10 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-display font-bold text-[#f5f3f0] truncate">
                {active.company_name || active.domain}
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono truncate">
                {active.domain} · {active.category || 'Uncategorized'} · {active.location_hint || 'Location unknown'}
              </p>
              {active.company_description && (
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{active.company_description}</p>
              )}
            </div>
            <div className="ml-auto text-right shrink-0">
              <div className="text-2xl font-mono font-bold text-amber-400">{active.current_step}/6</div>
              <div className="text-[10px] font-mono text-zinc-600 uppercase">steps done</div>
            </div>
          </div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            const done = stepDone(step.n);
            const isOpen = expanded === step.n;
            const busy = busyStep === step.n;
            const note = stepNotes[step.n];

            return (
              <div
                key={step.n}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  isOpen ? 'border-amber-500/40 bg-zinc-950' : 'border-zinc-800 bg-zinc-950/60'
                }`}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : step.n)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-zinc-900/40 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      done ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-600">STEP {step.n}</span>
                      <span className="text-sm font-semibold text-[#f5f3f0]">{step.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">{step.subtitle}</p>
                  </div>
                  {busy ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  ) : (
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-600 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/60 pt-3">
                    {note && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] font-mono text-amber-300/90">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {note}
                      </div>
                    )}

                    {/* Step 1 body */}
                    {step.n === 1 && (
                      <div className="space-y-2">
                        {active.company_description ? (
                          <div className="text-xs text-zinc-300 leading-relaxed space-y-1">
                            <p><span className="text-zinc-500">Name:</span> {active.company_name}</p>
                            <p><span className="text-zinc-500">Category:</span> {active.category}</p>
                            <p><span className="text-zinc-500">Location:</span> {active.location_hint}</p>
                            <p className="text-zinc-400">{active.company_description}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500">Run analysis to research this company.</p>
                        )}
                        <button
                          onClick={() => runStep(1)}
                          disabled={busy}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          {done ? 'Re-run Analysis' : 'Run Analysis'}
                        </button>
                      </div>
                    )}

                    {/* Step 2 body */}
                    {step.n === 2 && (
                      <div className="space-y-2">
                        {active.competitors.length > 0 ? (
                          <div className="grid sm:grid-cols-2 gap-2">
                            {active.competitors.map((c) => (
                              <div key={c.id} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-[#f5f3f0]">{c.name}</span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                    c.source === 'ai-estimated' ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/20 text-emerald-400'
                                  }`}>
                                    {c.source}
                                  </span>
                                </div>
                                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{c.domain}</p>
                                <p className="text-[11px] text-zinc-400 mt-1">{c.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500">Run discovery to map competitors.</p>
                        )}
                        <button
                          onClick={() => runStep(2)}
                          disabled={busy}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          {done ? 'Re-run Discovery' : 'Discover Competitors'}
                        </button>
                      </div>
                    )}

                    {/* Step 3 body */}
                    {step.n === 3 && (
                      <div className="space-y-2">
                        {active.segments.length > 0 ? (
                          <div className="grid sm:grid-cols-3 gap-2">
                            {active.segments.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => setSelectedSegment(s.id)}
                                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                                  selectedSegment === s.id
                                    ? 'bg-amber-500/10 border-amber-500/40'
                                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                                }`}
                              >
                                <div className="text-xs font-semibold text-[#f5f3f0]">{s.name}</div>
                                <p className="text-[11px] text-zinc-400 mt-1">{s.description}</p>
                                <p className="text-[10px] font-mono text-amber-400/80 mt-1">{s.estimated_size}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">Pain: {s.pain_point}</p>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500">Run ICP definition to build segments.</p>
                        )}
                        <button
                          onClick={() => runStep(3)}
                          disabled={busy}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          {done ? 'Re-define ICP' : 'Define ICP Segments'}
                        </button>
                      </div>
                    )}

                    {/* Step 4 body */}
                    {step.n === 4 && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-zinc-500">
                          Select a segment above (step 3), then source prospects.
                        </p>
                        {active.prospects.length > 0 ? (
                          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                            {active.prospects.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => setSelectedProspect(p.id)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                                  selectedProspect === p.id
                                    ? 'bg-amber-500/10 border-amber-500/40'
                                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-[#f5f3f0] truncate">{p.company_name}</div>
                                  <div className="text-[10px] font-mono text-zinc-500 truncate">
                                    {p.domain} · {p.country} · {p.employees} emp · {p.monthly_traffic}/mo
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-sm font-mono font-bold text-amber-400">{p.relevance_score}</div>
                                  <div className={`text-[8px] font-mono ${
                                    p.source === 'ai-estimated' ? 'text-zinc-500' : 'text-emerald-400'
                                  }`}>
                                    {p.source}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500">Run prospect sourcing for the selected segment.</p>
                        )}
                        <button
                          onClick={() => {
                            if (!selectedSegment) {
                              setError('Select an ICP segment in step 3 first.');
                              return;
                            }
                            runStep(4, { segmentId: selectedSegment });
                          }}
                          disabled={busy || !selectedSegment}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          {done ? 'Source More Prospects' : 'Source Prospects'}
                        </button>
                      </div>
                    )}

                    {/* Step 5 body */}
                    {step.n === 5 && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-zinc-500">
                          Select a prospect in step 4, then enrich contacts.
                        </p>
                        {active.contacts.length > 0 ? (
                          <div className="space-y-1.5">
                            {active.contacts.map((ct) => (
                              <div key={ct.id} className="flex items-center gap-3 p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-[#f5f3f0]">{ct.name}</div>
                                  <div className="text-[10px] text-zinc-500">{ct.title}</div>
                                  <div className="text-[10px] font-mono text-amber-400/80 truncate">{ct.email}</div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-sm font-mono font-bold text-amber-400">{ct.confidence_score}%</div>
                                  <div className={`text-[8px] font-mono ${
                                    ct.source === 'ai-estimated' ? 'text-zinc-500' : 'text-emerald-400'
                                  }`}>
                                    {ct.source}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500">Run contact enrichment for the selected prospect.</p>
                        )}
                        <button
                          onClick={() => {
                            if (!selectedProspect) {
                              setError('Select a prospect in step 4 first.');
                              return;
                            }
                            runStep(5, { prospectId: selectedProspect });
                          }}
                          disabled={busy || !selectedProspect}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          {done ? 'Enrich More Contacts' : 'Enrich Contacts'}
                        </button>
                      </div>
                    )}

                    {/* Step 6 body */}
                    {step.n === 6 && (
                      <div className="space-y-2">
                        {active.emails.length > 0 ? (
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {active.emails.map((em) => {
                              const ct = active.contacts.find((c) => c.id === em.contact_id);
                              return (
                                <div key={em.id} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-[#f5f3f0] truncate">
                                        To: {ct?.name || 'Unknown'} ({ct?.title})
                                      </div>
                                      <div className="text-[10px] font-mono text-zinc-500 truncate">{ct?.email}</div>
                                    </div>
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                      em.status === 'sent'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-zinc-800 text-zinc-400'
                                    }`}>
                                      {em.status}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-amber-300/90">{em.subject}</div>
                                  <p className="text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed">{em.body}</p>
                                  {em.status === 'draft' && (
                                    <button
                                      onClick={() => sendEmail(em.id)}
                                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-mono text-[10px] font-bold hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                      <Send className="w-3 h-3" />
                                      Send
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500">Select a contact in step 5, then draft an email.</p>
                        )}
                        <button
                          onClick={() => {
                            const lastContact =
                              active.contacts.find((c) => c.id === active.emails[active.emails.length - 1]?.contact_id) ||
                              active.contacts[0];
                            if (!lastContact) {
                              setError('Enrich contacts in step 5 before drafting.');
                              return;
                            }
                            runStep(6, { contactId: lastContact.id });
                          }}
                          disabled={busy || active.contacts.length === 0}
                          className="px-4 py-2 rounded-lg bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          {active.emails.length > 0 ? 'Draft Another Email' : 'Draft Email'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OutreachAgent;
