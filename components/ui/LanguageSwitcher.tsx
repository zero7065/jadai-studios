'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, ALL_LOCALES, SupportedLanguage } from '../providers/LanguageProvider';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudioAudio } from '../../lib/watermark';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = ALL_LOCALES.find((l) => l.code === language) || ALL_LOCALES[0];

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
    StudioAudio.playClick();
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] bg-[rgba(10,9,8,0.7)] hover:bg-[rgba(15,23,42,0.85)] backdrop-blur-md text-xs font-mono text-[#c4c0bb] hover:text-[#f5f3f0] transition-all cursor-pointer shadow-sm"
        title="Change Language (Auto-detected)"
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span className="font-semibold uppercase">{current.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-48 max-h-72 rounded-2xl border border-[rgba(201,168,76,0.3)] bg-[#0a0908]/95 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.8)] p-1.5 z-50 overflow-y-auto font-mono text-xs"
          >
            <div className="text-[9px] font-mono tracking-widest text-[#8a6e2a] px-2 py-1 uppercase border-b border-[rgba(201,168,76,0.15)] mb-1">
              Select Locale ({ALL_LOCALES.length})
            </div>
            {ALL_LOCALES.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code as SupportedLanguage)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[rgba(201,168,76,0.2)] text-[#e8c96a] font-bold'
                      : 'text-[#c4c0bb] hover:text-[#f5f3f0] hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{item.name} ({item.native})</span>
                  {isSelected && <Check className="w-3 h-3 text-[#C9A84C] shrink-0 ml-1" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
