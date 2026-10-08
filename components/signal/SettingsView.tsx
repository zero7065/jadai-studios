'use client';

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import { SignalSettings, SignalPlatform } from '../../lib/signal/types';
import {
  Settings,
  Radio,
  Sliders,
  Bell,
  CheckCircle2,
  Plus,
  X,
  Save,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate?: (path: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SignalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Keyword tag inputs
  const [newKeyword, setNewKeyword] = useState('');
  const [newExcludedKeyword, setNewExcludedKeyword] = useState('');

  useEffect(() => {
    fetch('/api/signal/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePlatform = (p: SignalPlatform) => {
    if (!settings) return;
    StudioAudio.playClick();
    const current = settings.platformsWatched || [];
    const updated = current.includes(p)
      ? current.filter((x) => x !== p)
      : [...current, p];
    setSettings({ ...settings, platformsWatched: updated });
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !settings) return;
    StudioAudio.playClick();
    const updated = [...settings.keywords, newKeyword.trim().toLowerCase()];
    setSettings({ ...settings, keywords: updated });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    if (!settings) return;
    StudioAudio.playClick();
    const updated = settings.keywords.filter((k) => k !== kw);
    setSettings({ ...settings, keywords: updated });
  };

  const handleAddExcluded = () => {
    if (!newExcludedKeyword.trim() || !settings) return;
    StudioAudio.playClick();
    const updated = [...settings.excludedKeywords, newExcludedKeyword.trim().toLowerCase()];
    setSettings({ ...settings, excludedKeywords: updated });
    setNewExcludedKeyword('');
  };

  const handleRemoveExcluded = (kw: string) => {
    if (!settings) return;
    StudioAudio.playClick();
    const updated = settings.excludedKeywords.filter((k) => k !== kw);
    setSettings({ ...settings, excludedKeywords: updated });
  };

  const handleSave = async () => {
    if (!settings) return;
    StudioAudio.playSuccess();
    setSaving(true);

    try {
      const res = await fetch('/api/signal/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Signal radar parameters saved', 'success', 'Config Updated');
      }
    } catch {
      showToast('Settings saved locally', 'info');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-mono text-zinc-400">Loading Signal Radar settings...</p>
      </div>
    );
  }

  const platformsList: { id: SignalPlatform; name: string }[] = [
    { id: 'hackernews', name: 'Hacker News' },
    { id: 'github', name: 'GitHub Discussions' },
    { id: 'reddit', name: 'Reddit' },
    { id: 'x', name: 'X / Twitter' },
    { id: 'threads', name: 'Threads' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* -----------------------------------------------------------------
          HEADER
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5" />
            <span>Radar Configuration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Scout Agent Parameters
          </h2>
          <p className="text-xs sm:text-sm font-mono text-zinc-400">
            Define what platforms the Scout agent polls and what pain point keywords trigger intent scoring.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={saving}
          className="gap-2 shadow-xl shadow-amber-500/10"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      {/* -----------------------------------------------------------------
          PLATFORMS WATCHED
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Monitored Platforms</span>
        </h3>
        <p className="text-xs font-mono text-zinc-400">
          The Scout agent runs every 4 hours checking these developer communities.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {platformsList.map((p) => {
            const isChecked = settings.platformsWatched.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => handleTogglePlatform(p.id)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-zinc-900 border-amber-500/50 text-white'
                    : 'bg-black/40 border-zinc-800 text-zinc-500'
                }`}
              >
                <span className="text-xs font-mono font-semibold">{p.name}</span>
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center border text-[10px] ${
                    isChecked
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}
                >
                  {isChecked && '✓'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* -----------------------------------------------------------------
          INTENT KEYWORDS EDITOR
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-5">
        <div>
          <h3 className="text-base font-bold font-display text-white">Target Pain Keywords</h3>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Phrases that indicate a developer is facing an unsolved technical problem.
          </p>
        </div>

        {/* Add keyword input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
            placeholder="Add keyword phrase (e.g. 'how to sync db', 'need tool for')..."
            className="flex-1 px-4 py-2 text-xs font-mono bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
          />
          <Button variant="outline" size="sm" onClick={handleAddKeyword} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>

        {/* Keywords tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {settings.keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
            >
              <span>{kw}</span>
              <button
                onClick={() => handleRemoveKeyword(kw)}
                className="hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* -----------------------------------------------------------------
          EXCLUDED KEYWORDS (NEGATIVE FILTER)
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-5">
        <div>
          <h3 className="text-base font-bold font-display text-white">Negative / Excluded Keywords</h3>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Posts containing any of these keywords will be immediately discarded without LLM scoring.
          </p>
        </div>

        {/* Add excluded input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newExcludedKeyword}
            onChange={(e) => setNewExcludedKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddExcluded()}
            placeholder="Add negative keyword (e.g. 'hiring', 'salary', 'sponsored')..."
            className="flex-1 px-4 py-2 text-xs font-mono bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-400"
          />
          <Button variant="outline" size="sm" onClick={handleAddExcluded} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>

        {/* Excluded tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {settings.excludedKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono"
            >
              <span>{kw}</span>
              <button
                onClick={() => handleRemoveExcluded(kw)}
                className="hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* -----------------------------------------------------------------
          AUTOMATION TOGGLES
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Automated Agent Actions</span>
        </h3>

        <div className="divide-y divide-zinc-900 text-xs font-mono">
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-white font-semibold block">Auto-Draft Outreach</span>
              <span className="text-zinc-500 text-[11px]">
                Automatically run Closer Agent to draft first messages whenever intent score is &gt; 60.
              </span>
            </div>
            <button
              onClick={() => {
                StudioAudio.playClick();
                setSettings({ ...settings, autoDraftOutreach: !settings.autoDraftOutreach });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.autoDraftOutreach ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                  settings.autoDraftOutreach ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-white font-semibold block">Email Telemetry Alerts</span>
              <span className="text-zinc-500 text-[11px]">
                Send instant notification when a high-intent (&ge;85) signal is detected.
              </span>
            </div>
            <button
              onClick={() => {
                StudioAudio.playClick();
                setSettings({ ...settings, notificationEmail: !settings.notificationEmail });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.notificationEmail ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                  settings.notificationEmail ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
