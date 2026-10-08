import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { HubListingCard } from '@/components/content/HubListingCard';
import { SEED_HUB_LISTINGS, HubListing } from '@/lib/data/hub';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Users,
  Search,
  PlusCircle,
  Briefcase,
  Layers,
  MapPin,
  Mail,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

import DefensiveFallback from '@/components/ui/DefensiveFallback';

const LISTING_TYPES = ['All', 'service', 'collab', 'product', 'job'] as const;

export default function HubPage() {
  const [hasError, setHasError] = useState(false);
  const [listings, setListings] = useState<HubListing[]>(() => {
    try {
      return SEED_HUB_LISTINGS || [];
    } catch {
      return [];
    }
  });
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [contactModalListing, setContactModalListing] = useState<HubListing | null>(null);
  const { showToast } = useToast();

  if (hasError) return <DefensiveFallback />;

  // New Listing Form State
  const [formType, setFormType] = useState<'service' | 'collab' | 'product' | 'job'>('collab');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStack, setFormStack] = useState('');
  const [formPriceType, setFormPriceType] = useState<'fixed' | 'hourly' | 'equity' | 'free'>('fixed');
  const [formPrice, setFormPrice] = useState('');
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('Jos, Nigeria');
  const [formContact, setFormContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredListings = listings.filter((item) => {
    const matchesType = selectedType === 'All' || item.type === selectedType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDesc || !formContact) {
      showToast('Please fill in the title, description, and contact method', 'error');
      return;
    }

    setSubmitting(true);
    const newListing: HubListing = {
      id: `hub-${Date.now()}`,
      type: formType,
      title: formTitle,
      description: formDesc,
      stack: formStack ? formStack.split(',').map((s) => s.trim()) : ['Systems Architecture'],
      price_type: formPriceType,
      price: formPrice ? parseFloat(formPrice) : 0,
      currency: 'NGN',
      portfolio_links: [],
      contact_method: formContact,
      status: 'active',
      views_count: 1,
      enquiries_count: 0,
      featured: false,
      author_name: formName || 'Anonymous Engineer',
      author_location: formLocation || 'Global Remote',
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/hub/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing),
      });
      await res.json();
    } catch {
      // In-memory fallback
    }

    setListings([newListing, ...listings]);
    setSubmitting(false);
    setPostModalOpen(false);
    showToast('Mission broadcasted across the JadaiHub mesh network!', 'success', 'Broadcast Active');

    // Reset Form
    setFormTitle('');
    setFormDesc('');
    setFormStack('');
    setFormPrice('');
    setFormContact('');
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)]">
          <Users className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            Decentralized Tactical Mesh
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#f5f3f0] tracking-wide">
          JadaiHub Collaborative
        </h1>
        <p className="text-sm sm:text-base font-mono text-[#8a6e2a]">
          High-tier engineering partnerships, freelance missions, peer review corridors, and sovereign project co-founding.
        </p>
      </div>

      {/* Control Bar: Categories, Search, Post Mission CTA */}
      <div className="space-y-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {LISTING_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded text-xs font-mono capitalize transition-all ${
                  selectedType === type
                    ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-[0_0_12px_rgba(201,168,76,0.35)]'
                    : 'bg-[#0a0908] text-[#c4c0bb] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C]'
                }`}
              >
                {type === 'All' ? 'All Missions' : type}
              </button>
            ))}
          </div>

          {/* Search & Post Button */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-[#8a6e2a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search missions, stack, builders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-xs text-[#f5f3f0] placeholder-[#8a6e2a] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setPostModalOpen(true)}
              className="shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Post Mission
            </Button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredListings.map((listing) => (
            <HubListingCard
              key={listing.id}
              listing={listing}
              onContact={(item) => setContactModalListing(item)}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-12 text-center max-w-lg mx-auto space-y-4">
          <Briefcase className="w-8 h-8 text-[#8a6e2a] mx-auto opacity-70" />
          <h3 className="text-lg font-display text-[#f5f3f0]">No Active Signals</h3>
          <p className="text-xs font-mono text-[#8a6e2a]">
            No missions found matching your current filter. Broadcast the first mission to the network.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedType('All');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </GlassCard>
      )}

      {/* Post Mission Modal */}
      <Modal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        title="Broadcast New Mission to JadaiHub"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateListing} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
                Mission Type
              </label>
              <select
                value={formType}
                onChange={(e: any) => setFormType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="collab">Collaborator Wanted (Equity / Partnership)</option>
                <option value="service">Architectural Service Offering</option>
                <option value="job">Contract Mission / Job</option>
                <option value="product">Studio Tool / Product</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
                Compensation Model
              </label>
              <select
                value={formPriceType}
                onChange={(e: any) => setFormPriceType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
                <option value="equity">Equity / RevShare</option>
                <option value="free">Open Collaboration / Pro Bono</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
              Mission Title
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Distributed CRDT Sync Engine for Offline PWA"
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
              Specification & Objectives
            </label>
            <textarea
              required
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Detail the technical architecture, problem statement, and requirements..."
              className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
                Tech Stack (Comma-separated)
              </label>
              <input
                type="text"
                value={formStack}
                onChange={(e) => setFormStack(e.target.value)}
                placeholder="TypeScript, Rust, PostgreSQL, Next.js"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
                Budget / Estimated Amount (NGN)
              </label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 250000 (0 for equity/free)"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
                Your Name / Handle
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Jadai Engineer"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
                Location
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. Jos, Nigeria / Remote"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mb-1">
                Contact Transmission
              </label>
              <input
                type="text"
                required
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                placeholder="email@example.com or @telegram"
                className="w-full px-3 py-2 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(201,168,76,0.2)]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setPostModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Broadcasting...' : 'Broadcast Mission'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Contact Author Modal */}
      {contactModalListing && (
        <Modal
          isOpen={Boolean(contactModalListing)}
          onClose={() => setContactModalListing(null)}
          title={`Connect with ${contactModalListing.author_name}`}
        >
          <div className="space-y-4 text-left">
            <div className="p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] space-y-2">
              <h4 className="font-display text-sm font-semibold text-[#f5f3f0]">
                {contactModalListing.title}
              </h4>
              <div className="flex items-center gap-3 text-xs font-mono text-[#8a6e2a]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C9A84C]" />
                  {contactModalListing.author_location}
                </span>
                <span>•</span>
                <span className="capitalize">{contactModalListing.type}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] block">
                Direct Transmission Line
              </span>
              <div className="p-3 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.2)] font-mono text-sm text-[#f5f3f0] flex items-center justify-between">
                <span>{contactModalListing.contact_method}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(contactModalListing.contact_method);
                    showToast('Contact channel copied to clipboard', 'success');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.location.href = `mailto:${contactModalListing.contact_method}?subject=Inquiry: ${encodeURIComponent(
                    contactModalListing.title
                  )}`;
                }}
              >
                <Mail className="w-3.5 h-3.5 mr-1" />
                Open Mail Transmission
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
