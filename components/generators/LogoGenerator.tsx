'use client';

import React, { useState } from 'react';
import { generateImage } from '@/modules/mirage/lib/providers';
import { Download, RefreshCw, Sparkles, AlertCircle, FileCode, Layers } from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';

interface LogoConcept {
  id: string;
  styleName: string;
  url: string;
}

export const LogoGenerator: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [vibeKeywords, setVibeKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [concepts, setConcepts] = useState<LogoConcept[]>([]);
  const [error, setError] = useState<string | null>(null);

  const STYLES = [
    {
      name: 'Geometric Monogram',
      promptModifier: 'clean vector logo monogram mark, geometric symmetry, isolated on pure black background, minimalist vector art, gold and silver foil aesthetic, high contrast, no realistic photo artifacts',
    },
    {
      name: 'Modern Emblem / Sigil',
      promptModifier: 'sacred geometry emblem logo, clean line art symbol, circular crest, luxury branding, minimalist modern mark, pure dark background, crisp edges',
    },
    {
      name: 'Futuristic Tech Insignia',
      promptModifier: 'sleek technological insignia logo, aerodynamic sharp lines, cybernetic elegance, polished bronze and gold on void black, premium app icon aesthetic',
    },
  ];

  const handleGenerate = async () => {
    const brand = brandName.trim();
    if (!brand) {
      setError('Please provide a brand name.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      StudioAudio.playClick();
    } catch {}

    const vibe = vibeKeywords.trim() || 'modern, premium, elegant';

    try {
      const generated: LogoConcept[] = [];
      const baseSeed = Date.now();

      for (let i = 0; i < STYLES.length; i++) {
        const style = STYLES[i];
        const prompt = `A professional company logo for "${brand}", vibe: ${vibe}, ${style.promptModifier}`;
        const seed = baseSeed + i * 31415 + Math.floor(Math.random() * 500);

        const url = await generateImage(prompt, {
          width: 800,
          height: 800,
          seed,
        });

        generated.push({
          id: `logo-${i}-${Date.now()}`,
          styleName: style.name,
          url,
        });
      }

      setConcepts(generated);
      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
    } catch (err: any) {
      console.error('Logo generation error:', err);
      setError("PRIME's image engine is busy. Try again in 30 seconds.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateOne = async (index: number) => {
    const brand = brandName.trim() || 'JADAI';
    const vibe = vibeKeywords.trim() || 'modern, premium, elegant';
    const style = STYLES[index];
    const prompt = `A professional company logo for "${brand}", vibe: ${vibe}, ${style.promptModifier}`;

    try {
      StudioAudio.playClick();
      const url = await generateImage(prompt, {
        width: 800,
        height: 800,
        seed: Date.now() + Math.floor(Math.random() * 99999),
      });

      setConcepts((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          url,
        };
        return copy;
      });
    } catch {
      setError("PRIME's image engine is busy. Try again in 30 seconds.");
    }
  };

  const handleDownloadPng = async (url: string, index: number) => {
    try {
      StudioAudio.playClick();
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo-concept-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleDownloadSvg = (url: string, index: number) => {
    try {
      StudioAudio.playClick();
      // SVG wrapper with embedded raster image for vector graphics tools
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <filter id="crisp">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
    </filter>
  </defs>
  <rect width="800" height="800" fill="#050404"/>
  <image href="${url}" width="800" height="800" filter="url(#crisp)"/>
</svg>`;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo-concept-${index + 1}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[rgba(10,9,8,0.7)] border border-[rgba(201,168,76,0.3)] backdrop-blur-2xl space-y-6 text-[#f5f3f0]">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold block mb-1">
          BRAND IDENTITY FOUNDRY
        </span>
        <h2 className="text-xl sm:text-2xl font-display font-bold">Logo & Brand Concept Generator</h2>
        <p className="text-xs font-mono text-[#8a857e] mt-1">
          Enter your brand name and vibe keywords to forge 3 distinct vector-ready logo marks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">Brand / Organization Name</label>
          <input
            type="text"
            required
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Lumina Technologies"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">Vibe / Style Keywords</label>
          <input
            type="text"
            value={vibeKeywords}
            onChange={(e) => setVibeKeywords(e.target.value)}
            placeholder="e.g. luxury, obsidian, sacred geometry, minimalist, gold"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3.5 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] font-display font-bold text-xs uppercase tracking-[0.2em] shadow-[0_4px_25px_rgba(201,168,76,0.35)] transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Generating 3 Logo Concepts...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate 3 Logo Concepts</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Stage: 3 Concepts Grid */}
      <div className="space-y-3 pt-2">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#8a6e2a] block">
          Logo Concepts (3 Variations)
        </span>

        {isGenerating ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="aspect-square rounded-2xl bg-black/80 border border-[rgba(201,168,76,0.2)] flex flex-col items-center justify-center gap-2 animate-pulse p-4"
              >
                <div className="w-8 h-8 rounded-full border border-[#C9A84C] border-t-transparent animate-spin" />
                <span className="text-[11px] font-mono text-[#8a6e2a]">Forging Concept {n}...</span>
              </div>
            ))}
          </div>
        ) : concepts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {concepts.map((concept, index) => (
              <div
                key={concept.id}
                className="rounded-2xl border border-[rgba(201,168,76,0.35)] bg-black/70 overflow-hidden shadow-xl flex flex-col justify-between group"
              >
                <div className="p-3 border-b border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#e8c96a]">{concept.styleName}</span>
                  <span className="text-[10px] text-[#8a857e]">Concept #{index + 1}</span>
                </div>

                <div className="relative aspect-square bg-[#050404] flex items-center justify-center p-4">
                  <img
                    src={concept.url}
                    alt={`${brandName} Logo Concept ${index + 1}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                <div className="p-3 border-t border-white/5 flex items-center justify-between gap-1.5 bg-[#0a0908]">
                  <button
                    type="button"
                    onClick={() => handleRegenerateOne(index)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a857e] hover:text-[#f5f3f0] transition-colors cursor-pointer"
                    title="Regenerate this concept"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownloadSvg(concept.url, index)}
                      className="px-2.5 py-1.5 rounded-lg border border-[rgba(201,168,76,0.3)] hover:border-[#C9A84C] bg-white/5 hover:bg-white/10 text-[11px] font-mono text-[#e8c96a] flex items-center gap-1 transition-all cursor-pointer"
                      title="Download Vector SVG"
                    >
                      <FileCode className="w-3 h-3" />
                      <span>SVG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPng(concept.url, index)}
                      className="px-3 py-1.5 rounded-lg bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title="Download PNG"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-black/40 border border-white/5 text-center text-[#555] font-mono text-xs">
            Enter your brand name above to generate 3 custom logo concepts.
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoGenerator;
