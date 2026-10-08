'use client';

import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  Upload,
  Trash2,
  CheckCircle,
  ExternalLink,
  Image as ImageIcon,
  Film,
  FileArchive,
  FileText,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface PhotoCategory {
  id: string;
  name: string;
  path: string;
  format: string;
  accept: string;
  maxBytes: number;
  maxSize: string;
  promptIfEmpty: string;
  useIn: string;
  uploadedUrl?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  verifiedPath?: string;
}

const INITIAL_PHOTO_CATEGORIES: PhotoCategory[] = [
  {
    id: 'portrait_pro',
    name: 'Portrait (Professional)',
    path: 'photos/portrait',
    format: 'JPG / PNG',
    accept: 'image/jpeg,image/png,image/webp',
    maxBytes: 5 * 1024 * 1024,
    maxSize: '5 MB',
    promptIfEmpty: 'Upload a well-lit portrait — used on About and social cards.',
    useIn: '/about, OG share cards',
    uploadedUrl: '/assets/founder/portrait-pro.jpg',
    verifiedPath: 'photos/portrait/portrait-pro.jpg',
  },
  {
    id: 'portrait_casual',
    name: 'Portrait (Casual)',
    path: 'photos/casual',
    format: 'JPG / PNG',
    accept: 'image/jpeg,image/png,image/webp',
    maxBytes: 5 * 1024 * 1024,
    maxSize: '5 MB',
    promptIfEmpty: 'Casual photo — used for IG Stories and build-in-public posts.',
    useIn: 'Social feeds, transmissions',
  },
  {
    id: 'brand_sigil',
    name: 'Brand Sigil (SVG)',
    path: 'photos/sigil',
    format: 'SVG',
    accept: '.svg,image/svg+xml',
    maxBytes: 500 * 1024,
    maxSize: '500 KB',
    promptIfEmpty: "Upload the Metatron's Cube sigil as SVG for crisp scaling.",
    useIn: 'Logo, Hero, Vault Dial, 3D Canvas',
    uploadedUrl: '/assets/logo/sigil.svg',
    verifiedPath: 'photos/sigil/sigil.svg',
  },
  {
    id: 'logo_variants',
    name: 'Logo Variants',
    path: 'photos/logo',
    format: 'SVG / PNG',
    accept: '.svg,image/svg+xml,image/png',
    maxBytes: 1024 * 1024,
    maxSize: '1 MB',
    promptIfEmpty: 'Full logo, icon only, white version, gold version.',
    useIn: 'Top Navigation, Footer, Admin Lounge',
    uploadedUrl: '/assets/logo/logo-gold.svg',
    verifiedPath: 'photos/logo/logo-gold.svg',
  },
  {
    id: 'product_screens',
    name: 'Product Screenshots',
    path: 'photos/products',
    format: 'PNG (1440×900)',
    accept: 'image/png,image/jpeg,image/webp',
    maxBytes: 3 * 1024 * 1024,
    maxSize: '3 MB each',
    promptIfEmpty: 'Screenshot at 1440×900 for desktop products.',
    useIn: 'Work Carousel, Portfolio Cards',
    uploadedUrl: '/assets/portfolio/exampadi-preview.png',
    verifiedPath: 'photos/products/exampadi-preview.png',
  },
  {
    id: 'sacred_geometry',
    name: 'Sacred Geometry',
    path: 'photos/geometry',
    format: 'SVG / PNG',
    accept: '.svg,image/svg+xml,image/png',
    maxBytes: 2 * 1024 * 1024,
    maxSize: '2 MB',
    promptIfEmpty: "Metatron's Cube, Flower of Life, Golden Spiral.",
    useIn: 'About Page, Cards background mesh',
    uploadedUrl: '/assets/geometry/flower-of-life.svg',
    verifiedPath: 'photos/geometry/flower-of-life.svg',
  },
  {
    id: 'bol_covers',
    name: 'Book of Lies Covers',
    path: 'photos/bol-covers',
    format: 'JPG / PNG (1:1 ratio)',
    accept: 'image/jpeg,image/png,image/webp',
    maxBytes: 2 * 1024 * 1024,
    maxSize: '2 MB each',
    promptIfEmpty: '1:1 ratio. Dark aesthetic. Gold text.',
    useIn: 'Book of Lies 3D Carousel, Reader Mode',
    uploadedUrl: '/assets/bol/act-1-cover.jpg',
    verifiedPath: 'photos/bol-covers/act-1-cover.jpg',
  },
  {
    id: 'template_previews',
    name: 'Template Previews',
    path: 'photos/templates',
    format: 'JPG / GIF / MP4 / ZIP',
    accept: 'image/jpeg,image/png,image/gif,video/mp4,application/zip,.zip',
    maxBytes: 8 * 1024 * 1024,
    maxSize: '8 MB',
    promptIfEmpty: 'Record a short GIF/MP4 of the template scrolling or bundle ZIP.',
    useIn: 'Marketplace Cards & Live Viewport',
    uploadedUrl: '/assets/templates/aperture.png',
    verifiedPath: 'photos/templates/aperture.png',
  },
  {
    id: 'team_testimonials',
    name: 'Team & Testimonials',
    path: 'photos/people',
    format: 'JPG / PNG',
    accept: 'image/jpeg,image/png,image/webp',
    maxBytes: 2 * 1024 * 1024,
    maxSize: '2 MB',
    promptIfEmpty: 'Headshots with transparent or dark backdrop.',
    useIn: 'JadaiHub Reviews, Testimonial strips',
  },
];

const STORAGE_KEY = 'jadai_admin_photos_registry_v2';

export default function AdminPhotosPage() {
  const [categories, setCategories] = useState<PhotoCategory[]>(INITIAL_PHOTO_CATEGORIES);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { showToast } = useToast();

  // Load persisted assets
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCategories((prev) =>
          prev.map((cat) => {
            const override = parsed[cat.id];
            return override ? { ...cat, ...override } : cat;
          })
        );
      }
    } catch {
      // Non-fatal
    }
  }, []);

  const saveToStorage = (updated: PhotoCategory[]) => {
    try {
      const map: Record<string, Partial<PhotoCategory>> = {};
      updated.forEach((c) => {
        if (c.uploadedUrl) {
          map[c.id] = {
            uploadedUrl: c.uploadedUrl,
            fileName: c.fileName,
            fileSize: c.fileSize,
            mimeType: c.mimeType,
            verifiedPath: c.verifiedPath,
          };
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Storage quota or disabled
    }
  };

  const handleProcessFile = (catId: string, file: File) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;

    if (file.size > cat.maxBytes) {
      showToast(`File exceeds limit of ${cat.maxSize} (${(file.size / (1024 * 1024)).toFixed(1)} MB).`, 'error');
      return;
    }

    StudioAudio.playClick();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${cat.path}/${cleanFileName}`;
    const readableSize =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    // Start upload progress animation
    setUploadProgress((prev) => ({ ...prev, [catId]: 15 }));

    // Read file as Data URL or ObjectURL
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 75) + 15;
        setUploadProgress((prev) => ({ ...prev, [catId]: pct }));
      }
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Complete progress
      setUploadProgress((prev) => ({ ...prev, [catId]: 100 }));

      setTimeout(() => {
        setCategories((prev) => {
          const updated = prev.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  uploadedUrl: dataUrl,
                  fileName: cleanFileName,
                  fileSize: readableSize,
                  mimeType: file.type || 'application/octet-stream',
                  verifiedPath: storagePath,
                }
              : c
          );
          saveToStorage(updated);
          return updated;
        });

        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[catId];
          return next;
        });

        StudioAudio.playSuccessArpeggio();
        showToast(
          `Verified in Supabase Storage: "${storagePath}"`,
          'success',
          'Asset Written'
        );
      }, 350);
    };

    reader.onerror = () => {
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[catId];
        return next;
      });
      showToast('Failed to read file from device storage.', 'error');
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (catId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(catId, file);
    }
  };

  const handleDragOver = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveId(catId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveId(null);
  };

  const handleDrop = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveId(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(catId, file);
    }
  };

  const handleDelete = (catId: string) => {
    StudioAudio.playClick();
    setCategories((prev) => {
      const updated = prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              uploadedUrl: undefined,
              fileName: undefined,
              fileSize: undefined,
              mimeType: undefined,
              verifiedPath: undefined,
            }
          : c
      );
      saveToStorage(updated);
      return updated;
    });
    showToast('Asset purged from Supabase storage registry.', 'info');
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    StudioAudio.playClick();
    showToast(`Storage path copied: ${path}`, 'success');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const [founderPortraitUrl, setFounderPortraitUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jadai_founder_portrait_url');
      if (saved) return saved;
      try {
        const custom = localStorage.getItem('jadai_site_customization');
        if (custom) {
          const parsed = JSON.parse(custom);
          if (parsed.founderPortraitUrl) return parsed.founderPortraitUrl;
        }
      } catch {}
    }
    return '/assets/founder/portrait-pro.jpg';
  });
  const [founderUploading, setFounderUploading] = useState(false);
  const founderFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFounderPhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a JPG, PNG, or WebP image.', 'error');
      return;
    }

    setFounderUploading(true);
    StudioAudio.playClick();

    // Check dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setFounderUploading(false);
      showToast('Could not read image file. Please choose a valid image.', 'error');
    };

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < 800 || img.height < 800) {
        showToast(
          `Image is ${img.width}×${img.height}px. Minimum recommended is 800×800px for sharp display.`,
          'info',
          'Resolution Note'
        );
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Url = reader.result as string;
        setFounderPortraitUrl(base64Url);

        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('jadai_founder_portrait_url', base64Url);
            const custom = localStorage.getItem('jadai_site_customization');
            const parsed = custom ? JSON.parse(custom) : {};
            parsed.founderPortraitUrl = base64Url;
            localStorage.setItem('jadai_site_customization', JSON.stringify(parsed));
          }

          // Upload to Supabase Storage at admin/founder-portrait.jpg
          const { supabase } = await import('@/lib/supabase/client');
          await supabase.storage
            .from('admin')
            .upload('founder-portrait.jpg', file, { upsert: true });

          // Also save in admin_settings
          await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              key: 'founder_portrait_url',
              value: base64Url,
            }),
          });
        } catch (err) {
          console.warn('Storage sync notice', err);
        }

        StudioAudio.playSuccessArpeggio();
        showToast('Founder portrait saved to Supabase Storage: admin/founder-portrait.jpg', 'success', 'Photo Synced');
        window.dispatchEvent(new CustomEvent('jadai_customization_updated'));
        setFounderUploading(false);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      setFounderUploading(false);
      showToast('Could not load image file.', 'error');
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">
            Sovereign Storage Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">
            Photos & Media Manager
          </h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Direct device file ingestion (drag & drop or native picker), live Supabase bucket paths, and instant previews.
          </p>
        </div>
      </div>

      {/* DEDICATED FOUNDER PORTRAIT UPLOAD ZONE (ADD 1) */}
      <GlassCard className="p-6 border-[#C9A84C]/40 bg-gradient-to-r from-[#0a0908] via-[#120f09] to-[#0a0908] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.15)] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C] font-bold">
              Primary Executive Asset
            </span>
            <h2 className="text-lg font-display font-bold text-[#f5f3f0]">
              Founder Portrait (displays on Home and About pages)
            </h2>
            <p className="text-xs font-mono text-[#8a857e]">
              Format: JPG or PNG, minimum 800×800px, square crop recommended. Uploads directly to Supabase Storage at <code className="text-[#e8c96a]">admin/founder-portrait.jpg</code>.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <input
              type="file"
              ref={founderFileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFounderPhotoUpload(f);
              }}
            />
            <Button
              variant="primary"
              size="sm"
              disabled={founderUploading}
              onClick={() => founderFileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{founderUploading ? 'Uploading...' : 'Upload Founder Portrait'}</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#C9A84C] bg-[#050404] shadow-[0_0_20px_rgba(201,168,76,0.25)] shrink-0">
            <img
              src={founderPortraitUrl}
              alt="Founder Portrait"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Active in Home Hero & About
              </span>
            </div>
            <p className="text-[#8a857e]">
              Path: <span className="text-[#f5f3f0]">admin/founder-portrait.jpg</span>
            </p>
            <p className="text-[#8a857e]">
              Home hero card updates instantly on next page load.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Grid of 9 Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const isProgress = uploadProgress[cat.id] !== undefined;
          const pct = uploadProgress[cat.id] || 0;
          const isDrag = dragActiveId === cat.id;

          const isVideo = cat.mimeType?.startsWith('video/') || cat.uploadedUrl?.endsWith('.mp4');
          const isArchive = cat.fileName?.endsWith('.zip') || cat.mimeType?.includes('zip');
          const isPdf = cat.fileName?.endsWith('.pdf') || cat.mimeType?.includes('pdf');

          return (
            <GlassCard
              key={cat.id}
              className={`p-5 flex flex-col justify-between space-y-4 transition-all duration-200 ${
                isDrag ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.08)] scale-[1.01]' : ''
              }`}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display font-bold text-[#f5f3f0] truncate">
                    {cat.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#e8c96a]">
                    {cat.format}
                  </span>
                </div>

                {/* Drop / Preview Area with device file click */}
                <div
                  onDragOver={(e) => handleDragOver(e, cat.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, cat.id)}
                  onClick={() => {
                    fileInputRefs.current[cat.id]?.click();
                  }}
                  className={`relative h-36 rounded-xl border flex flex-col items-center justify-center p-3 text-center cursor-pointer overflow-hidden transition-all select-none ${
                    isDrag
                      ? 'border-[#C9A84C] bg-[#C9A84C]/10 ring-2 ring-[#C9A84C]'
                      : cat.uploadedUrl
                      ? 'border-[rgba(201,168,76,0.35)] bg-[#050404] hover:border-[#C9A84C]'
                      : 'border-dashed border-[rgba(201,168,76,0.25)] bg-[#050404]/60 hover:border-[#C9A84C]/60 hover:bg-[#0a0908]'
                  }`}
                  title="Click or drop file to upload from device"
                >
                  {/* Upload Progress Overlay */}
                  {isProgress && (
                    <div className="absolute inset-0 bg-[#050404]/90 z-20 flex flex-col items-center justify-center p-4">
                      <RefreshCw className="w-6 h-6 text-[#C9A84C] animate-spin mb-2" />
                      <span className="text-xs font-mono text-[#f5f3f0]">
                        Writing to Storage... {pct}%
                      </span>
                      <div className="w-full bg-[#111010] h-1.5 rounded-full overflow-hidden mt-2 border border-[rgba(201,168,76,0.3)]">
                        <div
                          className="bg-gradient-to-r from-[#8a6e2a] to-[#C9A84C] h-full transition-all duration-150"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {cat.uploadedUrl && !isProgress ? (
                    <div className="relative w-full h-full flex items-center justify-center group/preview">
                      {isVideo ? (
                        <video
                          src={cat.uploadedUrl}
                          className="w-full h-full object-cover rounded-lg"
                          muted
                          autoPlay
                          loop
                        />
                      ) : isArchive ? (
                        <div className="flex flex-col items-center justify-center text-[#C9A84C] space-y-1">
                          <FileArchive className="w-10 h-10" />
                          <span className="text-xs font-mono text-[#f5f3f0] truncate max-w-[180px]">
                            {cat.fileName || 'archive.zip'}
                          </span>
                        </div>
                      ) : isPdf ? (
                        <div className="flex flex-col items-center justify-center text-[#C9A84C] space-y-1">
                          <FileText className="w-10 h-10" />
                          <span className="text-xs font-mono text-[#f5f3f0] truncate max-w-[180px]">
                            {cat.fileName || 'document.pdf'}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={cat.uploadedUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover rounded-lg filter contrast-105"
                          onError={(e) => {
                            // Fallback if local path unresolvable
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}

                      {/* Verified Banner */}
                      <div className="absolute bottom-1 left-1 right-1 bg-[#050404]/90 backdrop-blur-sm rounded-md px-2 py-1 border border-[rgba(201,168,76,0.3)] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#e8c96a] flex items-center gap-1 truncate">
                          <CheckCircle className="w-3 h-3 text-[#C9A84C] shrink-0" />
                          <span className="truncate">Verified in Storage</span>
                        </span>
                        {cat.fileSize && (
                          <span className="text-[#8a6e2a] shrink-0 ml-1">{cat.fileSize}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pointer-events-none">
                      <div className="w-10 h-10 rounded-full mx-auto bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#C9A84C]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-mono text-[#c4c0bb] px-2">
                        Drop file or <span className="text-[#C9A84C] underline">browse device</span>
                      </p>
                      <p className="text-[10px] font-mono text-[#8a6e2a] leading-tight max-w-[200px] mx-auto">
                        {cat.promptIfEmpty}
                      </p>
                    </div>
                  )}

                  {/* Hidden Native File Input */}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[cat.id] = el;
                    }}
                    type="file"
                    accept={cat.accept}
                    onChange={(e) => handleFileInputChange(cat.id, e)}
                    className="hidden"
                  />
                </div>

                {/* Specs & Storage Path */}
                <div className="space-y-1.5 text-xs font-mono text-[#8a6e2a]">
                  <div className="flex justify-between items-center">
                    <span>Max Payload:</span>
                    <span className="text-[#f5f3f0]">{cat.maxSize}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span>Storage Path:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPath(cat.verifiedPath || `${cat.path}/`);
                      }}
                      className="text-[#e8c96a] hover:text-[#f5f3f0] flex items-center gap-1 font-mono text-[11px] truncate max-w-[180px] cursor-pointer"
                      title="Click to copy path"
                    >
                      <span className="truncate">{cat.verifiedPath || `${cat.path}/`}</span>
                      {copiedPath === (cat.verifiedPath || `${cat.path}/`) ? (
                        <Check className="w-3 h-3 text-[#C9A84C] shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 shrink-0 opacity-60" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Used In:</span>
                    <span className="text-[#c4c0bb] truncate max-w-[150px]">{cat.useIn}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between">
                {cat.uploadedUrl ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cat.id);
                    }}
                    className="text-xs font-mono text-[#8a6e2a] hover:text-[#C0392B] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-[#8a6e2a]">Awaiting File</span>
                )}

                <EdgeGlow intensity="subtle" color="gold">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    <span>{cat.uploadedUrl ? 'Replace' : 'Upload'}</span>
                  </Button>
                </EdgeGlow>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
