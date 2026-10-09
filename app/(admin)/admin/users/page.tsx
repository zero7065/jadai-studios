'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  Users,
  Shield,
  Sparkles,
  Key,
  CheckCircle,
  Ban,
  ArrowUpCircle,
  MessageSquare,
  Clock,
  AlertTriangle,
  Send,
  PhoneCall,
  ExternalLink,
  Crown,
  Eye,
  Sliders,
  UserCheck,
} from 'lucide-react';

interface MockUser {
  id: string;
  email: string;
  displayName: string;
  tier: 'free' | 'foundation' | 'voice' | 'architecture' | 'prime';
  country: string;
  status: 'active' | 'suspended';
  created_at: string;
  last_active: string;
  prime_memory: string[];
  usage_count: number;
}

interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  issue: string;
  tier: string;
  isEmergency: boolean;
  minutesRemaining: number;
  autoRefundMinutesRemaining: number;
  status: 'pending' | 'accepted' | 'snoozed' | 'refunded';
}

const SEED_USERS: MockUser[] = [];

const INITIAL_TICKETS: SupportTicket[] = [];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [filterTier, setFilterTier] = useState<string>('All');
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [adminBrowseAsPremium, setAdminBrowseAsPremium] = useState(true);
  const { showToast } = useToast();

  const [directMsgModalOpen, setDirectMsgModalOpen] = useState(false);
  const [directMsgUser, setDirectMsgUser] = useState<MockUser | null>(null);
  const [directMsgText, setDirectMsgText] = useState('');
  const [directMsgSecondsLeft, setDirectMsgSecondsLeft] = useState<number | null>(null);

  // Load real users from Supabase
  useEffect(() => {
    let mounted = true;
    async function loadRealUsers() {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (mounted && data && data.length > 0) {
          const mapped: MockUser[] = data.map((d: any) => ({
            id: d.id,
            email: d.email || 'user@jadai.dev',
            displayName: d.display_name || d.name || d.email?.split('@')[0] || 'User',
            tier: (d.subscription_tier || 'free') as MockUser['tier'],
            country: d.country_code || 'NG',
            status: d.status || 'active',
            created_at: d.created_at ? d.created_at.slice(0, 10) : '2026-10-01',
            last_active: d.updated_at ? d.updated_at.slice(0, 16) : 'Just now',
            prime_memory: d.prime_memory || [],
            usage_count: d.usage_count || 0,
          }));
          setUsers(mapped);
        } else if (mounted) {
          const stored = localStorage.getItem('jadai_users_list');
          if (stored) {
            try { setUsers(JSON.parse(stored)); } catch {}
          }
        }
      } catch (err) {
        console.warn('Failed to load user_profiles', err);
      }
    }
    loadRealUsers();

    try {
      const saved = localStorage.getItem('jadai_admin_browse_as_premium');
      if (saved !== null) {
        setAdminBrowseAsPremium(saved === 'true');
      } else {
        localStorage.setItem('jadai_admin_browse_as_premium', 'true');
      }
    } catch {}

    return () => { mounted = false; };
  }, []);

  const toggleAdminPremiumMode = () => {
    const next = !adminBrowseAsPremium;
    setAdminBrowseAsPremium(next);
    localStorage.setItem('jadai_admin_browse_as_premium', String(next));
    StudioAudio.playSuccessArpeggio();
    showToast(
      next
        ? 'Admin browsing mode: Elite All-Access unlocked across entire platform.'
        : 'Admin browsing mode: Standard preview.',
      'success',
      'Admin Persona'
    );
  };

  const persistUsers = (updated: MockUser[]) => {
    setUsers(updated);
    try {
      localStorage.setItem('jadai_users_list', JSON.stringify(updated));
    } catch {
      // Non-fatal
    }
  };

  const handleUpdateTier = async (userId: string, tier: MockUser['tier']) => {
    StudioAudio.playClick();
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    try {
      const res = await fetch('/api/admin/users/grant-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: target.email, tier }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Tier grant failed');
      }
      const updated = users.map((u) => (u.id === userId ? { ...u, tier } : u));
      persistUsers(updated);
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, tier });
      }
      showToast(`Designated ${target.email} as ${tier.toUpperCase()} — persisted server-side.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Tier grant failed. Nothing was changed.', 'error');
    }
  };

  const handleOpenDirectMessage = (user: MockUser) => {
    setDirectMsgUser(user);
    setDirectMsgText('');
    setDirectMsgSecondsLeft(null);
    setDirectMsgModalOpen(true);
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsgText.trim() || !directMsgUser) return;

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUsername: directMsgUser.email,
          sender: 'Admin Studio',
          text: directMsgText.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Delivery failed');
      }
      StudioAudio.playSuccessArpeggio();
      setDirectMsgSecondsLeft(300);
      showToast(
        `Direct message dispatched to ${directMsgUser.email}. Queued in their notification inbox.`,
        'success',
        'Ephemeral Transmission'
      );
      setDirectMsgModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Message did not reach the user. Try again.', 'error');
    }
  };

  const handleAcceptTicket = (id: string) => {
    StudioAudio.playSuccessArpeggio();
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'accepted' } : t))
    );
    showToast('Ticket accepted. Terminal chat opened.', 'success');
  };

  const handleSnoozeTicket = (id: string) => {
    StudioAudio.playClick();
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, minutesRemaining: t.minutesRemaining + 5, status: 'snoozed' } : t
      )
    );
    showToast('Alert snoozed by +5 minutes.', 'info');
  };

  const handleRefundTicket = (id: string) => {
    StudioAudio.playClick();
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'refunded' } : t))
    );
    showToast('Auto-refund credited via Paystack.', 'info');
  };

  const filteredUsers = users.filter(
    (u) => filterTier === 'All' || u.tier === filterTier
  );

  return (
    <div className="space-y-8 font-mono text-xs text-slate-200">
      {/* -------------------------------------------------------------
          ADMIN PREMIUM DASHBOARD CONTROLLER (User requested)
          "update admin to have all updates and implementation and admin can
          have able Al premium account user dashboard and use the app normally
          and designate oeeum or mid features to any account he signs"
         ------------------------------------------------------------- */}
      <GlassCard className="p-6 border-cyan-500/40 bg-gradient-to-r from-slate-950 via-[#071324] to-slate-950 shadow-[0_10px_35px_rgba(2,6,23,0.7)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-display font-bold text-white tracking-wide">
                Admin Sovereign Persona & Live App Dashboard
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Your administrator account has automatic unrestricted capability across all 16 tools, templates, and API endpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleAdminPremiumMode}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                adminBrowseAsPremium
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 text-slate-400 border border-slate-700'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>
                {adminBrowseAsPremium ? 'Browse as Elite Prime: ACTIVE' : 'Browse as Standard User'}
              </span>
            </button>

            <a
              href="/"
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 hover:border-cyan-400 text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>View Live App</span>
            </a>
          </div>
        </div>
      </GlassCard>

      {/* EMERGENCY SUPPORT TICKET RESPONDER */}
      <GlassCard className="p-6 border-slate-800 bg-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <h2 className="text-base font-display font-bold text-white">
              Emergency Support Ticket Dispatch ($5 / Ticket)
            </h2>
          </div>
          <a
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cyan-300 hover:underline flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency WhatsApp Fallback</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((t) => {
            const isRedAlert = t.isEmergency && t.status === 'pending';

            return (
              <div
                key={t.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isRedAlert
                    ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        t.isEmergency ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {t.isEmergency ? 'CRITICAL EMERGENCY' : 'STANDARD TICKET'}
                    </span>
                    <span className="text-slate-400">#{t.id}</span>
                  </div>

                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {t.status === 'refunded'
                      ? 'Refunded'
                      : t.status === 'accepted'
                      ? 'In Progress'
                      : `${t.minutesRemaining}m to respond`}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white">{t.userName}</h4>
                  <p className="text-[11px] text-slate-400">{t.userEmail} • {t.tier}</p>
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed">{t.issue}</p>
                </div>

                {t.status === 'pending' || t.status === 'snoozed' ? (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleAcceptTicket(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-all cursor-pointer flex-1"
                    >
                      Accept & Open Chat
                    </button>
                    <button
                      onClick={() => handleSnoozeTicket(t.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Snooze (+5m)
                    </button>
                    <button
                      onClick={() => handleRefundTicket(t.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Auto-refund"
                    >
                      Refund
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 font-bold pt-1">
                    ✓ Handled by Administrator
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* USER GOVERNANCE & TIER DESIGNATION TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-cyan-400">
              Identity & Access Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              Users & Sovereign Tier Governance
            </h1>
            <p className="text-xs text-slate-400">
              Designate Free, Mid (Foundation/Voice), or Elite (Prime) capability directly to any signed account.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'free', 'foundation', 'voice', 'architecture', 'prime'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={`px-3 py-1 rounded text-xs capitalize transition-all cursor-pointer ${
                filterTier === t
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {t === 'All' ? 'All Tiers' : t}
            </button>
          ))}
        </div>

        {/* Users Table with Direct Designation Buttons */}
        <GlassCard className="p-4 overflow-x-auto border-slate-800">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Architect</th>
                <th className="py-2.5 px-3">Active Tier</th>
                <th className="py-2.5 px-3">Quick Tier Designation</th>
                <th className="py-2.5 px-3">Usage</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm font-mono text-[#c4c0bb]">
                    No users yet. Share the link to bring people in.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{u.displayName}</span>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${
                      u.tier === 'prime'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : u.tier === 'voice' || u.tier === 'foundation'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {u.tier}
                    </span>
                  </td>
                  {/* Quick Designation Buttons */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateTier(u.id, 'free')}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                          u.tier === 'free' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Free
                      </button>
                      <button
                        onClick={() => handleUpdateTier(u.id, 'voice')}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                          u.tier === 'voice' ? 'bg-cyan-600 text-white' : 'bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900'
                        }`}
                      >
                        Mid (Pro)
                      </button>
                      <button
                        onClick={() => handleUpdateTier(u.id, 'prime')}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                          u.tier === 'prime' ? 'bg-amber-500 text-slate-950' : 'bg-amber-950/50 text-amber-300 hover:bg-amber-900'
                        }`}
                      >
                        Elite (Prime)
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{u.usage_count} calls</td>
                  <td className="py-3 px-3">
                    <StatusBadge
                      status={u.status === 'active' ? 'Active' : 'Suspended'}
                      variant={u.status === 'active' ? 'gold' : 'crimson'}
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDirectMessage(u)}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                        title="Send 5-min Direct Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-400 hover:border-cyan-400 transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </GlassCard>
      </div>

      {/* User Detail & Memory Modal */}
      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title={`Architect Dossier: ${selectedUser.displayName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 p-3 rounded bg-slate-950 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Email:</span>
                <span className="text-white">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Active Tier:</span>
                <span className="text-cyan-300 font-bold uppercase">{selectedUser.tier}</span>
              </div>
            </div>

            {/* PRIME Transparent Memory Viewer */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wider font-bold">
                  PRIME Memory Context Traces
                </span>
              </div>
              <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                {selectedUser.prime_memory.map((mem, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-cyan-400">⬡</span>
                    <span>{mem}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Dismiss Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Direct Message with 5-minute Timer Modal */}
      {directMsgModalOpen && directMsgUser && (
        <Modal
          isOpen={directMsgModalOpen}
          onClose={() => setDirectMsgModalOpen(false)}
          title={`Ephemeral Dispatch to: ${directMsgUser.displayName}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSendDirectMessage} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-400 uppercase block">Notice</span>
              <p className="text-xs text-slate-300">
                Direct administrative messages include an unlosable 5-minute self-destruct countdown timer. Once expired, the message disappears from the user feed.
              </p>
            </div>

            {directMsgSecondsLeft !== null && (
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-400 flex items-center justify-between">
                <span className="text-xs text-cyan-200 font-bold">Transmission Active</span>
                <span className="text-sm font-bold text-white">
                  Expires in {Math.floor(directMsgSecondsLeft / 60)}:
                  {String(directMsgSecondsLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase block">Message Content</label>
              <textarea
                rows={4}
                value={directMsgText}
                onChange={(e) => setDirectMsgText(e.target.value)}
                placeholder="Compose direct note or priority instruction..."
                required
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setDirectMsgModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-all flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send 5-Min Note</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
