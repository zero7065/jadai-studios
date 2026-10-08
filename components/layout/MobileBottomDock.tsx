'use client';

import React, { useState } from 'react';
import { Home, Layers, BookOpen, ShoppingBag, User, HelpCircle } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';
import StudioGuideModal from '../tutorial/StudioGuideModal';

export interface MobileBottomDockProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  currentPath = '/',
  onNavigate,
}) => {
  const [guideOpen, setGuideOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Tools', path: '/playground', icon: Layers },
    { label: 'Studio', path: '/book-of-lies', icon: BookOpen },
    { label: 'Market', path: '/marketplace', icon: ShoppingBag },
    { label: 'You', path: '/hub', icon: User },
  ];

  const handleLinkClick = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    StudioAudio.playClick();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const isItemActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Floating Guide Button: 44px circle, bottom-right above dock */}
      <div className="md:hidden fixed bottom-[72px] right-4 z-[88]">
        <button
          type="button"
          onClick={() => {
            StudioAudio.playClick();
            setGuideOpen(true);
          }}
          className="w-11 h-11 rounded-full bg-[rgba(10,9,8,0.9)] border border-[rgba(201,168,76,0.3)] text-[#d4b050] hover:text-[#C9A84C] hover:border-[#C9A84C] shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer transition-all active:scale-95"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          title="Studio Guide"
          aria-label="Studio Guide"
        >
          <HelpCircle className="w-5 h-5 text-[#d4b050]" />
        </button>
      </div>

      {/* 5 Items Exactly: [Home] [Tools] [Studio] [Market] [You] */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="md:hidden fixed bottom-0 inset-x-0 z-[89] h-[60px] flex items-center justify-around select-none border-t"
        style={{
          backgroundColor: 'rgba(5, 4, 4, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'rgba(196, 192, 187, 0.08)',
        }}
      >
        {navItems.map((item) => {
          const active = isItemActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              onClick={(e) => handleLinkClick(item.path, e)}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 relative cursor-pointer transition-colors duration-200 ${
                active ? 'text-[#d4b050]' : 'text-[#8a857e]'
              }`}
            >
              <Icon className="w-[22px] h-[22px]" />
              <span className="text-[9px] font-mono uppercase tracking-wider">{item.label}</span>
              {active && (
                <span className="absolute bottom-0 inset-x-3 h-[2px] bg-[#d4b050] rounded-t-full shadow-[0_0_8px_#d4b050]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Studio Guide Modal */}
      <StudioGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};

export default MobileBottomDock;
