'use client';

import React from 'react';
import { useCurrency } from '../providers/CurrencyProvider';
import { StudioAudio } from '../../lib/watermark';
import { Globe } from 'lucide-react';

export const CurrencySwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currency, toggleCurrency } = useCurrency();

  const handleToggle = () => {
    try {
      StudioAudio.playClick();
    } catch {}
    toggleCurrency();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(15,14,12,0.8)] hover:bg-[rgba(201,168,76,0.15)] hover:border-[#C9A84C] text-[#e8c96a] text-xs font-mono font-bold transition-all cursor-pointer ${className}`}
      title={`Current currency: ${currency}. Click to switch to ${currency === 'USD' ? 'NGN (₦)' : 'USD ($)'}`}
      aria-label="Toggle currency"
    >
      <Globe className="w-3.5 h-3.5 text-[#C9A84C]" />
      <span>{currency === 'USD' ? '$ USD' : '₦ NGN'}</span>
    </button>
  );
};

export default CurrencySwitcher;
