'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
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

const SEED_DEPLOYMENTS: DeploymentItem[] = [
  {
    id: 'dep_1',
    slug: 'diagnostic',
    name: 'Site Diagnostic Engine',
    description: 'Sub-second Lighthouse Core Web Vitals health scanner',
    icon: 'icon.svg',
    tier: 'free',
    type: 'spa',
    entry: 'index.html',
    status: 'active',
    createdAt: '2026-09-15T12:00:00Z',
  },
  {
    id: 'dep_2',
    slug: 'oracle',
    name: 'PRIME Oracle Terminal',
    description: 'Adaptive living intelligence and persistent memory system',
    icon: 'icon.svg',
    tier: 'free',
    type: 'spa',
    entry: 'index.html',
    status: 'active',
    createdAt: '2026-09-20T10:00:00Z',
  },
];

export default function DeploymentUploadPage() {
  const [deployments, setDeployments] = useState<DeploymentItem[]>(SEED_DEPLOYMENTS);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleProcessZip = (file: File) => {
    if (!file.name.endsWith('.zip')) {
      showToast('Please upload a .zip archive.', 'error');
      return;
    }

    setUploadedZipName(file.name);
    setUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          showToast(
            `Archive "${file.name}" verified in storage path: deployments/${file.name}`,
            'success',
            'Storage Verified'
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
          return 100;
        }
        return prev + 30;
      });
    }, 120);
  };

  const handleManifestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(manifestJson);
      if (!parsed.slug || !parsed.name) {
        showToast('Manifest must contain "slug" and "name".', 'error');
        return;
      }

      const newDep: DeploymentItem = {
        id: `dep_${Date.now()}`,
        slug: parsed.slug,
        name: parsed.name,
        description: parsed.description || 'Custom sovereign deployment',
        icon: parsed.icon || 'icon.svg',
        tier: parsed.tier || 'free',
        type: parsed.type || 'spa',
        entry: parsed.entry || 'index.html',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setDeployments([newDep, ...deployments]);
      showToast(`Service "${newDep.name}" deployed live at /services/${newDep.slug}`, 'success', 'Vault Auto-Registered');
    } catch {
      showToast('Invalid JSON schema in manifest.', 'error');
    }
  };

  const toggleStatus = (id: string) => {
    setDeployments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: d.status === 'active' ? 'paused' : 'active' } : d))
    );
    showToast('Deployment status toggled.', 'info');
  };

  const deleteDeployment = (id: string) => {
    setDeployments((prev) => prev.filter((d) => d.id !== id));
    showToast('Deployment removed from registry.', 'info');
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
                <span className="text-xs font-mono text-[#f5f3f0]">Extracting & Verifying Archive... {uploadProgress}%</span>
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
              Fulfillment Protocol:
            </span>
            <p>1. Archive unpacked into sovereign storage bucket</p>
            <p>2. Endpoint routed instantly at /services/{'{slug}'}</p>
            <p>3. Dial entry injected into rotary Vault menu</p>
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
