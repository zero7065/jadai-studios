'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, RefreshCw, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import SacredGeometry from '@/components/ui/SacredGeometry';
import { StudioAudio, getImageWatermarkFilename } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import UpgradeModal from '@/components/auth/UpgradeModal';
import AuthModal from '@/components/auth/AuthModal';
import { checkToolAccess, recordModuleExecution } from '@/lib/supabase/gates';

export interface RealImageGeneratorProps {
  toolName?: string;
  toolSlug?: string;
  tagline?: string;
  placeholder?: string;
  initialPrompt?: string;
  aestheticSuffix?: string;
}

interface GeneratedCard {
  id: string;
  seed: number;
  url: string;
  loading: boolean;
  error: boolean;
}

export const RealImageGenerator: React.FC<RealImageGeneratorProps> = ({
  toolName = 'MIRAGE Studio',
  toolSlug = 'mirage',
  tagline = 'Triple-variation generative imagery powered by studio neural synthesis.',
  placeholder = 'Describe your visual concept in detail...',
  initialPrompt = '',
  aestheticSuffix = ', Jadai Studios aesthetic, void black and gold, cinematic',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [activeCards, setActiveCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { showToast } = useToast();

  const generateImages = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      showToast('Please specify a visual prompt.', 'error');
      return;
    }

    // Subscription & Auth Gate Check
    const access = await checkToolAccess(toolSlug);
    if (!access.allowed) {
      if (access.reason === 'unauthenticated') {
        setAuthModalOpen(true);
      } else {
        setUpgradeModalOpen(true);
      }
      return;
    }

    setGlobalError(null);
    setIsGenerating(true);
    StudioAudio.playClick();

    const encoded = encodeURIComponent(trimmed + aestheticSuffix);
    const seeds = [1, 42, 99];
    const newCards: GeneratedCard[] = seeds.map((seed, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      seed,
      url: `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`,
      loading: true,
      error: false,
    }));

    setActiveCards(newCards);
    await recordModuleExecution(toolSlug, access.userEmail, access.userId);
  };

  const handleCardLoad = (cardId: string) => {
    setActiveCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, loading: false } : c))
    );
    setIsGenerating(false);
  };

  const handleCardError = (cardId: string) => {
    setActiveCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, loading: false, error: true } : c))
    );
    setIsGenerating(false);
    setGlobalError('Image generation temporarily unavailable. Try again in 30 seconds.');
  };

  const regenerateSingle = (cardId: string) => {
    StudioAudio.playClick();
    const newSeed = Math.floor(Math.random() * 900000) + 100;
    const trimmed = prompt.trim() || 'Jadai Studios visual asset';
    const encoded = encodeURIComponent(trimmed + aestheticSuffix);
    const newUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${newSeed}&nologo=true`;

    setActiveCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, seed: newSeed, url: newUrl, loading: true, error: false } : c
      )
    );
    showToast('Regenerating image variation...', 'info');
  };

  const downloadImage = async (card: GeneratedCard) => {
    setDownloadingId(card.id);
    StudioAudio.playClick();

    try {
      const timestamp = Date.now();
      const filename = getImageWatermarkFilename(timestamp);

      const response = await fetch(card.url, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      StudioAudio.playSuccessArpeggio();
      showToast(`Saved as ${filename}`, 'success', 'Artifact Downloaded');
    } catch (err) {
      // Fallback direct link download
      const timestamp = Date.now();
      const filename = getImageWatermarkFilename(timestamp);
      const a = document.createElement('a');
      a.href = card.url;
      a.target = '_blank';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Opening high-res image stream...', 'info');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="w-full space-y-8 select-none">
      {/* Input Header & Console */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] flex items-center justify-center text-[#e8c96a]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#f5f3f0] tracking-wide">
                {toolName}
              </h2>
              <p className="text-[11px] font-mono text-[#8a6e2a]">{tagline}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.15)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] font-bold uppercase">
            3 Variations
          </span>
        </div>

        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (globalError) setGlobalError(null);
            }}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-[#050404] border border-[rgba(201,168,76,0.25)] rounded-2xl p-4 text-[#f5f3f0] font-sans text-sm placeholder-[#6b665f] focus:outline-none focus:border-[#C9A84C] transition-colors leading-relaxed"
          />

          <button
            type="button"
            onClick={generateImages}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C9A84C] via-[#e8c96a] to-[#C9A84C] text-[#050404] font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-[0_4px_24px_rgba(201,168,76,0.3)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Rendering 3 Variations...' : 'Generate 3 Visuals'}</span>
          </button>
        </div>

        {globalError && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-xs font-mono text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}
      </div>

      {/* 3 Side-by-Side Cards (or stacked on mobile) */}
      {activeCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-[#8a6e2a] uppercase tracking-wider">
              Output Renderings (1024×1024)
            </span>
            <span className="text-[11px] font-mono text-[#c4c0bb]">
              {activeCards.filter((c) => !c.loading).length} of 3 Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeCards.map((card, idx) => (
              <div
                key={card.id}
                className="relative rounded-2xl overflow-hidden bg-[#0a0908] border border-[rgba(201,168,76,0.25)] shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex flex-col group"
              >
                {/* Image or Pulsing Metatron Skeleton */}
                <div className="relative aspect-square w-full bg-[#050404] flex items-center justify-center overflow-hidden">
                  {/* Invisible Image Preloader */}
                  <img
                    src={card.url}
                    alt={`${toolName} Output ${idx + 1}`}
                    onLoad={() => handleCardLoad(card.id)}
                    onError={() => handleCardError(card.id)}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      card.loading ? 'opacity-0' : 'opacity-100'
                    }`}
                  />

                  {/* Pulsing Skeleton Card with Metatron Sigil Centered */}
                  {card.loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070605] animate-pulse p-6 text-center space-y-4">
                      <div className="relative flex items-center justify-center">
                        <SacredGeometry size={120} opacity={0.35} interactive={false} />
                        <div className="absolute w-8 h-8 rounded-full border-2 border-[#C9A84C]/40 border-t-[#C9A84C] animate-spin" />
                      </div>
                      <span className="text-[11px] font-mono text-[#8a6e2a] tracking-wider uppercase">
                        Synthesizing Seed #{card.seed}...
                      </span>
                    </div>
                  )}

                  {card.error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0707] p-6 text-center space-y-2 text-xs font-mono text-red-300">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                      <span>Generation timeout</span>
                      <button
                        type="button"
                        onClick={() => regenerateSingle(card.id)}
                        className="px-3 py-1.5 rounded-lg bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-[#e8c96a] text-[10px] uppercase font-bold hover:bg-[#C9A84C] hover:text-black transition-colors"
                      >
                        Retry Seed
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Controls: Download + Regenerate this one */}
                <div className="p-4 bg-[#0a0908] border-t border-[rgba(201,168,76,0.15)] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8a6e2a]">
                    <span>Variation #{idx + 1}</span>
                    <span>Seed: {card.seed}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={card.loading || card.error || downloadingId === card.id}
                      onClick={() => downloadImage(card)}
                      className="py-2 px-3 rounded-xl bg-[rgba(201,168,76,0.15)] hover:bg-[#C9A84C] text-[#C9A84C] hover:text-[#050404] border border-[rgba(201,168,76,0.3)] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      disabled={card.loading}
                      onClick={() => regenerateSingle(card.id)}
                      className="py-2 px-3 rounded-xl bg-transparent hover:bg-white/5 text-[#c4c0bb] hover:text-[#f5f3f0] border border-[rgba(196,192,187,0.15)] font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${card.loading ? 'animate-spin' : ''}`} />
                      <span>Regenerate this one</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        sourceTool={toolName}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          generateImages();
        }}
      />
    </div>
  );
};

export default RealImageGenerator;
