'use client';

import React from 'react';
import SacredGeometry from './SacredGeometry';
import EdgeGlow from './EdgeGlow';
import { ArrowRight } from 'lucide-react';

interface BrandedErrorFallbackProps {
  onNavigate?: (path: string) => void;
  message?: string;
}

export const BrandedErrorFallback: React.FC<BrandedErrorFallbackProps> = ({
  onNavigate,
  message,
}) => {
  const handleReturnHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-center space-y-6 shadow-2xl backdrop-blur-md">
        {/* Jadai Studios Sigil */}
        <div className="w-16 h-16 mx-auto flex items-center justify-center">
          <SacredGeometry size={56} className="text-[#C9A84C]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0]">
            This page couldn&apos;t load.
          </h2>
          {message && (
            <p className="text-xs font-mono text-[#8a857e]">
              {message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <a
            href="/"
            onClick={handleReturnHome}
            className="inline-flex items-center gap-2 text-sm font-mono font-bold text-[#C9A84C] hover:text-[#e8c96a] transition-colors cursor-pointer group"
          >
            <span>Return home</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default BrandedErrorFallback;
