import React, { useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { scoreResume, ResumeScore } from './engine';
import { StudioAudio } from '../../lib/watermark';

const SAMPLE = `ALEX OKONKWO
alex@highland.dev | +234 801 234 5678 | linkedin.com/in/alexokonkwo

EXPERIENCE

- Led a platform rebuild that cut p95 latency from 800ms to 140ms for 120k daily users
- Shipped a billing migration covering $2.4M ARR with zero downtime across 3 regions
- Built an internal design system adopted by 6 product squads, reducing UI debt 40%
- Automated release checks that dropped rollback rate from 9% to 2%
- Owned observability stack (Grafana, OpenTelemetry) for 40+ services

EDUCATION
B.Sc. Computer Science, University of Jos, 2018

SKILLS
TypeScript, React, Node.js, PostgreSQL, Docker, AWS, Terraform, GraphQL`;

const GRADE_TONE: Record<string, { label: string; color: string }> = {
  A: { label: 'ARCHITECT-GRADE', color: '#4ade80' },
  B: { label: 'STRONG', color: '#C9A84C' },
  C: { label: 'COMPETITIVE', color: '#f39c12' },
  D: { label: 'NEEDS WORK', color: '#e67e22' },
  F: { label: 'CRITICAL', color: '#e74c3c' },
};

export default function ResumeEditorPage() {
  const [text, setText] = useState('');
  const [score, setScore] = useState<ResumeScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rewrite, setRewrite] = useState<string | null>(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteNote, setRewriteNote] = useState<string | null>(null);

  const runScore = () => {
    try {
      setError(null);
      setRewrite(null);
      setRewriteNote(null);
      setScore(scoreResume(text));
      StudioAudio.playSuccessArpeggio();
    } catch (err: any) {
      setScore(null);
      setError(err.message || 'Scoring failed.');
    }
  };

  const rewriteWithPrime = async () => {
    if (!text.trim()) return;
    setRewriteLoading(true);
    setRewriteNote(null);
    try {
      const res = await fetch('/api/modules/resume-editor?action=score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, rewriteWeak: true }),
      });
      const json = await res.json();
      if (json.success && json.data?.aiRewrite) {
        setRewrite(json.data.aiRewrite);
      } else {
        setRewriteNote('PRIME rewrite unavailable right now — apply the fix manually using the suggestion above.');
      }
    } catch {
      setRewriteNote('PRIME rewrite unavailable right now — apply the fix manually using the suggestion above.');
    } finally {
      setRewriteLoading(false);
    }
  };

  const tone = score ? GRADE_TONE[score.grade] : null;

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Career Engineering</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Architectural Resume Editor</h1>
        </div>
        <StatusBadge status="Active" variant="gold" />
      </div>

      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#c4c0bb] leading-relaxed">
            Paste your full resume text. Ruthless deterministic scoring across 8 dimensions —
            contact, sections, quantified impact, action verbs, length, bullets, cliché hygiene, stack signal.
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
          placeholder="Paste your resume text here (minimum 40 characters)…"
          className="w-full h-64 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] p-4 font-mono text-sm text-[#c4c0bb] focus:outline-none focus:border-[#C9A84C] resize-y"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-[#8a6e2a]">
            {text.trim() ? `${text.trim().split(/\s+/).length} words` : 'No input'}
          </span>
          <button
            onClick={runScore}
            className="px-6 py-2 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e8c96a] transition-all cursor-pointer"
          >
            Score Resume
          </button>
        </div>

        {error && (
          <p className="text-xs font-mono text-[#e74c3c] border border-[rgba(231,76,60,0.3)] rounded-lg p-3">
            {error}
          </p>
        )}
      </GlassCard>

      {score && tone && (
        <>
          {/* Score + grade */}
          <GlassCard className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center shrink-0">
              <div className="text-5xl font-mono font-bold" style={{ color: tone.color }}>
                {score.total}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: tone.color }}>
                {tone.label}
              </div>
            </div>
            <div className="flex-1 w-full grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-mono text-[#f5f3f0]">{score.stats.words}</div>
                <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Words</div>
              </div>
              <div>
                <div className="text-lg font-mono text-[#f5f3f0]">{score.stats.bullets}</div>
                <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Bullets</div>
              </div>
              <div>
                <div className="text-lg font-mono text-[#f5f3f0]">{score.stats.quantified}</div>
                <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Metrics</div>
              </div>
              <div>
                <div className="text-lg font-mono text-[#f5f3f0]">{score.stats.actionVerbs}</div>
                <div className="text-[10px] font-mono uppercase text-[#8a6e2a]">Action verbs</div>
              </div>
            </div>
          </GlassCard>

          {/* Dimension breakdown */}
          <GlassCard className="p-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">
              Dimension Breakdown
            </span>
            <div className="space-y-3">
              {score.findings.map((f) => {
                const pct = Math.round((f.earned / f.weight) * 100);
                return (
                  <div key={f.dimension} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={f.passed ? 'text-[#4ade80]' : 'text-[#e8c96a]'}>
                        {f.passed ? '✓' : '△'} {f.dimension}
                      </span>
                      <span className="text-[#8a6e2a]">
                        {f.earned}/{f.weight}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#0a0908] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: f.passed ? '#4ade80' : '#C9A84C',
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-[#8a857e] font-mono">
                      {f.detail}
                      {!f.passed && f.fix ? ` — Fix: ${f.fix}` : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Pareto bullets + AI rewrite */}
          <div className="grid sm:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#4ade80]">
                Strongest Bullets
              </span>
              {score.topBullets.length === 0 ? (
                <p className="text-sm text-[#8a857e]">No bullet lines detected — use “– ” prefixed lines.</p>
              ) : (
                <ul className="space-y-2">
                  {score.topBullets.map((b, i) => (
                    <li key={i} className="text-xs text-[#c4c0bb] font-mono leading-relaxed flex gap-2">
                      <span className="text-[#4ade80]">▲</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>

            <GlassCard className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-[#e8c96a]">
                  Weakest Bullets
                </span>
                <button
                  onClick={rewriteWithPrime}
                  disabled={rewriteLoading}
                  className="px-3 py-1 rounded-full border border-[rgba(201,168,76,0.4)] text-[#e8c96a] font-mono text-[10px] uppercase tracking-widest hover:bg-[rgba(201,168,76,0.1)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {rewriteLoading ? 'PRIME rewriting…' : 'Rewrite with PRIME'}
                </button>
              </div>
              {score.weakBullets.length === 0 ? (
                <p className="text-sm text-[#8a857e]">No bullets detected.</p>
              ) : (
                <ul className="space-y-2">
                  {score.weakBullets.map((b, i) => (
                    <li key={i} className="text-xs text-[#8a857e] font-mono leading-relaxed flex gap-2">
                      <span className="text-[#C9A84C]">▽</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {rewrite && (
                <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#8a6e2a]">PRIME rewrite</span>
                  <p className="text-xs font-mono text-[#4ade80] leading-relaxed">{rewrite}</p>
                </div>
              )}
              {rewriteNote && <p className="text-[11px] font-mono text-[#8a6e2a]">{rewriteNote}</p>}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
