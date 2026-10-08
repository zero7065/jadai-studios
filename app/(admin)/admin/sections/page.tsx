'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import { getCustomization, saveCustomization, SectionCustomization, DEFAULT_CUSTOMIZATION } from '@/lib/data/customization';
import {
  ToggleLeft,
  Eye,
  EyeOff,
  Snowflake,
  AlertCircle,
  Sparkles,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Monitor,
  X,
  Save,
  RotateCcw,
  Download,
  Image as ImageIcon,
  Upload,
  User,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';

interface SectionConfig {
  id: string;
  name: string;
  route: string;
  anchor: string;
  state: 'visible' | 'hidden' | 'frozen';
  freezeMessage: string;
  order: number;
}

const INITIAL_SECTIONS: SectionConfig[] = [
  { id: 'sec-hero', name: 'Homepage Hero & Founder Portrait', route: '/', anchor: 'hero-section', state: 'visible', freezeMessage: 'Updates coming soon ⬡', order: 1 },
  { id: 'sec-services', name: 'Services & Three Engineering Pillars', route: '/services', anchor: 'services-section', state: 'visible', freezeMessage: 'Updates coming soon ⬡', order: 2 },
  { id: 'sec-work', name: 'Selected Architectural Works & Carousel', route: '/work', anchor: 'work-section', state: 'visible', freezeMessage: 'Updates coming soon ⬡', order: 3 },
  { id: 'sec-book', name: 'Book of Lies & Philosophical Canon', route: '/book-of-lies', anchor: 'book-section', state: 'visible', freezeMessage: 'Updates coming soon ⬡', order: 4 },
  { id: 'sec-hub', name: 'JadaiHub Mesh Network', route: '/hub', anchor: 'hub-section', state: 'visible', freezeMessage: 'Updates coming soon ⬡', order: 5 },
  { id: 'sec-community', name: 'Community Stream & Forum', route: '/community', anchor: 'community-section', state: 'visible', freezeMessage: 'Updates coming soon ⬡', order: 6 },
  { id: 'sec-about', name: 'About, Origins & Process', route: '/about', anchor: 'about-section', state: 'visible', freezeMessage: 'Updates coming soon ⬡', order: 7 },
  { id: 'sec-footer', name: 'Global Footer & Transmission', route: '/', anchor: 'footer-section', state: 'visible', freezeMessage: 'Updates coming soon ⬡', order: 8 },
];

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SectionConfig[]>(INITIAL_SECTIONS);
  const [customization, setCustomization] = useState<SectionCustomization>(DEFAULT_CUSTOMIZATION);
  const [activeTab, setActiveTab] = useState<'backgrounds' | 'visibility' | 'portrait'>('visibility');
  const [previewRoute, setPreviewRoute] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setCustomization(getCustomization());

    async function loadSectionSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const sectionEntry = data.settings.find((s: any) => s.key === 'section_states');
          if (sectionEntry?.value) {
            setSections(JSON.parse(sectionEntry.value));
            return;
          }
        }
      } catch {}

      const storedSections = localStorage.getItem('jadai_sections_config');
      if (storedSections) {
        try {
          setSections(JSON.parse(storedSections));
        } catch {}
      }
    }
    loadSectionSettings();
  }, []);

  const handleStateChange = (id: string, state: SectionConfig['state']) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, state } : s))
    );
    StudioAudio.playClick();
  };

  const handleFreezeMessageChange = (id: string, freezeMessage: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, freezeMessage: freezeMessage.slice(0, 60) } : s))
    );
  };

  const handleCustomizationChange = (field: keyof SectionCustomization, value: any) => {
    setCustomization((prev) => ({ ...prev, [field]: value }));
  };

  // Convert uploaded image or GIF to Data URL
  const handleFileUpload = (field: keyof SectionCustomization, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleCustomizationChange(field, dataUrl);
        StudioAudio.playSuccessArpeggio();
        showToast(`Loaded ${file.name} for ${String(field)}`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    StudioAudio.playClick();
    try {
      saveCustomization(customization);
      localStorage.setItem('jadai_sections_config', JSON.stringify(sections));
      localStorage.setItem('jadai_section_states', JSON.stringify(sections));

      // Persist to admin_settings table with key "section_states"
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'section_states',
          value: JSON.stringify(sections),
        }),
      });

      // Also persist to customization
      await fetch('/api/admin/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customization),
      });

      StudioAudio.playSuccessArpeggio();
      showToast('All section backgrounds, GIFs, and portrait saved successfully!', 'success');
    } catch (err: any) {
      showToast('Saved locally to browser cache.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    saveCustomization(DEFAULT_CUSTOMIZATION);
    StudioAudio.playClick();
    showToast('Reset backgrounds and aesthetics to default 9-image themes', 'info');
  };

  return (
    <div className="space-y-8 font-mono text-xs text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400">
            Aesthetic Architecture & Views
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Section Backgrounds & Visual Identity
          </h1>
          <p className="text-xs text-slate-400">
            Configure high-resolution background images, GIFs, and the glassy ancient-blue founder portrait.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>

          <Button variant="primary" size="sm" onClick={handleSaveAll} disabled={isSaving}>
            <Save className="w-3.5 h-3.5 mr-1" />
            {isSaving ? 'Saving...' : 'Apply Live'}
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('backgrounds')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'backgrounds'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Section Backgrounds & GIFs</span>
        </button>

        <button
          onClick={() => setActiveTab('portrait')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'portrait'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Home Center Founder Portrait</span>
        </button>

        <button
          onClick={() => setActiveTab('visibility')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'visibility'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Section Visibility & Reorder</span>
        </button>
      </div>

      {/* TAB 1: SECTION BACKGROUNDS & GIFS */}
      {activeTab === 'backgrounds' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
            <span className="font-bold flex items-center gap-1 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              9 Reference Image Architecture Notice
            </span>
            <p className="text-slate-300">
              Images and animated GIFs are positioned cleanly in the section background layers with delicate dark vignettes and edge glows, keeping typography and interactive cards crisp and readable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Home Section Background */}
            <GlassCard className="p-5 space-y-3 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-white">Home Page Background</span>
                <span className="text-[10px] text-cyan-400 uppercase">Image 1 (GCORE) & Image 8 (Velopay)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                High-tech dark ambient edge glow, neural mesh, or glowing orbital backdrop.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 block">Image or GIF URL</label>
                <input
                  type="text"
                  value={customization.homeBg}
                  onChange={(e) => handleCustomizationChange('homeBg', e.target.value)}
                  placeholder="https://... image or .gif"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <div className="flex items-center justify-between pt-1">
                  <label className="cursor-pointer text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Local File / GIF</span>
                    <input
                      type="file"
                      accept="image/*,.gif"
                      className="hidden"
                      onChange={(e) => handleFileUpload('homeBg', e)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewRoute('/')}
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Preview Home</span>
                  </button>
                </div>
              </div>
              {/* Thumbnail Preview */}
              <div className="h-28 rounded-lg overflow-hidden border border-slate-800 relative">
                <img src={customization.homeBg} alt="Home preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-mono text-cyan-300">Active Home Canvas</span>
                </div>
              </div>
            </GlassCard>

            {/* 2. Playground Section Background */}
            <GlassCard className="p-5 space-y-3 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-white">Playground Background</span>
                <span className="text-[10px] text-cyan-400 uppercase">Image 9 (Orizon) & Image 4 (Rome VisionOS)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                4K crisp frosted architectural glass, ion depth, and micro-stat expression.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 block">Image or GIF URL</label>
                <input
                  type="text"
                  value={customization.playgroundBg}
                  onChange={(e) => handleCustomizationChange('playgroundBg', e.target.value)}
                  placeholder="https://... image or .gif"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <div className="flex items-center justify-between pt-1">
                  <label className="cursor-pointer text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Local File / GIF</span>
                    <input
                      type="file"
                      accept="image/*,.gif"
                      className="hidden"
                      onChange={(e) => handleFileUpload('playgroundBg', e)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewRoute('/playground')}
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Preview Playground</span>
                  </button>
                </div>
              </div>
              <div className="h-28 rounded-lg overflow-hidden border border-slate-800 relative">
                <img src={customization.playgroundBg} alt="Playground preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-mono text-cyan-300">Active Playground Canvas</span>
                </div>
              </div>
            </GlassCard>

            {/* 3. Studio Section Background */}
            <GlassCard className="p-5 space-y-3 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-white">Studio Background</span>
                <span className="text-[10px] text-cyan-400 uppercase">Image 2 (Steary) & Image 6 (IT Empire)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Architectural sci-fi curves, frosted glass depth, and philosophical canon.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 block">Image or GIF URL</label>
                <input
                  type="text"
                  value={customization.studioBg}
                  onChange={(e) => handleCustomizationChange('studioBg', e.target.value)}
                  placeholder="https://... image or .gif"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <div className="flex items-center justify-between pt-1">
                  <label className="cursor-pointer text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Local File / GIF</span>
                    <input
                      type="file"
                      accept="image/*,.gif"
                      className="hidden"
                      onChange={(e) => handleFileUpload('studioBg', e)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewRoute('/book-of-lies')}
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Preview Studio</span>
                  </button>
                </div>
              </div>
              <div className="h-28 rounded-lg overflow-hidden border border-slate-800 relative">
                <img src={customization.studioBg} alt="Studio preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-mono text-cyan-300">Active Studio Canvas</span>
                </div>
              </div>
            </GlassCard>

            {/* 4. About & Footer Section Background */}
            <GlassCard className="p-5 space-y-3 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-white">About & Footer Background</span>
                <span className="text-[10px] text-cyan-400 uppercase">Image 7 (Aeroluxe) & Image 5 (Inkspire)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cinematic luxury hangar lighting and rich creative digital art timeline.
              </p>
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 block">Image or GIF URL</label>
                <input
                  type="text"
                  value={customization.aboutBg}
                  onChange={(e) => handleCustomizationChange('aboutBg', e.target.value)}
                  placeholder="https://... image or .gif"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <div className="flex items-center justify-between pt-1">
                  <label className="cursor-pointer text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Local File / GIF</span>
                    <input
                      type="file"
                      accept="image/*,.gif"
                      className="hidden"
                      onChange={(e) => handleFileUpload('aboutBg', e)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewRoute('/about')}
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Preview About</span>
                  </button>
                </div>
              </div>
              <div className="h-28 rounded-lg overflow-hidden border border-slate-800 relative">
                <img src={customization.aboutBg} alt="About preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-mono text-cyan-300">Active About Canvas</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: HOME CENTER FOUNDER PORTRAIT */}
      {activeTab === 'portrait' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200">
            <span className="font-bold block text-cyan-300">User Directive:</span>
            "in the home page the portrait in the middle should be glassy and dark ancient blue with my image uploaded there and all the aura and feel present"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <GlassCard className="p-6 space-y-4 border-slate-800">
              <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">
                Founder Portrait & Bio Controls
              </h3>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 block">Founder Image URL or Upload</label>
                <input
                  type="text"
                  value={customization.founderPortraitUrl}
                  onChange={(e) => handleCustomizationChange('founderPortraitUrl', e.target.value)}
                  placeholder="https://... photo url"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-cyan-300 border border-slate-700 mt-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Custom Portrait Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload('founderPortraitUrl', e)}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 block">Full Name</label>
                <input
                  type="text"
                  value={customization.founderName}
                  onChange={(e) => handleCustomizationChange('founderName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 block">Role & Designation</label>
                <input
                  type="text"
                  value={customization.founderRole}
                  onChange={(e) => handleCustomizationChange('founderRole', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-slate-400 block">Short Bio</label>
                <textarea
                  rows={3}
                  value={customization.founderBio}
                  onChange={(e) => handleCustomizationChange('founderBio', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <Button variant="primary" onClick={handleSaveAll} disabled={isSaving} className="w-full">
                <Save className="w-3.5 h-3.5 mr-1" />
                Save & Update Portrait Across Entire Site
              </Button>
            </GlassCard>

            {/* Live Glassy Dark Ancient Blue Frame Preview */}
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4">
              <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-widest">
                Live Ancient Blue Preview
              </span>

              <div className="relative w-64 h-84 rounded-[28px] overflow-hidden border border-cyan-400/50 shadow-[0_20px_60px_rgba(14,165,233,0.3)] bg-gradient-to-b from-[#091B33] via-[#040C1A] to-[#02050B]">
                <img
                  src={customization.founderPortraitUrl}
                  alt="Founder preview"
                  className="w-full h-full object-cover filter contrast-110 brightness-95 opacity-90"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#020612] via-[#040E24]/90 to-transparent z-10 space-y-1 text-left border-t border-cyan-500/20">
                  <span className="text-[9px] font-mono text-cyan-300 uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
                    Ancient Blue Matrix
                  </span>
                  <h4 className="font-display font-bold text-base text-white">
                    {customization.founderName}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-300">
                    {customization.founderRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECTION VISIBILITY & CONTROLLER (ADD 2) */}
      {activeTab === 'visibility' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.2)] pb-3">
            <div>
              <h3 className="font-display font-bold text-base text-[#f5f3f0]">
                Live Section Controller & Anchored Previews
              </h3>
              <p className="text-xs font-mono text-[#8a857e]">
                Control visibility, freeze with custom messages, and preview individual section viewports.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={isSaving}
              onClick={handleSaveAll}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Section States'}</span>
            </Button>
          </div>

          <GlassCard className="p-5 overflow-x-auto border-slate-800">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Section Name</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Freeze Message (Max 60 chars)</th>
                  <th className="py-2.5 px-3 text-right">Controls & Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {sections.map((sec, idx) => (
                  <tr key={sec.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-mono text-xs font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white text-xs block">{sec.name}</span>
                      <span className="text-[10px] font-mono text-[#8a6e2a]">{sec.route} #{sec.anchor}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                        sec.state === 'visible'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : sec.state === 'frozen'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {sec.state}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        maxLength={60}
                        value={sec.freezeMessage || 'Updates coming soon ⬡'}
                        onChange={(e) => handleFreezeMessageChange(sec.id, e.target.value)}
                        placeholder="Updates coming soon ⬡"
                        disabled={sec.state !== 'frozen'}
                        className="w-full max-w-xs px-2.5 py-1 rounded bg-[#050404] border border-slate-800 text-xs font-mono text-[#f5f3f0] placeholder-[#555] disabled:opacity-40 focus:outline-none focus:border-[#C9A84C]"
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-mono">
                        {/* Toggle Visible / Hidden */}
                        <button
                          type="button"
                          onClick={() => handleStateChange(sec.id, sec.state === 'hidden' ? 'visible' : 'hidden')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            sec.state === 'hidden'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {sec.state === 'hidden' ? 'Hidden ✕' : 'Hide'}
                        </button>

                        {/* Toggle Freeze */}
                        <button
                          type="button"
                          onClick={() => handleStateChange(sec.id, sec.state === 'frozen' ? 'visible' : 'frozen')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            sec.state === 'frozen'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {sec.state === 'frozen' ? 'Frozen ❄' : 'Freeze'}
                        </button>

                        {/* Preview Section Modal Iframe */}
                        <button
                          type="button"
                          onClick={() => setPreviewRoute(`${sec.route}?preview=true#${sec.anchor || ''}`)}
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[#C9A84C] hover:text-[#e8c96a] hover:border-[#C9A84C] transition-all flex items-center gap-1 cursor-pointer text-[11px]"
                          title="Open anchored section live preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}

      {/* ISOLATED SECTION PREVIEW MODAL */}
      {previewRoute && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">
                Live Admin Preview Mode: {previewRoute}
              </span>
            </div>
            <button
              onClick={() => setPreviewRoute(null)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              ✕ Exit Preview
            </button>
          </div>

          <div className="flex-1 mt-3 rounded-2xl overflow-hidden border border-slate-800 bg-[#050811] relative">
            <iframe
              src={previewRoute}
              className="w-full h-full border-none"
              title="Admin Section Live Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
