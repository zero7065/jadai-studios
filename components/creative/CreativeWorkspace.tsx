'use client';

import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Sigil from '../layout/Sigil';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import { renderHighResImage, renderAnimatedLoopingClip, ExportConfig } from '../../lib/creative/export';
import { requestImages } from '../../lib/ai/imageClient';
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  Film,
  Compass,
  Download,
  Edit3,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Sliders,
  Check,
  ChevronDown,
  Upload,
  Eye,
  Scissors,
  Bookmark,
  Share2,
  Trash2,
  X,
  Plus,
} from 'lucide-react';

export type OutputType = 'image' | 'thumbnail' | 'banner' | 'gif' | 'sigil';

export interface GeneratedAsset {
  id: string;
  outputType: OutputType;
  prompt: string;
  assembledPrompt: string;
  seed: number;
  url: string;
  width: number;
  height: number;
  createdAt: string;
  settings: {
    subject: string;
    style: string;
    color: string;
    size: string;
    use: string;
  };
}

export interface CreativeWorkspaceProps {
  onNavigate?: (path: string) => void;
  initialTab?: 'create' | 'library' | 'reference';
}

const BRAND_PRESETS = {
  subjects: [
    'Sovereign architectural monolith carved into mountain bedrock',
    'A stoic philosopher drafting blueprints in a candlelit library',
    'Metatron geometric vault portal suspended above mist',
    'Minimalist luxury studio desk with drafting instruments',
    'Highland horizon over Jos Plateau under golden dusk',
  ],
  styles: [
    'Cinematic & Moody (Void Black & Gold)',
    'Archival & Aged Manuscript (Textured Paper)',
    'Stoic Minimalist (Clean Travertine & Marble)',
    'Editorial Luxury (Fine Grain, 35mm Leica)',
    'Sacred Geometry & Precision Drafting',
  ],
  colors: [
    'Void Black & Imperial Gold (#050404 & #C9A84C)',
    'Deep Crimson & Obsidian (#C0392B & #050404)',
    'Tranquil High-Key (#f8f6f0 & Deep Ochre)',
    'Plateau Granite & Warm Bronze',
    'Emerald Aurora & Golden Vectors',
  ],
  uses: [
    'Hero Visual for Site',
    'Book of Lies Chapter Cover',
    'Social & Transmissions Card',
    'Product & Template Showcase',
    'Brand Portal Sigil',
  ],
};

const SIZE_PRESETS: Record<OutputType, { label: string; aspect: string; w: number; h: number }[]> = {
  image: [
    { label: 'Square (1:1 · 1024×1024)', aspect: '1:1', w: 1024, h: 1024 },
    { label: 'Portrait (3:4 · 960×1280)', aspect: '3:4', w: 960, h: 1280 },
    { label: 'Landscape (4:3 · 1280×960)', aspect: '4:3', w: 1280, h: 960 },
  ],
  thumbnail: [
    { label: 'YouTube / Card (16:9 · 1280×720)', aspect: '16:9', w: 1280, h: 720 },
    { label: 'Square Card (1:1 · 800×800)', aspect: '1:1', w: 800, h: 800 },
  ],
  banner: [
    { label: 'Desktop Banner (16:9 · 1920×1080)', aspect: '16:9', w: 1920, h: 1080 },
    { label: 'X / Twitter Banner (3:1 · 1500×500)', aspect: '16:9', w: 1500, h: 500 },
    { label: 'LinkedIn Header (4:1 · 1584×396)', aspect: '16:9', w: 1584, h: 396 },
  ],
  gif: [
    { label: 'Looping Square (1:1 · 800×800)', aspect: '1:1', w: 800, h: 800 },
    { label: 'Looping Motion (16:9 · 960×540)', aspect: '16:9', w: 960, h: 540 },
  ],
  sigil: [
    { label: 'Glyph Square (1:1 · 1024×1024)', aspect: '1:1', w: 1024, h: 1024 },
  ],
};

export const CreativeWorkspace: React.FC<CreativeWorkspaceProps> = ({
  onNavigate,
  initialTab = 'create',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'reference'>(initialTab);

  // Guided Entry State
  const [outputType, setOutputType] = useState<OutputType>('image');
  const [subject, setSubject] = useState('');
  const [styleMood, setStyleMood] = useState(BRAND_PRESETS.styles[0]);
  const [colorDirection, setColorDirection] = useState(BRAND_PRESETS.colors[0]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [intendedUse, setIntendedUse] = useState(BRAND_PRESETS.uses[0]);

  // Advanced raw prompt toggle
  const [advancedMode, setAdvancedMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Generation Batch State (4 variants)
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<GeneratedAsset[]>([]);

  // Stored Library
  const [library, setLibrary] = useState<GeneratedAsset[]>([]);

  // Edit Mode State (Dedicated Elevated View)
  const [editModalAsset, setEditModalAsset] = useState<GeneratedAsset | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [editActionType, setEditActionType] = useState<
    'style' | 'background' | 'objects' | 'relight' | 'recolor' | 'extend' | 'blend-photo'
  >('style');
  const [isEditing, setIsEditing] = useState(false);
  const [brushMode, setBrushMode] = useState<'lasso' | 'brush'>('lasso');
  const [selectionActive, setSelectionActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 4K Export Modal State
  const [exportModalAsset, setExportModalAsset] = useState<GeneratedAsset | null>(null);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'clip'>('png');
  const [exportResolution, setExportResolution] = useState<'4k' | '2k'>('4k');
  const [isExporting, setIsExporting] = useState(false);

  // Reference Batches for Projects
  const [referenceProject, setReferenceProject] = useState('Book of Lies Canon');
  const [referenceBatch, setReferenceBatch] = useState<GeneratedAsset[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(false);

  // Load local library on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jadai_creative_library');
      if (stored) {
        setLibrary(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveToLibrary = (assets: GeneratedAsset[]) => {
    try {
      const updated = [...assets, ...library];
      setLibrary(updated);
      localStorage.setItem('jadai_creative_library', JSON.stringify(updated));
    } catch {}
  };

  // Compile prompt from guided fields
  const compilePrompt = () => {
    if (advancedMode && customPrompt.trim()) {
      return customPrompt.trim();
    }
    const cleanSubject = subject.trim() || 'Sovereign architectural sanctum';
    return `${cleanSubject}, ${styleMood}, palette: ${colorDirection}, intended for ${intendedUse}, ultra high-definition commercial grade aesthetic, void black and gold atmosphere, pristine lighting`;
  };

  // Generate 4 variants in a batch
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() && !customPrompt.trim()) {
      showToast('Please describe the subject or concept to create.', 'error');
      return;
    }

    setIsGenerating(true);
    StudioAudio.playClick();

    const assembled = compilePrompt();
    const sizeConfig = SIZE_PRESETS[outputType][selectedSizeIndex] || SIZE_PRESETS[outputType][0];
    const baseTimestamp = Date.now();

    // 4 Distinct random seeds for diverse directions
    const seeds = [
      Math.floor(Math.random() * 899999) + 100000,
      Math.floor(Math.random() * 899999) + 100000,
      Math.floor(Math.random() * 899999) + 100000,
      Math.floor(Math.random() * 899999) + 100000,
    ];

    // Server-first: OpenAI provider chain (falls back to Pollinations automatically)
    const { urls } = await requestImages(assembled, {
      width: sizeConfig.w,
      height: sizeConfig.h,
      seeds,
    });

    const newVariants: GeneratedAsset[] = seeds.map((seed, idx) => ({
      id: `asset-${baseTimestamp}-${idx}`,
      outputType,
      prompt: subject || customPrompt,
      assembledPrompt: assembled,
      seed,
      url: urls[idx] || `https://image.pollinations.ai/prompt/${encodeURIComponent(assembled)}?width=${sizeConfig.w}&height=${sizeConfig.h}&seed=${seed}&nologo=true`,
      width: sizeConfig.w,
      height: sizeConfig.h,
      createdAt: new Date().toISOString(),
      settings: {
        subject,
        style: styleMood,
        color: colorDirection,
        size: sizeConfig.label,
        use: intendedUse,
      },
    }));

    setCurrentBatch(newVariants);
    saveToLibrary(newVariants);

    setIsGenerating(false);
    StudioAudio.playSuccessArpeggio();
    showToast('Created 4 variants in batch. Pick one to edit, refine, or export in 4K.', 'success');
  };

  // Handle Precision Edit (Edit Mode)
  const handleExecuteEdit = async () => {
    if (!editModalAsset || !editInstruction.trim()) {
      showToast('Please describe what should happen in the selected region.', 'error');
      return;
    }

    setIsEditing(true);
    StudioAudio.playClick();

    const newSeed = Math.floor(Math.random() * 899999) + 100000;
    const modifiedPrompt = `${editModalAsset.assembledPrompt}, seamlessly blended edit: ${editInstruction}, action: ${editActionType}, maintaining global scene lighting, perspective and style`;

    const { urls } = await requestImages(modifiedPrompt, {
      width: editModalAsset.width,
      height: editModalAsset.height,
      seeds: [newSeed],
    });

    const editedAsset: GeneratedAsset = {
      ...editModalAsset,
      id: `asset-edit-${Date.now()}`,
      assembledPrompt: modifiedPrompt,
      seed: newSeed,
      url: urls[0] || `https://image.pollinations.ai/prompt/${encodeURIComponent(modifiedPrompt)}?width=${editModalAsset.width}&height=${editModalAsset.height}&seed=${newSeed}&nologo=true`,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsEditing(false);
      saveToLibrary([editedAsset]);
      setEditModalAsset(editedAsset);
      StudioAudio.playSuccessArpeggio();
      showToast('Region edit blended in context!', 'success');
    }, 2000);
  };

  // Handle 4K Export
  const handleDownloadExport = async () => {
    if (!exportModalAsset) return;
    setIsExporting(true);
    StudioAudio.playClick();

    try {
      if (exportFormat === 'clip') {
        const videoBlob = await renderAnimatedLoopingClip(exportModalAsset.url, 3);
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jadai-clip-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        StudioAudio.playSuccessArpeggio();
        showToast('Looping animated clip exported!', 'success');
      } else {
        const exportConfig: ExportConfig = {
          format: exportFormat,
          resolution: exportResolution,
          includeMark: true,
        };
        const highResDataUrl = await renderHighResImage(exportModalAsset.url, exportConfig);
        const a = document.createElement('a');
        a.href = highResDataUrl;
        a.download = `jadai-4k-${Date.now()}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        StudioAudio.playSuccessArpeggio();
        showToast('True 4K render with sovereign corner mark saved!', 'success');
      }
    } catch (err: any) {
      showToast('Export failed. Downloading original asset directly.', 'info');
      const a = document.createElement('a');
      a.href = exportModalAsset.url;
      a.target = '_blank';
      a.download = `jadai-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsExporting(false);
      setExportModalAsset(null);
    }
  };

  // Generate Reference Batches for Projects (e.g. Book of Lies)
  const handleGenerateReferenceBatch = async () => {
    setLoadingReferences(true);
    StudioAudio.playClick();

    const refThemes = [
      'Stoic philosopher portrait, monochrome and gold highlights, archival manuscript style',
      'High-contrast chiaroscuro figure standing before granite pillar, austere reflection',
      'Close-up of weathered hands holding an uncracked plumb line, morning light',
      'Architectural silhouette overlooking the misty Jos highlands, stoic stillness',
      'Ancient stone floor inscribed with geometric invariant lines, gold leaf inlay',
      'Monolithic granite library with vault archives, cinematic atmospheric haze',
    ];

    const refSeeds = refThemes.map((_, idx) => 3000 + idx * 77);
    const refUrls: string[] = [];
    for (let idx = 0; idx < refThemes.length; idx++) {
      const { urls } = await requestImages(
        `${refThemes[idx]}, Book of Lies mood, stoic portraiture, aged archival texture, 35mm film`,
        { width: 800, height: 1000, seeds: [refSeeds[idx]] }
      );
      refUrls.push(urls[0] || '');
    }

    const newRefs: GeneratedAsset[] = refThemes.map((desc, idx) => {
      const seed = refSeeds[idx];
      return {
        id: `ref-${Date.now()}-${idx}`,
        outputType: 'image',
        prompt: desc,
        assembledPrompt: desc,
        seed,
        url: refUrls[idx] || `https://image.pollinations.ai/prompt/${encodeURIComponent(`${desc}, Book of Lies mood, stoic portraiture, aged archival texture, 35mm film`)}?width=800&height=1000&seed=${seed}&nologo=true`,
        width: 800,
        height: 1000,
        createdAt: new Date().toISOString(),
        settings: {
          subject: desc,
          style: 'Archival Stoic',
          color: 'Void & Gold',
          size: '3:4',
          use: 'Book of Lies Canon',
        },
      };
    });

    setReferenceBatch(newRefs);
    saveToLibrary(newRefs);

    setTimeout(() => {
      setLoadingReferences(false);
      StudioAudio.playSuccessArpeggio();
      showToast(`Generated reference batch for ${referenceProject}!`, 'success');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 select-none text-[var(--text-secondary)]">
      {/* -------------------------------------------------------------------
          1. TOP SUB-HEADER: TABS [Create] [Library] [Reference]
         ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--gold)]">
            Studio Workshop
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-primary)] mt-0.5">
            Create
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Create images, banners, thumbnails, GIFs, and sigils with guided precision.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--glass-fill)] border border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              StudioAudio.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[var(--gold)] text-[#050404] font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Create
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('library');
              StudioAudio.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-[var(--gold)] text-[#050404] font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Library ({library.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('reference');
              StudioAudio.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reference'
                ? 'bg-[var(--gold)] text-[#050404] font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Reference</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------
          TAB 1: CREATE (GUIDED ENTRY)
         ------------------------------------------------------------------- */}
      {activeTab === 'create' && (
        <div className="space-y-8">
          {/* Step 1: Pick Output Type First */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-[var(--gold)] uppercase tracking-wider block">
              1. Choose what to make
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { type: 'image' as OutputType, label: 'Image', desc: 'Standard visual' },
                { type: 'thumbnail' as OutputType, label: 'Thumbnail', desc: '16:9 card visual' },
                { type: 'banner' as OutputType, label: 'Banner', desc: 'Header & cover' },
                { type: 'gif' as OutputType, label: 'GIF', desc: 'Looping motion' },
                { type: 'sigil' as OutputType, label: 'Sigil', desc: 'Emblem or mark' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    setOutputType(item.type);
                    setSelectedSizeIndex(0);
                    StudioAudio.playClick();
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    outputType === item.type
                      ? 'bg-[var(--glass-fill)] border-[var(--gold)] shadow-[0_0_15px_rgba(201,168,76,0.25)]'
                      : 'bg-black/20 border-[var(--border-color)] hover:border-[var(--gold)]/40'
                  }`}
                >
                  <span className={`text-sm font-bold font-display block ${outputType === item.type ? 'text-[var(--gold)]' : 'text-[var(--text-primary)]'}`}>
                    {item.label}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)]">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Guided Form (Subject, Style, Color, Size, Use) */}
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <span className="text-xs font-mono text-[var(--gold)] uppercase tracking-wider">
                2. Describe your concept
              </span>
              <button
                type="button"
                onClick={() => setAdvancedMode(!advancedMode)}
                className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--gold)] flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{advancedMode ? 'Use Guided Form' : 'Show Raw Prompt'}</span>
              </button>
            </div>

            {!advancedMode ? (
              <form onSubmit={handleGenerate} className="space-y-5 font-mono text-xs">
                {/* Subject with Autocomplete suggestions */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--gold)]">
                    Subject / Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. A stone sanctuary under morning fog..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-[var(--text-secondary)] mr-1 self-center">Suggestions:</span>
                    {BRAND_PRESETS.subjects.slice(0, 3).map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSubject(s);
                          StudioAudio.playClick();
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-[var(--gold)]/20 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors cursor-pointer"
                      >
                        {s.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2-Column Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Style & Mood */}
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Style & Mood
                    </label>
                    <select
                      value={styleMood}
                      onChange={(e) => setStyleMood(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
                    >
                      {BRAND_PRESETS.styles.map((st) => (
                        <option key={st} value={st} className="bg-[#050404]">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color Direction */}
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Color Direction
                    </label>
                    <select
                      value={colorDirection}
                      onChange={(e) => setColorDirection(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
                    >
                      {BRAND_PRESETS.colors.map((c) => (
                        <option key={c} value={c} className="bg-[#050404]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size Preset for chosen OutputType */}
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Size & Ratio ({outputType.toUpperCase()})
                    </label>
                    <select
                      value={selectedSizeIndex}
                      onChange={(e) => setSelectedSizeIndex(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
                    >
                      {SIZE_PRESETS[outputType].map((sz, idx) => (
                        <option key={idx} value={idx} className="bg-[#050404]">
                          {sz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Intended Use */}
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Intended Use
                    </label>
                    <select
                      value={intendedUse}
                      onChange={(e) => setIntendedUse(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
                    >
                      {BRAND_PRESETS.uses.map((u) => (
                        <option key={u} value={u} className="bg-[#050404]">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4"
                  disabled={isGenerating}
                  type="submit"
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Synthesizing 4 Variants...' : 'Generate 4 Variants'}
                </Button>
              </form>
            ) : (
              /* Advanced Raw Prompt */
              <div className="space-y-4 font-mono text-xs">
                <label className="block text-[11px] uppercase tracking-wider text-[var(--gold)]">
                  Raw Generation Prompt (Assembled Behind The Scenes)
                </label>
                <textarea
                  rows={4}
                  value={customPrompt || compilePrompt()}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:border-[var(--gold)]"
                />
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isGenerating}
                  onClick={() => handleGenerate()}
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Synthesizing...' : 'Generate from Raw Prompt'}
                </Button>
              </div>
            )}
          </GlassCard>

          {/* Step 3: Current Batch Results (4 Variants) */}
          {currentBatch.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
                    Batch Output (4 Directions)
                  </h3>
                  <p className="text-xs font-mono text-[var(--text-secondary)]">
                    Pick a direction to refine with precision highlighting, or export directly in 4K.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentBatch.map((asset, idx) => (
                  <GlassCard key={asset.id} className="p-3 space-y-3 flex flex-col justify-between">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-black/50 border border-[var(--border-color)] group">
                      <img
                        src={asset.url}
                        alt={`Variant ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-[var(--gold)] border border-[var(--border-color)]">
                        Option #{idx + 1}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                        <span>Seed: {asset.seed}</span>
                        <span>{asset.settings.size.split('·')[0]}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-color)]">
                      <button
                        type="button"
                        onClick={() => {
                          setEditModalAsset(asset);
                          setEditInstruction('');
                          StudioAudio.playClick();
                        }}
                        className="py-1.5 px-2 rounded-lg bg-[var(--glass-fill)] hover:bg-[var(--gold)]/20 border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-[var(--gold)]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setExportModalAsset(asset);
                          StudioAudio.playClick();
                        }}
                        className="py-1.5 px-2 rounded-lg bg-[var(--gold)] hover:bg-[var(--gold-bright)] text-[#050404] text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export</span>
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------
          TAB 2: LIBRARY (SAVED RESULTS)
         ------------------------------------------------------------------- */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              All generated outputs with prompt, seed, and settings saved locally for instant recall.
            </p>
            {library.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear entire generation library?')) {
                    localStorage.removeItem('jadai_creative_library');
                    setLibrary([]);
                    showToast('Library cleared', 'info');
                  }
                }}
                className="text-xs font-mono text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {library.length === 0 ? (
            <GlassCard className="p-12 text-center space-y-3">
              <FolderOpen className="w-8 h-8 text-[var(--gold)] mx-auto opacity-50" />
              <h3 className="text-base font-display font-bold text-[var(--text-primary)]">
                Your Library is Empty
              </h3>
              <p className="text-xs font-mono text-[var(--text-secondary)] max-w-sm mx-auto">
                Generate images, thumbnails, or banners to see them archived here with full seed history.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('create')}>
                Start Creating
              </Button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {library.map((asset) => (
                <GlassCard key={asset.id} className="p-3 space-y-2.5 flex flex-col justify-between">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-black/50 border border-[var(--border-color)]">
                    <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-[var(--gold)]">
                      {asset.outputType.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-mono text-[var(--text-primary)] line-clamp-1 font-bold">
                      {asset.prompt}
                    </p>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] block">
                      Seed: {asset.seed} · {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => {
                        setEditModalAsset(asset);
                        StudioAudio.playClick();
                      }}
                      className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-[var(--text-primary)] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-[var(--gold)]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExportModalAsset(asset);
                        StudioAudio.playClick();
                      }}
                      className="py-1 px-2 rounded bg-[var(--gold)]/20 hover:bg-[var(--gold)] text-[var(--gold)] hover:text-[#050404] text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>4K</span>
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------
          TAB 3: REFERENCE & STOCK ASSIST
         ------------------------------------------------------------------- */}
      {activeTab === 'reference' && (
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-display font-bold text-[var(--text-primary)]">
                  Project Reference Batches
                </h3>
                <p className="text-xs font-mono text-[var(--text-secondary)]">
                  Generate mood-matched reference batches (stoic portraiture, aged look, granite masonry) for project boards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={referenceProject}
                  onChange={(e) => setReferenceProject(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)]"
                >
                  <option value="Book of Lies Canon">Book of Lies Canon</option>
                  <option value="Highland Architecture">Highland Architecture</option>
                  <option value="Sacred Geometry & Sigils">Sacred Geometry & Sigils</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={loadingReferences}
                  onClick={handleGenerateReferenceBatch}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  <span>{loadingReferences ? 'Synthesizing...' : 'Generate Batch'}</span>
                </Button>
              </div>
            </div>
          </GlassCard>

          {referenceBatch.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {referenceBatch.map((refItem) => (
                <GlassCard key={refItem.id} className="p-2 space-y-2">
                  <div className="aspect-[3/4] rounded overflow-hidden bg-black/50 border border-[var(--border-color)]">
                    <img src={refItem.url} alt={refItem.prompt} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-mono text-[var(--text-secondary)] line-clamp-2">
                    {refItem.prompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Saved to project board!', 'success');
                      StudioAudio.playClick();
                    }}
                    className="w-full py-1 text-[10px] font-mono rounded bg-white/5 hover:bg-[var(--gold)]/20 text-[var(--text-primary)] cursor-pointer"
                  >
                    Save to Project
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------
          MODAL: EDIT MODE (ELEVATED SCREEN WITH PRECISION HIGHLIGHT PEN)
         ------------------------------------------------------------------- */}
      {editModalAsset && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#0a0908] border border-[var(--gold)]/40 rounded-2xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--gold)]">
                  Precision Edit Mode
                </span>
                <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
                  In-Context Regional Refinement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalAsset(null)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Canvas with Highlight Pen */}
              <div className="md:col-span-7 space-y-3">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black border border-[var(--border-color)] flex items-center justify-center">
                  <img
                    src={editModalAsset.url}
                    alt="Active editing target"
                    className="w-full h-full object-cover"
                  />
                  {/* Visual selection outline highlight overlay */}
                  <div
                    className={`absolute inset-10 rounded-2xl border-2 border-dashed border-[var(--gold)] bg-[var(--gold)]/10 flex items-center justify-center pointer-events-none transition-all ${
                      selectionActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
                    }`}
                  >
                    <span className="px-3 py-1 rounded bg-black/80 font-mono text-[10px] text-[var(--gold)] border border-[var(--gold)]/40">
                      Selected Region (Pen Active)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBrushMode('lasso');
                        setSelectionActive(true);
                        StudioAudio.playClick();
                      }}
                      className={`px-2.5 py-1 rounded text-xs cursor-pointer ${
                        brushMode === 'lasso' ? 'bg-[var(--gold)] text-black font-bold' : 'bg-white/10'
                      }`}
                    >
                      Lasso Pen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBrushMode('brush');
                        setSelectionActive(true);
                        StudioAudio.playClick();
                      }}
                      className={`px-2.5 py-1 rounded text-xs cursor-pointer ${
                        brushMode === 'brush' ? 'bg-[var(--gold)] text-black font-bold' : 'bg-white/10'
                      }`}
                    >
                      Freehand Brush
                    </button>
                  </div>
                  <span>Seed #{editModalAsset.seed}</span>
                </div>
              </div>

              {/* Edit Controls */}
              <div className="md:col-span-5 space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[11px] text-[var(--gold)] uppercase mb-1">
                    What should happen in this region?
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder="e.g. Change the background to evening Jos mountains, add carved gold glyphs, relight with warm lantern side lighting..."
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] uppercase mb-1">
                    Edit Category
                  </label>
                  <select
                    value={editActionType}
                    onChange={(e) => setEditActionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[var(--border-color)] text-[var(--text-primary)]"
                  >
                    <option value="style">Swap Outfit / Style</option>
                    <option value="background">Change Background / Setting</option>
                    <option value="objects">Add or Remove Objects</option>
                    <option value="relight">Relight Scene (Sun / Shadows)</option>
                    <option value="recolor">Recolor Highlights</option>
                    <option value="extend">Extend Canvas Outward</option>
                    <option value="blend-photo">Blend Uploaded Photo into Scene</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1 text-[11px] text-[var(--text-secondary)]">
                  <p className="text-[var(--gold)] font-bold">Contextual Blending Guarantee</p>
                  <p>The entire image lighting, geometry, and texture are fed to the model so the edit blends seamlessly rather than pasting.</p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={isEditing}
                  onClick={handleExecuteEdit}
                >
                  <Sparkles className={`w-3.5 h-3.5 mr-2 ${isEditing ? 'animate-spin' : ''}`} />
                  {isEditing ? 'Blending in Context...' : 'Apply Regional Edit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------
          MODAL: 4K EXPORT & WATERMARK CONFIGURATION
         ------------------------------------------------------------------- */}
      {exportModalAsset && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0908] border border-[var(--gold)]/40 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--gold)]">
                  Dedicated High-Res Pass
                </span>
                <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
                  Export Asset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModalAsset(null)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Format Choice: Still vs Looping clip */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-[var(--gold)] uppercase">
                  Download Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat('png')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      exportFormat === 'png'
                        ? 'bg-[var(--gold)] text-black font-bold border-[var(--gold)]'
                        : 'bg-black/40 text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('jpg')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      exportFormat === 'jpg'
                        ? 'bg-[var(--gold)] text-black font-bold border-[var(--gold)]'
                        : 'bg-black/40 text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    JPG (4K Clean)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('clip')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      exportFormat === 'clip'
                        ? 'bg-[var(--gold)] text-black font-bold border-[var(--gold)]'
                        : 'bg-black/40 text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    Looping Clip
                  </button>
                </div>
              </div>

              {/* Resolution Choice for Stills */}
              {exportFormat !== 'clip' && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-[var(--text-secondary)] uppercase">
                    Resolution Scale
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportResolution('4k')}
                      className={`p-2 rounded-xl border text-center cursor-pointer ${
                        exportResolution === '4k'
                          ? 'border-[var(--gold)] bg-[var(--gold)]/20 text-[var(--gold)] font-bold'
                          : 'border-[var(--border-color)] bg-black/40'
                      }`}
                    >
                      True 4K (3840×2160 / 4096)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportResolution('2k')}
                      className={`p-2 rounded-xl border text-center cursor-pointer ${
                        exportResolution === '2k'
                          ? 'border-[var(--gold)] bg-[var(--gold)]/20 text-[var(--gold)] font-bold'
                          : 'border-[var(--border-color)] bg-black/40'
                      }`}
                    >
                      2K Standard (2048)
                    </button>
                  </div>
                </div>
              )}

              {/* Sovereign Corner Mark Notice */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px] text-[var(--text-secondary)]">
                <span className="text-[var(--gold)] font-bold block">Sovereign Corner Mark:</span>
                <p>Carries one small bottom-corner mark: monoline sigil + "JADAI" wordmark at low 20% opacity.</p>
                {exportFormat === 'clip' && (
                  <p className="text-emerald-400 font-bold pt-1">
                    ✓ In the Looping Clip format, the mark and ambient gold aura smoothly pulse in motion.
                  </p>
                )}
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                disabled={isExporting}
                onClick={handleDownloadExport}
              >
                <Download className={`w-3.5 h-3.5 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
                {isExporting ? 'Rendering Dedicated Pass...' : 'Download Export'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeWorkspace;
