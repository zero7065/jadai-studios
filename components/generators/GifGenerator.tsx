'use client';

import React, { useState, useRef, useEffect } from 'react';
import { requestImages } from '@/lib/ai/imageClient';
import { encodeGif, GifFrameInput } from '@/lib/creative/gif-encoder';
import { Download, RefreshCw, Sparkles, Upload, Play, Pause, Film, Image as ImageIcon } from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';

export const GifGenerator: React.FC = () => {
  const { showToast } = useToast();
  const [imageSrc, setImageSrc] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
  const [textCaption, setTextCaption] = useState('JADAI STUDIOS');
  const [subCaption, setSubCaption] = useState('BUILD DIFFERENT');
  const [effectType, setEffectType] = useState<'sheen' | 'pulse' | 'typewriter' | 'scanline'>('sheen');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGeneratingBase, setIsGeneratingBase] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);

  // Load image into memory
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      loadedImgRef.current = img;
    };
  }, [imageSrc]);

  // Frame rendering loop
  useEffect(() => {
    let active = true;

    const render = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (canvas && loadedImgRef.current && isPlaying) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          frameCountRef.current = (frameCountRef.current + 1) % 120;
          const frame = frameCountRef.current;
          const progress = frame / 120; // 0 to 1

          // 1. Draw Background Image
          ctx.clearRect(0, 0, w, h);
          ctx.save();

          if (effectType === 'pulse') {
            const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.04;
            ctx.translate(w / 2, h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);
          }

          ctx.drawImage(loadedImgRef.current, 0, 0, w, h);
          ctx.restore();

          // 2. Effect Overlay
          if (effectType === 'sheen') {
            const sheenX = (progress * 2 - 0.5) * w;
            const grad = ctx.createLinearGradient(sheenX - 120, 0, sheenX + 120, h);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(0.5, 'rgba(201, 168, 76, 0.45)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
          } else if (effectType === 'scanline') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            for (let y = 0; y < h; y += 4) {
              ctx.fillRect(0, y, w, 2);
            }
            const barY = (progress * h * 1.5) % h;
            const barGrad = ctx.createLinearGradient(0, barY - 20, 0, barY + 20);
            barGrad.addColorStop(0, 'transparent');
            barGrad.addColorStop(0.5, 'rgba(201, 168, 76, 0.35)');
            barGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = barGrad;
            ctx.fillRect(0, barY - 20, w, 40);
          }

          // 3. Text Overlay
          if (textCaption) {
            ctx.save();
            ctx.textAlign = 'center';

            let displayText = textCaption;
            if (effectType === 'typewriter') {
              const chars = Math.min(
                textCaption.length,
                Math.floor((progress * 2) * textCaption.length)
              );
              displayText = textCaption.slice(0, chars);
            }

            // Dark backing strip
            ctx.fillStyle = 'rgba(5, 4, 4, 0.65)';
            ctx.fillRect(0, h - 110, w, 90);

            // Gold accent line
            ctx.fillStyle = '#C9A84C';
            ctx.fillRect(w / 2 - 60, h - 110, 120, 2);

            // Title
            ctx.font = 'bold 22px Cinzel, serif';
            ctx.fillStyle = '#f5f3f0';
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 8;
            ctx.fillText(displayText, w / 2, h - 68);

            // Subtitle
            if (subCaption) {
              ctx.font = '11px JetBrains Mono, monospace';
              ctx.fillStyle = '#C9A84C';
              ctx.fillText(subCaption, w / 2, h - 42);
            }

            ctx.restore();
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, effectType, textCaption, subCaption]);

  const handleGenerateBaseImage = async () => {
    if (!prompt.trim()) return;
    setIsGeneratingBase(true);
    try {
      StudioAudio.playClick();
      const { urls } = await requestImages(prompt, { width: 600, height: 600, seeds: [Date.now()] });
      const url = urls[0];
      if (!url) throw new Error('No image returned');
      setImageSrc(url);
      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingBase(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Real animated GIF export — samples one full 120-frame canvas loop and
  // encodes it with the pure-TS GIF89a encoder (median-cut + LZW).
  const handleDownloadGif = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRendering) return;

    try {
      StudioAudio.playClick();
    } catch {}
    setIsRendering(true);
    if (!isPlaying) setIsPlaying(true);

    try {
      const OUT_SIZE = 400;
      const FRAME_COUNT = 60;
      const scratch = document.createElement('canvas');
      scratch.width = OUT_SIZE;
      scratch.height = OUT_SIZE;
      const sctx = scratch.getContext('2d');
      if (!sctx) throw new Error('2d context unavailable');

      const frames: GifFrameInput[] = [];
      for (let i = 0; i < FRAME_COUNT; i++) {
        // Sample every 2nd rAF → 60 frames spanning the full 120-frame loop (~2s).
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        sctx.drawImage(canvas, 0, 0, OUT_SIZE, OUT_SIZE);
        frames.push({ imageData: sctx.getImageData(0, 0, OUT_SIZE, OUT_SIZE), delayMs: 33 });
      }

      const bytes = encodeGif(OUT_SIZE, OUT_SIZE, frames);
      const blob = new Blob([bytes], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jadai-loop-${Date.now()}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      StudioAudio.playSuccessArpeggio();
      showToast(
        `GIF exported — ${FRAME_COUNT} frames, ${(bytes.length / 1024).toFixed(0)} KB.`,
        'success'
      );
    } catch (err: any) {
      showToast(
        `GIF export failed: ${err?.message || 'unknown error'}${
          String(err?.message || '').includes('tainted') || String(err?.name || '') === 'SecurityError'
            ? ' (the base image blocks cross-origin pixel reads — upload or generate your own image)'
            : ''
        }.`,
        'error'
      );
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      StudioAudio.playClick();
      setIsRendering(true);

      // Check MediaRecorder support for WebM/GIF animated export
      if (typeof MediaRecorder !== 'undefined') {
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm',
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `jadai-animation-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsRendering(false);
        };

        recorder.start();
        setTimeout(() => {
          recorder.stop();
        }, 3000); // 3 seconds loop
      } else {
        // Fallback: Snapshot PNG
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `jadai-frame-${Date.now()}.png`;
        a.click();
        setIsRendering(false);
      }
    } catch {
      setIsRendering(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[rgba(10,9,8,0.7)] border border-[rgba(201,168,76,0.3)] backdrop-blur-2xl space-y-6 text-[#f5f3f0]">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold block mb-1">
          MOTION CANVAS
        </span>
        <h2 className="text-xl sm:text-2xl font-display font-bold">GIF & Looping Motion Generator</h2>
        <p className="text-xs font-mono text-[#8a857e] mt-1">
          Combine images with kinetic typographic motion, metallic sheen passes, and rhythmic pulses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Column */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">
              1. Base Image: Prompt or Upload
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Generate new base image (e.g. obsidian cube, gold glow)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] focus:border-[#C9A84C] text-[#f5f3f0] placeholder-[#555] text-xs font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateBaseImage}
                disabled={isGeneratingBase}
                className="px-3 py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-bold text-xs font-mono flex items-center gap-1 cursor-pointer hover:bg-[#e8c96a] transition-all disabled:opacity-50"
              >
                {isGeneratingBase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate</span>
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <label className="text-[11px] font-mono text-[#8a857e] hover:text-[#e8c96a] flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3 h-3 text-[#C9A84C]" />
                <span>Upload custom file instead</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#c4c0bb] block mb-1">Headline Text</label>
              <input
                type="text"
                value={textCaption}
                onChange={(e) => setTextCaption(e.target.value)}
                placeholder="Headline"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#c4c0bb] block mb-1">Subtitle</label>
              <input
                type="text"
                value={subCaption}
                onChange={(e) => setSubCaption(e.target.value)}
                placeholder="Subtitle"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#c4c0bb] block mb-1.5">Animation Effect</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sheen', name: 'Golden Sheen Sweep' },
                { id: 'pulse', name: 'Kinetic Depth Pulse' },
                { id: 'typewriter', name: 'Typewriter Text' },
                { id: 'scanline', name: 'Cybernetic Scanline' },
              ].map((eff) => (
                <button
                  key={eff.id}
                  type="button"
                  onClick={() => setEffectType(eff.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono text-left transition-all cursor-pointer ${
                    effectType === eff.id
                      ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.15)] text-[#e8c96a]'
                      : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  {eff.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2.5 rounded-full border border-[rgba(201,168,76,0.3)] bg-white/5 hover:bg-white/10 text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#C9A84C]" /> : <Play className="w-3.5 h-3.5 text-[#C9A84C]" />}
              <span>{isPlaying ? 'Pause Loop' : 'Play Loop'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadGif}
              disabled={isRendering}
              className="flex-1 py-2.5 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isRendering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isRendering ? 'Encoding GIF...' : 'Export GIF (.gif)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAnimation}
              disabled={isRendering}
              className="px-4 py-2.5 rounded-full border border-[rgba(201,168,76,0.3)] bg-white/5 hover:bg-white/10 text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              title="3-second WebM video loop"
            >
              <Film className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>WebM</span>
            </button>
          </div>
        </div>

        {/* Live Canvas Viewport */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-[rgba(201,168,76,0.4)] shadow-2xl bg-black">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="w-full max-w-[420px] aspect-square object-cover"
            />
          </div>
          <p className="text-[10px] font-mono text-[#8a857e] mt-2">
            Live 60 FPS HTML5 Canvas • Hardware accelerated
          </p>
        </div>
      </div>
    </div>
  );
};

export default GifGenerator;
