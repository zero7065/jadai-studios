'use client';

import React from 'react';
import EdgeGlow from './EdgeGlow';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  withGlow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  withGlow = true,
  ...props
}) => {
  const baseStyles =
    'relative z-1 inline-flex items-center justify-center font-mono font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-[0.65rem] px-3 py-1 rounded-[4px] tracking-[0.14em]',
    md: 'text-[0.7rem] px-[1.4rem] py-[0.55rem] rounded-[4px] tracking-[0.16em]',
    lg: 'text-[0.75rem] px-6 py-2.5 rounded-[4px] tracking-[0.18em] uppercase',
  };

  const variantStyles = {
    primary:
      'bg-[#C9A84C] text-[#050404] font-bold hover:bg-[#e8c96a] active:bg-[#8a6e2a] shadow-[0_0_15px_rgba(201,168,76,0.25)]',
    ghost:
      'bg-[#0a0908]/90 text-[#c4c0bb] hover:text-[#f5f3f0] hover:bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.2)]',
    outline:
      'bg-[#050404] text-[#C9A84C] border border-[#C9A84C] hover:bg-[rgba(201,168,76,0.15)] active:bg-[rgba(201,168,76,0.25)]',
    danger:
      'bg-[rgba(192,57,43,0.18)] text-[#f5f3f0] border border-[#C0392B] hover:bg-[#C0392B] active:bg-[#962d22]',
  };

  const glowColor =
    variant === 'danger' ? 'crimson' : variant === 'primary' ? 'gold' : 'dual';
  const glowIntensity = variant === 'primary' ? 'intense' : 'medium';
  const radius = 4;

  const btnContent = (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );

  if (!withGlow) {
    return btnContent;
  }

  return (
    <EdgeGlow
      intensity={glowIntensity}
      color={glowColor}
      borderRadius={radius}
      className="inline-flex"
      disabled={disabled}
    >
      {btnContent}
    </EdgeGlow>
  );
};

export default Button;
