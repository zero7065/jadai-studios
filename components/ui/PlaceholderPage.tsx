import React from 'react';
import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';
import Button from './Button';

export interface PlaceholderPageProps {
  title: string;
  tagline: string;
  promptStage: 'Prompt 2' | 'Prompt 3';
  description: string;
  backHref?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  tagline,
  promptStage,
  description,
  backHref = '/',
}) => {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">{tagline}</span>
          <h1 className="text-3xl sm:text-4xl font-display text-[#f5f3f0] mt-1">{title}</h1>
        </div>
        <StatusBadge status={`In Build • ${promptStage}`} variant="gold" />
      </div>

      {/* Main Glass Panel */}
      <GlassCard className="p-8 text-center space-y-6">
        {/* Gold Sigil */}
        <div className="flex justify-center">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
            <polygon points="20,2 38,20 20,38 2,20" stroke="#C9A84C" strokeWidth="1.5" />
            <rect x="11" y="11" width="18" height="18" stroke="#8a6e2a" strokeWidth="1" transform="rotate(45 20 20)" />
            <circle cx="20" cy="20" r="2.5" fill="#C9A84C" />
          </svg>
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-xl font-display text-[#f5f3f0]">Floor Blueprint Established</h2>
          <p className="text-sm text-[#c4c0bb] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-3.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] text-xs font-mono text-[#8a6e2a] max-w-md mx-auto">
          ◈ Architectural schema, routing, and state verified. Full UI & engine synthesis launches in {promptStage}.
        </div>

        <div className="pt-2">
          <a href={backHref}>
            <Button variant="outline" size="sm">
              Return to Center
            </Button>
          </a>
        </div>
      </GlassCard>
    </div>
  );
};

export default PlaceholderPage;
