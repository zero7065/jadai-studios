'use client';

import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import CodeBlock from '../ui/CodeBlock';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import {
  Search,
  Activity,
  Globe,
  Radio,
  Share2,
  Download,
  Terminal,
  ShieldCheck,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle,
  FileText,
  BarChart2,
  Zap,
} from 'lucide-react';

export interface SocialDiagnosticReport {
  handle: string;
  platform: 'x' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'threads';
  avatarUrl: string;
  bio: string;
  overallScore: number;
  grade: string;
  followersEstimated: string;
  engagementRate: string;
  cadence: string;
  geoDistribution: {
    country: string;
    code: string;
    percent: number;
    flag: string;
  }[];
  peakTimezones: string[];
  algorithmicVelocity: {
    score: number;
    reachMultiplier: string;
    penaltyRisk: 'Zero (Clean)' | 'Low' | 'Moderate';
    optimalWindow: string;
    retentionSlope: string;
  };
  followerTiers: {
    tier: string;
    percent: number;
    description: string;
  }[];
  recommendations: string[];
  generatedAt: string;
}

export const SocialDiagnosticView: React.FC = () => {
  const [handleInput, setHandleInput] = useState('@hudsonstylez');
  const [platform, setPlatform] = useState<'x' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'threads'>('x');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SocialDiagnosticReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'geo' | 'algorithm' | 'followers' | 'code'>('overview');
  const { showToast } = useToast();

  const handleRunDiagnostic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanHandle = handleInput.trim().replace(/^@/, '');
    if (!cleanHandle) {
      showToast('Please enter a valid social handle or profile URL', 'error');
      return;
    }

    setLoading(true);
    try {
      StudioAudio.playClick();
    } catch {}

    // Simulate forensic fetch with dynamic intelligence
    setTimeout(() => {
      const isFounder = cleanHandle.toLowerCase().includes('hudson') || cleanHandle.toLowerCase().includes('jadai');

      const generatedReport: SocialDiagnosticReport = {
        handle: `@${cleanHandle}`,
        platform,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        bio: isFounder
          ? 'Architect & Software Craftsman @ Jadai Studios. Building sovereign systems from Jos, Plateau.'
          : `Digital Creator & Strategic Operator. Navigating modern media algorithms and distribution.`,
        overallScore: isFounder ? 96 : Math.floor(Math.random() * 22 + 76),
        grade: isFounder ? 'A+' : 'A',
        followersEstimated: isFounder ? '48.2K' : '24.5K',
        engagementRate: isFounder ? '5.8%' : '4.2%',
        cadence: '2.4 posts / day (Peak: 21:47 WAT)',
        geoDistribution: [
          { country: 'Nigeria', code: 'NG', percent: 42, flag: '🇳🇬' },
          { country: 'United States', code: 'US', percent: 24, flag: '🇺🇸' },
          { country: 'United Kingdom', code: 'GB', percent: 16, flag: '🇬🇧' },
          { country: 'Germany', code: 'DE', percent: 8, flag: '🇩🇪' },
          { country: 'Kenya', code: 'KE', percent: 6, flag: '🇰🇪' },
          { country: 'Others', code: 'INTL', percent: 4, flag: '🌐' },
        ],
        peakTimezones: ['21:00 – 23:30 WAT (Highest velocity)', '13:00 – 16:00 EST', '18:00 – 20:30 GMT'],
        algorithmicVelocity: {
          score: isFounder ? 94 : 86,
          reachMultiplier: '3.6x organic reach outside primary follower graph',
          penaltyRisk: 'Zero (Clean)',
          optimalWindow: '21:47 WAT / 16:47 EST',
          retentionSlope: '82% completion rate on long-form transmissions',
        },
        followerTiers: [
          { tier: 'Tier 1: Tech Founders & Verified Architects', percent: 12, description: 'High-leverage accounts with >10K organic followings' },
          { tier: 'Tier 2: Active Creators & Domain Practitioners', percent: 32, description: 'Frequent retweeters, high comment depth nodes' },
          { tier: 'Tier 3: Core Reading & Purchasing Audience', percent: 52, description: 'Consistent consumer cohort with high bookmark rate' },
          { tier: 'Tier 4: Inactive / Ghost Profiles', percent: 4, description: 'Well below 10% platform shadowban threshold' },
        ],
        recommendations: [
          'Maintain transmission timing at 21:47 WAT to capture dual West Africa & US East Coast peak overlap.',
          'Lead with first-principles architectural statements before linking to repos to avoid algorithmic link penalties.',
          'Double-down on technical build teardowns — these generate 4.2x higher bookmark saves than generic opinions.',
          'Leverage video & animated SVG demonstrations to tap current platform preference for high dwell-time media.',
        ],
        generatedAt: new Date().toISOString(),
      };

      setReport(generatedReport);
      setLoading(false);
      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
      showToast(`Diagnostic completed for @${cleanHandle} • Score ${generatedReport.overallScore}/100`, 'success', 'Social Radar');
    }, 1100);
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signal-audit-${report.handle.replace('@', '')}.json`;
    a.click();
    showToast('Telemetry report exported as JSON', 'success');
  };

  const pythonApiSnippet = `import requests

# Query Jadai Signal Social Diagnostic API
API_URL = "https://jadai.dev/api/signal/diagnose"
payload = {
    "handle": "${report ? report.handle : '@your_handle'}",
    "platform": "${platform}",
    "depth": "full_matrix"
}

response = requests.post(API_URL, json=payload)
data = response.json()

print(f"Overall Algorithmic Score: {data['overallScore']}/100")
print(f"Optimal Transmission Cadence: {data['algorithmicVelocity']['optimalWindow']}")`;

  const nodeApiSnippet = `// Node.js / TypeScript SDK Implementation
import { SignalRadarClient } from '@jadai/signal-radar';

const signal = new SignalRadarClient();

async function runSocialAudit() {
  const audit = await signal.diagnose({
    handle: '${report ? report.handle : '@your_handle'}',
    platform: '${platform}',
    includeGeo: true,
  });

  console.log('Top Follower Geography:', audit.geoDistribution);
  console.log('Algorithmic Velocity Multiplier:', audit.algorithmicVelocity.reachMultiplier);
}

runSocialAudit();`;

  return (
    <div className="space-y-6">
      {/* Small Screen Device Adaptability Header Notice */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-xs font-mono">
        <div className="flex items-center gap-2 text-[#e8c96a]">
          <Monitor className="w-4 h-4 text-[#C9A84C]" />
          <span>Multi-Pane Visualizer</span>
        </div>
        <span className="text-[11px] text-[#8a6e2a] hidden sm:inline">
          Interactive analytics dashboard is fully mobile responsive • Rotate or view on desktop for full multi-pane analysis
        </span>
      </div>

      {/* Main Diagnostic Input Bar */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(201,168,76,0.15)] pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#C9A84C] animate-pulse" />
              <span>Social Media Forensic Radar</span>
            </span>
            <h2 className="text-2xl font-display font-bold text-[#f5f3f0] mt-1">
              Social Account Diagnostic & Activity Analysis
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8a6e2a]">
            Zero-API-Token Guest Sandbox • Instant Analysis
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleRunDiagnostic} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Platform picker */}
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="bg-[#050404] border border-[rgba(201,168,76,0.25)] rounded-xl px-3.5 py-3 text-xs font-mono text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="x">X / Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
              <option value="threads">Threads</option>
            </select>

            {/* Handle or URL Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="Enter handle (e.g. @hudsonstylez or profile URL)"
                className="w-full bg-[#050404] border border-[rgba(201,168,76,0.25)] rounded-xl px-4 py-3 text-sm font-mono text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            {/* Execute Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="shrink-0"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#050404] border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-1.5" />
                  <span>Execute Diagnostic</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Audit Results Dashboard */}
      {report && (
        <div className="space-y-6">
          {/* Header Card with Score & Identity */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#C9A84C] relative bg-[#050404] shrink-0">
                  <img src={report.avatarUrl} alt={report.handle} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display font-bold text-[#f5f3f0]">{report.handle}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] text-[10px] font-mono text-[#e8c96a] uppercase">
                      {report.platform.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#8a6e2a] max-w-md line-clamp-2">
                    {report.bio}
                  </p>
                </div>
              </div>

              {/* Score Badges */}
              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[rgba(201,168,76,0.2)] pt-4 md:pt-0 md:pl-6">
                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase text-[#8a6e2a] block">Overall Health</span>
                  <span className="text-3xl font-display font-black text-[#C9A84C]">{report.overallScore}</span>
                  <span className="text-[10px] font-mono text-emerald-400 block font-bold">Grade {report.grade}</span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase text-[#8a6e2a] block">Reach Multiplier</span>
                  <span className="text-2xl font-display font-bold text-[#f5f3f0]">3.6x</span>
                  <span className="text-[10px] font-mono text-[#8a6e2a] block">Viral Factor</span>
                </div>

                <Button variant="outline" size="sm" onClick={handleExportJSON} className="shrink-0 ml-auto md:ml-0">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>Export Report</span>
                </Button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-[rgba(201,168,76,0.15)]">
              {(['overview', 'geo', 'algorithm', 'followers', 'code'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer uppercase ${
                    activeTab === t
                      ? 'bg-[#C9A84C] text-[#050404] font-bold'
                      : 'text-[#8a6e2a] hover:text-[#f5f3f0] hover:bg-[#050404]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Algorithmic Velocity Card */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#C9A84C]" />
                    <h4 className="text-base font-display font-bold text-[#f5f3f0]">Algorithmic Velocity</h4>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {report.algorithmicVelocity.score}/100
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between border-b border-[rgba(201,168,76,0.1)] pb-1.5">
                    <span className="text-[#8a6e2a]">Distribution Multiplier:</span>
                    <span className="text-[#f5f3f0]">{report.algorithmicVelocity.reachMultiplier}</span>
                  </div>
                  <div className="flex justify-between border-b border-[rgba(201,168,76,0.1)] pb-1.5">
                    <span className="text-[#8a6e2a]">Penalty / Shadowban Risk:</span>
                    <span className="text-emerald-400 font-bold">{report.algorithmicVelocity.penaltyRisk}</span>
                  </div>
                  <div className="flex justify-between border-b border-[rgba(201,168,76,0.1)] pb-1.5">
                    <span className="text-[#8a6e2a]">Optimal Transmission Window:</span>
                    <span className="text-[#e8c96a] font-bold">{report.algorithmicVelocity.optimalWindow}</span>
                  </div>
                  <div className="flex justify-between pb-1.5">
                    <span className="text-[#8a6e2a]">Audience Retention Slope:</span>
                    <span className="text-[#f5f3f0]">{report.algorithmicVelocity.retentionSlope}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Actionable Recommendations */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C9A84C]" />
                  <h4 className="text-base font-display font-bold text-[#f5f3f0]">Actionable Growth Directives</h4>
                </div>
                <ul className="space-y-2.5 text-xs text-[#c4c0bb]">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          )}

          {/* TAB 2: GEOGRAPHICAL ANALYSIS */}
          {activeTab === 'geo' && (
            <GlassCard className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.15)] pb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#C9A84C]" />
                  <h4 className="text-base font-display font-bold text-[#f5f3f0]">
                    Audience Geographical Distribution
                  </h4>
                </div>
                <span className="text-xs font-mono text-[#8a6e2a]">Based on IP & Edge Node Latency</span>
              </div>

              {/* Country Bars */}
              <div className="space-y-3">
                {report.geoDistribution.map((item) => (
                  <div key={item.code} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#f5f3f0] flex items-center gap-1.5">
                        <span>{item.flag}</span>
                        <span>{item.country}</span>
                      </span>
                      <span className="text-[#C9A84C] font-bold">{item.percent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#050404] overflow-hidden border border-[rgba(201,168,76,0.2)]">
                      <div
                        className="h-full bg-gradient-to-r from-[#8a6e2a] to-[#C9A84C] rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Peak Active Timezones */}
              <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C9A84C]">
                  Peak Active Timezone Windows
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {report.peakTimezones.map((tz, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#e8c96a]"
                    >
                      {tz}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 3: ALGORITHM VELOCITY */}
          {activeTab === 'algorithm' && (
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#C9A84C]" />
                <h4 className="text-base font-display font-bold text-[#f5f3f0]">
                  Algorithmic Distribution Metrics
                </h4>
              </div>
              <p className="text-xs text-[#c4c0bb]">
                Signal reverse-engineers distribution algorithms across X, Instagram, and LinkedIn to identify shadowban flags and content amplification vectors.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-1">
                  <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Dwell Time Score</span>
                  <p className="text-xl font-display font-bold text-[#f5f3f0]">8.4 / 10</p>
                  <p className="text-[10px] font-mono text-emerald-400">High Reader Retention</p>
                </div>
                <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-1">
                  <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Bookmark Velocity</span>
                  <p className="text-xl font-display font-bold text-[#f5f3f0]">14.2%</p>
                  <p className="text-[10px] font-mono text-emerald-400">Superior Reference Value</p>
                </div>
                <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-1">
                  <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Link Penalty Damping</span>
                  <p className="text-xl font-display font-bold text-[#f5f3f0]">0.0%</p>
                  <p className="text-[10px] font-mono text-emerald-400">No Suppression Detected</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 4: FOLLOWER TIERS */}
          {activeTab === 'followers' && (
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C9A84C]" />
                <h4 className="text-base font-display font-bold text-[#f5f3f0]">
                  Major Follower & Tier Analysis
                </h4>
              </div>

              <div className="space-y-3">
                {report.followerTiers.map((tier, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-display font-bold text-[#f5f3f0]">{tier.tier}</span>
                      <span className="text-xs font-mono text-[#C9A84C] font-bold">{tier.percent}%</span>
                    </div>
                    <p className="text-xs font-mono text-[#8a6e2a]">{tier.description}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* TAB 5: CODE STACK & SDK */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#C9A84C]" />
                  <h4 className="text-base font-display font-bold text-[#f5f3f0]">
                    Developer API & Integration Stack
                  </h4>
                </div>
                <p className="text-xs text-[#c4c0bb]">
                  Incorporate Signal social intelligence directly into your sovereign applications or automated bots:
                </p>

                <div className="space-y-4">
                  <CodeBlock
                    code={nodeApiSnippet}
                    language="typescript"
                    title="SIGNAL_NODE_SDK.TS"
                  />
                  <CodeBlock
                    code={pythonApiSnippet}
                    language="python"
                    title="SIGNAL_PYTHON_CLIENT.PY"
                  />
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialDiagnosticView;
