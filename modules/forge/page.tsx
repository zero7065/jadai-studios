'use client';

import React, { useState } from 'react';
import { UploadZone } from '@/components/forge/UploadZone';
import { Editor } from '@/components/forge/Editor';
import { processFile } from './lib/convert';
import UpgradeModal from '@/components/auth/UpgradeModal';
import AuthModal from '@/components/auth/AuthModal';
import { checkToolAccess, recordModuleExecution } from '@/lib/supabase/gates';
import { useToast } from '@/components/providers/ToastProvider';

export default function ForgePage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [doc, setDoc] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const { showToast } = useToast();

  async function handleProcess(files: File[]) {
    // 1. Subscription Gate Check
    const access = await checkToolAccess('forge');
    if (!access.allowed) {
      setPendingFiles(files);
      if (access.reason === 'unauthenticated') {
        setAuthModalOpen(true);
      } else {
        setUpgradeModalOpen(true);
      }
      return;
    }

    setProcessing(true);
    setProgress(0);
    try {
      const results = [];
      for (let i = 0; i < files.length; i++) {
        try {
          const result = await processFile(files[i]);
          results.push(result);
        } catch (itemErr) {
          console.warn(`File processing warning for ${files[i].name}:`, itemErr);
        }
        setProgress(((i + 1) / files.length) * 100);
      }
      if (results.length > 0) {
        setDoc(results[0]);
        await recordModuleExecution('forge', access.userEmail, access.userId);
        const r = results[0];
        const pageCount = r.pages?.length || 1;
        showToast(
          `Extracted ${r.extractedCount} text layers across ${pageCount} page${pageCount > 1 ? 's' : ''} (${r.source.toUpperCase()})`,
          'success'
        );
      } else {
        showToast('Could not extract layers from provided file(s).', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Document intake encountered an issue. Please try an image or text file.', 'error');
    } finally {
      setProcessing(false);
    }
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-[#050404] flex items-center justify-center p-6 text-center select-none">
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto border-4 border-[rgba(201,168,76,0.2)] border-t-[#C9A84C] rounded-full animate-spin shadow-[0_0_30px_rgba(201,168,76,0.3)]" />
          <div className="space-y-1">
            <h2 className="text-xl font-display font-bold text-[#f5f3f0]">
              FORGE OCR Extraction in Progress
            </h2>
            <p className="text-xs font-mono text-[#8a6e2a]">
              Reconstructing bounding coordinates and text layers... {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (doc) {
    return (
      <Editor
        originalUrl={doc.originalUrl}
        initialFields={doc.fields}
        width={doc.width}
        height={doc.height}
        pages={doc.pages}
        source={doc.source}
        extractedCount={doc.extractedCount}
        onReset={() => setDoc(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050404] text-[#c4c0bb] pt-12 pb-24 px-4 sm:px-6 select-none">
      <div className="max-w-4xl mx-auto text-center mb-8 space-y-2">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
          Document & Image Reconstruction
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-white font-bold tracking-tight">
          FORGE
        </h1>
        <p className="text-sm font-mono text-[#8a6e2a]">
          Edit documents and images. OCR + AI-powered reconstruction.
        </p>
      </div>

      <UploadZone onProcess={handleProcess} />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onNavigate={onNavigate}
        sourceTool="FORGE"
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (pendingFiles) {
            handleProcess(pendingFiles);
          }
        }}
      />
    </div>
  );
}
