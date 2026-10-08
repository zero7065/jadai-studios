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
  Server,
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
  const [tab, setTab] = useState<'pwa' | 'docker' | 'cli' | 'webhook'>('pwa');
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

  const dockerSnippet = `# 1. Pull the official Signal sovereign container
docker pull ghcr.io/jadaistudios/signal-radar:latest

# 2. Run independently with your own PostgreSQL or sqlite
docker run -d \\
  --name jadai-signal-standalone \\
  -p 4200:4200 \\
  -e PORT=4200 \\
  -e JADAI_SOVEREIGN_MODE=standalone \\
  -e RADAR_CADENCE="21:47 WAT" \\
  ghcr.io/jadaistudios/signal-radar:latest

# 3. Access standalone workspace at:
# http://localhost:4200`;

  const cliSnippet = `# Run Signal CLI directly via NPX without dependencies
npx @jadai/signal-radar audit @your_handle --geo --velocity

# Or daemonize continuous social telemetry monitoring
npx @jadai/signal-radar daemon --interval=6h --webhook=https://api.yourdomain.com/social-feed`;

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
            onClick={() => setTab('docker')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'docker'
                ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Docker Engine</span>
          </button>

          <button
            onClick={() => setTab('cli')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'cli'
                ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>NPX / CLI</span>
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

        {/* Tab 2: Docker */}
        {tab === 'docker' && (
          <div className="space-y-3 text-left">
            <p className="text-xs font-mono text-[#c4c0bb]">
              Run an isolated Signal instance on your VPS, Raspberry Pi, or local Kubernetes cluster:
            </p>
            <CodeBlock
              code={dockerSnippet}
              language="bash"
              title="DOCKER_DEPLOY.SH"
            />
          </div>
        )}

        {/* Tab 3: CLI */}
        {tab === 'cli' && (
          <div className="space-y-3 text-left">
            <p className="text-xs font-mono text-[#c4c0bb]">
              Use the developer CLI to run automated batch audits from your terminal or CI/CD pipelines:
            </p>
            <CodeBlock
              code={cliSnippet}
              language="bash"
              title="SIGNAL_CLI_RUNNER.SH"
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
