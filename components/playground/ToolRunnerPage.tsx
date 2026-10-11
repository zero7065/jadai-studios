'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EdgeGlow from '../ui/EdgeGlow';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';
import ModuleIcon from '../ui/ModuleIcon';
import Button from '../ui/Button';
import { PLAYGROUND_TOOLS, PlaygroundTool } from '../../lib/data/playgroundTools';
import { saveLocalDraft } from '../../lib/data/draftWorkspace';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import { askPrime } from '../../lib/ai/memory';
import WarmFallbackModal from '../ai/WarmFallbackModal';
import RealImageGenerator from '../ai/RealImageGenerator';
import UpgradeModal from '../auth/UpgradeModal';
import AuthModal from '../auth/AuthModal';
import { checkToolAccess, recordModuleExecution } from '../../lib/supabase/gates';
import {
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  Lock,
  ChevronRight,
  FolderGit2,
} from 'lucide-react';

export interface ToolRunnerPageProps {
  slug: string;
  onNavigate?: (path: string) => void;
}

export const ToolRunnerPage: React.FC<ToolRunnerPageProps> = ({ slug, onNavigate }) => {
  const tool = PLAYGROUND_TOOLS.find((t) => t.slug === slug);
  const { showToast } = useToast();

  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');
  const [running, setRunning] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [fallbackModalOpen, setFallbackModalOpen] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [userUsage, setUserUsage] = useState<{ usageCount: number; tier: string } | null>(null);

  useEffect(() => {
    if (!tool) return;
    checkToolAccess(tool.slug).then((res) => {
      setUserUsage({ usageCount: res.usageCount, tier: res.tier });
    });
  }, [tool?.slug]);

  // Unknown engine — honest 404 instead of silently loading a different tool
  if (!tool) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C0392B]">
          404 // Engine Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#f5f3f0]">
          No engine answers to “{slug}”
        </h1>
        <p className="text-sm font-mono text-[#8a857e] leading-relaxed max-w-md mx-auto">
          The link may be stale or mistyped. The chamber currently holds 16 engines — browse
          them from the playground floor.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() =>
              onNavigate ? onNavigate('/playground') : (window.location.href = '/playground')
            }
            className="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all cursor-pointer"
          >
            Back to the Playground
          </button>
          <button
            onClick={() => (onNavigate ? onNavigate('/') : (window.location.href = '/'))}
            className="px-5 py-2.5 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] text-[#c4c0bb] font-mono text-xs hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            Return home
          </button>
        </div>
      </div>
    );
  }

  const handleCopyPrompt = () => {
    StudioAudio.playClick();
    navigator.clipboard.writeText(tool.promptTemplate);
    setCopiedPrompt(true);
    showToast('Prompt copied to clipboard', 'success', 'Ready to Paste');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyOutput = () => {
    StudioAudio.playClick();
    navigator.clipboard.writeText(outputVal);
    setCopiedOutput(true);
    showToast('Output copied to clipboard', 'info');
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const handleRunTool = async () => {
    if (!inputVal.trim()) {
      showToast('Please provide an input value', 'error');
      return;
    }

    // 1. Subscription & Auth Gate Check
    const access = await checkToolAccess(tool.slug);
    setUserUsage({ usageCount: access.usageCount, tier: access.tier });
    if (!access.allowed) {
      StudioAudio.playClick();
      if (access.reason === 'unauthenticated') {
        setAuthModalOpen(true);
      } else {
        setUpgradeModalOpen(true);
      }
      return;
    }

    StudioAudio.playClick();
    setRunning(true);

    try {
      // ---------------------------------------------------------------------
      // Deterministic engines — real endpoints, no AI roundtrip needed
      // ---------------------------------------------------------------------
      if (tool.slug === 'link-shortener') {
        if (!/^https?:\/\//i.test(inputVal.trim())) {
          showToast('Enter a full URL starting with http:// or https://', 'error', 'Link Shortener');
          return;
        }
        const res = await fetch('/api/short/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUrl: inputVal.trim() }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const output = `SHORT LINK CREATED\n\n${data.shortUrl}\n→ ${data.targetUrl}\nSlug: ${data.slug} · Cloaked: ${data.cloaked ? 'yes' : 'no'}`;
        setOutputVal(output);
        saveLocalDraft({
          serviceSlug: tool.slug,
          serviceName: tool.name,
          projectName: `Short link: ${data.slug}`,
          inputData: inputVal,
          resultData: output,
        });
        StudioAudio.playSuccessArpeggio();
        showToast('Sovereign short link minted and persisted.', 'success');
        return;
      }

      if (tool.slug === 'diagnostic' || tool.slug === 'sentinel') {
        const url = inputVal.trim();
        if (!/^https?:\/\//i.test(url)) {
          showToast('Enter a full URL starting with http:// or https://', 'error', 'Diagnostic');
          return;
        }
        const res = await fetch('/api/sentinel/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const scan = await res.json();
        if (scan.error) throw new Error(scan.error);
        const lines = [
          `SENTINEL AUDIT — ${scan.url || url}`,
          '',
          `Performance ${scan.scores?.performance ?? '—'} · Accessibility ${scan.scores?.accessibility ?? '—'} · Best Practices ${scan.scores?.bestPractices ?? '—'} · SEO ${scan.scores?.seo ?? '—'}`,
          `FCP ${scan.metrics?.fcp ?? '—'} · LCP ${scan.metrics?.lcp ?? '—'} · CLS ${scan.metrics?.cls ?? '—'} · TBT ${scan.metrics?.tbt ?? '—'}`,
          '',
          ...(scan.issues || []).map((i: any) => `• [${String(i.impact || 'info').toUpperCase()}] ${i.title} — ${i.description}`),
        ];
        const output = lines.join('\n');
        setOutputVal(output);
        await recordModuleExecution(tool.slug, access.userEmail, access.userId);
        saveLocalDraft({
          serviceSlug: tool.slug,
          serviceName: tool.name,
          projectName: `Audit: ${new URL(url).hostname}`,
          inputData: url,
          resultData: output,
        });
        StudioAudio.playSuccessArpeggio();
        showToast('Diagnostic scan completed. Report saved to Workspace.', 'success');
        return;
      }

      // ---------------------------------------------------------------------
      // AI engines — use the tool's own prompt template so inputs serve as designed
      // ---------------------------------------------------------------------
      const placeholder = /\[(INSERT [A-Z ]+|PROMPT)\]/;
      const prompt = placeholder.test(tool.promptTemplate)
        ? tool.promptTemplate.replace(placeholder, inputVal.trim())
        : `${tool.promptTemplate}\n\nInput: ${inputVal.trim()}`;

      const result = await askPrime({
        prompt,
        systemPrompt: `You are the ${tool.name} engine at Jadai Studios. ${tool.what} Deliver immediate, high-fidelity sovereign output.`,
        moduleSlug: tool.slug,
        scope: tool.slug,
      });

      if (!result.text || result.error || result.provider === 'graceful_fallback') {
        // Honest failure — never present a mock as live output, never consume quota
        const sample = await tool.mockResultGenerator(inputVal);
        const reason = result.error || 'the live chain returned no model output';
        setOutputVal(
          `OFFLINE SAMPLE — the live ${tool.name} engine is unreachable right now (${reason}). Your quota was NOT consumed.\n\n${sample}`
        );
        setFallbackModalOpen(true);
        showToast('Live engine unreachable — showing an offline sample.', 'info', 'Warm Fallback');
        return;
      }

      const resultText = result.text;
      setOutputVal(resultText);

      // Record successful execution
      await recordModuleExecution(tool.slug, access.userEmail, access.userId);

      // Auto-save to workspace drafts (Section 5)
      saveLocalDraft({
        serviceSlug: tool.slug,
        serviceName: tool.name,
        projectName: `${tool.name}: ${inputVal.slice(0, 30)}...`,
        inputData: inputVal,
        resultData: resultText,
        thumbnailUrl: tool.backgroundImage,
      });

      StudioAudio.playSuccessArpeggio();
      showToast('Execution successful. Draft saved to Workspace.', 'success');
    } catch (err: any) {
      const fallbackResult = await tool.mockResultGenerator(inputVal);
      setOutputVal(
        `DEGRADED MODE — ${err?.message || 'request failed'}.\nShowing a deterministic sample so you can see the expected shape:\n\n${fallbackResult}`
      );
      setFallbackModalOpen(true);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12 text-[#c4c0bb]">
      {/* Top Breadcrumb & Title */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8a6e2a]">
          <a
            href="/playground"
            onClick={(e) => {
              e.preventDefault();
              onNavigate ? onNavigate('/playground') : (window.location.href = '/playground');
            }}
            className="hover:text-[#C9A84C] transition-colors"
          >
            Playground
          </a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#f5f3f0] capitalize">{tool.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] flex items-center justify-center p-3 shadow-[0_0_25px_rgba(201,168,76,0.15)]">
              <ModuleIcon name={tool.iconName} size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#f5f3f0]">
                  {tool.name}
                </h1>
                <StatusBadge status={tool.status} variant="gold" size="sm" />
              </div>
              <p className="text-xs font-mono text-[#8a6e2a] mt-0.5">{tool.shortTag}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate ? onNavigate('/account/workspace') : (window.location.href = '/account/workspace')}
              className="px-3.5 py-2 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] text-[#f5f3f0] font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>My Drafts</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1 — WHY (Philosophical One-Liner) */}
      <section className="relative p-6 rounded-2xl bg-[#0a0908]/90 border border-[rgba(201,168,76,0.25)] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[rgba(201,168,76,0.12)] to-transparent pointer-events-none" />
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] block mb-2 font-bold">
          Section 1 // Why It Matters
        </span>
        <blockquote className="text-xl sm:text-2xl font-display italic text-[#f5f3f0] leading-snug">
          "{tool.why}"
        </blockquote>
      </section>

      {/* SECTION 2 & 3 — WHAT & HOW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 2 — What */}
        <section className="p-6 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8a6e2a] font-bold block">
            Section 2 // What It Does
          </span>
          <h3 className="text-lg font-display font-bold text-[#f5f3f0]">Plain Language Function</h3>
          <p className="text-xs sm:text-sm text-[#c4c0bb] leading-relaxed">{tool.what}</p>
        </section>

        {/* Section 3 — How */}
        <section className="p-6 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8a6e2a] font-bold block">
            Section 3 // How To Use
          </span>
          <h3 className="text-lg font-display font-bold text-[#f5f3f0]">Step-by-Step Cadence</h3>
          <ol className="space-y-2 text-xs font-mono text-[#c4c0bb]">
            {tool.howSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] text-[#e8c96a] flex items-center justify-center shrink-0 text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* SECTION 4 — BEFORE / AFTER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
            Section 4 // Contrast Vector (Before vs After)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-5 rounded-2xl bg-[#050404] border border-neutral-800 space-y-2">
            <span className="text-[10px] uppercase text-[#8a6e2a] block tracking-wider">
              {tool.beforeAfter.beforeLabel}
            </span>
            <p className="text-neutral-400 leading-relaxed">{tool.beforeAfter.beforeContent}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.3)] space-y-2 shadow-inner">
            <span className="text-[10px] uppercase text-[#e8c96a] block tracking-wider font-bold">
              ✦ {tool.beforeAfter.afterLabel}
            </span>
            <p className="text-[#f5f3f0] leading-relaxed">{tool.beforeAfter.afterContent}</p>
          </div>
        </div>
      </section>

      {/* SECTION 5 — TRY IT NOW (Interactive tool interface) */}
      <section className="space-y-4">
        {tool.slug === 'mirage' || tool.slug === 'logo-designer' || tool.slug === 'thumbnail-generator' ? (
          <RealImageGenerator
            toolName={tool.name}
            toolSlug={tool.slug}
            tagline={tool.shortTag}
            placeholder={tool.defaultInputPlaceholder}
            aestheticSuffix={
              tool.slug === 'logo-designer'
                ? ', modern minimalist brand logo vector, obsidian and metallic gold, sacred geometry, clean sharp edges'
                : tool.slug === 'thumbnail-generator'
                ? ', cinematic YouTube thumbnail, dramatic lighting, high contrast, void black and metallic gold, 4k'
                : ', Jadai Studios aesthetic, void black and gold, cinematic'
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
                  Section 5 // Try It Now
                </span>
                <span className="text-xs text-[#8a6e2a]">●</span>
                <span className="text-xs font-mono text-[#8a6e2a]">
                  {userUsage?.tier && userUsage.tier !== 'free'
                    ? `${userUsage.tier.toUpperCase()} Tier — Unlimited Access`
                    : `Free Trial: ${userUsage ? userUsage.usageCount : 0}/3 tries used`}
                </span>
              </div>

              {(!userUsage || userUsage.tier === 'free') && (
                <button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="text-xs font-mono text-[#e8c96a] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>Subscribe to Unlock Unlimited</span>
                </button>
              )}
            </div>

            <EdgeGlow intensity="subtle" color="gold" borderRadius={24}>
              <div
                style={{ borderRadius: '24px' }}
                className="p-6 bg-[#0a0908] border border-[rgba(201,168,76,0.3)] space-y-5"
              >
                {/* Input Field */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-[#8a6e2a] uppercase tracking-wider block">
                    {tool.defaultInputLabel}
                  </label>
                  <textarea
                    rows={3}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={tool.defaultInputPlaceholder}
                    className="w-full p-3.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#f5f3f0] placeholder:text-neutral-600 focus:outline-none focus:border-[#C9A84C] transition-all"
                  />
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-[#8a6e2a]">
                    Outputs auto-save to persistent draft ledger
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleRunTool}
                      disabled={running || !inputVal.trim()}
                    >
                      <Play className="w-4 h-4 mr-1.5" />
                      <span>{running ? 'Synthesizing...' : `Run ${tool.name}`}</span>
                    </Button>
                  </div>
                </div>

                {/* Output Display */}
                {outputVal && (
                  <div className="mt-4 pt-4 border-t border-[rgba(201,168,76,0.2)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#e8c96a] font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Output Synthesis
                      </span>

                      <button
                        onClick={handleCopyOutput}
                        className="p-1.5 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] transition-colors flex items-center gap-1 text-xs font-mono cursor-pointer"
                      >
                        {copiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedOutput ? 'Copied' : 'Copy Result'}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] font-mono text-xs text-[#f5f3f0] whitespace-pre-wrap leading-relaxed">
                      {outputVal}
                    </div>
                  </div>
                )}
              </div>
            </EdgeGlow>
          </>
        )}
      </section>

      {/* SECTION 6 — INSTRUCTIONS COPY BUTTON */}
      <section className="p-6 rounded-2xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold block mb-1">
              Section 6 // Instructions Prompt Copy
            </span>
            <h4 className="text-sm font-display font-bold text-[#f5f3f0]">
              Take This Engine Anywhere
            </h4>
            <p className="text-xs text-[#8a6e2a] font-mono">
              Ready-to-use prompt calibrated for external LLMs or terminal pipelines.
            </p>
          </div>

          <button
            onClick={handleCopyPrompt}
            className="px-4 py-2.5 rounded-xl bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] transition-all text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shrink-0"
          >
            {copiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedPrompt ? 'Prompt Copied ✦' : 'Copy Prompt'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.15)] font-mono text-xs text-neutral-400 select-all">
          {tool.promptTemplate}
        </div>
      </section>

      {/* Authoritative Subscription Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onNavigate={onNavigate}
        sourceTool={tool.name}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          handleRunTool();
        }}
      />

      {/* Warm Fallback Modal */}
      <WarmFallbackModal
        isOpen={fallbackModalOpen}
        onClose={() => setFallbackModalOpen(false)}
        onRetry={handleRunTool}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default ToolRunnerPage;
