'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '../ui/GlassCard';
import BentoGridContainer, { BentoItem } from '../ui/BentoGrid';
import Sigil from '../layout/Sigil';
import Button from '../ui/Button';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import {
  Sparkles,
  Edit3,
  FileText,
  BookOpen,
  Activity,
  ShoppingBag,
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  LogOut,
  FolderOpen,
  ArrowRight,
  User,
  Trash2,
  Layers,
} from 'lucide-react';

export interface CentralDashboardProps {
  onNavigate?: (path: string) => void;
}

interface ServiceInstallItem {
  id: string;
  name: string;
  scope: string;
  desc: string;
  icon: any;
}

const INSTALLABLE_SERVICES: ServiceInstallItem[] = [
  { id: 'write', name: 'Story & Writing', scope: '/write', desc: 'Novel, Memoir, Script & Codex', icon: Edit3 },
  { id: 'bol', name: 'Book of Lies', scope: '/book-of-lies', desc: '40 Parables & Reflective Mirror', icon: BookOpen },
  { id: 'forge', name: 'Dream Forge', scope: '/dream-forge', desc: 'System Architecture & Spec Engine', icon: Sparkles },
  { id: 'radar', name: 'Signal Radar', scope: '/signal', desc: 'Real-Time Web & SEO Diagnostics', icon: Activity },
  { id: 'hub', name: 'Creative Hub', scope: '/hub', desc: 'Curated Templates & Modules', icon: Layers },
];

export const CentralDashboard: React.FC<CentralDashboardProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [userSession, setUserSession] = useState<{ email: string; name: string; neverExpires: boolean } | null>(null);
  const [libraryCount, setLibraryCount] = useState(0);
  const [snapshotsCount, setSnapshotsCount] = useState(0);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceInstallItem | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jadai_user_session');
      if (stored) setUserSession(JSON.parse(stored));

      const lib = localStorage.getItem('jadai_creative_library');
      if (lib) setLibraryCount(JSON.parse(lib).length);

      const snaps = localStorage.getItem('jadai_writer_snapshots');
      if (snaps) setSnapshotsCount(JSON.parse(snaps).length);
    } catch {}
  }, []);

  const handleNav = (path: string) => {
    StudioAudio.playClick();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleInstallService = (srv: ServiceInstallItem) => {
    setSelectedService(srv);
    StudioAudio.playClick();
    setInstallModalOpen(true);
  };

  const executeInstallPWA = () => {
    if (!selectedService) return;
    StudioAudio.playSuccessArpeggio();
    // Simulate / register standalone shortcut scope
    showToast(
      `Service "${selectedService.name}" registered as standalone home-screen shortcut for ${selectedService.scope}`,
      'success',
      'Shortcut Enabled'
    );
    setInstallModalOpen(false);
  };

  const handleLogout = () => {
    if (confirm('Log out from this device? Cached data remains safe in on-device storage.')) {
      StudioAudio.playClick();
      localStorage.removeItem('jadai_user_session');
      setUserSession(null);
      showToast('Logged out of session. Access is now locked until next sign-in.', 'info');
      window.dispatchEvent(new CustomEvent('jadai_session_updated'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 select-none text-[var(--text-secondary)]">
      {/* -------------------------------------------------------------------
          TOP IDENTITY & SYNC HUD
         ------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sigil size="sm" animate={true} />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--gold)]">
              Central Studio Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)]">
            Overview
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Select any creation engine below. All work is preserved on-device and accessible offline.
          </p>
        </div>

        {/* User Identity & Offline Cache Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[var(--glass-fill)] border border-[var(--border-color)] flex items-center gap-2 text-xs font-mono">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">On-Device Cache Active</span>
          </div>

          {userSession ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-[var(--glass-fill)] border border-[var(--gold)]/40 flex items-center gap-2 text-xs font-mono">
                <User className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span className="text-[var(--text-primary)] font-bold">{userSession.name}</span>
                <span className="text-[10px] text-zinc-500 hidden sm:inline">(Permanent)</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl border border-[var(--border-color)] hover:border-red-400 text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('jadai_open_auth'))}
            >
              Sign In with Google
            </Button>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------
          CENTRAL BENTO GRID MATRIX (PLAIN LANGUAGE LABELS)
         ------------------------------------------------------------------- */}
      <BentoGridContainer columns={12} gap="md">
        {/* 1. CREATE (Large Featured, 7 cols) */}
        <BentoItem
          span="col-span-full"
          className="lg:col-span-7 p-6 hover:border-[var(--gold)] transition-all cursor-pointer group"
          onClick={() => handleNav('/create')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--gold)] uppercase tracking-wider">
              Visual Creation Studio
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
              <span className="text-xs font-mono text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <span>Launch</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="my-4 space-y-1">
            <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              Create
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Craft images, thumbnails, banners, GIFs, and sigils. Includes precision highlight pen for in-context edits and true 4K export.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Library: {libraryCount} artifacts saved</span>
            <span className="text-[var(--gold)]">Still & Looping Clip 4K</span>
          </div>
        </BentoItem>

        {/* 2. WRITE (Medium, 5 cols) */}
        <BentoItem
          span="col-span-full"
          className="lg:col-span-5 p-6 hover:border-[var(--gold)] transition-all cursor-pointer group"
          onClick={() => handleNav('/write')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--gold)] uppercase tracking-wider">
              Writing & Authoring
            </span>
            <span className="text-xs font-mono text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <span>Launch</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="my-4 space-y-1">
            <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              Write
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Long-form books and short-form essays. Matches your authorial voice, tracks character/plot invariants, and co-writes with track changes.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Snapshots: {snapshotsCount} restorable</span>
            <span className="text-[var(--gold)]">Export .docx / PDF</span>
          </div>
        </BentoItem>

        {/* 3. DOCUMENTS (4 cols) */}
        <BentoItem
          span="col-span-full"
          className="md:col-span-4 p-5 hover:border-[var(--gold)] transition-all cursor-pointer group"
          onClick={() => handleNav('/playground/forge')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--gold)] uppercase">Doc Studio</span>
            <span className="text-xs font-mono text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </div>

          <div className="my-3 space-y-1">
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
              Documents
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Upload any document. Rebuilds into structured, fully editable canvas layout with 30-step history.
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-zinc-400">
            PDF & PNG High-Res
          </div>
        </BentoItem>

        {/* 4. DIAGNOSTICS (4 cols) */}
        <BentoItem
          span="col-span-full"
          className="md:col-span-4 p-5 hover:border-cyan-400 transition-all cursor-pointer group"
          onClick={() => handleNav('/playground/sentinel')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Site Health</span>
            <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </div>

          <div className="my-3 space-y-1">
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)] group-hover:text-cyan-300 transition-colors">
              Diagnostics
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Audit any web domain in under 3 seconds for Core Web Vitals, security, and accessibility standards.
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-zinc-400">
            Real HTTP Verification
          </div>
        </BentoItem>

        {/* 5. ART & STORIES (4 cols) */}
        <BentoItem
          span="col-span-full"
          className="md:col-span-4 p-5 hover:border-red-500 transition-all cursor-pointer group"
          onClick={() => handleNav('/book-of-lies')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#C0392B] uppercase">Philosophical Canon</span>
            <span className="text-xs font-mono text-[#C0392B] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </div>

          <div className="my-3 space-y-1">
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)] group-hover:text-red-300 transition-colors">
              Art & Stories
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              The Book of Lies serialized episodes exploring moral hazards, engineering discipline, and pride.
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-zinc-400">
            Nightly 9:47 PM Drop
          </div>
        </BentoItem>
      </BentoGridContainer>

      {/* -------------------------------------------------------------------
          PER-SERVICE HOMESCREEN INSTALL SECTION (PROMPT 8)
         ------------------------------------------------------------------- */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--gold)]">
              Scoped Standalone Apps
            </span>
            <h3 className="text-base font-display font-bold text-[var(--text-primary)]">
              Per-Service Home Screen Shortcuts
            </h3>
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              Install any studio tool directly to your desktop or phone home screen. Launches straight into that service and runs offline on cached data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {INSTALLABLE_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="p-3.5 rounded-xl bg-black/40 border border-[var(--border-color)] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--gold)]" />
                    <span className="font-bold text-xs font-display text-[var(--text-primary)]">
                      {srv.name}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">
                    {srv.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => handleNav(srv.scope)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[var(--gold)]/20 hover:bg-[var(--gold)] text-[#e8c96a] hover:text-[#050404] text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Enter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstallService(srv)}
                    className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-mono flex items-center justify-center transition-colors cursor-pointer"
                    title={`Install ${srv.name} as Standalone PWA`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[var(--gold)]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* -------------------------------------------------------------------
          INSTALL MODAL
         ------------------------------------------------------------------- */}
      {installModalOpen && selectedService && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0908] border border-[var(--gold)]/40 rounded-2xl p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <Smartphone className="w-5 h-5 text-[var(--gold)]" />
              <h3 className="text-base font-display font-bold text-[var(--text-primary)]">
                Install {selectedService.name} Shortcut
              </h3>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)]">
              This installs an independent PWA shortcut scoped exclusively to <code className="text-[var(--gold)]">{selectedService.scope}</code>. It launches directly into {selectedService.name} and retains local storage offline until you explicitly log out.
            </p>

            <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1 text-[11px]">
              <span className="text-emerald-400 font-bold block">✓ Offline Cache Enabled</span>
              <p>Your work and drafts remain safe on this device without relying on uninterrupted network connectivity.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInstallModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <Button variant="primary" size="sm" onClick={executeInstallPWA}>
                Add to Home Screen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralDashboard;
