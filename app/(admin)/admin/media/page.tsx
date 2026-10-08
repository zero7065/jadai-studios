'use client';

import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  Film,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Play,
  Clock,
  FileVideo,
  Layers,
} from 'lucide-react';
import { SectionVideoSlot, SectionVideoRecord, useSectionVideos } from '@/lib/media/useSectionVideos';

interface SlotDefinition {
  slot: SectionVideoSlot;
  title: string;
  targetDescription: string;
  usedIn: string;
}

const SECTION_SLOTS: SlotDefinition[] = [
  {
    slot: 'marketplace_template_cards',
    title: 'Marketplace Template Cards',
    targetDescription: 'Looping preview video for high-converting template product headers.',
    usedIn: '/marketplace, Template cards',
  },
  {
    slot: 'forge_card_loop',
    title: 'FORGE Card Loop',
    targetDescription: 'Canva-grade document vector parsing demonstration loop.',
    usedIn: 'Homepage Bento Grid (#bento-forge), Studio Tools',
  },
  {
    slot: 'mirage_card_loop',
    title: 'MIRAGE Card Loop',
    targetDescription: 'Fast LPU visual synthesis 3-version generation teaser loop.',
    usedIn: 'Homepage Bento Grid (#bento-mirage), Studio Tools',
  },
  {
    slot: 'community_intro_clips',
    title: 'Community Intro Clips',
    targetDescription: 'Decentralized talent collaborative hero video background.',
    usedIn: '/community, Hub feed header',
  },
];

export default function AdminMediaPage() {
  const { videos, refresh } = useSectionVideos();
  const { showToast } = useToast();

  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleSelectFile = (slot: SectionVideoSlot) => {
    fileInputRefs.current[slot]?.click();
  };

  const validateAndUpload = async (slot: SectionVideoSlot, file: File) => {
    // Clear previous inline error
    setInlineErrors((prev) => ({ ...prev, [slot]: '' }));

    // 1. Format check: mp4 or webm only
    const validMimes = ['video/mp4', 'video/webm'];
    const hasValidExt = file.name.endsWith('.mp4') || file.name.endsWith('.webm');
    if (!validMimes.includes(file.type) && !hasValidExt) {
      setInlineErrors((prev) => ({
        ...prev,
        [slot]: 'Format rejected: only MP4 and WebM video files are accepted.',
      }));
      showToast('Only MP4 and WebM video files are accepted', 'error', 'Format Rejected');
      return;
    }

    // 2. Max 8MB check
    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(1);
      setInlineErrors((prev) => ({
        ...prev,
        [slot]: `File size rejected: ${actualMb}MB exceeds the 8MB maximum limit.`,
      }));
      showToast(`File size (${actualMb}MB) exceeds 8MB limit`, 'error', 'File Too Large');
      return;
    }

    // 3. Max 10 seconds duration check via HTML5 video element
    const objectUrl = URL.createObjectURL(file);
    const videoElem = document.createElement('video');
    videoElem.preload = 'metadata';
    videoElem.src = objectUrl;

    videoElem.onloadedmetadata = async () => {
      URL.revokeObjectURL(objectUrl);
      const duration = videoElem.duration;

      if (duration > 10.5) {
        const actualSec = duration.toFixed(1);
        setInlineErrors((prev) => ({
          ...prev,
          [slot]: `Duration rejected: video length of ${actualSec}s exceeds the 10-second limit.`,
        }));
        showToast(`Video duration (${actualSec}s) exceeds 10s limit`, 'error', 'Duration Exceeded');
        return;
      }

      // Convert file to Base64 for persistent server write
      setUploadingSlot(slot);
      try {
        StudioAudio.playClick();
      } catch {}

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/admin/media/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slotName: slot,
              fileName: file.name,
              fileData: base64Data,
              fileSize: file.size,
              duration: duration,
              mimeType: file.type || (file.name.endsWith('.webm') ? 'video/webm' : 'video/mp4'),
            }),
          });

          const data = await res.json();
          if (data.success) {
            try {
              StudioAudio.playSuccessArpeggio();
            } catch {}
            showToast(`Video successfully deployed for ${slot}`, 'success', 'Media Deployed');
            refresh();
          } else {
            setInlineErrors((prev) => ({
              ...prev,
              [slot]: data.error || 'Server rejected media upload.',
            }));
            showToast(data.error || 'Media upload failed', 'error');
          }
        } catch (err: any) {
          setInlineErrors((prev) => ({
            ...prev,
            [slot]: 'Network error while uploading video to server storage.',
          }));
          showToast('Failed to connect to media storage', 'error');
        } finally {
          setUploadingSlot(null);
        }
      };

      reader.readAsDataURL(file);
    };

    videoElem.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setInlineErrors((prev) => ({
        ...prev,
        [slot]: 'Unable to decode video metadata. Ensure file is a valid MP4 or WebM stream.',
      }));
      showToast('Corrupted or invalid video stream', 'error');
    };
  };

  const handleRemove = async (slot: SectionVideoSlot) => {
    try {
      StudioAudio.playClick();
      const res = await fetch('/api/admin/media/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotName: slot }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Video removed from ${slot}; reverted to shimmer placeholder.`, 'info');
        refresh();
      }
    } catch {
      showToast('Failed to remove media', 'error');
    }
  };

  return (
    <div className="space-y-6 py-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C] flex items-center gap-1.5">
            <Film className="w-4 h-4 text-[#C9A84C]" />
            <span>Admin Media & Video Studio</span>
          </span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1 font-bold">
            Section Videos
          </h1>
          <p className="text-xs font-mono text-[#8a6e2a] mt-1">
            Replace CSS shimmer placeholders with live looping MP4/WebM video elements across the application.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refresh()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh State</span>
          </Button>
        </div>
      </div>

      {/* Constraints Notice Banner */}
      <div className="p-4 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] flex items-start gap-3 text-xs font-mono">
        <Film className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[#f5f3f0] font-bold block">
            Media Ingestion Constraints:
          </span>
          <p className="text-[#c4c0bb] leading-relaxed">
            Accepted formats: <span className="text-[#e8c96a]">MP4, WebM</span> • Max File Size:{' '}
            <span className="text-[#e8c96a]">8 MB</span> • Max Duration:{' '}
            <span className="text-[#e8c96a]">10 Seconds</span>. Exceeding limits will be rejected with an inline error. On upload, assets persist at <code className="text-[#C9A84C]">media/&#123;slot-name&#125;.mp4</code> and update <code className="text-[#C9A84C]">admin_settings</code>.
          </p>
        </div>
      </div>

      {/* 4 SECTION VIDEO SLOTS */}
      <div className="space-y-4">
        {SECTION_SLOTS.map((item) => {
          const videoRecord = videos[item.slot] as SectionVideoRecord | undefined;
          const isUploading = uploadingSlot === item.slot;
          const errorMsg = inlineErrors[item.slot];

          return (
            <GlassCard key={item.slot} className="p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-[#f5f3f0]">
                      {item.title}
                    </h3>
                    {videoRecord?.url ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Live Video Active</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-[10px] font-mono text-[#e8c96a]">
                        CSS Shimmer Placeholder
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#c4c0bb]">{item.targetDescription}</p>
                  <span className="text-[10px] font-mono text-[#8a6e2a] block">
                    Slot ID: <code className="text-[#e8c96a]">{item.slot}</code> • Applied in: {item.usedIn}
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[item.slot] = el;
                    }}
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) validateAndUpload(item.slot, file);
                      e.target.value = '';
                    }}
                  />

                  {videoRecord?.url ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectFile(item.slot)}
                        disabled={isUploading}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        <span>Replace</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.slot)}
                        disabled={isUploading}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        <span>Remove</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSelectFile(item.slot)}
                      disabled={isUploading}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      <span>{isUploading ? 'Validating...' : 'Upload Video (Max 8MB, 10s)'}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Inline Error Notice if rejected */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs font-mono text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Video Preview or Shimmer Row */}
              <div className="p-3.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.15)] flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-48 h-28 rounded-lg overflow-hidden bg-black relative shrink-0 border border-[rgba(201,168,76,0.2)]">
                  {videoRecord?.url ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      src={videoRecord.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#C9A84C]/25 via-[#C0392B]/30 to-[#050404] flex items-center justify-center relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ animation: 'bentoBars 2.5s ease-in-out infinite' }}
                      />
                      <span className="text-[10px] font-mono text-[#e8c96a] z-10">
                        CSS Shimmer
                      </span>
                    </div>
                  )}
                </div>

                {/* Metadata Details */}
                <div className="flex-1 space-y-1.5 text-xs font-mono w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a6e2a]">Filename:</span>
                    <span className="text-[#f5f3f0] truncate max-w-[200px]">
                      {videoRecord?.fileName || 'shimmer_placeholder_default.css'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a6e2a]">Duration:</span>
                    <span className="text-[#e8c96a] font-bold">
                      {videoRecord?.duration ? `${videoRecord.duration}s` : 'Continuous Loop (CSS)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a6e2a]">Markup Applied:</span>
                    <code className="text-[#c4c0bb] text-[11px]">
                      &lt;video autoPlay muted loop playsInline /&gt;
                    </code>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
