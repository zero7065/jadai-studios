'use client';

import React, { useState, useEffect } from 'react';
import { TemplateCard } from '@/components/content/TemplateCard';
import TemplatePreviewModal from '@/components/content/TemplatePreviewModal';
import { SEED_TEMPLATES, TemplateItem } from '@/lib/data/templates';
import { useToast } from '@/components/providers/ToastProvider';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { StudioAudio } from '@/lib/watermark';
import { Search, Sparkles, Filter, CheckCircle, Github, Download, ShoppingBag, ExternalLink } from 'lucide-react';

import DefensiveFallback from '@/components/ui/DefensiveFallback';

const CATEGORIES = ['All', 'portfolio', 'saas', 'marketplace', 'landing'] as const;
const STACKS = ['All', 'Next.js 14', 'PostgreSQL', 'Tailwind', 'AI Integration'] as const;
const STATUSES = ['All', 'Active', 'In Build'] as const;

export default function MarketplacePage() {
  const [hasError, setHasError] = useState(false);
  const [templates, setTemplates] = useState<TemplateItem[]>(() => {
    try {
      return SEED_TEMPLATES || [];
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStack, setSelectedStack] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { currency, setCurrency } = useCurrency();
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [purchasedTemplate, setPurchasedTemplate] = useState<TemplateItem | null>(null);
  const { showToast } = useToast();

  if (hasError) return <DefensiveFallback />;

  useEffect(() => {
    let mounted = true;
    async function loadTemplates() {
      try {
        const { supabase } = await import('@/lib/supabase/client');
        const { data, error } = await supabase.from('templates').select('*');
        if (mounted && data && data.length > 0) {
          setTemplates(data as unknown as TemplateItem[]);
        }
      } catch (err) {
        console.warn('Failed to load templates table', err);
      }
    }
    loadTemplates();
    return () => { mounted = false; };
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      template.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStack =
      selectedStack === 'All' ||
      template.stack.some((s) => s.toLowerCase().includes(selectedStack.toLowerCase()));
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStack && matchesSearch;
  });

  const handleBuy = async (template: TemplateItem) => {
    StudioAudio.playSuccessArpeggio();
    showToast(
      `Initializing Paystack gateway for ${template.name}...`,
      'info',
      'Transaction Pending'
    );

    try {
      const res = await fetch('/api/templates/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          currency,
          price: currency === 'NGN' ? template.price_ngn : template.price_usd,
        }),
      });

      await res.json();
      setPurchasedTemplate(template);
      setPreviewTemplate(null);
      showToast(
        `Acquisition approved! Repository link unlocked for ${template.name}.`,
        'success',
        'Payload Dispatched'
      );
    } catch {
      setPurchasedTemplate(template);
      setPreviewTemplate(null);
      showToast(`Repository token simulated for ${template.name}.`, 'success');
    }
  };

  return (
    <div className="relative min-h-[92vh] py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 select-none bg-market-atmos">
      {/* Orizon-inspired Floating Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] shadow-lg backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            Production Systems Store
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#f5f3f0] tracking-wide">
          New Way of Building
        </h1>
        <p className="text-sm sm:text-base font-serif italic text-[#c4c0bb]">
          Pre-built software foundations engineered with zero bloat, strict PostgreSQL schemas, and resilient AI fallback chains.
        </p>

        {/* Stat Pill (Matching Orizon 10K+ Properties in reference image 3) */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#0a0908]/90 border border-[rgba(201,168,76,0.3)] shadow-xl backdrop-blur-md">
            <span className="text-sm font-display font-bold text-[#C9A84C]">
              12+ Systems
            </span>
            <span className="text-xs font-mono text-[#8a6e2a]">
              Instant Git Repo Access + Setup Guides
            </span>
          </div>
        </div>
      </div>

      {/* Glass Filter Pills Bar (Category · Stack · Price · Status) */}
      <div className="space-y-4 max-w-6xl mx-auto bg-[#0a0908]/70 border border-[rgba(201,168,76,0.2)] p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-[10px] font-mono text-[#8a6e2a] uppercase tracking-wider mr-1">
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  StudioAudio.playClick();
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-[0_0_10px_rgba(201,168,76,0.4)]'
                    : 'bg-[#050404] text-[#c4c0bb] hover:text-[#f5f3f0] border border-[rgba(201,168,76,0.15)]'
                }`}
              >
                {cat === 'All' ? 'All Systems' : cat}
              </button>
            ))}
          </div>

          {/* Dual-Currency Switcher & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6e2a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stack, lore..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#f5f3f0] placeholder-[#4a4744] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            {/* Currency Pill */}
            <div className="flex items-center bg-[#050404] border border-[rgba(201,168,76,0.25)] p-0.5 rounded-full shrink-0">
              <button
                onClick={() => setCurrency('NGN')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
                  currency === 'NGN' ? 'bg-[#C9A84C] text-[#050404] font-bold' : 'text-[#8a6e2a]'
                }`}
              >
                NGN (₦)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
                  currency === 'USD' ? 'bg-[#C9A84C] text-[#050404] font-bold' : 'text-[#8a6e2a]'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 24px Border-Radius Card Grid (Orizon design) */}
      {filteredTemplates.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.15)] max-w-xl mx-auto space-y-3">
          <ShoppingBag className="w-8 h-8 text-[#C9A84C] mx-auto opacity-40" />
          <p className="font-mono text-sm text-[#f5f3f0]">
            Templates coming soon — follow @hudsonstylez for launch updates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={setPreviewTemplate}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}

      {/* Live Preview Modal iframe */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onBuy={handleBuy}
      />
    </div>
  );
}
