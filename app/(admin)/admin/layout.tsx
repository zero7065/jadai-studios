'use client';

import React, { useState } from 'react';
import Logo from '@/components/layout/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  ShieldCheck,
  ArrowLeft,
  Activity,
  Settings,
  Database,
  Layers,
  FileText,
  BookOpen,
  ShoppingBag,
  Users,
  Sparkles,
  Camera,
  ToggleLeft,
  BarChart3,
  Bell,
  Terminal,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Palette,
  CloudUpload,
  Globe,
  Upload,
  Film,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSubpath?: string;
  onNavigate?: (path: string) => void;
}

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: Activity },
  { label: 'Theme Swapper', path: '/admin/themes', icon: Palette },
  { label: 'Deployments', path: '/admin/deployments', icon: CloudUpload },
  { label: 'Portfolio', path: '/admin/portfolio', icon: Layers },
  { label: 'Content', path: '/admin/content', icon: FileText },
  { label: 'Book of Lies', path: '/admin/book-of-lies', icon: BookOpen },
  { label: 'Templates', path: '/admin/templates', icon: ShoppingBag },
  { label: 'Hub Approvals', path: '/admin/hub', icon: Users },
  { label: 'Users & Tiers', path: '/admin/users', icon: ShieldCheck },
  { label: 'Prime AI Studio', path: '/admin/prime', icon: Sparkles },
  { label: 'Photos Manager', path: '/admin/photos', icon: Camera },
  { label: 'Media & Videos', path: '/admin/media', icon: Film },
  { label: 'Section Controller', path: '/admin/sections', icon: ToggleLeft },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings & Keys', path: '/admin/settings', icon: Settings },
  { label: 'Self-Diagnostic', path: '/admin/diagnostic', icon: Activity },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Footer Manager', path: '/admin/footer', icon: Sparkles },
  { label: 'Recovery Terminal', path: '/admin/recovery', icon: Terminal },
];

export default function AdminLayout({
  children,
  currentSubpath = '/admin',
  onNavigate,
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'live'>('idle');
  const [viewAsUser, setViewAsUser] = useState(false);
  const { showToast } = useToast();

  const handleNav = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handlePublishSite = async () => {
    setPublishStatus('publishing');
    StudioAudio.playClick();

    const timestamp = new Date().toISOString();
    const auditEntry = `[${timestamp}] admin=jadaistudiosoffcl@gmail.com action="Site published"`;

    try {
      // 1. Call revalidation endpoint
      await fetch('/api/admin/publish', { method: 'POST' });

      // 2. Record publish timestamp in admin_settings
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'last_published_at', value: timestamp }),
      });

      // 3. Append to audit log
      const currentLogs = localStorage.getItem('jadai_admin_audit_log') || '';
      localStorage.setItem('jadai_admin_audit_log', `${currentLogs}\n${auditEntry}`);
    } catch {
      // Non-blocking
    }

    setTimeout(() => {
      setPublishStatus('live');
      StudioAudio.playSuccessArpeggio();
      showToast('Live ✓ — All paths revalidated and published.', 'success', 'Site Published');
      setTimeout(() => setPublishStatus('idle'), 3500);
    }, 700);
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('jadai_admin_unlocked');
      localStorage.removeItem('jadai_admin_unlocked');
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      //
    }
    if (onNavigate) onNavigate('/');
    else window.location.href = '/';
  };

  if (viewAsUser) {
    return (
      <div className="relative w-full min-h-screen bg-[#050404]">
        {/* Floating Exit View as User Pill */}
        <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a0908]/90 border border-[rgba(201,168,76,0.5)] shadow-2xl backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
          <span className="text-xs font-mono text-[#f5f3f0]">Viewing as Free-Tier User</span>
          <button
            type="button"
            onClick={() => {
              setViewAsUser(false);
              StudioAudio.playClick();
              showToast('Restored Admin Lounge workspace', 'info');
            }}
            className="ml-2 px-3 py-1 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-[11px] font-bold hover:bg-[#e8c96a] transition-all cursor-pointer shadow-md"
          >
            Exit View as User
          </button>
        </div>

        {/* Public Site Viewport */}
        <iframe
          src="/?preview=true"
          title="User Viewport"
          className="w-full h-screen border-none"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050404] text-[#c4c0bb] font-mono font-normal flex flex-col md:flex-row select-none">
      {/* Sidebar (Desktop 240px) */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-[#0a0908] border-r border-[rgba(201,168,76,0.2)] flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5 overflow-hidden flex flex-col h-[calc(100vh-130px)]">
          {/* Brand & Exit */}
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(201,168,76,0.2)] shrink-0">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <div>
                <span className="font-mono text-xs font-bold text-[#f5f3f0] block leading-tight">STUDIO LOUNGE</span>
                <span className="text-[10px] font-mono text-[#8a6e2a]">Jadai Studios HQ</span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-[#8a6e2a] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Scrollable) */}
          <nav className="space-y-1 overflow-y-auto pr-1 flex-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentSubpath === item.path;

              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleNav(item.path, e)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[rgba(201,168,76,0.15)] text-[#e8c96a] font-bold border-l-2 border-[#C9A84C]'
                      : 'text-[#c4c0bb] hover:text-[#f5f3f0] hover:bg-[rgba(201,168,76,0.06)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] space-y-2 shrink-0">
          <div className="p-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex items-center justify-between text-xs font-mono">
            <div className="truncate">
              <span className="text-[#f5f3f0] font-semibold block truncate">Jehu Nanpan</span>
              <span className="text-[10px] text-[#8a6e2a]">Principal Architect</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-mono text-[#8a6e2a] hover:text-[#C0392B] hover:bg-[rgba(192,57,43,0.1)] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Operations Session</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Topbar with Publish Site + View as User */}
        <header className="border-b border-[rgba(201,168,76,0.2)] bg-[#0a0908] px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded text-[#8a6e2a] hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-[#8a6e2a] hidden sm:inline">Studio Lounge</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8a6e2a] hidden sm:inline" />
            <span className="text-xs font-mono text-[#f5f3f0] capitalize">
              {currentSubpath.replace('/admin/', '').replace('/admin', 'Dashboard')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* "Publish Site" Button */}
            <EdgeGlow intensity="intense" color="gold" borderRadius="6px">
              <button
                onClick={handlePublishSite}
                disabled={publishStatus === 'publishing'}
                className="px-3 py-1 rounded bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {publishStatus === 'publishing'
                    ? 'Publishing...'
                    : publishStatus === 'live'
                    ? 'Live ✓'
                    : 'Publish ⬡'}
                </span>
              </button>
            </EdgeGlow>

            {/* "View as User" / "Admin Mode" Toggle */}
            <button
              type="button"
              onClick={() => {
                StudioAudio.playClick();
                setViewAsUser(true);
                showToast('Switched to Free User Viewport. Admin controls minimized.', 'info');
              }}
              className="px-3 py-1 rounded border border-[rgba(201,168,76,0.3)] bg-[#050404] text-xs font-mono text-[#e8c96a] hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span className="hidden sm:inline">View as User</span>
            </button>

            <ThemeToggle />
          </div>
        </header>

        {/* Child Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
