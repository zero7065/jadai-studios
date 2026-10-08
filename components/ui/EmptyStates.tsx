import React from 'react';
import GlassCard from './GlassCard';
import Button from './Button';

export const EmptyPortfolio: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <GlassCard className="p-8 text-center space-y-4 max-w-lg mx-auto border-[rgba(201,168,76,0.2)]">
    <div className="w-12 h-12 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center mx-auto text-[#C9A84C] font-mono text-xl">
      ◈
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-display text-[#f5f3f0]">The Work Is Being Assembled</h3>
      <p className="text-xs font-mono text-[#8a6e2a]">
        Check back soon. Case studies and live system benchmarks are compiling.
      </p>
    </div>
    {onRefresh && (
      <Button variant="outline" size="sm" onClick={onRefresh}>
        Re-check Frequency
      </Button>
    )}
  </GlassCard>
);

export const EmptyBookOfLies: React.FC = () => (
  <GlassCard className="p-8 text-center space-y-4 max-w-lg mx-auto border-[rgba(192,57,43,0.3)]">
    <div className="w-12 h-12 rounded-full border border-[rgba(192,57,43,0.4)] flex items-center justify-center mx-auto text-[#C0392B] font-mono text-xl">
      ⬡
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-display text-[#f5f3f0]">The Transmission Is Encrypted</h3>
      <p className="text-xs font-mono text-[#8a6e2a]">
        The first episode drops at 9:47 PM. Stand by the signal.
      </p>
    </div>
  </GlassCard>
);

export const EmptyMarketplace: React.FC = () => (
  <GlassCard className="p-8 text-center space-y-4 max-w-lg mx-auto border-[rgba(201,168,76,0.2)]">
    <div className="w-12 h-12 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center mx-auto text-[#C9A84C] font-mono text-xl">
      ⬢
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-display text-[#f5f3f0]">Templates Are Coming</h3>
      <p className="text-xs font-mono text-[#8a6e2a]">
        Join the newsletter to receive early architectural blueprints.
      </p>
    </div>
  </GlassCard>
);

export const EmptyHub: React.FC<{ onAction?: () => void }> = ({ onAction }) => (
  <GlassCard className="p-8 text-center space-y-4 max-w-lg mx-auto border-[rgba(201,168,76,0.2)]">
    <div className="w-12 h-12 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center mx-auto text-[#C9A84C] font-mono text-xl">
      ❖
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-display text-[#f5f3f0]">The Hub Opens Soon</h3>
      <p className="text-xs font-mono text-[#8a6e2a]">
        Be the first to list a tactical mission or engineering service.
      </p>
    </div>
    {onAction && (
      <Button variant="primary" size="sm" onClick={onAction}>
        Submit First Listing
      </Button>
    )}
  </GlassCard>
);
