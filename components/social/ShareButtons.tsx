import React, { useState } from 'react';
import { Share2, Copy, Check, Twitter, Instagram } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

export interface ShareButtonsProps {
  title: string;
  url?: string;
  excerpt?: string;
  className?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  title,
  url,
  excerpt = '',
  className = '',
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://jadai.dev');
  const shareText = `${title}${excerpt ? ` — "${excerpt.slice(0, 100)}..."` : ''} • Build Different. jadai.dev ⬡`;

  const handleTwitterShare = () => {
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntent, '_blank', 'noopener,noreferrer');
  };

  const handleInstagramShare = async () => {
    const caption = `${excerpt || title} — Build Different. jadai.dev ⬡ #JadaiStudios #BuildTheFloor`;
    try {
      await navigator.clipboard.writeText(caption);
      showToast('Caption copied. Paste it on your Instagram dispatch.', 'success', 'Social Transmission');
      setTimeout(() => {
        window.open('https://instagram.com/jadaistudios/', '_blank');
      }, 800);
    } catch {
      showToast('Unable to copy caption automatically', 'error');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied to clipboard', 'info');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-[11px] font-mono uppercase tracking-wider text-[#8a6e2a] mr-1">Share:</span>
      
      {/* Twitter / X */}
      <button
        onClick={handleTwitterShare}
        className="p-1.5 rounded border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors cursor-pointer"
        title="Share on X"
        aria-label="Share on X"
      >
        <Twitter className="w-3.5 h-3.5" />
      </button>

      {/* Instagram */}
      <button
        onClick={handleInstagramShare}
        className="p-1.5 rounded border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors cursor-pointer"
        title="Copy Caption & Open Instagram"
        aria-label="Copy Caption & Open Instagram"
      >
        <Instagram className="w-3.5 h-3.5" />
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="p-1.5 rounded border border-[rgba(201,168,76,0.2)] text-[#c4c0bb] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors cursor-pointer"
        title="Copy Link"
        aria-label="Copy Link"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#C9A84C]" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default ShareButtons;
