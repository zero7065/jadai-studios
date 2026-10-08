'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import EdgeGlow from '../ui/EdgeGlow';
import SacredGeometry from '../ui/SacredGeometry';
import { StudioAudio } from '../../lib/watermark';
import {
  Compass,
  Sparkles,
  Bot,
  RotateCw,
  FolderGit2,
  Layers,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  ShoppingBag,
  Activity,
  X,
} from 'lucide-react';

interface StudioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

const GUIDE_STEPS = [
  {
    title: 'Welcome to Jadai Studios',
    subtitle: 'Creative technology studio · Jos, Nigeria',
    description:
      "Welcome to Jadai Studios — a creative technology studio from Jos, Nigeria. Here you'll find tools, philosophy, and community for builders who think differently.",
    badge: 'Step 1 of 5 • The Foundation',
    icon: Compass,
    actionLabel: 'Discover Tools →',
    highlight: 'Explore the Floor',
  },
  {
    title: 'The 4 Creation Tools',
    subtitle: 'Forge • Oracle • Mirage • Sentinel',
    description:
      'Consolidated into 4 elite instruments: Forge handles document editing & OCR layout; Oracle is your Socratic AI companion with persistent device memory; Mirage synthesizes 4K visual art with multi-API fallback; Sentinel audits site speed, SEO, and cloaks links.',
    badge: 'Step 2 of 5 • Creation Engines',
    icon: Layers,
    actionLabel: 'View Art & Canon →',
    highlight: 'Continuous Drafts',
  },
  {
    title: 'Hall of Art & The Book of Lies',
    subtitle: 'Nightly 9:47 PM Philosophical Transmission',
    description:
      'Immerse in the serialized moral fiction of The Book of Lies. Every sin (Pride, Envy, Wrath, Sloth, Greed, Gluttony, Lust) is mapped to sacred geometry diagrams and engineering reflections on system failure modes.',
    badge: 'Step 3 of 5 • Hall of Art',
    icon: BookOpen,
    actionLabel: 'Learn 3D Cards →',
    highlight: 'Sacred Geometry',
  },
  {
    title: '3D Rotatable Cards & Sleek Density',
    subtitle: 'Flip Any Card for Technical Specs',
    description:
      'To prevent cluttered screens, cards across the Marketplace, Services, and Book of Lies feature 3D Flip toggles. Tap the flip icon to inspect detailed tech stacks, EXIF metadata, and direct actions without leaving your scroll position.',
    badge: 'Step 4 of 5 • Interactive 3D',
    icon: RotateCw,
    actionLabel: 'Meet the Ultron AI →',
    highlight: '180° Flip Physics',
  },
  {
    title: 'Ultron AI Floating Pod & Safe Vault',
    subtitle: 'Ask, Navigate & Unseal Continuous State',
    description:
      'The glowing holographic orb at bottom-right is your Ultron assistant. It cycles 8 assistance queries and can auto-navigate anywhere upon natural command. Turn the rotary Vault Knob at top-right (or mobile bottom dock) for complete system access.',
    badge: 'Step 5 of 5 • Autonomous Mastery',
    icon: Bot,
    actionLabel: 'Enter the Studio ✓',
    highlight: 'Zero Latency Navigation',
  },
];

export const StudioGuideModal: React.FC<StudioGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('jadai_tour_seen');
      if (seen === 'true') {
        setDontShowAgain(true);
      }
    }
  }, []);

  const step = GUIDE_STEPS[currentStep];
  const StepIcon = step.icon;

  const persistPreference = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jadai_tour_seen', 'true');
    }
  };

  const handleNext = () => {
    StudioAudio.playClick();
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (dontShowAgain) persistPreference();
      StudioAudio.playSuccessArpeggio();
      onClose();
    }
  };

  const handlePrev = () => {
    StudioAudio.playClick();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkipTour = () => {
    StudioAudio.playClick();
    if (dontShowAgain) persistPreference();
    onClose();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDontShowAgain(checked);
    if (typeof window !== 'undefined') {
      if (checked) {
        localStorage.setItem('jadai_tour_seen', 'true');
      } else {
        localStorage.removeItem('jadai_tour_seen');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="p-2 sm:p-4 space-y-6 text-[#c4c0bb] select-none">
        {/* Step Badge & Skip Tour */}
        <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.15)] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C]">
              {step.badge}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSkipTour}
            className="text-xs font-mono text-[#8a857e] hover:text-[#e8c96a] transition-colors cursor-pointer"
          >
            Skip tour
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#e8c96a] shadow-[0_0_25px_rgba(201,168,76,0.2)]">
            <StepIcon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0]">
              {step.title}
            </h3>
            <p className="text-xs font-mono text-[#e8c96a]">
              {step.subtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm font-serif leading-relaxed text-[#c4c0bb] bg-[#050404] p-4 rounded-xl border border-[rgba(201,168,76,0.15)]">
            {step.description}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {GUIDE_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                StudioAudio.playClick();
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? 'w-8 bg-gradient-to-r from-[#e8c96a] to-[#C9A84C]'
                  : 'w-2 bg-[rgba(201,168,76,0.25)] hover:bg-[rgba(201,168,76,0.5)]'
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Preferences checkbox & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[rgba(201,168,76,0.15)]">
          <label className="flex items-center gap-2 text-xs font-mono text-[#8a857e] hover:text-[#c4c0bb] cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleCheckboxChange}
              className="rounded bg-[#050404] border-[rgba(201,168,76,0.3)] text-[#C9A84C] focus:ring-0 cursor-pointer"
            />
            <span>Don&apos;t show again</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors ${
                currentStep === 0
                  ? 'opacity-30 cursor-not-allowed text-[#8a6e2a]'
                  : 'text-[#c4c0bb] hover:text-[#f5f3f0] hover:bg-white/5 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <EdgeGlow intensity="subtle" color="gold" borderRadius="8px">
              <Button variant="primary" size="sm" onClick={handleNext}>
                <span>{step.actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </EdgeGlow>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StudioGuideModal;
