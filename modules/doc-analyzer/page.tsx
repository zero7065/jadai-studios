import React, { useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { analyzeDocument, DocAnalysis } from './engine';
import { StudioAudio } from '../../lib/watermark';

const SAMPLE = `SERVICE AGREEMENT — MASTER

This Agreement is entered into on 2026-01-15 between Highland Systems Ltd (email: ops@highland.example) and the Client.

1. SCOPE
The Contractor shall deliver platform architecture services. Obviously, everyone knows this arrangement is standard in the industry.

2. PAYMENT
Total contract value is $48,000 payable in milestones. A penalty of 15% applies to late delivery. Fees are non-refundable and may auto-renew annually.

3. LIABILITY
The Client shall indemnify and hold harmless the Contractor against any claim. Liability is unlimited. The Contractor may terminate without notice at any time, in its sole discretion.

4. GENERAL
This license is perpetual and irrevocable. All intellectual property assignment transfers fully to the Contractor.`;

function scoreTone(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'CLEAN', color: '#4ade80' };
  if (score >= 65) return { label: 'REVIEW', color: '#C9A84C' };
  return { label: 'HIGH RISK', color: '#e74c3c' };
}

const CATEGORY_LABEL: Record<string, string> = {
  risk: 'Contract risk',
  bias: 'Bias language',
  hedge: 'Hedging',
  absolutist: 'Absolutist claim',
};

export default function DocAnalyzerPage() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<DocAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const runAnalysis = () => {
    try {
      setError(null);
      setAiBrief(null);
      setAiNote(null);
      setAnalysis(analyzeDocument(text));
      StudioAudio.playSuccessArpeggio();
    } catch (err: any) {
      setAnalysis(null);
      setError(err.message || 'Analysis failed.');
    }
  };

  const refineWithPrime = async () => {
    if (!text.trim()) return;
    setAiLoading(true);
    setAiNote(null);
    try {
      const res = await fetch('/api/modules/doc-analyzer?action=analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, aiBrief: true }),
      });
      const json = await res.json();
      if (json.success && json.data?.aiBrief) {
        setAiBrief(json.data.aiBrief);
      } else {
        setAiNote('PRIME brief unavailable right now — the deterministic brief above still stands.');
      }
    } catch {
      setAiNote('PRIME brief unavailable right now — the deterministic brief above still stands.');
    } finally {
      setAiLoading(false);
    }
  };

  const tone = analysis ? scoreTone(analysis.score) : null;

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Document Intelligence</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Document Intelligence Analyzer</h1>
        </div>
        <StatusBadge status="Active" variant="gold" />
      </div>

      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#c4c0bb] leading-relaxed">
            Paste a contract, policy, brief, or article. Extraction, bias check, risk-clause detection,
            and executive brief — deterministic, offline-capable analysis.
          </p>
          <button
            onClick={() => { setText(SAMPLE); setError(null); }}
            className="shrink-0 px-3 py-1.5 rounded-full border border-[rgba(201,168,76,0.4)] text-[#e8c96a] font-mono text-[10px] uppercase tracking-widest hover:bg-[rgba(201,168,76,0.1)] transition-colors cursor-pointer"
          >
            Load Sample
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste document text here (minimum 20 characters)…"
          className="w-full h-56 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] p-4 font-mono text-sm text-[#c4c0bb] focus:outline-none focus:border-[#C9A84C] resize-y"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-[#8a6e2a]">
            {text.trim() ? `${text.trim().split(/\s+/).length} words` : 'No input'}
          </span>
          <button
            onClick={runAnalysis}
            className="px-6 py-2 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e8c96a] transition-all cursor-pointer"
          >
            Analyze Document
          </button>
        </div>

        {error && (
          <p className="text-xs font-mono text-[#e74c3c] border border-[rgba(231,76,60,0.3)] rounded-lg p-3">
            {error}
          </p>
        )}
      </GlassCard>

      {analysis && tone && (
        <>
          {/* Score + Stats */}
          <GlassCard className="p-6 grid grid-cols-2 sm:grid-cols-6 gap-4 items-center">
            <div className="col-span-2 sm:col-span-1 text-center">
              <div className="text-4xl font-mono font-bold" style={{ color: tone.color }}>
                {analysis.score}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: tone.color }}>
                {tone.label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-[#f5f3f0]">{analysis.stats.words}</div>
              <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Words</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-[#f5f3f0]">{analysis.stats.readingMinutes}m</div>
              <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Read time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-[#f5f3f0]">{analysis.stats.gradeLevel}</div>
              <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Grade level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-[#f5f3f0]">{analysis.flags.length}</div>
              <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Flags</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-[#f5f3f0]">{analysis.entities.length}</div>
              <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Entities</div>
            </div>
          </GlassCard>

          {/* Executive Brief */}
          <GlassCard className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">
                Executive Brief
              </span>
              <button
                onClick={refineWithPrime}
                disabled={aiLoading}
                className="px-3 py-1 rounded-full border border-[rgba(201,168,76,0.4)] text-[#e8c96a] font-mono text-[10px] uppercase tracking-widest hover:bg-[rgba(201,168,76,0.1)] transition-colors cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? 'PRIME writing…' : 'Refine with PRIME'}
              </button>
            </div>
            <p className="text-sm text-[#c4c0bb] leading-relaxed">{analysis.brief}</p>
            {aiBrief && (
              <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#8a6e2a]">PRIME AI brief</span>
                <p className="text-sm text-[#e8c96a] leading-relaxed">{aiBrief}</p>
              </div>
            )}
            {aiNote && <p className="text-[11px] font-mono text-[#8a6e2a]">{aiNote}</p>}
          </GlassCard>

          {/* Flags */}
          <GlassCard className="p-6 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">
              Detected Flags ({analysis.flags.length})
            </span>
            {analysis.flags.length === 0 ? (
              <p className="text-sm text-[#c4c0bb]">No risk, bias, or absolutist language detected.</p>
            ) : (
              <div className="space-y-2">
                {analysis.flags.map((f, i) => (
                  <div
                    key={`${f.term}-${i}`}
                    className="p-3 rounded-lg bg-[#0a0908] border border-[rgba(201,168,76,0.2)] space-y-1"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm text-[#f5f3f0]">{f.term}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-[#8a6e2a]">
                          {CATEGORY_LABEL[f.category]}
                        </span>
                        <span
                          className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border"
                          style={{
                            color: f.severity === 'high' ? '#e74c3c' : f.severity === 'medium' ? '#C9A84C' : '#8a8580',
                            borderColor: f.severity === 'high' ? 'rgba(231,76,60,0.4)' : 'rgba(201,168,76,0.3)',
                          }}
                        >
                          {f.severity}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#8a857e]">{f.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Recommendations + Entities */}
          <div className="grid sm:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">
                Recommendations
              </span>
              <ul className="space-y-2">
                {analysis.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-[#c4c0bb] leading-relaxed flex gap-2">
                    <span className="text-[#C9A84C]">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-6 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">
                Extracted Entities ({analysis.entities.length})
              </span>
              {analysis.entities.length === 0 ? (
                <p className="text-sm text-[#8a857e]">No money, dates, percentages, emails, or URLs found.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.entities.map((e, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#e8c96a]"
                      title={e.type}
                    >
                      {e.value}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
