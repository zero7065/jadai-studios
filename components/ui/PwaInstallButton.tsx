'use client';

import React, { useState, useEffect } from 'react';
import { Download, Check, Sparkles } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';

export const PwaInstallButton: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      showToast('Jadai Studios installed to your device! Continue offline anytime.', 'success', 'App Ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    try {
      StudioAudio.playClick();
    } catch {}

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('Installing Jadai Studios app...', 'success');
      }
      setDeferredPrompt(null);
    } else {
      // Guide user if browser doesn't expose beforeinstallprompt directly (e.g. Safari / Chrome installed)
      showToast('To install: tap Share / Menu (⋮) on your browser, then tap "Add to Home Screen" or "Install App".', 'info', 'Install Studio App');
    }
  };

  if (isInstalled) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30 ${className}`}>
        <Check className="w-3 h-3" />
        {!compact && <span>Installed</span>}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.1)] hover:bg-[rgba(201,168,76,0.22)] text-[#e8c96a] text-xs font-mono font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${className}`}
      title="Download & Install Jadai Studios as PWA App — continue where you left off"
    >
      <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
      <span>{compact ? 'App' : 'Install App'}</span>
    </button>
  );
};

export default PwaInstallButton;
