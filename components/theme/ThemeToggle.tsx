'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeProvider';
import { StudioAudio } from '../../lib/watermark';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    StudioAudio.playClick();
    toggleTheme();
  };

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`group relative flex items-center h-8 w-15 rounded-full p-1 border transition-all duration-300 cursor-pointer select-none shadow-inner ${
        isLight
          ? 'bg-slate-200/90 border-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'
          : 'bg-[#0B101B]/90 border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C]/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]'
      } ${className}`}
      title={`Toggle ${isLight ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle visual theme"
    >
      <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
        <Sun className={`w-3.5 h-3.5 transition-opacity duration-300 ${isLight ? 'opacity-90 text-amber-600' : 'opacity-20 text-slate-500'}`} />
        <Moon className={`w-3 h-3 transition-opacity duration-300 ${!isLight ? 'opacity-90 text-[#FFDF79]' : 'opacity-20 text-slate-400'}`} />
      </div>

      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-colors ${
          isLight
            ? 'translate-x-0 bg-white text-amber-600 border border-slate-300/80'
            : 'translate-x-7 bg-gradient-to-tr from-[#161B26] to-[#252D3D] text-[#FFDF79] border border-[#C9A84C]/40'
        }`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, scale: 0.5 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isLight ? (
            <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
