'use client';

import React from 'react';
import GlassCard from './GlassCard';

export type BentoSpan = '1x1' | '1x2' | '2x1' | '2x2' | 'col-span-full' | 'col-span-2' | 'col-span-3';

export interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: BentoSpan;
  children: React.ReactNode;
  className?: string;
  glowColor?: 'gold' | 'crimson' | 'dual';
  onClick?: () => void;
}

export const BentoItem: React.FC<BentoItemProps> = ({
  span = '1x1',
  children,
  className = '',
  glowColor = 'gold',
  onClick,
  ...props
}) => {
  // Map span to responsive tailwind classes
  const spanClasses = {
    '1x1': 'col-span-1 row-span-1',
    '1x2': 'col-span-1 md:row-span-2',
    '2x1': 'col-span-1 md:col-span-2 row-span-1',
    '2x2': 'col-span-1 md:col-span-2 md:row-span-2',
    'col-span-2': 'col-span-1 md:col-span-2',
    'col-span-3': 'col-span-1 md:col-span-2 lg:col-span-3',
    'col-span-full': 'col-span-full',
  }[span];

  return (
    <GlassCard
      glowColor={glowColor}
      onClick={onClick}
      className={`h-full flex flex-col justify-between ${spanClasses} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${className}`}
      {...props}
    >
      {children}
    </GlassCard>
  );
};

export interface BentoGridContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BentoGridContainer: React.FC<BentoGridContainerProps> = ({
  children,
  columns = 4,
  gap = 'md',
  className = '',
  ...props
}) => {
  const colClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-2 md:grid-cols-6 lg:grid-cols-12',
  }[columns];

  const gapClass = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-5',
    lg: 'gap-6 sm:gap-8',
  }[gap];

  return (
    <div
      className={`grid ${colClass} ${gapClass} auto-rows-[minmax(180px,auto)] w-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default BentoGridContainer;
