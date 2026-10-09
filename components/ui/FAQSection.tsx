'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';
import type { FAQItem } from '../../lib/data/faqs';

export interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  intro?: string;
  className?: string;
}

/**
 * Shared animated FAQ accordion. Uses the CSS grid-rows 0fr -> 1fr technique
 * so answers expand smoothly without measuring height in JS.
 */
export default function FAQSection({
  items,
  title = 'Questions, Answered',
  intro,
  className = '',
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    StudioAudio.playClick();
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className={`space-y-5 ${className}`} aria-label={title}>
      <div className="border-b border-[rgba(201,168,76,0.2)] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
          Before You Ask
        </span>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0] mt-1">
          {title}
        </h2>
        {intro && (
          <p className="text-xs font-mono text-[#8a857e] mt-2 max-w-2xl leading-relaxed">
            {intro}
          </p>
        )}
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.q}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-[#0a0908] border-[rgba(201,168,76,0.45)] shadow-[0_0_24px_rgba(201,168,76,0.08)]'
                  : 'bg-[#050404] border-[rgba(201,168,76,0.18)] hover:border-[rgba(201,168,76,0.35)]'
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full flex items-start justify-between gap-4 text-left px-4 sm:px-5 py-3.5 cursor-pointer group"
              >
                <span
                  className={`text-xs sm:text-sm font-mono leading-snug transition-colors ${
                    isOpen ? 'text-[#e8c96a] font-bold' : 'text-[#c4c0bb] group-hover:text-[#f5f3f0]'
                  }`}
                >
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 mt-0.5 text-[#C9A84C] transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {/* grid-rows 0fr -> 1fr animation: no JS height measurement needed */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="px-4 sm:px-5 pb-4 text-[11px] sm:text-xs text-[#8a857e] leading-relaxed font-sans">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
