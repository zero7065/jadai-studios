import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import { Settings, Eye, EyeOff, CheckCircle, RefreshCw, Key, ShieldCheck, Save, Globe, UserCog } from 'lucide-react';

interface KeyConfig {
  id: string;
  label: string;
  envKey: string;
  value: string;
  revealed: boolean;
  testing: boolean;
  configured?: boolean;
  testResult?: { ok: boolean; latency: number; msg: string };
}

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // API Keys state with 15-second auto-hide
  const [keys, setKeys] = useState<KeyConfig[]>([
    {
      id: 'groq',
      label: 'Groq API Key (Primary: openai/gpt-oss-120b)',
      envKey: 'GROQ_API_KEY',
      value: '',
      revealed: false,
      testing: false,
    },
    {
      id: 'gemini',
      label: 'Google Gemini API Key (Secondary Failover)',
      envKey: 'GEMINI_API_KEY',
      value: '',
      revealed: false,
      testing: false,
    },
    {
      id: 'paystack_secret',
      label: 'Paystack Secret Key (HMAC Verification)',
      envKey: 'PAYSTACK_SECRET_KEY',
      value: '',
      revealed: false,
      testing: false,
    },
    {
      id: 'paystack_public',
      label: 'Paystack Public Key (Client Elements)',
      envKey: 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
      value: '',
      revealed: false,
      testing: false,
    },
    {
      id: 'google_psi',
      label: 'Google PageSpeed Insights API Key',
      envKey: 'GOOGLE_PSI_API_KEY',
      value: '',
      revealed: false,
      testing: false,
    },
  ]);

  // Real configured-status per key, read from the server's process.env.
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((res) => {
        const runtime = res?.runtime;
        if (runtime) {
          setKeys((prev) => prev.map((k) => ({ ...k, configured: Boolean(runtime[k.id]) })));
        }
      })
      .catch(() => {});
  }, []);

  // Load real configured-status from the server (process.env truth).
  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((res) => {
        if (cancelled || !res?.runtime) return;
        setKeys((prev) =>
          prev.map((k) => ({ ...k, configured: Boolean(res.runtime[k.id]) }))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Admin credentials state
  const [credEmail, setCredEmail] = useState('');
  const [credCurrentPw, setCredCurrentPw] = useState('');
  const [credNewPw, setCredNewPw] = useState('');
  const [credSaving, setCredSaving] = useState(false);

  // Load current admin email
  useEffect(() => {
    fetch('/api/admin/credentials')
      .then((r) => r.json())
      .then((res) => { if (res?.email) setCredEmail(res.email); })
      .catch(() => {});
  }, []);

  // General Settings State
  const [siteStatus, setSiteStatus] = useState<'live' | 'maintenance' | 'coming_soon'>('live');
  const [watermarkText, setWatermarkText] = useState('© JADAI STUDIOS | jadai.dev | BUILD DIFFERENT');
  const [oracleDailyLimit, setOracleDailyLimit] = useState(50);
  const [contactEmail, setContactEmail] = useState('jadaistudiosoffcl@gmail.com');
  const [contactWhatsapp, setContactWhatsapp] = useState('+234 810 000 0000');
  const [recoveryCode, setRecoveryCode] = useState(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );

  const handleToggleReveal = (id: string) => {
    StudioAudio.playClick();
    setKeys((prev) =>
      prev.map((k) => {
        if (k.id === id) {
          const nextState = !k.revealed;
          if (nextState) {
            // Auto hide after 15 seconds
            setTimeout(() => {
              setKeys((current) =>
                current.map((curr) => (curr.id === id ? { ...curr, revealed: false } : curr))
              );
            }, 15000);
          }
          return { ...k, revealed: nextState };
        }
        return k;
      })
    );
  };

  const handleTestKey = async (id: string) => {
    StudioAudio.playClick();
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, testing: true, testResult: undefined } : k))
    );

    // Real connectivity probe executed server-side (env keys never leave the server).
    try {
      const res = await fetch('/api/admin/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: id }),
      });
      const data = await res.json().catch(() => null);
      const ok = Boolean(data?.ok);
      const latency = Number(data?.latencyMs || 0);
      const msg = ok
        ? data?.msg || `Connected in ${latency}ms`
        : data?.error || data?.msg || 'Test failed';

      setKeys((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, testing: false, configured: ok ? true : k.configured, testResult: { ok, latency, msg } }
            : k
        )
      );
      showToast(msg, ok ? 'success' : 'error', ok ? 'Connection Verified' : 'Test Failed');
      if (ok) StudioAudio.playChime();
    } catch {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, testing: false, testResult: { ok: false, latency: 0, msg: 'Server unreachable — test not run' } }
            : k
        )
      );
      showToast('Server unreachable — connection test could not run.', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    StudioAudio.playClick();

    const entries: Array<[string, unknown]> = [
      ['site_status', siteStatus],
      ['watermark_text', watermarkText],
      ['oracle_daily_limit', oracleDailyLimit],
      ['contact_email', contactEmail],
      ['contact_whatsapp', contactWhatsapp],
      ['recovery_code', recoveryCode],
    ];

    try {
      let saved = 0;
      const failures: string[] = [];
      for (const [key, value] of entries) {
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
        const data = await res.json().catch(() => null);
        if (data?.success) saved++;
        else failures.push(`${key}: ${data?.error || 'request failed'}`);
      }

      setSaving(false);
      if (failures.length === 0) {
        StudioAudio.playSuccessArpeggio();
        showToast(`Saved ${saved} settings to admin_settings (caches invalidated).`, 'success', 'Configuration Saved');
      } else if (saved > 0) {
        showToast(`Saved ${saved}/${entries.length} — failures: ${failures.join('; ')}`, 'error', 'Partial Save');
      } else {
        showToast(`No settings saved — ${failures.join('; ')}`, 'error', 'Save Failed');
      }
    } catch {
      setSaving(false);
      showToast('Server unreachable — settings were not saved.', 'error', 'Save Failed');
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!credCurrentPw) { showToast('Enter your current password to confirm.', 'error', 'Confirmation Required'); return; }
    setCredSaving(true);
    StudioAudio.playClick();
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: credCurrentPw, email: credEmail, newPassword: credNewPw || undefined }),
      });
      const data = await res.json();
      setCredSaving(false);
      if (data.success) {
        setCredCurrentPw(''); setCredNewPw('');
        StudioAudio.playSuccessArpeggio();
        showToast(`Admin credentials updated for ${data.email}.`, 'success', 'Credentials Saved');
      } else {
        showToast(data.error || 'Failed to update credentials', 'error', 'Update Failed');
      }
    } catch {
      setCredSaving(false);
      showToast('Server unreachable — credentials not saved.', 'error', 'Save Failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Configuration Vault</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">Master Control Settings</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Manage API credentials, 15s auto-masked secrets, payment gateways, and contact coordinates.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: API Keys & Secrets */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[rgba(201,168,76,0.15)] pb-3">
            <Key className="w-4 h-4 text-[#C9A84C]" />
            <h2 className="text-base font-display font-bold text-[#f5f3f0]">Encrypted API Key Manager (ADD 3)</h2>
          </div>
          <p className="text-xs text-[#c4c0bb]">
            Keys are stored securely in the <code className="text-[#e8c96a]">admin_settings</code> table. Click "Show" to reveal in plaintext or "Update" to persist new credentials.
          </p>

          <div className="space-y-4 pt-2">
            {keys.map((k) => {
              const isSet = Boolean(k.value && k.value.trim().length > 3);
              return (
                <div
                  key={k.id}
                  className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-2.5 font-mono text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-[#f5f3f0]">{k.label}</span>
                    <div className="flex items-center gap-2">
                      {k.testResult && (
                        <span
                          className={`text-[11px] flex items-center gap-1 ${
                            k.testResult.ok ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {k.testResult.msg}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleTestKey(k.id)}
                        disabled={k.testing}
                        className="px-2.5 py-1 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-[10px] text-[#8a6e2a] hover:text-[#C9A84C] flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${k.testing ? 'animate-spin' : ''}`} />
                        <span>{k.testing ? 'Testing...' : 'Test Connection'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type={k.revealed ? 'text' : 'password'}
                      value={k.value}
                      placeholder={k.revealed ? 'Enter key value...' : '••••••••••••••••'}
                      onChange={(e) => {
                        const v = e.target.value;
                        setKeys((prev) => prev.map((item) => (item.id === k.id ? { ...item, value: v } : item)));
                      }}
                      className="flex-1 px-3 py-2 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-[#e8c96a] text-xs font-mono focus:outline-none focus:border-[#C9A84C]"
                    />

                    {/* Show / Hide Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleReveal(k.id)}
                      className="px-3 py-2 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-[#c4c0bb] hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      {k.revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{k.revealed ? 'Hide' : 'Show'}</span>
                    </button>

                    {/* Individual Update Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        StudioAudio.playClick();
                        try {
                          const res = await fetch('/api/admin/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              key: k.envKey.toLowerCase(),
                              value: k.value,
                            }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            StudioAudio.playSuccessArpeggio();
                            showToast(`${k.label.split(' ')[0]} updated in admin_settings table.`, 'success', 'Key Saved');
                          } else {
                            showToast(data.error || 'Failed to update key', 'error');
                          }
                        } catch {
                          showToast('Server unreachable — key was not saved.', 'error', 'Save Failed');
                        }
                      }}
                      className="px-3.5 py-2 rounded bg-[#C9A84C] text-[#050404] font-bold text-xs hover:bg-[#e8c96a] transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      Update
                    </button>
                  </div>

                  {/* Below each key: status indicator */}
                  <div className="pt-0.5">
                    {k.configured ? (
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Active — configured on server
                      </span>
                    ) : isSet ? (
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Value entered — click Update to persist
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> Not set — enter key to activate
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Section 2: Platform Behavior & Limits */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[rgba(201,168,76,0.15)] pb-3">
            <Settings className="w-4 h-4 text-[#C9A84C]" />
            <h2 className="text-base font-display font-bold text-[#f5f3f0]">Platform Execution & Limits</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Platform Status</label>
              <select
                value={siteStatus}
                onChange={(e) => setSiteStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              >
                <option value="live">Live Production (Normal)</option>
                <option value="maintenance">Maintenance Overlay</option>
                <option value="coming_soon">Restricted Launch Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Oracle Free Daily Allowance</label>
              <input
                type="number"
                value={oracleDailyLimit}
                onChange={(e) => setOracleDailyLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs pt-2">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Master Contact Transmission</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              />
            </div>

            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">
                20-Tap Recovery Passcode
              </label>
              <input
                type="text"
                maxLength={4}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#39FF14] font-bold"
              />
            </div>
          </div>
        </GlassCard>

        {/* Save CTA */}
        <div className="flex justify-end">
          <Button variant="primary" size="md" type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Synchronizing Cluster...' : 'Commit Configuration'}
          </Button>
        </div>
      </form>

      {/* Section 3: Admin Credentials (self-contained form) */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[rgba(201,168,76,0.15)] pb-3">
          <UserCog className="w-4 h-4 text-[#C9A84C]" />
          <h2 className="text-base font-display font-bold text-[#f5f3f0]">Admin Login Credentials</h2>
        </div>
        <p className="text-xs text-[#c4c0bb]">
          Change the admin email and password used to sign into this dashboard. A new session is issued immediately on save.
        </p>

        <form onSubmit={handleSaveCredentials} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Admin Email</label>
              <input
                type="email"
                value={credEmail}
                onChange={(e) => setCredEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              />
            </div>
            <div>
              <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">Current Password (required)</label>
              <input
                type="password"
                value={credCurrentPw}
                onChange={(e) => setCredCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
              />
            </div>
          </div>

          <div className="font-mono text-xs">
            <label className="block text-[#8a6e2a] uppercase text-[10px] mb-1">New Password (leave blank to keep current)</label>
            <input
              type="password"
              value={credNewPw}
              onChange={(e) => setCredNewPw(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
            />
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="md" type="submit" disabled={credSaving}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              {credSaving ? 'Updating Credentials...' : 'Update Credentials'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
