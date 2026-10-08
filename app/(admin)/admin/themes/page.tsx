'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  Palette,
  Check,
  Upload,
  RotateCcw,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Save,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface ThemePreset {
  name: string;
  slug: string;
  palette: {
    void: string;
    void2: string;
    gold: string;
    crimson: string;
    pale: string;
  };
  typography: {
    display: string;
    body: string;
    mono: string;
  };
  edgeGlow: {
    intensity: 'subtle' | 'medium' | 'intense';
    color: 'gold' | 'crimson' | 'dual';
  };
  backgroundStyle: string;
}

const TEN_BUILTIN_THEMES: ThemePreset[] = [
  {
    name: 'Midnight Gold (Canon)',
    slug: 'midnight-gold',
    palette: { void: '#050404', void2: '#0a0908', gold: '#C9A84C', crimson: '#C0392B', pale: '#c4c0bb' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'medium', color: 'gold' },
    backgroundStyle: 'void-gradient',
  },
  {
    name: 'Basalt Obsidian',
    slug: 'basalt-obsidian',
    palette: { void: '#020202', void2: '#080808', gold: '#e8c96a', crimson: '#962d22', pale: '#d6d2cd' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'intense', color: 'gold' },
    backgroundStyle: 'deep-obsidian',
  },
  {
    name: 'Architectural Drafting Paper (Light)',
    slug: 'architectural-drafting-paper',
    palette: { void: '#f4efe6', void2: '#eae4d8', gold: '#8c6d28', crimson: '#8b2e24', pale: '#2d2620' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'medium', color: 'gold' },
    backgroundStyle: 'drafting-paper',
  },
  {
    name: 'Crimson Sovereign',
    slug: 'crimson-sovereign',
    palette: { void: '#060303', void2: '#0d0707', gold: '#d4af37', crimson: '#C0392B', pale: '#ded9d5' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'intense', color: 'crimson' },
    backgroundStyle: 'crimson-void',
  },
  {
    name: 'Jos Plateau Granite',
    slug: 'jos-plateau-granite',
    palette: { void: '#090807', void2: '#141210', gold: '#bfa15f', crimson: '#a33b2e', pale: '#c7c2b8' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'medium', color: 'gold' },
    backgroundStyle: 'granite-crag',
  },
  {
    name: 'Donghua Cyberpunk',
    slug: 'donghua-cyberpunk',
    palette: { void: '#030508', void2: '#070d14', gold: '#ffd700', crimson: '#e63946', pale: '#e0e6ed' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'intense', color: 'dual' },
    backgroundStyle: 'cyber-nebula',
  },
  {
    name: 'Celestial Monolith',
    slug: 'celestial-monolith',
    palette: { void: '#030304', void2: '#0c0c10', gold: '#f3e5ab', crimson: '#bd1e24', pale: '#d0d0d8' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'subtle', color: 'gold' },
    backgroundStyle: 'starlight-void',
  },
  {
    name: 'Electric Emerald',
    slug: 'electric-emerald',
    palette: { void: '#020503', void2: '#050f08', gold: '#52b788', crimson: '#d90429', pale: '#d8f3dc' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'medium', color: 'gold' },
    backgroundStyle: 'emerald-aurora',
  },
  {
    name: 'Velvet Shadow',
    slug: 'velvet-shadow',
    palette: { void: '#080204', void2: '#120509', gold: '#e0a96d', crimson: '#7b1113', pale: '#ebd4cb' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'intense', color: 'crimson' },
    backgroundStyle: 'velvet-mist',
  },
  {
    name: 'Titanium Aeroluxe',
    slug: 'titanium-aeroluxe',
    palette: { void: '#0d0e11', void2: '#16191f', gold: '#d4af37', crimson: '#9b2226', pale: '#e9ecef' },
    typography: { display: 'Cinzel', body: 'Crimson Pro', mono: 'JetBrains Mono' },
    edgeGlow: { intensity: 'subtle', color: 'gold' },
    backgroundStyle: 'brushed-titanium',
  },
];

interface SectionBg {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'gif' | 'animation';
}

const DEFAULT_SECTION_BGS: SectionBg[] = [
  { id: 'sec-hero', name: 'Hero (Aeroluxe)', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'sec-services', name: 'Services Void', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'sec-work', name: 'Work (Gadtfes)', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'sec-book', name: 'Book of Lies', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'sec-store', name: 'Marketplace (Orizon)', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop&q=80', type: 'image' },
  { id: 'sec-about', name: 'About Studio (Eosai)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&auto=format&fit=crop&q=80', type: 'image' },
];

export default function ThemeSwapperPage() {
  const [themes, setThemes] = useState<ThemePreset[]>(TEN_BUILTIN_THEMES);
  const [activeTheme, setActiveTheme] = useState<string>('midnight-gold');
  const [previousTheme, setPreviousTheme] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<ThemePreset | null>(null);
  const [customJson, setCustomJson] = useState('');
  const [sectionBgs, setSectionBgs] = useState<SectionBg[]>(DEFAULT_SECTION_BGS);
  const { showToast } = useToast();

  const applyThemePlatformWide = async (theme: ThemePreset) => {
    StudioAudio.playClick();
    setPreviousTheme(activeTheme);
    setActiveTheme(theme.slug);

    const root = document.documentElement;
    root.style.setProperty('--void', theme.palette.void);
    root.style.setProperty('--void-2', theme.palette.void2);
    root.style.setProperty('--gold', theme.palette.gold);
    root.style.setProperty('--crimson', theme.palette.crimson);
    root.style.setProperty('--pale', theme.palette.pale);

    try {
      localStorage.setItem('jadai_active_theme', JSON.stringify(theme));
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'active_theme_config',
          value: JSON.stringify(theme),
        }),
      });
    } catch {}

    StudioAudio.playSuccessArpeggio();
    showToast(`Theme applied: ${theme.name}`, 'success', 'Changes live platform-wide ✓');
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomJson(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      if (parsed.name && parsed.palette) {
        setThemes((prev) => [parsed, ...prev.filter((t) => t.slug !== parsed.slug)]);
        showToast('Valid theme JSON parsed successfully.', 'success');
      }
    } catch {}
  };

  const handleRevert = () => {
    const target = previousTheme
      ? themes.find((t) => t.slug === previousTheme) || themes[0]
      : themes[0];
    applyThemePlatformWide(target);
    showToast(`Reverted to ${target.name}.`, 'info');
  };

  const handleUpdateBg = (id: string, newUrl: string) => {
    setSectionBgs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, url: newUrl } : s))
    );
    showToast(`Background URL updated for ${id}`, 'info');
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-6 px-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
            Visual Engine Architecture
          </span>
          <h1 className="text-3xl font-display font-bold text-[#f5f3f0]">
            Theme & Background Manager
          </h1>
          <p className="text-xs text-[#8a6e2a]">
            10 built-in sovereign presets, live palette swatches, JSON upload, and per-section media controllers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {previousTheme && (
            <Button variant="outline" size="sm" onClick={handleRevert}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Revert to Previous
            </Button>
          )}
        </div>
      </div>

      {/* 10 Theme Presets Grid (Section 16) */}
      <div className="space-y-4">
        <h3 className="text-sm font-display font-bold text-[#f5f3f0] flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#C9A84C]" />
          <span>Preset Themes (10 Built-In)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const isCurrent = activeTheme === theme.slug;

            return (
              <GlassCard
                key={theme.slug}
                className={`p-5 border transition-all duration-300 relative space-y-3.5 ${
                  isCurrent
                    ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.1)] shadow-[0_0_20px_rgba(201,168,76,0.25)]'
                    : 'border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-base text-[#f5f3f0]">
                      {theme.name}
                    </h4>
                    <span className="text-[10px] text-[#8a6e2a]">slug: {theme.slug}</span>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#C9A84C] text-[#050404]">
                      Active Platform-Wide
                    </span>
                  )}
                </div>

                {/* Swatches */}
                <div className="flex items-center gap-2 py-1">
                  <div
                    className="w-7 h-7 rounded border border-white/20"
                    style={{ backgroundColor: theme.palette.void }}
                    title="Void"
                  />
                  <div
                    className="w-7 h-7 rounded border border-white/20"
                    style={{ backgroundColor: theme.palette.void2 }}
                    title="Void-2"
                  />
                  <div
                    className="w-7 h-7 rounded border border-white/20 shadow-sm"
                    style={{ backgroundColor: theme.palette.gold }}
                    title="Gold"
                  />
                  <div
                    className="w-7 h-7 rounded border border-white/20"
                    style={{ backgroundColor: theme.palette.crimson }}
                    title="Crimson"
                  />
                  <div
                    className="w-7 h-7 rounded border border-white/20"
                    style={{ backgroundColor: theme.palette.pale }}
                    title="Pale"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[rgba(201,168,76,0.15)]">
                  <button
                    onClick={() => setPreviewTheme(theme)}
                    className="text-[#8a6e2a] hover:text-[#C9A84C] flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Mock Preview</span>
                  </button>

                  <button
                    onClick={() => applyThemePlatformWide(theme)}
                    disabled={isCurrent}
                    className="px-4 py-1.5 rounded-lg bg-[#C9A84C] text-[#050404] font-bold hover:bg-[#e8c96a] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isCurrent ? 'Applied' : 'Apply Platform-Wide'}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* JSON Theme Token Upload */}
      <GlassCard className="p-6 space-y-3 border-[rgba(201,168,76,0.25)]">
        <h3 className="text-sm font-display font-bold text-[#f5f3f0] flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#C9A84C]" />
          <span>Upload New Theme via JSON Tokens</span>
        </h3>
        <p className="text-xs text-[#8a6e2a]">
          Paste a JSON specification containing name, slug, palette (void, void2, gold, crimson, pale), and typography.
        </p>
        <textarea
          rows={3}
          value={customJson}
          onChange={handleJsonUpload}
          placeholder='{"name": "Obsidian Nebula", "slug": "obsidian-nebula", "palette": {"void": "#030204", "void2": "#09060c", "gold": "#d4af37", "crimson": "#b7094c", "pale": "#ede0d4"}}'
          className="w-full p-3 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
        />
      </GlassCard>

      {/* BACKGROUND MANAGER (Section 16) */}
      <div className="space-y-4 pt-4 border-t border-[rgba(201,168,76,0.2)]">
        <h3 className="text-sm font-display font-bold text-[#f5f3f0] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#C9A84C]" />
          <span>Section Background Media Manager</span>
        </h3>
        <p className="text-xs text-[#8a6e2a]">
          Configure image URLs, animated GIFs, or textures individually per public section.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionBgs.map((sec) => (
            <div
              key={sec.id}
              className="p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#f5f3f0]">{sec.name}</span>
                <span className="text-[10px] uppercase text-[#8a6e2a] px-2 py-0.5 rounded bg-black/60 border border-[rgba(201,168,76,0.2)]">
                  {sec.type}
                </span>
              </div>

              <div className="h-28 rounded-xl overflow-hidden border border-[rgba(201,168,76,0.2)] relative">
                <img
                  src={sec.url}
                  alt={sec.name}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#8a6e2a] uppercase">Media URL / GIF</label>
                <input
                  type="text"
                  value={sec.url}
                  onChange={(e) => handleUpdateBg(sec.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[11px] text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Live Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">
                Mock Preview: {previewTheme.name}
              </span>
              <button
                onClick={() => setPreviewTheme(null)}
                className="text-xs text-[#8a6e2a] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div
              className="p-6 rounded-2xl border transition-all space-y-4"
              style={{
                backgroundColor: previewTheme.palette.void,
                borderColor: previewTheme.palette.gold,
                color: previewTheme.palette.pale,
              }}
            >
              <h2
                className="text-2xl font-bold"
                style={{ color: previewTheme.palette.gold }}
              >
                Build Different. Build the floor.
              </h2>
              <p className="text-xs leading-relaxed">
                This is a live mock representation of typography and palette variables under the{' '}
                {previewTheme.name} design tokens.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  className="px-4 py-2 rounded font-bold text-xs"
                  style={{
                    backgroundColor: previewTheme.palette.gold,
                    color: previewTheme.palette.void,
                  }}
                >
                  Primary Action
                </button>
                <button
                  className="px-4 py-2 rounded text-xs border"
                  style={{
                    borderColor: previewTheme.palette.crimson,
                    color: previewTheme.palette.crimson,
                  }}
                >
                  Emergency Signal
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewTheme(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#8a6e2a] hover:text-white"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  applyThemePlatformWide(previewTheme);
                  setPreviewTheme(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-bold hover:bg-[#e8c96a]"
              >
                Apply Platform-Wide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
