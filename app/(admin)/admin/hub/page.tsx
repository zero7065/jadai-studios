import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { SEED_HUB_LISTINGS, HubListing } from '@/lib/data/hub';
import { useToast } from '@/components/providers/ToastProvider';
import { Users, CheckCircle, XCircle, Flag, Eye, MessageSquare, Trash2 } from 'lucide-react';

export default function AdminHubPage() {
  const [listings, setListings] = useState<HubListing[]>(SEED_HUB_LISTINGS);
  const { showToast } = useToast();

  const handleApprove = (id: string, title: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'active' } : l))
    );
    showToast(`Mission "${title}" approved for network broadcast.`, 'success');
  };

  const handleReject = (id: string, title: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'rejected' } : l))
    );
    showToast(`Mission "${title}" flagged / rejected.`, 'info');
  };

  const handleDelete = (id: string, title: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    showToast(`Listing "${title}" removed from database.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Collaborative Mesh</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">JadaiHub Moderation Queue</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Review peer missions, co-founding proposals, freelance service bids, and community flags.
          </p>
        </div>
      </div>

      {/* Listings Table */}
      <GlassCard className="p-4 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[rgba(201,168,76,0.2)] text-[#8a6e2a] uppercase text-[10px]">
              <th className="py-2.5 px-3">Mission Title</th>
              <th className="py-2.5 px-3">Type & Origin</th>
              <th className="py-2.5 px-3">Compensation</th>
              <th className="py-2.5 px-3">Enquiries</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(201,168,76,0.1)]">
            {listings.map((l) => (
              <tr key={l.id} className="hover:bg-[rgba(201,168,76,0.04)] transition-colors">
                <td className="py-3 px-3">
                  <span className="font-bold text-[#f5f3f0] block">{l.title}</span>
                  <span className="text-[11px] text-[#8a6e2a] line-clamp-1">{l.description}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="capitalize text-[#f5f3f0] block">{l.type}</span>
                  <span className="text-[10px] text-[#8a6e2a]">{l.author_name} ({l.author_location})</span>
                </td>
                <td className="py-3 px-3 text-[#e8c96a]">
                  {l.price ? `₦${l.price.toLocaleString()}` : l.price_type.toUpperCase()}
                </td>
                <td className="py-3 px-3 text-[#c4c0bb]">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-[#C9A84C]" />
                    {l.enquiries_count}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={l.status === 'active' ? 'Live' : 'Pending'} variant={l.status === 'active' ? 'gold' : 'dim'} />
                </td>
                <td className="py-3 px-3 text-right space-x-2">
                  {l.status !== 'active' ? (
                    <button
                      onClick={() => handleApprove(l.id, l.title)}
                      className="px-2 py-1 rounded bg-[rgba(201,168,76,0.15)] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#050404] transition-colors"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(l.id, l.title)}
                      className="px-2 py-1 rounded border border-[rgba(192,57,43,0.3)] text-[#C0392B] hover:bg-[rgba(192,57,43,0.2)] transition-colors"
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(l.id, l.title)}
                    className="p-1 text-[#8a6e2a] hover:text-[#C0392B]"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
