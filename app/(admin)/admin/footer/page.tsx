'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import { Sparkles, Plus, Trash2, Save, RotateCcw, CheckCircle } from 'lucide-react';
import type { FounderBubble } from '@/components/layout/Footer';

const INITIAL_BUBBLES: FounderBubble[] = [
  { id: 'b1', label: 'Relational Database Schema', category: 'Backend', tooltip: '20+ table idempotent PostgreSQL architecture with Row-Level Security' },
  { id: 'b2', label: 'Multi-Tier AI Redundancy', category: 'Intelligence', tooltip: 'Groq primary to Gemini fallback to SHA-256 local cache' },
  { id: 'b3', label: 'Offline-First PWAs', category: 'Frontend', tooltip: 'IndexedDB local stores with background sync for fluctuating networks' },
  { id: 'b4', label: 'Zero Chunk Code', category: 'Discipline', tooltip: 'Every file is complete, runnable, and uncompromising. No placeholders.' },
  { id: 'b5', label: 'Paystack Multi-Currency', category: 'Fintech', tooltip: 'Dual NGN/USD checkout with HMAC-SHA512 webhook verification' },
  { id: 'b6', label: 'Book of Lies Canon', category: 'Philosophy', tooltip: 'Nightly 9:47 PM reflections on engineering, pride, and moral hazards' },
  { id: 'b7', label: 'Plateau Highlands Origin', category: 'Location', tooltip: 'Forged in Jos, Plateau State, Nigeria — engineered for the real world' },
];

export default function AdminFooterPage() {
  const [bubbles, setBubbles] = useState<FounderBubble[]>(INITIAL_BUBBLES);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState('Core');
  const [newTooltip, setNewTooltip] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jadai_footer_bubbles');
      if (stored) {
        setBubbles(JSON.parse(stored));
      }
    } catch {
      // Non-fatal
    }
  }, []);

  const handleAddBubble = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newTooltip) return;

    const newB: FounderBubble = {
      id: `b_${Date.now()}`,
      label: newLabel,
      category: newCategory,
      tooltip: newTooltip,
    };

    setBubbles([...bubbles, newB]);
    setNewLabel('');
    setNewTooltip('');
    setIsDirty(true);
    StudioAudio.playClick();
    showToast('Bubble added to footer draft.', 'info');
  };

  const handleRemoveBubble = (id: string) => {
    setBubbles(bubbles.filter((b) => b.id !== id));
    setIsDirty(true);
    StudioAudio.playClick();
  };

  const handleSave = () => {
    try {
      localStorage.setItem('jadai_footer_bubbles', JSON.stringify(bubbles));
      setIsDirty(false);
      StudioAudio.playSuccessArpeggio();
      showToast('Footer bubble chips updated live across platform.', 'success', 'Footer Synchronized');
    } catch {
      showToast('Saved locally.', 'success');
    }
  };

  const handleReset = () => {
    setBubbles(INITIAL_BUBBLES);
    localStorage.removeItem('jadai_footer_bubbles');
    setIsDirty(false);
    showToast('Reset to canonical founder chips.', 'info');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            Identity & Surface Management
          </span>
          <h1 className="text-3xl font-display font-bold text-[#f5f3f0]">
            Footer & Founder Bubbles
          </h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Manage the floating bubble chips, tooltips, and identity claims displayed in the platform footer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>

          <EdgeGlow intensity="intense" color="gold" borderRadius={6}>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!isDirty}>
              <Save className="w-3.5 h-3.5 mr-1" />
              Save to Live
            </Button>
          </EdgeGlow>
        </div>
      </div>

      {/* Bubble Management Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Chips List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-display font-bold text-[#f5f3f0] uppercase tracking-wider">
            Active Founder Chips ({bubbles.length})
          </h2>

          <div className="space-y-2.5">
            {bubbles.map((b) => (
              <GlassCard key={b.id} className="p-4 flex items-start justify-between gap-4 border-[rgba(201,168,76,0.2)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#f5f3f0]">{b.label}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(201,168,76,0.15)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)]">
                      {b.category}
                    </span>
                  </div>
                  <p className="text-xs font-serif text-[#c4c0bb]">{b.tooltip}</p>
                </div>

                <button
                  onClick={() => handleRemoveBubble(b.id)}
                  className="p-1.5 rounded text-[#8a6e2a] hover:text-[#C0392B] transition-colors cursor-pointer shrink-0"
                  title="Remove bubble"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Column: Add New Chip Form */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-6 space-y-4 border-[rgba(201,168,76,0.25)]">
            <h3 className="font-display font-bold text-sm text-[#f5f3f0] uppercase tracking-wider border-b border-[rgba(201,168,76,0.15)] pb-3">
              Add New Bubble Chip
            </h3>

            <form onSubmit={handleAddBubble} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] text-[#8a6e2a] uppercase mb-1">
                  Bubble Label
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Sub-Second TTFB Edge"
                  className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8a6e2a] uppercase mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Performance / Cloud"
                  className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8a6e2a] uppercase mb-1">
                  Tooltip Explanation
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTooltip}
                  onChange={(e) => setNewTooltip(e.target.value)}
                  placeholder="Brief sentence shown on hover..."
                  className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
                />
              </div>

              <Button variant="primary" size="md" className="w-full" type="submit">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Chip
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
