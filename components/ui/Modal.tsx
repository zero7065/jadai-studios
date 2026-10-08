'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import EdgeGlow from './EdgeGlow';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#050404]/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog with EdgeGlow outer frame */}
      <div className={`relative w-full ${maxWidth} z-10 transform transition-all duration-300`}>
        <EdgeGlow intensity="intense" color="gold" borderRadius={16} className="w-full">
          <div className="w-full glass border border-[rgba(201,168,76,0.35)] rounded-[16px] shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden">
            {/* Top Gold Accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,168,76,0.15)] bg-[#0a0908]/90">
              {title ? (
                <h3 className="text-lg font-display font-bold text-[#f5f3f0] tracking-wide">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8a6e2a] hover:text-[#f5f3f0] hover:bg-[rgba(201,168,76,0.15)] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto bg-[#050404]/90">{children}</div>
          </div>
        </EdgeGlow>
      </div>
    </div>
  );
};

export default Modal;
