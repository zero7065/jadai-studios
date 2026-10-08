'use client';

import React, { useState } from 'react';
import { generateImage } from '@/modules/mirage/lib/providers';
import { Download, RefreshCw, Sparkles, Image as ImageIcon, Upload, Check, AlertCircle } from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';

interface TemplateOption {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  presetStyle: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'youtube',
    name: 'YouTube Thumbnail',
    platform: 'YouTube (16:9)',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    presetStyle: 'bold vibrant YouTube thumbnail, hyper-expressive, high contrast, cinematic studio lighting, 8k',
  },
  {
    id: 'blog',
    name: 'Editorial Blog Header',
    platform: 'Medium / Substack',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    presetStyle: 'editorial magazine header, sophisticated minimalist composition, moody dramatic shadows',
  },
  {
    id: 'instagram',
    name: 'Instagram Square',
    platform: 'Instagram Post (1:1)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    presetStyle: 'aesthetic Instagram photography, clean composition, warm ambient golden hour tones',
  },
  {
    id: 'twitter',
    name: 'Twitter / X Card',
    platform: 'Social Share Card',
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
    presetStyle: 'tech social preview banner, sleek futuristic typography space, deep dark obsidian and gold accents',
  },
];

export const ThumbnailGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(TEMPLATES[0]);
  const [prompt, setPrompt] = useState('');
  const [titleOverlay, setTitleOverlay] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setGeneratedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    const textPrompt = prompt.trim() || titleOverlay.trim() || 'Modern architectural tech concept';
    setError(null);
    setIsGenerating(true);
    try {
      StudioAudio.playClick();
    } catch {}

    const fullPrompt = `${textPrompt}, ${selectedTemplate.presetStyle}`;

    try {
      const url = await generateImage(fullPrompt, {
        width: selectedTemplate.width,
        height: selectedTemplate.height,
        seed: Date.now(),
      });
      setGeneratedImage(url);
      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
    } catch (err: any) {
      console.error('Thumbnail generation failed:', err);
      setError("PRIME's image engine is busy. Try again in 30 seconds.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      StudioAudio.playClick();
    } catch {}

    try {
      const res = await fetch(generatedImage);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `jadai-thumbnail-${selectedTemplate.id}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(generatedImage, '_blank');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[rgba(10,9,8,0.7)] border border-[rgba(201,168,76,0.3)] backdrop-blur-2xl space-y-6 text-[#f5f3f0]">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold block mb-1">
          STUDIO ENGINE
        </span>
        <h2 className="text-xl sm:text-2xl font-display font-bold">Thumbnail & Card Generator</h2>
        <p className="text-xs font-mono text-[#8a857e] mt-1">
          Pick a platform template, describe the visual, and generate high-res ready-to-publish thumbnails.
        </p>
      </div>

      {/* Template Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {TEMPLATES.map((tmpl) => {
          const isSelected = tmpl.id === selectedTemplate.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => {
                setSelectedTemplate(tmpl);
                try {
                  StudioAudio.playClick();
                } catch {}
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.15)] shadow-md'
                  : 'border-white/10 bg-black/40 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold text-xs text-[#f5f3f0] block">{tmpl.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#C9A84C]" />}
              </div>
              <p className="text-[10px] font-mono text-[#8a857e]">{tmpl.platform}</p>
              <span className="text-[9px] font-mono text-[#C9A84C] block mt-1">
                {tmpl.width} × {tmpl.height}px
              </span>
            </button>
          );
        })}
      </div>

      {/* Input Options */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">
            Thumbnail Concept / Subject Description
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A solitary mechanical architect looking at a glowing blueprint in the desert, cinematic lighting..."
            className="w-full p-3.5 rounded-2xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">Headline / Title Text</label>
            <input
              type="text"
              value={titleOverlay}
              onChange={(e) => setTitleOverlay(e.target.value)}
              placeholder="e.g. BUILDING BEYOND CODE"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">
              Or Upload Reference Image (Optional)
            </label>
            <label className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] text-[#8a857e] hover:text-[#f5f3f0] text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span className="truncate">{uploadedImage ? 'Change Image' : 'Upload Image'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
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
              <span>Synthesizing Thumbnail...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Thumbnail Image</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Stage */}
      <div className="space-y-3 pt-2">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#8a6e2a] block">
          Rendered Thumbnail Output
        </span>

        {isGenerating ? (
          <div className="w-full aspect-video rounded-2xl bg-black/80 border border-[rgba(201,168,76,0.2)] flex flex-col items-center justify-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full border border-[#C9A84C] border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-[#e8c96a]">Generating {selectedTemplate.name}...</p>
          </div>
        ) : generatedImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-[rgba(201,168,76,0.4)] shadow-2xl bg-black group">
            <img
              src={generatedImage}
              alt="Generated Thumbnail"
              className="w-full h-auto object-cover max-h-[500px]"
            />

            {/* Optional Title Overlay Preview */}
            {titleOverlay && (
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
                <h3 className="font-display font-black text-xl sm:text-3xl text-white tracking-wide uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  {titleOverlay}
                </h3>
              </div>
            )}

            {/* Floating Action Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                className="px-3 py-1.5 rounded-full bg-black/75 hover:bg-black border border-white/20 text-[#f5f3f0] text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer"
                title="Regenerate"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                title="Download Image"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-video rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center p-6 text-[#555]">
            <ImageIcon className="w-10 h-10 mb-2 opacity-40 text-[#C9A84C]" />
            <p className="text-xs font-mono">Select a template and enter a prompt to render your thumbnail.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailGenerator;
