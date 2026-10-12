'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import CodeBlock from '../ui/CodeBlock';
import Button from '../ui/Button';
import { useToast } from '../providers/ToastProvider';
import { StudioAudio } from '../../lib/watermark';
import {
  Download,
  Terminal,
  Layers,
  CheckCircle,
  Smartphone,
  ExternalLink,
  Copy,
  Zap,
} from 'lucide-react';

export interface SignalInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignalInstallModal: React.FC<SignalInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<'pwa' | 'api' | 'webhook'>('pwa');
  const { showToast } = useToast();

  const handlePwaInstall = () => {
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}
    if ((window as any).deferredInstallPrompt) {
      (window as any).deferredInstallPrompt.prompt();
    } else {
      showToast(
        'Tap your browser menu (⋮ or Share) and select "Add to Home Screen / Install Signal"',
        'info',
        'Independent PWA'
      );
    }
  };

  const apiSnippet = `# Real Signal API — the same endpoints this app calls
API=https://api.jadai.dev

# Run a scout scan across HN / GitHub / Reddit
curl -X POST $API/api/signal/worker/scout

# Draft outreach against a captured signal
curl -X POST $API/api/signal/worker/closer \\
  -H "Content-Type: application/json" \\
  -d '{"signalId":"sig-123"}'

# Generate X / LinkedIn / Reddit posts
curl -X POST $API/api/signal/worker/writer \\
  -H "Content-Type: application/json" \\
  -d '{"type":"launch","summary":"Shipped feature X","details":"Why it matters"}'

# Read funnel analytics
curl $API/api/signal/analytics

# Start a Paystack checkout for a Signal plan
curl -X POST $API/api/signal/subscribe \\
  -H "Content-Type: application/json" \\
  -d '{"planTier":"pro","currency":"NGN","email":"you@example.com"}'`;

  const webhookSnippet = `// Sample Node.js / Express Webhook Receiver for Signal Live Intelligence
app.post('/api/signal-telemetry', (req, res) => {
  const { handle, platform, algorithmic_velocity, geo_distribution, alerts } = req.body;
  console.log(\`[SIGNAL ALERT] \${handle} reached \${algorithmic_velocity.score}/100 velocity!\`);
  // Dispatch notification to your Slack / Discord / Database
  res.status(200).json({ received: true, timestamp: new Date().toISOString() });
});`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="INSTALL SIGNAL INDEPENDENTLY"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <p className="text-xs font-mono text-[#8a6e2a]">
          Deploy Signal Radar as an independent standalone system, native desktop PWA, or isolated container.
        </p>
        {/* Installation method selector tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)]">
          <button
            onClick={() => setTab('pwa')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'pwa'
                ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Native PWA</span>
          </button>

          <button
            onClick={() => setTab('api')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'api'
                ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>REST API</span>
          </button>

          <button
            onClick={() => setTab('webhook')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'webhook'
                ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Webhooks</span>
          </button>
        </div>

        {/* Tab 1: PWA */}
        {tab === 'pwa' && (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] space-y-2">
              <h4 className="text-sm font-display font-bold text-[#f5f3f0]">
                Instant Desktop & Mobile Sovereign App
              </h4>
              <p className="text-xs font-mono text-[#c4c0bb] leading-relaxed">
                Install Signal directly to your macOS Dock, Windows Taskbar, iOS Home Screen, or Android App Drawer. Works 100% offline with local IndexedDB persistence and instant launch.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={handlePwaInstall}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>Install Native App Now</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.15)] space-y-1">
                <span className="text-[#C9A84C] block font-bold">Offline-First Engine</span>
                <p className="text-[#8a6e2a]">Service Worker caches telemetry schemas and background audits automatically.</p>
              </div>
              <div className="p-3 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.15)] space-y-1">
                <span className="text-[#C9A84C] block font-bold">Zero Telemetry Leaks</span>
                <p className="text-[#8a6e2a]">All handles and audit results reside strictly on your local disk.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: REST API */}
        {tab === 'api' && (
          <div className="space-y-3 text-left">
            <p className="text-xs font-mono text-[#c4c0bb]">
              Signal runs as a hosted service — call the live REST endpoints from your scripts, CI jobs, or other apps:
            </p>
            <CodeBlock
              code={apiSnippet}
              language="bash"
              title="SIGNAL_REST_API.SH"
            />
          </div>
        )}

        {/* Tab 4: Webhook */}
        {tab === 'webhook' && (
          <div className="space-y-3 text-left">
            <p className="text-xs font-mono text-[#c4c0bb]">
              Receive real-time push alerts whenever your tracked accounts hit peak algorithmic velocity:
            </p>
            <CodeBlock
              code={webhookSnippet}
              language="typescript"
              title="WEBHOOK_LISTENER.TS"
            />
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex justify-end pt-2 border-t border-[rgba(201,168,76,0.15)]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SignalInstallModal;
