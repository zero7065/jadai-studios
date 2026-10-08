'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STICKER_PACKS, Sticker } from '../../lib/community/feed';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import { Download, Sparkles, X, Smile } from 'lucide-react';

export interface StickerPickerProps {
  onSelectSticker: (sticker: Sticker) => void;
  onClose?: () => void;
  className?: string;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onSelectSticker,
  onClose,
  className = '',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'builder' | 'mythic' | 'reaction'>('builder');

  const currentStickers = STICKER_PACKS[activeTab] || STICKER_PACKS.builder;

  const handleDownloadPack = () => {
    StudioAudio.playSuccessArpeggio();
    // Generate a downloadable JSON metadata pack
    const jsonStr = JSON.stringify(STICKER_PACKS[activeTab], null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jadai-${activeTab}-stickers.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded Jadai "${activeTab.toUpperCase()}" sticker pack!`, 'success');
  };

  return (
    <div
      className={`p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl w-80 text-left space-y-3 z-50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#e8c96a]">
          <Smile className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span>Jadai Sticker Packs</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8a857e] hover:text-[#fff] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#050404] p-1 rounded-xl border border-white/5 text-[11px] font-mono">
        {(
          [
            { id: 'builder', label: 'Builder' },
            { id: 'mythic', label: 'Mythic' },
            { id: 'reaction', label: 'Reaction' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              StudioAudio.playClick();
            }}
            className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#C9A84C] text-[#050404] shadow-xs'
                : 'text-[#8a857e] hover:text-[#f5f3f0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 12 Stickers Grid */}
      <div className="grid grid-cols-4 gap-2 py-1 max-h-48 overflow-y-auto scrollbar-thin">
        {currentStickers.map((stk) => (
          <button
            key={stk.id}
            onClick={() => {
              StudioAudio.playClick();
              onSelectSticker(stk);
              if (onClose) onClose();
            }}
            title={stk.label}
            className="p-2 rounded-xl bg-white/5 hover:bg-[rgba(201,168,76,0.15)] border border-white/10 hover:border-[#C9A84C] transition-all flex flex-col items-center justify-center cursor-pointer group hover:scale-105 active:scale-95"
          >
            <span className="text-2xl leading-none">{stk.emoji}</span>
            <span className="text-[8px] font-mono text-[#8a857e] group-hover:text-[#e8c96a] mt-1 truncate max-w-full">
              {stk.name}
            </span>
          </button>
        ))}
      </div>

      {/* Download Pack Button */}
      <button
        onClick={handleDownloadPack}
        className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-[#e8c96a] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Download className="w-3 h-3 text-[#C9A84C]" />
        <span>Download {activeTab} Pack (12 items)</span>
      </button>
    </div>
  );
};

export default StickerPicker;
