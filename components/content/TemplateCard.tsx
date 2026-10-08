'use client';

import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import EdgeGlow from '../ui/EdgeGlow';
import LikeButton from '../ui/LikeButton';
import RotatableCard3D from '../ui/RotatableCard3D';
import type { TemplateItem } from '../../lib/data/templates';
import { Eye, ShoppingBag, ArrowUpRight, Sparkles, CheckCircle2, RotateCw } from 'lucide-react';
import { formatCurrency } from '../../lib/utils/format';
import { useCurrency } from '../providers/CurrencyProvider';
import { motion, AnimatePresence } from 'motion/react';
import { useSectionVideos } from '../../lib/media/useSectionVideos';

export interface TemplateCardProps {
  template: TemplateItem;
  onPreview: (template: TemplateItem) => void;
  onBuy: (template: TemplateItem) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPreview,
  onBuy,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const { getVideo } = useSectionVideos();
  const { formatDual } = useCurrency();
  const dualPrice = formatDual(template.price_usd, template.price_ngn);
  const marketplaceVideo = getVideo('marketplace_template_cards');

  const landscapeGradients: Record<string, string> = {
    aperture: 'radial-gradient(circle at 50% 20%, rgba(212,165,116,0.18) 0%, rgba(10,9,8,0.95) 80%)',
    vendor: 'radial-gradient(circle at 50% 20%, rgba(192,57,43,0.18) 0%, rgba(10,22,40,0.95) 80%)',
    shelter: 'radial-gradient(circle at 50% 20%, rgba(26,46,31,0.6) 0%, rgba(18,33,22,0.95) 80%)',
    bloom: 'radial-gradient(circle at 50% 20%, rgba(232,180,184,0.2) 0%, rgba(92,26,46,0.95) 80%)',
    glow: 'radial-gradient(circle at 50% 20%, rgba(212,160,136,0.22) 0%, rgba(46,26,46,0.95) 80%)',
  };

  const cardBackground =
    landscapeGradients[template.slug] ||
    'radial-gradient(circle at 50% 20%, rgba(201,168,76,0.15) 0%, rgba(10,9,8,0.95) 80%)';

  return (
    <EdgeGlow
      intensity={isHovered ? 'intense' : 'subtle'}
      color="gold"
      borderRadius={24}
      className="h-full w-full block"
      pulse={isHovered}
    >
      <RotatableCard3D
        flipLabel="Includes"
        isFlippedControlled={isFlipped}
        onFlipToggle={(f) => setIsFlipped(f)}
        front={
          <div
            style={{ borderRadius: '24px', background: cardBackground }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="TemplateCard relative flex flex-col justify-between p-6 sm:p-7 border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] transition-all duration-300 shadow-[0_15px_45px_rgba(0,0,0,0.85)] group backdrop-blur-xl overflow-hidden h-[490px] w-full text-left"
          >
            {/* Top Category Strip */}
            <div className="relative z-10 flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-[#e8c96a]">
                {template.category}
              </span>

              <div className="flex items-center gap-2 pr-20">
                <LikeButton
                  targetType="template"
                  targetId={template.id}
                  initialLikes={template.download_count || 12}
                  size="sm"
                />
              </div>
            </div>

            {/* Title & Lore */}
            <div className="relative z-10 space-y-2 my-auto">
              <h3 className="text-2xl font-display font-bold text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors leading-tight">
                {template.name}
              </h3>
              <p className="text-xs font-mono text-[#8a6e2a] italic line-clamp-1">
                "{template.tagline}"
              </p>
              <p className="text-xs text-[#c4c0bb] leading-relaxed line-clamp-3 font-serif">
                {template.description}
              </p>

              {/* Live Video Loop if uploaded, otherwise aesthetic background */}
              {marketplaceVideo?.url && (
                <div className="w-full h-24 my-2 rounded-xl overflow-hidden border border-[rgba(201,168,76,0.25)] relative shrink-0">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    src={marketplaceVideo.url}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Stack Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {template.stack.slice(0, 3).map((item) => (
                  <span
                    key={item}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#050404]/90 border border-[rgba(201,168,76,0.2)] text-[#c4c0bb]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Pricing & CTAs */}
            <div className="relative z-10 pt-4 border-t border-[rgba(201,168,76,0.2)] space-y-3 mt-auto">
              <div className="flex items-baseline justify-between">
                <div className="text-xl font-mono font-bold text-[#e8c96a]">
                  {dualPrice.main}
                </div>
                <div className="text-xs font-mono text-[#8a6e2a]">
                  ≈ {dualPrice.alt}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onPreview(template)}
                  className="w-full py-2.5 px-3 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(10,9,8,0.7)] text-[#f5f3f0] hover:text-[#C9A84C] hover:border-[#C9A84C] font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <EdgeGlow intensity="intense" color="gold" borderRadius="12px">
                  <button
                    type="button"
                    onClick={() => onBuy(template)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold tracking-wider hover:bg-[#e8c96a] transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Acquire</span>
                  </button>
                </EdgeGlow>
              </div>
            </div>
          </div>
        }
        back={
          <div className="space-y-4 text-xs font-mono text-[#c4c0bb] h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="border-b border-[rgba(201,168,76,0.2)] pb-2">
                <span className="text-[10px] text-[#8a6e2a] uppercase">Payload Blueprint</span>
                <h4 className="font-display font-bold text-base text-[#f5f3f0]">
                  What {template.name} Includes:
                </h4>
              </div>

              <ul className="space-y-2 text-[11px] font-mono text-[#c4c0bb]">
                {template.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between">
              <div className="text-sm font-bold text-[#e8c96a]">
                ₦{template.price_ngn.toLocaleString()}
              </div>

              <button
                type="button"
                onClick={() => onBuy(template)}
                className="px-4 py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-bold text-xs hover:bg-[#e8c96a] transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Acquire License</span>
              </button>
            </div>
          </div>
        }
      />
    </EdgeGlow>
  );
};

export default TemplateCard;
