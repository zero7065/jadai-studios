import React from 'react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'gold' | 'crimson' | 'dim' | 'neutral' | 'emerald';
  size?: 'sm' | 'md' | 'lg' | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size,
  className = '',
}) => {
  // Infer variant if not provided
  let activeVariant = variant;
  if (!activeVariant) {
    if (status === 'Live') activeVariant = 'gold';
    else if (status === 'In Build' || status === 'Beta') activeVariant = 'gold';
    else if (status === 'Concept' || status === 'Prototype') activeVariant = 'dim';
    else if (status === 'Coming Soon') activeVariant = 'dim';
    else activeVariant = 'neutral';
  }

  const styles = {
    gold: 'bg-[rgba(201,168,76,0.12)] text-[#e8c96a] border-[rgba(201,168,76,0.35)]',
    crimson: 'bg-[rgba(192,57,43,0.12)] text-[#f5f3f0] border-[rgba(192,57,43,0.4)]',
    dim: 'bg-[rgba(138,110,42,0.1)] text-[#8a6e2a] border-[rgba(138,110,42,0.25)]',
    neutral: 'bg-[rgba(74,71,68,0.2)] text-[#c4c0bb] border-[rgba(74,71,68,0.4)]',
    emerald: 'bg-[rgba(16,185,129,0.12)] text-[#34d399] border-[rgba(16,185,129,0.35)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] border text-[10px] font-mono uppercase tracking-widest ${styles[activeVariant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};

export default StatusBadge;
