import React, { useState, useEffect } from 'react';
import GlassCard from '../../../components/ui/GlassCard';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import { runSelfCheck, SelfCheckReport } from '../../../lib/diagnostics/self-check';
import { useToast } from '../../../components/providers/ToastProvider';
import {
  Activity,
  Users,
  DollarSign,
  Mail,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  Layers,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [report, setReport] = useState<SelfCheckReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  const fetchHealth = async (full = false) => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/diagnostic', {
        method: full ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: full ? JSON.stringify({ run_full: true }) : undefined,
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch {
      // In-memory fallback
      const r = await runSelfCheck(full);
      setReport(r);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth(false);
    const interval = setInterval(() => fetchHealth(false), 300000); // 5 min auto refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Command Center</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">Master Control Room</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Motto: Build the floor • Autonomous diagnostic telemetry, revenue tracking, and prime intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchHealth(true)} disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Auditing System...' : 'Execute Full Audit'}</span>
          </Button>
        </div>
      </div>

      {/* Row 1: Four Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Registered Architects</span>
            <Users className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#f5f3f0]">1,420</div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18 new today
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Active Subscriptions</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#f5f3f0]">342</div>
          <div className="text-[10px] font-mono text-[#8a6e2a]">Prime, Voice & Foundation</div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Monthly Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#e8c96a]">₦4,850,000</div>
          <div className="text-[10px] font-mono text-[#8a6e2a]">≈ $3,450 USD (Paystack)</div>
        </GlassCard>

        <GlassCard className="p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Newsletter Subscribers</span>
            <Mail className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#f5f3f0]">2,890</div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +42 this week
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Daily AI Report by PRIME & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PRIME Daily Executive Brief */}
        <GlassCard className="lg:col-span-7 p-6 space-y-4 border-[rgba(201,168,76,0.3)]">
          <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.15)] pb-3">
            <div className="flex items-center gap-2 text-[#C9A84C]">
              <Sparkles className="w-4 h-4" />
              <h2 className="font-display font-bold text-sm text-[#f5f3f0]">
                PRIME Daily Intelligence Report
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#8a6e2a]">Autonomous Synthesis</span>
          </div>

          <div className="space-y-3 font-mono text-xs text-[#c4c0bb] leading-relaxed bg-[#050404] p-4 rounded border border-[rgba(201,168,76,0.15)]">
            <p className="text-[#e8c96a] font-bold">
              [SUMMARY]: Platform operating at high structural efficiency across all 20 PostgreSQL schemas.
            </p>
            <p>
              • <strong>Inference Health:</strong> Groq primary responded to 98.2% of inquiries at average 410ms. Gemini seamlessly caught 12 rate-limited failovers with zero user dropouts.
            </p>
            <p>
              • <strong>Content Cadence:</strong> Nightly 9:47 PM transmission pipeline delivered to 1,420 registered endpoints without failure. Riddle resolution rate is 34.6%.
            </p>
            <p>
              • <strong>Marketplace:</strong> Aperture photography portfolio starter generated 8 new licenses via Paystack dual-currency checkout.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8a6e2a] pt-1">
            <span>Next Automated Audit: In 4 hours</span>
            <span className="text-[#C9A84C]">Zero Chunk Code Enforced</span>
          </div>
        </GlassCard>

        {/* System Health Telemetry */}
        <GlassCard className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.15)] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C9A84C]" />
              <h3 className="font-display font-bold text-sm text-[#f5f3f0]">Active Health Telemetry</h3>
            </div>
            {report && (
              <StatusBadge status={report.ok ? 'Operational' : 'Attention'} variant={report.ok ? 'gold' : 'crimson'} />
            )}
          </div>

          {report ? (
            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex justify-between">
                <span className="text-[#8a6e2a]">Supabase DB Status:</span>
                <span className="text-[#f5f3f0] font-bold capitalize">{report.checks.database.status}</span>
              </div>
              <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex justify-between">
                <span className="text-[#8a6e2a]">AI Avg Latency:</span>
                <span className="text-[#f5f3f0] font-bold">{report.checks.metrics_24h.avg_ai_latency_ms}ms</span>
              </div>
              <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex justify-between">
                <span className="text-[#8a6e2a]">Cache Hit Ratio:</span>
                <span className="text-emerald-400 font-bold">{report.checks.metrics_24h.cache_hit_rate_pct}%</span>
              </div>
              <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex justify-between">
                <span className="text-[#8a6e2a]">Error Rate (24h):</span>
                <span className="text-emerald-400 font-bold">{report.checks.metrics_24h.error_rate_pct}%</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-mono text-[#8a6e2a]">
              Inspecting system telemetry...
            </div>
          )}
        </GlassCard>
      </div>

      {/* Row 3: Pending Review Items & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Items */}
        <GlassCard className="lg:col-span-6 p-6 space-y-4">
          <h3 className="font-display font-bold text-sm text-[#f5f3f0] border-b border-[rgba(201,168,76,0.15)] pb-3">
            Pending Tasks & Action Items
          </h3>
          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f5f3f0] block">JadaiHub Mission Proposal</span>
                <span className="text-[11px] text-[#8a6e2a]">"Building Low-Bandwidth WAEC Mock Simulator"</span>
              </div>
              <a href="/admin/hub" className="text-xs text-[#C9A84C] hover:underline">
                Review →
              </a>
            </div>

            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f5f3f0] block">Client Architectural Audit Deposit</span>
                <span className="text-[11px] text-[#8a6e2a]">₦350,000 via Paystack awaiting debrief scheduling</span>
              </div>
              <a href="/admin/users" className="text-xs text-[#C9A84C] hover:underline">
                Schedule →
              </a>
            </div>

            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f5f3f0] block">Book of Lies Draft Episode</span>
                <span className="text-[11px] text-[#8a6e2a]">Act 3 Chapter awaiting publishing sign-off</span>
              </div>
              <a href="/admin/book-of-lies" className="text-xs text-[#C9A84C] hover:underline">
                Approve →
              </a>
            </div>
          </div>
        </GlassCard>

        {/* Recent Admin Audit Activity Feed */}
        <GlassCard className="lg:col-span-6 p-6 space-y-4">
          <h3 className="font-display font-bold text-sm text-[#f5f3f0] border-b border-[rgba(201,168,76,0.15)] pb-3">
            Admin Sovereign Audit Ledger
          </h3>
          <div className="space-y-2.5 font-mono text-xs">
            {[
              { action: 'Paystack Webhook Verified', target: 'order_#8914', time: '12m ago', user: 'system' },
              { action: 'PWA Service Worker Cached', target: 'manifest.json v1', time: '45m ago', user: 'client' },
              { action: 'PRIME Memory Trace Extracted', target: 'architect.dave@gmail.com', time: '2h ago', user: 'oracle' },
              { action: 'Full Diagnostic Audit Cleared', target: 'self-check.ts', time: '3h ago', user: 'admin' },
              { action: 'Nightly 9:47 PM Delivery Dispatched', target: '1,420 devices', time: 'Yesterday 21:47', user: 'cron' },
            ].map((log, i) => (
              <div
                key={i}
                className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.1)] flex items-center justify-between text-[11px]"
              >
                <div>
                  <span className="text-[#f5f3f0] font-bold block">{log.action}</span>
                  <span className="text-[#8a6e2a]">{log.target}</span>
                </div>
                <div className="text-right text-[#8a6e2a]">
                  <span>{log.time}</span>
                  <span className="block text-[10px] text-[#C9A84C]">[{log.user}]</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
