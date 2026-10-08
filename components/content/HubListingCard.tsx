import React from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import type { HubListing } from '../../lib/data/hub';
import { formatCurrency } from '../../lib/utils/format';
import { Mail, MapPin, Eye } from 'lucide-react';

export interface HubListingCardProps {
  listing: HubListing;
  onContact?: (listing: HubListing) => void;
}

export const HubListingCard: React.FC<HubListingCardProps> = ({
  listing,
  onContact,
}) => {
  const typeBadgeColors = {
    service: 'bg-[rgba(201,168,76,0.12)] text-[#e8c96a] border-[rgba(201,168,76,0.3)]',
    collab: 'bg-[rgba(192,57,43,0.12)] text-[#f5f3f0] border-[rgba(192,57,43,0.35)]',
    product: 'bg-[rgba(138,110,42,0.15)] text-[#C9A84C] border-[rgba(138,110,42,0.3)]',
    job: 'bg-[rgba(245,243,240,0.1)] text-[#f5f3f0] border-[rgba(245,243,240,0.2)]',
  };

  return (
    <GlassCard className="flex flex-col justify-between p-6 border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)] transition-all h-full">
      <div className="space-y-3">
        {/* Header Tags */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${typeBadgeColors[listing.type]}`}>
            {listing.type}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-[#8a6e2a]">
            <Eye className="w-3 h-3" />
            {listing.views_count}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-display font-semibold text-[#f5f3f0] leading-snug">
          {listing.title}
        </h3>

        {/* Author / Location */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#8a6e2a]">
          <span>{listing.author_name}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#C9A84C]" />
            {listing.author_location}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#c4c0bb] leading-relaxed line-clamp-3">
          {listing.description}
        </p>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {listing.stack.map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] text-[#8a6e2a]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Action & Price */}
      <div className="pt-4 mt-4 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between">
        <div>
          {listing.price_type === 'equity' ? (
            <span className="text-xs font-mono font-semibold text-[#C9A84C]">Equity / Partnership</span>
          ) : listing.price > 0 ? (
            <span className="text-sm font-mono font-bold text-[#e8c96a]">
              {formatCurrency(listing.price, listing.currency)}
            </span>
          ) : (
            <span className="text-xs font-mono text-[#8a6e2a]">Negotiable</span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => (onContact ? onContact(listing) : (window.location.href = `mailto:${listing.contact_method}`))}
        >
          <Mail className="w-3 h-3 mr-1" />
          Connect
        </Button>
      </div>
    </GlassCard>
  );
};

export default HubListingCard;
