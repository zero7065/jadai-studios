'use client';
import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, ArrowRight, MessageSquare } from 'lucide-react';

export function SignalCard({
  signal,
  onSelect,
  onNavigate,
}: {
  signal: any;
  onSelect?: (signal: any) => void;
  onNavigate?: (path: string) => void;
}) {
  const score = signal.intent_score ?? signal.intentScore ?? 0;
  const intentColor =
    score >= 80
      ? 'text-red-400 border-red-400/30 bg-red-400/10'
      : score >= 60
      ? 'text-orange-400 border-orange-400/30 bg-orange-400/10'
      : score >= 40
      ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      : 'text-[#8a6e2a] border-[#8a6e2a]/30 bg-[#8a6e2a]/10';

  const author = signal.author_handle || signal.author || 'builder';
  const content = signal.content || '';
  const platform = signal.platform || 'web';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(signal);
    } else if (onNavigate) {
      onNavigate(`/signal/radar/${signal.id}`);
    } else {
      window.location.href = `/signal/radar/${signal.id}`;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-5 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] transition-all duration-200 flex flex-col justify-between shadow-lg group cursor-pointer"
      onClick={handleClick}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#8a6e2a] text-xs font-mono uppercase tracking-wider font-bold">
            {platform}
          </span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${intentColor}`}>
            {score}% Intent
          </span>
        </div>

        <p className="text-[#f5f3f0] text-sm line-clamp-3 mb-4 leading-relaxed font-sans">
          {content}
        </p>

        {signal.reason && (
          <p className="text-xs text-[#8a6e2a] font-mono line-clamp-1 mb-3">
            Why: {signal.reason}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between text-xs font-mono text-[#8a6e2a]">
        <span>@{author}</span>
        <span className="text-[#C9A84C] group-hover:translate-x-1 transition-transform flex items-center gap-1">
          Open HUD <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
}
