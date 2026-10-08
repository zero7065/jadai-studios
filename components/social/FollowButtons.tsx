import React from 'react';
import { Twitter, Instagram } from 'lucide-react';

export const FollowButtons: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href="https://twitter.com/intent/follow?screen_name=hudsonstylez"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#c4c0bb] hover:text-[#f5f3f0] hover:border-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)] transition-all"
      >
        <Twitter className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span>Follow Founder on X</span>
      </a>

      <a
        href="https://instagram.com/jadaistudios"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#c4c0bb] hover:text-[#f5f3f0] hover:border-[#C9A84C] hover:bg-[rgba(201,168,76,0.08)] transition-all"
      >
        <Instagram className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span>Follow @jadaistudios</span>
      </a>
    </div>
  );
};

export default FollowButtons;
