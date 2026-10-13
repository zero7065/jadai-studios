'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EdgeGlow from '../ui/EdgeGlow';
import StatusBadge from '../ui/StatusBadge';
import ModuleIcon from '../ui/ModuleIcon';
import { PLAYGROUND_TOOLS } from '../../lib/data/playgroundTools';
import { StudioAudio } from '../../lib/watermark';
import { getCustomization } from '../../lib/data/customization';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Eye,
  Terminal,
  Layers,
  Cpu,
  Compass,
  CheckCircle2,
  RotateCcw,
  Zap,
} from 'lucide-react';

export interface DisplayItem {
  id: string;
  name: string;
  category: 'playground' | 'studio' | 'hub';
  status: 'Live' | 'In Build' | 'Coming Soon';
  icon: string;
  path: string;
  backgroundImage: string;
  previewImage: string;
  why: string;
  what: string;
  how: string;
}

const PLAYGROUND_ROW_ITEMS: DisplayItem[] = PLAYGROUND_TOOLS.map((t) => ({
  id: t.slug,
  name: t.name,
  category: 'playground',
  status: t.status,
  icon: t.iconName,
  path: `/playground/${t.slug}`,
  backgroundImage: t.backgroundImage,
  previewImage: t.previewGif,
  why: t.why,
  what: t.what,
  how: t.howSteps.slice(0, 2).join(' → '),
}));

const STUDIO_ROW_ITEMS: DisplayItem[] = [
  {
    id: 'dashboard',
    name: 'Central Dashboard',
    category: 'studio',
    status: 'Live',
    icon: 'oracle',
    path: '/dashboard',
    backgroundImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    why: 'One plain-language command center for all your engines.',
    what: 'Central Bento grid with per-service PWA shortcuts, on-device cache, and permanent Google identity.',
    how: 'Launch your tools → Install standalone shortcuts → Keep working offline.',
  },
  {
    id: 'create',
    name: 'Create',
    category: 'studio',
    status: 'Live',
    icon: 'dream-forge',
    path: '/create',
    backgroundImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&auto=format&fit=crop&q=80',
    why: 'Guided creative assembly, not an empty prompt void.',
    what: 'Craft images, thumbnails, banners, GIFs, and sigils. Precision highlight pen and true 4K export with still or animated mark.',
    how: 'Pick output type → Fill guided prompt → Refine with lasso pen → Export 4K.',
  },
  {
    id: 'write',
    name: 'Write & Author',
    category: 'studio',
    status: 'Live',
    icon: 'book-of-lies',
    path: '/write',
    backgroundImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80',
    why: 'Ghostwriting with voice matching and running invariant discipline.',
    what: 'Long-form books and short-form essays. Tracks character/plot facts, suggests diff track changes, and exports .docx / PDF.',
    how: 'Input voice sample → Organize outline → Co-author sections → Export manuscript.',
  },
  {
    id: 'book-of-lies',
    name: 'Book of Lies & Quotes',
    category: 'studio',
    status: 'Live',
    icon: 'book-of-lies',
    path: '/book-of-lies',
    backgroundImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80',
    why: 'Truth stripped of comforting lies is the only durable ground.',
    what: 'A nightly philosophical canon serialized into 7 deadly acts, dissecting moral hazards and engineering pride.',
    how: 'Delivered at 9:47 PM WAT nightly. Read or listen to unvarnished transmissions.',
  },
  {
    id: 'oracle',
    name: 'PRIME Oracle',
    category: 'studio',
    status: 'Live',
    icon: 'oracle',
    path: '/oracle',
    backgroundImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&auto=format&fit=crop&q=80',
    why: 'Most founders drown in noise; few have an oracle to test their conviction.',
    what: 'Living adaptive intelligence trained on catastrophic failure modes and high-tier engineering discipline.',
    how: 'State your bottleneck → Receive unvarnished first-principles refactoring.',
  },
  {
    id: 'dream-forge',
    name: 'Dream Forge',
    category: 'studio',
    status: 'Live',
    icon: 'dream-forge',
    path: '/dream-forge',
    backgroundImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    why: 'Visions evaporate without chronological milestone constraints.',
    what: 'Translate raw ambition and blockers into a mathematically phased 6-month strategic architectural path.',
    how: 'Complete the intake protocol → Receive your 4-phase deployment blueprint.',
  },
  {
    id: 'work',
    name: 'Engineering Works',
    category: 'studio',
    status: 'Live',
    icon: 'work',
    path: '/work',
    backgroundImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    why: 'Proof over promises. Shipped software over slide decks.',
    what: 'Interactive live browser mockups of Jadai flagships including ExamPadi, Aeroluxe, and Gadtfes.',
    how: 'Switch viewports → Test sub-50ms latency → Examine architecture telemetry.',
  },
  {
    id: 'services',
    name: 'Services Void',
    category: 'studio',
    status: 'Live',
    icon: 'diagnostic',
    path: '/services',
    backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    why: 'Three pillars to erect an unshakeable digital empire.',
    what: 'Deep-dive into Jadai Studio bespoke engineering: Diagnostic Auditing and Elite Craftsmanship.',
    how: 'Select your tier → Schedule emergency or architectural dispatch.',
  },
  {
    id: 'about',
    name: 'Philosophy & Origins',
    category: 'studio',
    status: 'Live',
    icon: 'oracle',
    path: '/about',
    backgroundImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    why: 'Jos Plateau roots; celestial standards.',
    what: 'The engineering ethos of founder Jehu Nanpan and the foundational doctrine of "Build the floor."',
    how: 'Explore the timeline → Audit our open engineering invariants.',
  },
];

const HUB_ROW_ITEMS: DisplayItem[] = [
  {
    id: 'marketplace',
    name: 'Production Templates',
    category: 'hub',
    status: 'Live',
    icon: 'marketplace',
    path: '/marketplace',
    backgroundImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80',
    why: 'Do not rebuild boilerplate from zero. Start on hardened bedrock.',
    what: 'Elite, production-grade starter kits (Aperture, Vendor, Shelter, Bloom, Glow) with self-contained preview engines.',
    how: 'Preview in desktop/mobile → Acquire with Paystack → Receive instant repo dispatch.',
  },
  {
    id: 'community-hub',
    name: 'JadaiHub Mesh',
    category: 'hub',
    status: 'Live',
    icon: 'hub',
    path: '/hub',
    backgroundImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
    why: 'Isolated builders burn out; connected builder nodes form an empire.',
    what: 'Private network connecting founders, engineers, and creators with Jadai ID handshakes.',
    how: 'Search user Jadai ID → Send connect signal → Share private drafts.',
  },
  {
    id: 'career-board',
    name: 'Career Board & Bounties',
    category: 'hub',
    status: 'Live',
    icon: 'career-board',
    path: '/career-board',
    backgroundImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&auto=format&fit=crop&q=80',
    why: 'High-signal builders seek mission-critical leverage over corporate ladders.',
    what: 'Open engineering positions, technical bounties, and verified contributor paths.',
    how: 'Filter by stack → Submit verified GitHub proof of work → Onboard directly.',
  },
  {
    id: 'workspace-hub',
    name: 'Draft Workspaces',
    category: 'hub',
    status: 'Live',
    icon: 'resume-editor',
    path: '/account/workspace',
    backgroundImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80',
    why: 'Continuous creation requires persistent, unlosable state.',
    what: 'Every tool invocation generates an auto-saved draft ready to resume anytime.',
    how: 'Launch any playground tool → Pick up exactly where you left off.',
  },
  {
    id: 'team-rooms',
    name: 'Team Chambers',
    category: 'hub',
    status: 'In Build',
    icon: 'hub',
    path: '/hub#teams',
    backgroundImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80',
    why: 'Coordination overhead kills velocity without shared mental maps.',
    what: 'Encrypted collaborative workrooms with real-time whiteboards and live markdown syncing.',
    how: 'Reserved for Voice and Prime tiers — upgrade to claim early access.',
  },
];

interface FlipCardProps {
  item: DisplayItem;
  onNavigate: (path: string) => void;
}

const FlippingDisplayCard: React.FC<FlipCardProps> = ({ item, onNavigate }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlipToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    StudioAudio.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleActionClick = () => {
    StudioAudio.playClick();
    onNavigate(item.path);
  };

  // Tool-specific subtle accent colors per Visual Lock Supplement:
  // FORGE=gold, ORACLE=crimson, MIRAGE=violet, SENTINEL=cyan
  const getAccentBorder = (id: string) => {
    switch (id) {
      case 'forge':
        return 'group-hover:border-[#C9A84C]/80 group-hover:shadow-[0_0_30px_rgba(201,168,76,0.3)]';
      case 'oracle':
        return 'group-hover:border-[#C0392B]/80 group-hover:shadow-[0_0_30px_rgba(192,57,43,0.3)]';
      case 'mirage':
        return 'group-hover:border-purple-500/80 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]';
      case 'sentinel':
        return 'group-hover:border-cyan-400/80 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]';
      default:
        return 'group-hover:border-[#C9A84C]/60 group-hover:shadow-[0_0_30px_rgba(201,168,76,0.2)]';
    }
  };

  return (
    <div className="shrink-0 w-[285px] sm:w-[330px] h-[370px] snap-start perspective-1000 group">
      <EdgeGlow
        intensity="subtle"
        color={item.category === 'playground' ? 'gold' : item.category === 'studio' ? 'dual' : 'gold'}
        borderRadius={20}
        className="h-full w-full block transition-transform duration-300 group-hover:-translate-y-2"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-all ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT SIDE (Sleek Bento Card with 3D Depth) */}
          <div
            onClick={handleActionClick}
            className={`card-3d absolute inset-0 flex flex-col justify-between p-5 bg-[#0a0908]/90 border border-[rgba(196,192,187,0.12)] ${getAccentBorder(
              item.id
            )} transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-xl rounded-[20px] overflow-hidden backface-hidden cursor-pointer`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Background Texture & Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity duration-500 scale-105"
              style={{ backgroundImage: `url(${item.backgroundImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050404] via-[#050404]/85 to-transparent pointer-events-none" />

            {/* Top Bar: Icon, Name, Category & Status */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#121110] border border-[rgba(196,192,187,0.2)] flex items-center justify-center p-1.5 shadow-inner">
                  <ModuleIcon name={item.icon} size={20} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors leading-snug">
                    {item.name}
                  </h4>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#8a857e]">
                    {item.category}
                  </span>
                </div>
              </div>

              <StatusBadge
                status={item.status}
                variant={item.status === 'Live' ? 'gold' : item.status === 'In Build' ? 'emerald' : 'dim'}
                size="sm"
              />
            </div>

            {/* Why Copy (Philosophical One-Liner) */}
            <div className="relative z-10 my-1 p-2 rounded-xl bg-[#161514] border border-[rgba(196,192,187,0.15)]">
              <p className="text-[11px] font-mono italic text-[#e8c96a] line-clamp-2">
                "{item.why}"
              </p>
            </div>

            {/* What & How Breakdown */}
            <div className="relative z-10 space-y-1.5 text-xs text-[#c4c0bb] my-1 leading-relaxed">
              <div>
                <span className="font-mono text-[9px] uppercase text-[#8a857e] block tracking-wider">
                  FUNCTION:
                </span>
                <p className="line-clamp-2 pt-0.5 text-xs text-[#f5f3f0]">{item.what}</p>
              </div>

              <div>
                <span className="font-mono text-[9px] uppercase text-[#8a857e] block tracking-wider">
                  PROTOCOL:
                </span>
                <p className="line-clamp-1 pt-0.5 text-xs text-[#8a857e] font-mono">
                  {item.how}
                </p>
              </div>
            </div>

            {/* Bottom Actions: Flip Card button + Launch */}
            <div className="relative z-10 pt-2 border-t border-[rgba(196,192,187,0.12)] flex items-center justify-between text-xs font-mono mt-auto">
              <button
                type="button"
                onClick={handleFlipToggle}
                className="px-2.5 py-1 rounded-full bg-[#161514] hover:bg-[#201e1c] border border-[rgba(196,192,187,0.2)] hover:border-[#C9A84C]/50 text-[10px] text-[#e8c96a] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Preview details in 3D"
              >
                <RotateCcw className="w-3 h-3 text-[#C9A84C]" />
                <span>3D Flip</span>
              </button>

              <div className="flex items-center gap-1 text-[#8a857e] group-hover:text-[#e8c96a] group-hover:translate-x-1 transition-all">
                <span className="text-xs font-bold">Open</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* BACK SIDE (VisionOS Glassmorphic Interactive Preview Card) */}
          <div
            className="absolute inset-0 flex flex-col justify-between p-5 bg-[#0a0908]/95 border border-[#C9A84C]/50 shadow-[0_16px_45px_rgba(0,0,0,0.9)] backdrop-blur-2xl rounded-[20px] overflow-hidden rotate-y-180 backface-hidden"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
            }}
          >
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.2)] pb-2">
                <span className="text-[10px] font-mono text-[#e8c96a] uppercase tracking-widest flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#C9A84C]" />
                  Live Preview Mode
                </span>
                <button
                  type="button"
                  onClick={handleFlipToggle}
                  className="text-xs font-mono text-[#8a857e] hover:text-[#f5f3f0] px-2 py-0.5 rounded bg-[#161514]"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-[#f5f3f0]">{item.name}</h4>
                <p className="text-xs text-[#c4c0bb] leading-relaxed">{item.what}</p>
              </div>

              {/* Telemetry Chips */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded-lg bg-[#121110] border border-[rgba(196,192,187,0.15)]">
                  <span className="text-[#8a857e] block">EXECUTION</span>
                  <span className="text-emerald-400 font-bold">Client & Edge</span>
                </div>
                <div className="p-2 rounded-lg bg-[#121110] border border-[rgba(196,192,187,0.15)]">
                  <span className="text-[#8a857e] block">RATE LIMIT</span>
                  <span className="text-[#e8c96a] font-bold">Uncapped (Pro)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[11px] font-mono text-[#c4c0bb]">
                <span className="text-[#C9A84C] block text-[9px] uppercase">Telemetry Signature</span>
                <code>jadai://inference/{item.id}?v=3.8</code>
              </div>
            </div>

            <div className="relative z-10 pt-3 border-t border-[rgba(196,192,187,0.15)] flex items-center gap-2">
              <button
                type="button"
                onClick={handleActionClick}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8a6e2a] via-[#C9A84C] to-[#e8c96a] hover:opacity-90 text-[#050404] font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Launch Tool Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </EdgeGlow>
    </div>
  );
};

interface CascadingRowProps {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  items: DisplayItem[];
  depthOffset?: string;
  rowBackground?: string;
  onNavigate: (path: string) => void;
}

const CascadingRow: React.FC<CascadingRowProps> = ({
  title,
  subtitle,
  badge,
  icon,
  items,
  depthOffset = '0px',
  rowBackground,
  onNavigate,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scrollBy = (offset: number) => {
    StudioAudio.playClick();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{ marginTop: depthOffset }}
      className="relative z-10 space-y-4 pt-4 pb-2 group/row transition-all duration-500 rounded-3xl overflow-hidden"
    >
      {/* Optional Row Background Image/GIF */}
      {rowBackground && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none filter brightness-50"
          style={{ backgroundImage: `url(${rowBackground})` }}
        />
      )}

      {/* Row Header Strip (VisionOS / Iron Man HUD Header) */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(14,165,233,0.25)]">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-300 font-bold">
                {badge}
              </span>
              <span className="text-xs text-slate-500">●</span>
              <span className="text-xs font-mono text-slate-400">{items.length} Modules</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-white tracking-wide">
              {title}
            </h3>
          </div>
        </div>

        {/* Scroll Nav Buttons (Image 4 VisionOS style controller) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy(-360)}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-slate-900/80 text-white hover:border-cyan-400 hover:text-cyan-300'
                : 'opacity-30 cursor-not-allowed bg-black/40 text-neutral-600'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(360)}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-slate-900/80 text-white hover:border-cyan-400 hover:text-cyan-300'
                : 'opacity-30 cursor-not-allowed bg-black/40 text-neutral-600'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="relative z-10 flex items-stretch gap-5 overflow-x-auto px-4 sm:px-6 pb-6 pt-2 scrollbar-none scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <FlippingDisplayCard key={item.id} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
};

export const CascadingCategorizedDisplay: React.FC<{
  onNavigate: (path: string) => void;
}> = ({ onNavigate }) => {
  const [customization, setCustomization] = useState(getCustomization());

  useEffect(() => {
    const handleUpdate = () => setCustomization(getCustomization());
    window.addEventListener('jadai_customization_changed', handleUpdate);
    return () => window.removeEventListener('jadai_customization_changed', handleUpdate);
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto space-y-6 px-2 sm:px-6 py-12 rounded-3xl overflow-hidden select-none">
      {/* 4K Atmospheric Background Image with Slow Breathing Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-12 filter brightness-60 contrast-125 animate-atmosphere"
          style={{ backgroundImage: `url(${customization.playgroundBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050404] via-[#050404]/80 to-[#050404]" />

        {/* Ambient Drifting Particles */}
        <div className="absolute inset-0 opacity-25">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#C9A84C]"
              style={{
                width: `${(i % 3) + 1}px`,
                height: `${(i % 3) + 1}px`,
                left: `${(i * 13 + 5) % 100}%`,
                top: `${(i * 17 + 9) % 100}%`,
                opacity: (i % 6 + 4) / 10,
                boxShadow: '0 0 6px #C9A84C',
                animation: `particleFloat ${7 + (i % 7)}s ease-in-out infinite alternate`,
                animationDelay: `${(i % 7) * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Row 1: PLAYGROUND (Tools & Instruments) */}
      <CascadingRow
        title="Playground Suite"
        subtitle="Diagnostic, Doc Analyzer, GIF Maker, Thumbnail Gen, Writing Engine & more."
        badge="INFERENCE SUITE"
        icon={<Terminal className="w-4 h-4" />}
        items={PLAYGROUND_ROW_ITEMS}
        depthOffset="0px"
        rowBackground={customization.playgroundBg}
        onNavigate={onNavigate}
      />

      {/* Row 2: STUDIO (Philosophy, Art, Narrative & Canon) */}
      <CascadingRow
        title="Studio & Philosophical Canon"
        subtitle="Book of Lies, PRIME Oracle, Dream Forge, and Flagship Works."
        badge="PHILOSOPHICAL BEDROCK"
        icon={<Layers className="w-4 h-4" />}
        items={STUDIO_ROW_ITEMS}
        depthOffset="-10px"
        rowBackground={customization.studioBg}
        onNavigate={onNavigate}
      />

      {/* Row 3: HUB (Ecosystem, Marketplace & Network) */}
      <CascadingRow
        title="JadaiHub & Production Templates"
        subtitle="Production-grade starter kits, mesh community, and verified bounties."
        badge="COLLABORATIVE NETWORK"
        icon={<Cpu className="w-4 h-4" />}
        items={HUB_ROW_ITEMS}
        depthOffset="-10px"
        rowBackground={customization.servicesBg}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default CascadingCategorizedDisplay;
