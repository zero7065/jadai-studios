'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudioAudio } from '../../lib/watermark';
import {
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Terminal,
  Compass,
  FileText,
  Palette,
  Shield,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Users,
  User,
  Radio,
  Sliders,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export interface CatalogCategory {
  id: string;
  name: string;
  subtitle: string;
  borderColor: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }>;
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    id: 'playground',
    name: 'PLAYGROUND',
    subtitle: '16 tools for builders',
    borderColor: '#C9A84C', // Gold
    items: [
      {
        id: 'forge',
        title: 'FORGE',
        description: 'Document architect and markdown writing engine.',
        path: '/playground/forge',
        icon: Terminal,
        accentColor: '#C9A84C',
      },
      {
        id: 'oracle',
        title: 'ORACLE',
        description: "Adaptive guidance and professional writer's room.",
        path: '/oracle',
        icon: Compass,
        accentColor: '#C9A84C',
      },
      {
        id: 'mirage',
        title: 'MIRAGE',
        description: '4K visual asset creation and canvas engine.',
        path: '/create',
        icon: Palette,
        accentColor: '#C9A84C',
      },
      {
        id: 'sentinel',
        title: 'SENTINEL',
        description: 'Site performance, security audit and health scan.',
        path: '/playground/sentinel',
        icon: Shield,
        accentColor: '#C9A84C',
      },
    ],
  },
  {
    id: 'studio',
    name: 'STUDIO',
    subtitle: 'Book of Lies · Gallery · Doctrine',
    borderColor: '#c0392b', // Crimson
    items: [
      {
        id: 'book-of-lies',
        title: 'Book of Lies',
        description: '70 parables and philosophical meditations.',
        path: '/book-of-lies',
        icon: BookOpen,
        accentColor: '#c0392b',
      },
      {
        id: 'gallery',
        title: 'Studio Gallery',
        description: 'Visual portfolio and 4K creative render showcases.',
        path: '/work',
        icon: ImageIcon,
        accentColor: '#c0392b',
      },
      {
        id: 'doctrine',
        title: 'Doctrine & Philosophy',
        description: 'Engineering principles, story codex, and studio craft.',
        path: '/about',
        icon: Sparkles,
        accentColor: '#c0392b',
      },
    ],
  },
  {
    id: 'marketplace',
    name: 'MARKETPLACE',
    subtitle: '7 templates + portfolio',
    borderColor: '#00e5ff', // Cyan
    items: [
      {
        id: 'aperture',
        title: 'Aperture',
        description: 'Photography studio and visual gallery stack.',
        path: '/hub',
        icon: ShoppingBag,
        accentColor: '#00e5ff',
      },
      {
        id: 'vendor',
        title: 'Vendor',
        description: 'E-commerce storefront with pre-wired payments.',
        path: '/hub',
        icon: ShoppingBag,
        accentColor: '#00e5ff',
      },
      {
        id: 'shelter',
        title: 'Shelter',
        description: 'Real estate and architecture platform foundation.',
        path: '/hub',
        icon: ShoppingBag,
        accentColor: '#00e5ff',
      },
      {
        id: 'bloom',
        title: 'Bloom',
        description: 'Beauty and wellness client booking system.',
        path: '/hub',
        icon: ShoppingBag,
        accentColor: '#00e5ff',
      },
      {
        id: 'glow',
        title: 'Glow',
        description: 'Luxury skincare and cosmetics digital store.',
        path: '/hub',
        icon: ShoppingBag,
        accentColor: '#00e5ff',
      },
      {
        id: 'portfolio',
        title: 'Portfolio Stacks',
        description: 'Verified production stacks ready for deployment.',
        path: '/work',
        icon: Briefcase,
        accentColor: '#00e5ff',
      },
    ],
  },
  {
    id: 'hub',
    name: 'HUB',
    subtitle: 'Community · Profile · Workspace',
    borderColor: '#f59e0b', // Amber
    items: [
      {
        id: 'community',
        title: 'Community Feed',
        description: 'Live builder transmissions, updates, and discussions.',
        path: '/community',
        icon: Users,
        accentColor: '#f59e0b',
      },
      {
        id: 'profile',
        title: 'User Profile',
        description: 'Account settings, tier status, and member badges.',
        path: '/account/workspace',
        icon: User,
        accentColor: '#f59e0b',
      },
      {
        id: 'workspace',
        title: 'Writer Workspace',
        description: 'Personal drafts, saved stories, and ghostwriting room.',
        path: '/write',
        icon: FileText,
        accentColor: '#f59e0b',
      },
    ],
  },
  {
    id: 'signal',
    name: 'SIGNAL',
    subtitle: 'Find your people',
    borderColor: '#ff8c3c', // Orange
    items: [
      {
        id: 'signal-radar',
        title: 'Signal Radar',
        description: 'Targeted outbound lead discovery and outreach engine.',
        path: '/signal',
        icon: Radio,
        accentColor: '#ff8c3c',
      },
      {
        id: 'signal-pricing',
        title: 'Plans & Pricing',
        description: 'Startup tiers and transparent software subscriptions.',
        path: '/pricing',
        icon: DollarSign,
        accentColor: '#ff8c3c',
      },
      {
        id: 'signal-trends',
        title: 'Radar Feeds',
        description: 'Real-time telemetry and market opportunities.',
        path: '/signal/radar',
        icon: TrendingUp,
        accentColor: '#ff8c3c',
      },
    ],
  },
];

export interface CatalogMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
  onSelect?: (path: string) => void;
  currentPath?: string;
}

export const CatalogMenu: React.FC<CatalogMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelect,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMenuOpen = isOpen !== undefined ? isOpen : internalOpen;

  const handleClose = () => {
    if (onClose) onClose();
    setInternalOpen(false);
  };

  // Event listeners for autonomous toggling across site
  useEffect(() => {
    const handleToggle = () => setInternalOpen((prev) => !prev);
    const handleOpen = () => setInternalOpen(true);
    const handleCloseEvent = () => setInternalOpen(false);

    window.addEventListener('jadai_toggle_catalog', handleToggle);
    window.addEventListener('jadai_open_catalog', handleOpen);
    window.addEventListener('jadai_toggle_vault', handleToggle);
    window.addEventListener('jadai_open_vault', handleOpen);
    window.addEventListener('jadai_close_vault', handleCloseEvent);

    return () => {
      window.removeEventListener('jadai_toggle_catalog', handleToggle);
      window.removeEventListener('jadai_open_catalog', handleOpen);
      window.removeEventListener('jadai_toggle_vault', handleToggle);
      window.removeEventListener('jadai_open_vault', handleOpen);
      window.removeEventListener('jadai_close_vault', handleCloseEvent);
    };
  }, []);

  // All categories collapsed by default per PROMPT 4
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleCategory = (categoryId: string) => {
    StudioAudio.playClick();
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleItemClick = (path: string) => {
    StudioAudio.playClick();
    handleClose();
    if (onSelect) {
      onSelect(path);
    } else if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  if (!isMenuOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center select-none">
        {/* Deep Dark Glass Void Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
        />

        {/* Full-Screen Catalog Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl h-[92vh] sm:h-[86vh] max-h-[820px] mx-4 rounded-3xl bg-[#080706] border border-[rgba(201,168,76,0.3)] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(201,168,76,0.2)] bg-[#0d0c0a]/80">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C] animate-pulse" />
              <h2
                className="text-lg sm:text-xl font-display font-black tracking-[0.2em] text-[#f5f3f0] uppercase"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                CATALOG
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-white/10 hover:border-[#C9A84C] bg-white/5 hover:bg-[#C9A84C]/15 text-[#c4c0bb] hover:text-[#fff] transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
              aria-label="Close catalog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Collapsible Categories List (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scrollbar-thin">
            {CATALOG_CATEGORIES.map((cat) => {
              const isExpanded = expandedCategoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="rounded-2xl bg-[#0f0e0c]/90 border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/15 shadow-sm"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: cat.borderColor,
                  }}
                >
                  {/* Category Trigger Header */}
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-white/[0.02]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm sm:text-base font-display font-bold tracking-wider text-[#f5f3f0]"
                          style={{ fontFamily: 'Cinzel, serif' }}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#8a857e] mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8a857e] transition-transform duration-200">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-[#e8c96a]' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Items Sub-List */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-white/5 bg-[#080706]/70"
                      >
                        <div className="p-3 sm:p-4 space-y-2">
                          {cat.items.map((item) => {
                            const IconComponent = item.icon;

                            return (
                              <button
                                key={item.id}
                                onClick={() => handleItemClick(item.path)}
                                className="w-full p-3 rounded-xl flex items-center justify-between gap-3 text-left transition-all duration-200 hover:bg-white/[0.04] border border-transparent hover:border-white/10 group cursor-pointer"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  {/* 40px Icon */}
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-[#12100d] transition-all duration-200 group-hover:scale-105"
                                    style={{ color: item.accentColor }}
                                  >
                                    <IconComponent className="w-5 h-5" />
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="text-sm font-display font-semibold text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors truncate">
                                      {item.title}
                                    </h4>
                                    <p className="text-xs font-mono text-[#8a857e] truncate mt-0.5">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>

                                {/* "Open" Arrow */}
                                <div className="flex items-center gap-1.5 text-xs font-mono text-[#8a857e] group-hover:text-[#e8c96a] transition-colors shrink-0">
                                  <span className="hidden sm:inline">Open</span>
                                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3.5 border-t border-[rgba(201,168,76,0.15)] bg-[#0a0908] flex items-center justify-between text-xs font-mono text-[#8a857e]">
            <span>JADAI STUDIOS • CATALOG</span>
            <span>Press ESC to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CatalogMenu;
