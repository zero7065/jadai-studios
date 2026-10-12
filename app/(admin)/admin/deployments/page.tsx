'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  Upload,
  Layers,
  FileCode,
  CheckCircle,
  ExternalLink,
  Trash2,
  PauseCircle,
  PlayCircle,
  Sparkles,
} from 'lucide-react';

interface DeploymentItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  tier: 'free' | 'foundation' | 'voice' | 'architecture' | 'prime';
  type: 'spa' | 'static' | 'iframe';
  entry: string;
  status: 'active' | 'paused';
  createdAt: string;
}

export default function DeploymentUploadPage() {
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'upload' | 'extract'>('idle');
  const [stagedZip, setStagedZip] = useState<File | null>(null);
  const [uploadedZipName, setUploadedZipName] = useState<string | null>(null);
  const [manifestJson, setManifestJson] = useState(`{
  "slug": "exampadi-lite",
  "name": "ExamPadi Sovereign Lite",
  "description": "Offline JAMB study questions and simulated CBT exams",
  "icon": "icon.svg",
  "tier": "free",
  "type": "spa",
  "entry": "index.html"
}`);
  const { showToast } = useToast();

  const loadDeployments = () => {
    fetch('/api/admin/deployments')
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) setDeployments(res.data);
      })
      .catch(() => {
        showToast('Could not reach the deployment registry.', 'error');
      });
  };

  useEffect(() => {
    loadDeployments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProcessZip = (file: File) => {
    if (!file.name.endsWith('.zip')) {
      showToast('Please upload a .zip archive.', 'error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showToast('Archive exceeds the 50MB limit.', 'error');
      return;
    }

    // Stage the archive locally — it is uploaded for real on deploy.
    setStagedZip(file);
    setUploadedZipName(file.name);
    showToast(
      `Staged "${file.name}" (${Math.max(1, Math.round(file.size / 1024))} KB). Press "Register & Deploy" to upload and unpack it on the server.`,
      'info',
      'Archive Staged'
    );

    // If filename looks like a slug, prefill manifest
    const baseSlug = file.name.replace('.zip', '').toLowerCase().replace(/[^a-z0-9]/g, '-');
    setManifestJson(`{
  "slug": "${baseSlug}",
  "name": "${baseSlug.charAt(0).toUpperCase() + baseSlug.slice(1)} Sovereign",
  "description": "Deployed micro-application from ${file.name}",
  "icon": "icon.svg",
  "tier": "free",
  "type": "spa",
  "entry": "index.html"
}`);
  };

  const handleManifestSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    let parsed: any;
    try {
      parsed = JSON.parse(manifestJson);
      if (!parsed.slug || !parsed.name) {
        showToast('Manifest must contain "slug" and "name".', 'error');
        return;
      }
    } catch {
      showToast('Invalid JSON schema in manifest.', 'error');
      return;
    }

    setUploading(true);
    setUploadPhase(stagedZip ? 'upload' : 'extract');
    setUploadProgress(0);
    StudioAudio.playClick();

    try {
      let archiveBase64: string | undefined;
      if (stagedZip) {
        archiveBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Could not read the staged archive'));
          reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
          reader.readAsDataURL(stagedZip);
        });
      }

      const payload = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/deployments/deploy');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setUploadPhase('upload');
            setUploadProgress(Math.round((evt.loaded / evt.total) * 90));
          }
        };
        xhr.onerror = () => reject(new Error('Server unreachable'));
        xhr.onload = () => {
          setUploadPhase('extract');
          setUploadProgress(100);
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) resolve(data);
            else reject(new Error(data.error || 'Deploy rejected'));
          } catch {
            reject(new Error('Invalid server response'));
          }
        };
        xhr.send(JSON.stringify({ manifest: parsed, archiveBase64 }));
      });

      showToast(
        `${payload.note || 'Deployed.'} Live at ${payload.url}`,
        'success',
        'Service Deployed'
      );
      setStagedZip(null);
      setUploadedZipName(null);
      loadDeployments();
    } catch (err: any) {
      showToast(`Deploy failed: ${String(err?.message || err)} — nothing was published.`, 'error', 'Not Deployed');
    } finally {
      setUploading(false);
      setUploadPhase('idle');
      setUploadProgress(0);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const res = await fetch('/api/admin/deployments/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.success) throw new Error(data?.error || 'Toggle rejected');
      setDeployments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: data.record.status } : d))
      );
      showToast(
        data.record.status === 'paused'
          ? `Service paused — /services/${data.record.slug} no longer serves files.`
          : `Service resumed — /services/${data.record.slug} is live again.`,
        'success'
      );
    } catch (err: any) {
      showToast(`Toggle failed: ${String(err?.message || err)}`, 'error');
    }
  };

  const deleteDeployment = async (id: string) => {
    try {
      const res = await fetch('/api/admin/deployments/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.success) throw new Error(data?.error || 'Delete rejected');
      setDeployments((prev) => prev.filter((d) => d.id !== id));
      showToast(`Service files removed for /services/${data.slug}.`, 'success');
    } catch (err: any) {
      showToast(`Delete failed: ${String(err?.message || err)}`, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            Micro-App Runtime Engine
          </span>
          <h1 className="text-3xl font-display font-bold text-[#f5f3f0]">
            Deployment Upload
          </h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Accept ZIP archives containing manifest.json + index.html, deploy to /services/{'{slug}'}, and auto-register in Vault.
          </p>
        </div>
      </div>

      {/* Upload Zone & Manifest Specification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Drop Zone */}
        <div className="lg:col-span-6 space-y-4">
          <GlassCard
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleProcessZip(file);
            }}
            className={`p-8 border-dashed border-2 text-center space-y-4 transition-all duration-200 relative overflow-hidden ${
              dragActive
                ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.12)] scale-[1.01]'
                : 'border-[rgba(201,168,76,0.35)] hover:border-[#C9A84C]'
            }`}
          >
            {uploading && (
              <div className="absolute inset-0 bg-[#050404]/90 z-20 flex flex-col items-center justify-center p-6 space-y-2">
                <span className="text-xs font-mono text-[#f5f3f0]">
                  {uploadPhase === 'extract'
                    ? `Unpacking on server... ${uploadProgress}%`
                    : `Uploading Archive... ${uploadProgress}%`}
                </span>
                <div className="w-48 bg-[#111010] h-1.5 rounded-full overflow-hidden border border-[rgba(201,168,76,0.3)]">
                  <div
                    className="bg-gradient-to-r from-[#8a6e2a] to-[#C9A84C] h-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="w-14 h-14 mx-auto rounded-full bg-[rgba(201,168,76,0.12)] border border-[#C9A84C] flex items-center justify-center text-[#C9A84C]">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#f5f3f0]">
                {uploadedZipName ? `Archive Loaded: ${uploadedZipName}` : 'Drop Sovereign ZIP Archive'}
              </h3>
              <p className="text-xs font-mono text-[#8a6e2a] mt-1">
                Must contain manifest.json, index.html, and icon.svg
              </p>
            </div>
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept=".zip,application/zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleProcessZip(e.target.files[0]);
                  }
                }}
              />
              <span className="px-4 py-2 rounded-lg bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-xs font-mono text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] transition-colors inline-block cursor-pointer">
                {uploadedZipName ? 'Replace ZIP Archive...' : 'Browse Device ZIP...'}
              </span>
            </label>
          </GlassCard>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.15)] text-xs font-mono text-[#c4c0bb] space-y-1.5">
            <span className="text-[#C9A84C] block uppercase font-bold text-[10px]">
              Deployment Protocol:
            </span>
            <p>1. Archive unpacked into dist/services/{'{slug}'}</p>
            <p>2. Served instantly at /services/{'{slug}'}</p>
            <p>3. Registered in the live services list below</p>
          </div>
        </div>

        {/* Manifest JSON Editor */}
        <div className="lg:col-span-6 space-y-4">
          <GlassCard className="p-6 border-[rgba(201,168,76,0.25)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#C9A84C] uppercase tracking-wider">
                Manifest JSON Specification
              </span>
              <span className="text-[10px] font-mono text-[#8a6e2a]">manifest.json</span>
            </div>

            <textarea
              rows={9}
              value={manifestJson}
              onChange={(e) => setManifestJson(e.target.value)}
              className="w-full p-4 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.25)] font-mono text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
            />

            <EdgeGlow intensity="intense" color="gold" className="w-full">
              <Button variant="primary" className="w-full" onClick={handleManifestSubmit}>
                Register & Deploy Service
              </Button>
            </EdgeGlow>
          </GlassCard>
        </div>
      </div>

      {/* Active Deployments Table */}
      <div className="space-y-4 pt-6 border-t border-[rgba(201,168,76,0.2)]">
        <h3 className="font-display font-bold text-xl text-[#f5f3f0]">
          Active Registered Services ({deployments.length})
        </h3>

        <div className="space-y-3">
          {deployments.length === 0 && (
            <div className="p-8 rounded-xl bg-[#0a0908] border border-dashed border-[rgba(201,168,76,0.3)] text-center space-y-2">
              <p className="text-sm font-mono text-[#c4c0bb]">No services registered on this server yet.</p>
              <p className="text-xs font-mono text-[#8a6e2a]">
                Deploy a ZIP above and it will appear here with a live /services/{'{slug}'} route.
              </p>
            </div>
          )}
          {deployments.map((dep) => (
            <GlassCard key={dep.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-base text-[#f5f3f0]">{dep.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#e8c96a]">
                    /services/{dep.slug}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${dep.status === 'active' ? 'text-[#2ecc71] bg-green-950/30' : 'text-[#e74c3c] bg-red-950/30'}`}>
                    {dep.status}
                  </span>
                </div>
                <p className="text-xs text-[#c4c0bb]">{dep.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/services/${dep.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors"
                  title="Open Live Service"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => toggleStatus(dep.id)}
                  className="p-2 rounded border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#f5f3f0] transition-colors cursor-pointer"
                  title={dep.status === 'active' ? 'Pause Service' : 'Activate Service'}
                >
                  {dep.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => deleteDeployment(dep.id)}
                  className="p-2 rounded border border-[rgba(192,57,43,0.3)] text-[#C0392B] hover:bg-[rgba(192,57,43,0.15)] transition-colors cursor-pointer"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
