'use client';

import React from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';

export interface MenuProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 48px Round Menu Trigger Button labeled "MENU" with Sigil Icon
 * Triggers the full-screen Catalog Menu
 */
export const Menu: React.FC<MenuProps> = ({
  onClick,
  className = '',
  size = 'md',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      StudioAudio.playClick();
    } catch {}

    if (onClick) {
      onClick();
    } else {
      window.dispatchEvent(new CustomEvent('jadai_toggle_catalog'));
      window.dispatchEvent(new CustomEvent('jadai_toggle_vault'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative w-12 h-12 rounded-full border border-[rgba(201,168,76,0.4)] bg-[rgba(15,14,12,0.85)] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] hover:border-[#C9A84C] transition-all flex flex-col items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(201,168,76,0.25)] active:scale-95 group backdrop-blur-xl ${className}`}
      title="Open Catalog Menu"
      aria-label="Open Catalog Menu"
    >
      <MenuIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
      <span className="text-[8px] font-mono font-bold tracking-wider uppercase mt-0.5 leading-none">
        MENU
      </span>
    </button>
  );
};

export default Menu;
