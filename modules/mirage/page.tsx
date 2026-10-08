'use client';

import React, { useState } from 'react';
import Carousel from '@/components/ui/Carousel';
import { generateImage } from './lib/providers';
import ThumbnailGenerator from '@/components/generators/ThumbnailGenerator';
import LogoGenerator from '@/components/generators/LogoGenerator';
import GifGenerator from '@/components/generators/GifGenerator';
import { Download, RefreshCw, Sparkles, Image as ImageIcon, AlertCircle, Film, Layers } from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';

export default function MiragePage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [activeTab, setActiveTab] = useState<'mirage' | 'thumbnails' | 'logos' | 'gifs'>('mirage');

  // Mirage 3-Variation Studio State
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:5' | '9:16'>('1:1');
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const STYLES = [
    { id: 'cinematic', label: 'Cinematic Drama' },
    { id: 'photorealistic', label: 'Photorealistic 35mm' },
    { id: 'illustration', label: 'Digital Illustration' },
    { id: 'jade-art', label: 'Jadai Void & Gold' },
    { id: 'blueprint', label: 'Architectural Blueprint' },
  ];

  const ASPECT_RATIOS: Array<{ id: '1:1' | '16:9' | '4:5' | '9:16'; label: string; dims: { width: number; height: number } }> = [
    { id: '1:1', label: '1:1 Square', dims: { width: 1024, height: 1024 } },
    { id: '16:9', label: '16:9 Landscape', dims: { width: 1280, height: 720 } },
    { id: '4:5', label: '4:5 Portrait', dims: { width: 1024, height: 1280 } },
    { id: '9:16', label: '9:16 Mobile Story', dims: { width: 720, height: 1280 } },
  ];

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('Please provide a visual prompt description.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      StudioAudio.playClick();
    } catch {}

    const selectedRatio = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];
    const styleSuffix = {
      cinematic: 'cinematic composition, dramatic volumetric lighting, sharp focus, 8k resolution, warm golds and deep void shadows',
      photorealistic: 'photorealistic 35mm lens, raw photograph, hyper-detailed textures, studio lighting, depth of field',
      illustration: 'masterpiece digital art, intricate lines, clean cel shading, sacred geometry vectors, ethereal lighting',
      'jade-art': 'Jadai Studios sovereign aesthetic, ancient-blue obsidian, brushed gold trim, Metatron geometry, highland mist',
      blueprint: 'architectural drafting schematic, isometric technical drawing, precise CAD lines, cyan and gold on dark vellum',
    }[style] || '';

    const fullPrompt = `${trimmed}, ${styleSuffix}`;

    try {
      // Generate 3 images
      const baseSeed = Date.now();
      const generated: string[] = [];

      for (let i = 0; i < 3; i++) {
        const seed = baseSeed + i * 9973 + Math.floor(Math.random() * 500);
        const url = await generateImage(fullPrompt, {
          width: selectedRatio.dims.width,
          height: selectedRatio.dims.height,
          seed,
        });
        generated.push(url);
      }

      setImages(generated);
      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
    } catch (err: any) {
      console.error('Mirage generation failed:', err);
      setError("PRIME's image engine is busy. Try again in 30 seconds.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateOne = async (index: number) => {
    const trimmed = prompt.trim() || 'Cinematic visual';
    const selectedRatio = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];
    try {
      StudioAudio.playClick();
      const url = await generateImage(`${trimmed}, cinematic`, {
        width: selectedRatio.dims.width,
        height: selectedRatio.dims.height,
        seed: Date.now() + Math.floor(Math.random() * 100000),
      });

      setImages((prev) => {
        const copy = [...prev];
        copy[index] = url;
        return copy;
      });
    } catch {
      setError("PRIME's image engine is busy. Try again in 30 seconds.");
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      StudioAudio.playClick();
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `jadai-mirage-variation-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#050404] text-[#c4c0bb] pt-8 pb-24 px-4 sm:px-6 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Studio Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
                JADAI CREATIVE FOUNDRY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]">
              MIRAGE Studio & Generators
            </h1>
            <p className="text-xs font-mono text-[#8a857e] mt-1">
              Deterministic 3-variant generative imagery, platform thumbnails, brand logos, and animated motion.
            </p>
          </div>

          {/* Sub-Generator Tabs */}
          <div className="p-1 rounded-2xl bg-black/60 border border-[rgba(201,168,76,0.3)] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('mirage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'mirage'
                  ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mirage 3X</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('thumbnails')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'thumbnails'
                  ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Thumbnails</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logos'
                  ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Logos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gifs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gifs'
                  ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>GIFs & Motion</span>
            </button>
          </div>
        </div>

        {/* ------------------- TAB 1: MIRAGE 3-VARIATION STUDIO ------------------- */}
        {activeTab === 'mirage' && (
          <div className="p-6 rounded-3xl bg-[rgba(10,9,8,0.7)] border border-[rgba(201,168,76,0.3)] backdrop-blur-2xl space-y-6 text-[#f5f3f0]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold block mb-1">
                TRIPLE VARIATION SYNTHESIS
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold">Image Synthesis Engine</h2>
              <p className="text-xs font-mono text-[#8a857e] mt-1">
                Describe it. See it. 3 instant variations rendered with studio lighting.
              </p>
            </div>

            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">Prompt</label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A glowing crystal in a dark cave, cinematic lighting, gold and obsidian textures..."
                  className="w-full p-4 rounded-2xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Style Dropdown */}
                <div>
                  <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] text-xs font-mono outline-none cursor-pointer"
                  >
                    {STYLES.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0a0908] text-white">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          aspectRatio === ratio.id
                            ? 'bg-[#C9A84C] text-[#050404]'
                            : 'bg-black/40 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {ratio.id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] font-display font-bold text-xs uppercase tracking-[0.2em] shadow-[0_4px_25px_rgba(201,168,76,0.35)] transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing 3 Variations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate 3 Images</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Output Grid */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8a6e2a] block">
                Rendered Results (3 Variations)
              </span>

              {/* Loading Skeleton: 3 pulsing squares */}
              {isGenerating ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="aspect-square rounded-2xl bg-black/80 border border-[rgba(201,168,76,0.25)] flex flex-col items-center justify-center gap-3 animate-pulse p-4 shadow-xl"
                    >
                      <div className="w-10 h-10 rounded-full border border-[#C9A84C] border-t-transparent animate-spin" />
                      <span className="text-xs font-mono text-[#e8c96a]">Synthesizing Variation #{n}...</span>
                    </div>
                  ))}
                </div>
              ) : images.length > 0 ? (
                /* Results: Single-Card Carousel with categoryLabel FEATURED TOOLS per FIX 6 */
                <Carousel
                  categoryLabel="FEATURED TOOLS"
                  items={images.map((imgUrl, index) => ({
                    id: index,
                    content: (
                      <div className="w-full max-w-[480px] rounded-3xl border border-[rgba(201,168,76,0.35)] bg-black/90 overflow-hidden shadow-2xl flex flex-col justify-between group mx-auto">
                        <div className="relative aspect-square bg-[#050404] flex items-center justify-center overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Variation ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 bg-[#0a0908]">
                          <span className="text-xs font-mono text-[#e8c96a] font-bold">
                            Variation #{index + 1}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRegenerateOne(index)}
                              className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-[#C9A84C] text-[#8a857e] hover:text-[#f5f3f0] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Regenerate this variation"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-[#C9A84C]" />
                              <span>Regen</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownload(imgUrl, index)}
                              className="px-4 py-1.5 rounded-xl bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                              title="Download variation"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <div className="p-12 rounded-2xl bg-black/40 border border-white/5 text-center text-[#555] font-mono text-xs flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-10 h-10 opacity-30 text-[#C9A84C]" />
                  <p>Enter a prompt and select your style to render 3 live image variations.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------- TAB 2: THUMBNAILS ------------------- */}
        {activeTab === 'thumbnails' && <ThumbnailGenerator />}

        {/* ------------------- TAB 3: LOGOS ------------------- */}
        {activeTab === 'logos' && <LogoGenerator />}

        {/* ------------------- TAB 4: GIFS & MOTION ------------------- */}
        {activeTab === 'gifs' && <GifGenerator />}
      </div>
    </div>
  );
}
