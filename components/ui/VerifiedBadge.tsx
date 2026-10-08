'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface VerifiedBadgeProps {
  size?: number;
  className?: string;
  tooltip?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 14,
  className = '',
  tooltip = 'Verified subscriber of Jadai Studios',
}) => {
  return (
    <span
      className={`inline-flex items-center text-[#3B82F6] hover:text-[#60A5FA] transition-colors cursor-help ${className}`}
      title={tooltip}
      aria-label={tooltip}
    >
      <CheckCircle2
        style={{ width: size, height: size }}
        className="fill-[#3B82F6] text-[#050404]"
      />
    </span>
  );
};

export default VerifiedBadge;
