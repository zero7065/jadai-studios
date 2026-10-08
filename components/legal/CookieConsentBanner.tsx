import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Cookie, Shield, Check } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    preferences: true,
    diagnostics: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem('jadai-cookie-consent');
    if (!consent) {
      // Delay slightly for smooth page load experience
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('jadai-cookie-consent', 'accepted');
    StudioAudio.playClick();
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('jadai-cookie-consent', 'rejected');
    StudioAudio.playClick();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('jadai-cookie-consent', JSON.stringify(preferences));
    StudioAudio.playClick();
    setManageModalOpen(false);
    setIsVisible(false);
  };

  if (!isVisible && !manageModalOpen) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {isVisible && (
        <aside
          role="region"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-lg z-[110] p-4 rounded-lg bg-[#0a0908]/95 border border-[rgba(201,168,76,0.35)] shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-md space-y-3 font-mono text-xs animate-in slide-in-from-bottom-4"
        >
          <div className="flex items-start gap-3">
            <Cookie className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-sm font-display font-bold text-[#f5f3f0] block">
                Storage Protocol
              </span>
              <p className="text-[#c4c0bb] text-[11px] leading-relaxed font-sans">
                We use strictly essential storage and performance telemetry to make Jadai Studios work offline without commercial third-party ad profiling.{' '}
                <a href="/legal/cookies" className="text-[#C9A84C] underline hover:text-[#e8c96a]">
                  Review Policy
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              onClick={handleRejectAll}
              className="px-2.5 py-1 text-[11px] text-[#8a6e2a] hover:text-[#f5f3f0] transition-colors"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={() => setManageModalOpen(true)}
              className="px-3 py-1 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[11px] text-[#c4c0bb] hover:border-[#C9A84C]"
            >
              Manage
            </button>
            <Button variant="primary" size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </aside>
      )}

      {/* Granular Management Modal */}
      <Modal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        title="Manage Storage Preferences"
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-[#c4c0bb] font-sans">
            Customize which storage categories are authorized during your active session. Essential cookies cannot be disabled.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f5f3f0] block">Essential Session Tokens</span>
                <span className="text-[10px] text-[#8a6e2a]">Required for navigation, security, and auth</span>
              </div>
              <span className="text-[10px] text-[#C9A84C] px-2 py-0.5 rounded bg-[rgba(201,168,76,0.1)]">
                Mandatory
              </span>
            </div>

            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f5f3f0] block">State & Preferences</span>
                <span className="text-[10px] text-[#8a6e2a]">Theme selection, Web Audio settings, PWA sync</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.preferences}
                onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                className="w-4 h-4 accent-[#C9A84C] cursor-pointer"
              />
            </div>

            <div className="p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#f5f3f0] block">Diagnostic Telemetry</span>
                <span className="text-[10px] text-[#8a6e2a]">Internal latency and API error counters</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.diagnostics}
                onChange={(e) => setPreferences({ ...preferences, diagnostics: e.target.checked })}
                className="w-4 h-4 accent-[#C9A84C] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setManageModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CookieConsentBanner;
