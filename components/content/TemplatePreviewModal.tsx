'use client';

import React, { useState, useEffect } from 'react';
import { SEED_TEMPLATES, TemplateItem } from '../../lib/data/templates';
import Button from '../ui/Button';
import EdgeGlow from '../ui/EdgeGlow';
import CodeBlock from '../ui/CodeBlock';
import { StudioAudio } from '../../lib/watermark';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle,
  ExternalLink,
  Download,
  Github,
  ShoppingBag,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  Compass,
  ArrowLeft,
  Database,
  Code,
  FileCode,
  Check,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';

interface TemplatePreviewModalProps {
  template: TemplateItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (template: TemplateItem) => void;
  onSelectTemplate?: (template: TemplateItem) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template: initialTemplate,
  isOpen,
  onClose,
  onBuy,
  onSelectTemplate,
}) => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(initialTemplate);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'interactive' | 'files' | 'schema' | 'deploy'>('interactive');

  // Interactive demo states
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    { id: 'item-1', name: 'Raw Minimalist Oversized Hoodie', price: 28000, qty: 1 },
  ]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedExif, setSelectedExif] = useState<string | null>(null);

  useEffect(() => {
    setActiveTemplate(initialTemplate);
  }, [initialTemplate]);

  // Keyboard escape listener to close modal smoothly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeTemplate) return null;

  const currentTemplate = activeTemplate;
  const currentIndex = SEED_TEMPLATES.findIndex((t) => t.slug === currentTemplate.slug);

  const handlePrevTemplate = () => {
    try {
      StudioAudio.playClick();
    } catch {}
    const prevIdx = (currentIndex - 1 + SEED_TEMPLATES.length) % SEED_TEMPLATES.length;
    const prevTmpl = SEED_TEMPLATES[prevIdx];
    setActiveTemplate(prevTmpl);
    if (onSelectTemplate) onSelectTemplate(prevTmpl);
  };

  const handleNextTemplate = () => {
    try {
      StudioAudio.playClick();
    } catch {}
    const nextIdx = (currentIndex + 1) % SEED_TEMPLATES.length;
    const nextTmpl = SEED_TEMPLATES[nextIdx];
    setActiveTemplate(nextTmpl);
    if (onSelectTemplate) onSelectTemplate(nextTmpl);
  };

  const viewportWidths = {
    desktop: 'w-full max-w-6xl',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  const renderSimulatedApp = () => {
    switch (currentTemplate.slug) {
      case 'aperture':
        return (
          <div className="bg-[#050404] text-[#F5F3F0] p-6 space-y-6 font-sans min-h-[540px]">
            <header className="flex items-center justify-between border-b border-[rgba(212,165,116,0.2)] pb-4">
              <span className="font-serif tracking-widest text-lg text-[#D4A574]">APERTURE // LIGHT</span>
              <nav className="flex gap-4 text-xs font-mono text-[#c4c0bb]">
                <span className="text-[#D4A574] border-b border-[#D4A574] cursor-pointer">Editorial</span>
                <span className="cursor-pointer hover:text-white">Portraits</span>
                <span className="cursor-pointer hover:text-white">Weddings</span>
                <span className="cursor-pointer hover:text-white">Inquire</span>
              </nav>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'The Highland Solitude',
                  meta: 'Jos, Plateau • 35mm f/1.4 1/250s ISO 100',
                  img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
                },
                {
                  title: 'Harmattan Veil',
                  meta: 'Rayfield Lake • 85mm f/1.8 1/1000s ISO 50',
                  img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
                },
                {
                  title: 'Midnight Monolith',
                  meta: 'Shere Hills • 24mm f/2.8 30s ISO 1600',
                  img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedExif(item.meta)}
                  className="group relative rounded-xl overflow-hidden border border-[rgba(212,165,116,0.2)] bg-[#0a0908] p-3 space-y-2 cursor-pointer hover:border-[#D4A574] transition-all"
                >
                  <div className="h-48 rounded-lg overflow-hidden relative">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-[#D4A574]">
                      INSPECT EXIF
                    </div>
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#F5F3F0]">{item.title}</h4>
                    <p className="text-[10px] font-mono text-[#D4A574] mt-0.5">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedExif && (
              <div className="p-3 rounded-lg bg-[rgba(212,165,116,0.1)] border border-[#D4A574] flex items-center justify-between text-xs font-mono text-[#e8c96a]">
                <span>Active Light Inspection: {selectedExif}</span>
                <button onClick={() => setSelectedExif(null)} className="underline text-white cursor-pointer">
                  Close
                </button>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#0a0908] border border-[rgba(212,165,116,0.25)] flex items-center justify-between">
              <div>
                <h5 className="font-serif text-sm text-[#F5F3F0]">Client Print Shop Integration</h5>
                <p className="text-xs text-[#c4c0bb]">Museum-grade archival cotton prints with Paystack checkout</p>
              </div>
              <button
                onClick={() => {
                  try { StudioAudio.playSuccessArpeggio(); } catch {}
                  alert('Preview mode — this shows how the Print Shop will behave. Live Paystack checkout activates once the template is deployed. No charge was made.');
                }}
                className="px-4 py-2 rounded-lg bg-[#D4A574] text-black font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all cursor-pointer"
              >
                Order Prints →
              </button>
            </div>
          </div>
        );

      case 'vendor':
        return (
          <div className="bg-[#0A1628] text-[#F5F5F0] p-6 space-y-6 font-sans min-h-[540px]">
            <header className="flex items-center justify-between border-b border-[rgba(192,57,43,0.3)] pb-4">
              <span className="font-mono font-bold tracking-widest text-lg text-white">VENDOR // STORE</span>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-mono text-xs font-bold">
                  Cart ({cartItems.reduce((acc, i) => acc + i.qty, 0)})
                </span>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'p1',
                  name: 'Sovereign Raw Denim',
                  price: 32000,
                  img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80',
                },
                {
                  id: 'p2',
                  name: 'Obsidian Void Windbreaker',
                  price: 45000,
                  img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80',
                },
              ].map((prod) => (
                <div key={prod.id} className="p-4 rounded-xl bg-[#060e1a] border border-blue-900/40 space-y-3">
                  <div className="h-44 rounded-lg overflow-hidden">
                    <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-white">{prod.name}</h4>
                      <p className="text-xs font-mono text-amber-400">₦{prod.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        setCartItems((prev) => [...prev, { ...prod, qty: 1 }]);
                        try { StudioAudio.playClick(); } catch {}
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Drawer Preview */}
            <div className="p-4 rounded-xl bg-[#060e1a] border border-red-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-400 block">Subtotal:</span>
                <span className="text-lg font-mono font-bold text-white">
                  ₦{cartItems.reduce((acc, i) => acc + i.price * i.qty, 0).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  try { StudioAudio.playSuccessArpeggio(); } catch {}
                  alert('Preview mode — the cart above is a demo of the live store. Deploy the template to run real Paystack transactions. No charge was made.');
                }}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Instant Paystack Checkout →
              </button>
            </div>
          </div>
        );

      case 'shelter':
        return (
          <div className="bg-[#1A2E1F] text-[#F5F4EE] p-6 space-y-6 font-sans min-h-[540px]">
            <header className="flex items-center justify-between border-b border-emerald-700/40 pb-4">
              <span className="font-serif tracking-wider text-lg text-emerald-300">SHELTER RESCUE & ADOPT</span>
              <span className="text-xs font-mono text-emerald-400">100% Volunteer Network</span>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Koda', species: 'Golden Retriever Mix • 2 yrs', status: 'Ready for Home', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80' },
                { name: 'Luna', species: 'Calico Cat • 1 yr', status: 'Foster Ready', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80' },
              ].map((pet, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#122016] border border-emerald-800/40 space-y-2.5">
                  <div className="h-40 rounded-lg overflow-hidden">
                    <img src={pet.img} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-200">{pet.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-300">{pet.species}</p>
                    </div>
                    <button
                      onClick={() => setBookingSuccess(true)}
                      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs cursor-pointer"
                    >
                      Adopt
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {bookingSuccess && (
              <div className="p-3 rounded-lg bg-emerald-900/60 border border-emerald-500 text-xs font-mono text-emerald-200 flex justify-between items-center">
                <span>Adoption Application Initiated for Koda!</span>
                <button onClick={() => setBookingSuccess(false)} className="underline cursor-pointer">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-[#050404] text-[#c4c0bb] p-8 text-center space-y-6 min-h-[500px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-[#C9A84C] flex items-center justify-center text-[#C9A84C] bg-[#0a0908]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h4 className="text-2xl font-display font-bold text-[#f5f3f0]">
                {currentTemplate.name} Live Sandbox
              </h4>
              <p className="text-xs font-mono text-[#8a6e2a]">
                {currentTemplate.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {currentTemplate.stack.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#e8c96a]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        );
    }
  };

  const fileTreeSnippet = `├── app/
│   ├── (site)/page.tsx
│   ├── checkout/route.ts
│   └── api/paystack/verify/route.ts
├── components/
│   ├── ui/
│   ├── gallery/
│   └── cart/Drawer.tsx
├── lib/
│   ├── supabase/schema.sql
│   └── paystack.ts
├── package.json
└── .env.example`;

  const schemaSnippet = `-- 2026 Production Schema for ${currentTemplate.name}
CREATE TABLE IF NOT EXISTS public.${currentTemplate.slug}_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending',
  paystack_reference TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row-Level Security Policy
ALTER TABLE public.${currentTemplate.slug}_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only read own orders" ON public.${currentTemplate.slug}_orders
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${currentTemplate.name} live preview`}
      className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex flex-col"
    >
      {/* 1. TOP DUAL-ACTION HEADER BAR */}
      <header className="h-16 bg-[#0a0908] border-b border-[rgba(201,168,76,0.25)] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Prominent Return & Browse Others Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.35)] text-[#e8c96a] hover:text-[#f5f3f0] hover:border-[#C9A84C] text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
            title="Return to Marketplace grid (Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-[#C9A84C]" />
            <span>← Return to Marketplace</span>
          </button>

          <span className="hidden md:inline text-zinc-700">|</span>

          {/* Quick Previous / Next Template switcher */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={handlePrevTemplate}
              className="p-1.5 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer"
              title="Previous Template"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-display font-bold text-[#f5f3f0] px-2 truncate max-w-[140px]">
              {currentTemplate.name}
            </span>
            <button
              onClick={handleNextTemplate}
              className="p-1.5 rounded-lg border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer"
              title="Next Template"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Viewport Toggles (Desktop / Tablet / Mobile) */}
        <div className="hidden sm:flex items-center rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] p-0.5">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === 'desktop' ? 'bg-[#C9A84C] text-[#050404] font-bold' : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === 'tablet' ? 'bg-[#C9A84C] text-[#050404] font-bold' : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewport === 'mobile' ? 'bg-[#C9A84C] text-[#050404] font-bold' : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Buy / Acquire & Close Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <EdgeGlow intensity="intense" color="gold" borderRadius="8px">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                StudioAudio.playSuccessArpeggio();
                onBuy(currentTemplate);
              }}
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              <span>Acquire (₦{currentTemplate.price_ngn.toLocaleString()} / ${currentTemplate.price_usd})</span>
            </Button>
          </EdgeGlow>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[rgba(201,168,76,0.3)] text-[#8a6e2a] hover:text-[#f5f3f0] hover:border-[#C9A84C] transition-colors cursor-pointer"
            aria-label="Close preview modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. SUB-NAVIGATION BAR FOR SANDBOX / CODE / SCHEMA */}
      <div className="bg-[#070605] border-b border-[rgba(201,168,76,0.15)] px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          {(['interactive', 'files', 'schema', 'deploy'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer capitalize ${
                activeTab === tab
                  ? 'bg-[rgba(201,168,76,0.2)] text-[#e8c96a] border border-[#C9A84C]'
                  : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
              }`}
            >
              {tab === 'interactive' && '🎮 Live Sandbox'}
              {tab === 'files' && '📁 File Hierarchy'}
              {tab === 'schema' && '🗄️ Database & RLS'}
              {tab === 'deploy' && '⚡ 1-Click Deploy'}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#8a6e2a] hidden md:inline">
          Template {currentIndex + 1} of {SEED_TEMPLATES.length}
        </span>
      </div>

      {/* 3. MAIN CONTENT SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Specs Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 bg-[#0a0908] border-r border-[rgba(201,168,76,0.2)] p-4 overflow-y-auto space-y-5 shrink-0 hidden lg:block">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Architectural Lore
              </span>
              <p className="text-xs text-[#c4c0bb] font-serif italic mt-1 leading-relaxed border-l border-[#C9A84C] pl-2.5">
                "{currentTemplate.lore}"
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Verified Tech Stack
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentTemplate.stack.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#e8c96a]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Included Deliverables
              </span>
              <ul className="space-y-2 mt-2">
                {currentTemplate.includes.map((inc, i) => (
                  <li key={i} className="text-xs text-[#c4c0bb] flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-2 text-xs font-mono">
              <span className="text-[#8a6e2a] block uppercase text-[10px]">Instant Fulfillment</span>
              <div className="flex items-center gap-2 text-[#f5f3f0]">
                <Github className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>Private Repo Access Unlocked</span>
              </div>
              <div className="flex items-center gap-2 text-[#f5f3f0]">
                <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>PDF Setup Guide + Secret Keys</span>
              </div>
            </div>
          </aside>
        )}

        {/* Center Viewport Stage */}
        <div className="flex-1 bg-[#050404] p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
          <div
            className={`transition-all duration-300 rounded-2xl overflow-hidden border border-[rgba(201,168,76,0.3)] shadow-[0_25px_80px_rgba(0,0,0,0.95)] bg-[#050404] ${
              viewportWidths[viewport]
            }`}
          >
            {/* Viewport Top Fake Browser Chrome */}
            <div className="px-4 py-2.5 bg-[#0a0908] border-b border-[rgba(201,168,76,0.2)] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="px-4 py-1 rounded-lg bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[11px] font-mono text-[#e8c96a] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#C9A84C]" />
                <span>https://preview.jadai.dev/{currentTemplate.slug}</span>
              </div>

              <span className="text-[10px] font-mono text-[#8a6e2a]">
                {viewport.toUpperCase()} • 60 FPS
              </span>
            </div>

            {/* TAB CONTENTS */}
            <div className="min-h-[560px] bg-black">
              {activeTab === 'interactive' && renderSimulatedApp()}
              {activeTab === 'files' && (
                <div className="p-6 space-y-4">
                  <h4 className="text-sm font-display font-bold text-[#f5f3f0]">
                    Complete Production Repository Structure
                  </h4>
                  <CodeBlock code={fileTreeSnippet} language="bash" title="PROJECT_FILE_TREE.TXT" />
                </div>
              )}
              {activeTab === 'schema' && (
                <div className="p-6 space-y-4">
                  <h4 className="text-sm font-display font-bold text-[#f5f3f0]">
                    PostgreSQL Tables & Row-Level Security Rules
                  </h4>
                  <CodeBlock code={schemaSnippet} language="sql" title="SCHEMA_AND_RLS.SQL" />
                </div>
              )}
              {activeTab === 'deploy' && (
                <div className="p-6 space-y-4 text-xs font-mono text-[#c4c0bb]">
                  <h4 className="text-sm font-display font-bold text-[#f5f3f0]">
                    1-Click Vercel / Railway Deployment Pipeline
                  </h4>
                  <p>
                    Each template is 100% self-contained. Upon acquisition, you receive private repository rights and instant deployment triggers.
                  </p>
                  <CodeBlock
                    code={`npm install\ncp .env.example .env.local\nnpm run build\nnpm run start`}
                    language="bash"
                    title="DEPLOY_COMMANDS.SH"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Floating Return & Browse Other Templates pill at bottom */}
          <div className="sticky bottom-4 mt-6 z-30 flex items-center gap-3">
            <button
              onClick={handlePrevTemplate}
              className="px-4 py-2 rounded-full bg-[#0a0908] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] text-[#e8c96a] text-xs font-mono flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#C9A84C] text-[#050404] hover:bg-[#e8c96a] text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(201,168,76,0.4)] cursor-pointer"
            >
              ← Return & Browse All Templates
            </button>

            <button
              onClick={handleNextTemplate}
              className="px-4 py-2 rounded-full bg-[#0a0908] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] text-[#e8c96a] text-xs font-mono flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
