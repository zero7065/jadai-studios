import React, { useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { buildGrowthPlan, GrowthInput, GrowthPlan } from './engine';
import { StudioAudio } from '../../lib/watermark';

const CHANNELS = ['SEO', 'Paid Ads', 'Product-Led', 'Social Organic', 'Email', 'Community', 'Partnerships', 'Direct Sales'];

const STAGES: Array<{ id: GrowthInput['stage']; label: string; blurb: string }> = [
  { id: 'idea', label: 'Idea', blurb: 'Validate before you build' },
  { id: 'launch', label: 'Launch', blurb: 'Convert first cohort' },
  { id: 'scale', label: 'Scale', blurb: 'Efficient growth + expansion' },
];

const BUDGETS: Array<{ id: GrowthInput['budget']; label: string }> = [
  { id: 'zero', label: 'Zero budget' },
  { id: 'lean', label: 'Lean ($100–1k/mo)' },
  { id: 'funded', label: 'Funded ($1.5k+/mo)' },
];

const PRIORITY_COLOR: Record<number, string> = { 1: '#4ade80', 2: '#C9A84C', 3: '#8a8580' };

export default function GrowthMakerPage() {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [stage, setStage] = useState<GrowthInput['stage']>('idea');
  const [budget, setBudget] = useState<GrowthInput['budget']>('zero');
  const [channels, setChannels] = useState<string[]>(['Social Organic', 'SEO']);
  const [plan, setPlan] = useState<GrowthPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const toggleChannel = (c: string) => {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const runPlan = () => {
    try {
      setError(null);
      setAiSummary(null);
      setAiNote(null);
      const built = buildGrowthPlan({ product, audience, stage, budget, channels });
      setPlan(built);
      StudioAudio.playSuccessArpeggio();
    } catch (err: any) {
      setPlan(null);
      setError(err.message || 'Plan generation failed.');
    }
  };

  const summarizeWithPrime = async () => {
    setAiLoading(true);
    setAiNote(null);
    try {
      const res = await fetch('/api/modules/growth-maker?action=strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, audience, stage, budget, channels, aiSummary: true }),
      });
      const json = await res.json();
      if (json.success && json.data?.aiSummary) {
        setAiSummary(json.data.aiSummary);
      } else {
        setAiNote('PRIME summary unavailable — the deterministic plan below still stands.');
      }
    } catch {
      setAiNote('PRIME summary unavailable — the deterministic plan below still stands.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Growth Strategy</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Growth Strategy Engine</h1>
        </div>
        <StatusBadge status="Active" variant="gold" />
      </div>

      {/* Input form */}
      <GlassCard className="p-6 space-y-5">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          Describe the product and audience, pick a stage and budget — get a 30-day plan with pillars,
          weekly actions, channel matrix, and risk calls. Deterministic framework, optional PRIME synthesis.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">Product</label>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. offline-first exam prep app"
              className="w-full rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] px-4 py-2.5 font-mono text-sm text-[#c4c0bb] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">Audience</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. WAEC candidates in West Africa"
              className="w-full rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] px-4 py-2.5 font-mono text-sm text-[#c4c0bb] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">Stage</label>
            <div className="flex gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  title={s.blurb}
                  className={`flex-1 px-3 py-2 rounded-xl border font-mono text-xs transition-all cursor-pointer ${
                    stage === s.id
                      ? 'bg-[#C9A84C] text-[#050404] border-[#C9A84C] font-bold'
                      : 'bg-[#0a0908] text-[#8a6e2a] border-[rgba(201,168,76,0.25)] hover:border-[rgba(201,168,76,0.5)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">Budget</label>
            <div className="flex gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBudget(b.id)}
                  className={`flex-1 px-3 py-2 rounded-xl border font-mono text-[11px] transition-all cursor-pointer ${
                    budget === b.id
                      ? 'bg-[#C9A84C] text-[#050404] border-[#C9A84C] font-bold'
                      : 'bg-[#0a0908] text-[#8a6e2a] border-[rgba(201,168,76,0.25)] hover:border-[rgba(201,168,76,0.5)]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
            Channels (pick 1–4)
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c}
                onClick={() => toggleChannel(c)}
                className={`px-3 py-1.5 rounded-full border font-mono text-[11px] transition-all cursor-pointer ${
                  channels.includes(c)
                    ? 'bg-[rgba(201,168,76,0.15)] text-[#e8c96a] border-[rgba(201,168,76,0.5)]'
                    : 'bg-[#0a0908] text-[#8a6e2a] border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-[#8a6e2a]">
            {channels.length} channel{channels.length === 1 ? '' : 's'} selected
          </span>
          <button
            onClick={runPlan}
            className="px-6 py-2 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e8c96a] transition-all cursor-pointer"
          >
            Generate 30-Day Plan
          </button>
        </div>

        {error && (
          <p className="text-xs font-mono text-[#e74c3c] border border-[rgba(231,76,60,0.3)] rounded-lg p-3">
            {error}
          </p>
        )}
      </GlassCard>

      {plan && (
        <>
          {/* AI summary strip */}
          <GlassCard className="p-6 flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Strategy snapshot — {plan.product || 'your product'} · {plan.stage} · {plan.budget} budget
              </span>
              <p className="text-sm text-[#c4c0bb] leading-relaxed">
                {aiSummary ||
                  'Three pillars, four weekly sprints, prioritized channel matrix, and the risks that kill plans at this stage.'}
              </p>
              {aiNote && <p className="text-[11px] font-mono text-[#8a6e2a]">{aiNote}</p>}
            </div>
            <button
              onClick={summarizeWithPrime}
              disabled={aiLoading}
              className="shrink-0 px-3 py-1.5 rounded-full border border-[rgba(201,168,76,0.4)] text-[#e8c96a] font-mono text-[10px] uppercase tracking-widest hover:bg-[rgba(201,168,76,0.1)] transition-colors cursor-pointer disabled:opacity-50"
            >
              {aiLoading ? 'PRIME writing…' : 'AI Summary'}
            </button>
          </GlassCard>

          {/* Pillars */}
          <div className="grid sm:grid-cols-3 gap-4">
            {plan.pillars.map((p, i) => (
              <GlassCard key={p.name} className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.4)] text-[#C9A84C] text-[10px] font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="font-display font-bold text-sm text-[#f5f3f0]">{p.name}</h3>
                </div>
                <p className="text-[11px] font-mono text-[#8a6e2a]">{p.focus}</p>
                <ul className="space-y-1.5">
                  {p.tactics.map((t, ti) => (
                    <li key={ti} className="text-xs text-[#c4c0bb] leading-relaxed flex gap-1.5">
                      <span className="text-[#C9A84C]">▸</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-[rgba(201,168,76,0.15)] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#8a6e2a]">KPIs</span>
                  {p.kpis.map((k, ki) => (
                    <div key={ki} className="text-[11px] font-mono text-[#4ade80]">◇ {k}</div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Week plan */}
          <GlassCard className="p-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">
              30-Day Execution
            </span>
            <div className="grid sm:grid-cols-4 gap-3">
              {plan.weeks.map((w) => (
                <div key={w.week} className="p-4 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#8a6e2a]">Week {w.week}</span>
                    <span className="text-[10px] font-mono text-[#C9A84C]">{w.focus}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {w.actions.map((a, ai) => (
                      <li key={ai} className="text-[11px] text-[#c4c0bb] leading-snug">• {a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Channel matrix + risks */}
          <div className="grid sm:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">
                Channel Matrix
              </span>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[10px] uppercase text-[#8a6e2a] border-b border-[rgba(201,168,76,0.2)]">
                    <th className="text-left py-2">Channel</th>
                    <th className="text-left py-2">Pri</th>
                    <th className="text-left py-2">Effort</th>
                    <th className="text-left py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.channels.map((c) => (
                    <tr key={c.channel} className="border-b border-[rgba(201,168,76,0.08)]">
                      <td className="py-2 text-[#f5f3f0]">{c.channel}</td>
                      <td className="py-2" style={{ color: PRIORITY_COLOR[c.priority] }}>P{c.priority}</td>
                      <td className="py-2 text-[#8a857e]">{c.effort}</td>
                      <td className="py-2 text-[#8a6e2a] text-[11px]">{c.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>

            <GlassCard className="p-6 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#e74c3c]">
                Risks To Neutralize
              </span>
              <ul className="space-y-2">
                {plan.risks.map((r, i) => (
                  <li key={i} className="text-xs text-[#c4c0bb] leading-relaxed flex gap-2">
                    <span className="text-[#e74c3c]">▲</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
