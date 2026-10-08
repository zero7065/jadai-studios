'use client';

import React from 'react';

export interface ModuleIconProps {
  slug?: string;
  name?: string;
  size?: number;
  className?: string;
}

export const ModuleIcon: React.FC<ModuleIconProps> = ({
  slug,
  name,
  size = 28,
  className = '',
}) => {
  const effectiveSlug = slug || name || 'diagnostic';
  const strokeWidth = 1.5;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={`goldGrad-${effectiveSlug}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#e8c96a" />
        </linearGradient>
      </defs>

      {/* 1. Diagnostic: Concentric rings + circuit trace */}
      {(effectiveSlug === 'diagnostic' || effectiveSlug === 'diagnostic-icon') && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="18" strokeDasharray="2 2" opacity="0.4" />
          <circle cx="20" cy="20" r="12" />
          <circle cx="20" cy="20" r="5" />
          <path d="M20 2V8M20 32V38M2 20H8M32 20H38" />
          <path d="M11 11L14 14M26 26L29 29" opacity="0.7" />
          <circle cx="20" cy="20" r="2" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 2. PRIME Oracle: Sacred Eye + Metatron geometry overlay */}
      {(slug === 'oracle' || slug === 'prime') && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="18" strokeDasharray="3 3" opacity="0.4" />
          <path d="M4 20C10 10 30 10 36 20C30 30 10 30 4 20Z" />
          <circle cx="20" cy="20" r="7" />
          <polygon points="20,13 26,24 14,24" opacity="0.75" />
          <polygon points="20,27 14,16 26,16" opacity="0.75" />
          <circle cx="20" cy="20" r="2.2" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 3. Dream Forge: Anvil + key-flame */}
      {slug === 'dream-forge' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="18" strokeDasharray="2 2" opacity="0.3" />
          <path d="M9 24H31L28 32H12L9 24Z" />
          <path d="M7 24H33V20H25L23 15H17L15 20H7V24Z" />
          <path d="M20 5C17.5 9 17.5 12 20 14C22.5 12 22.5 9 20 5Z" fill="rgba(201,168,76,0.15)" />
          <circle cx="20" cy="9.5" r="1.5" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 4. Template Market: Stacked rectangles + golden-ratio spiral */}
      {(slug === 'template-market' || slug === 'marketplace') && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="18" strokeDasharray="2 2" opacity="0.3" />
          <rect x="7" y="12" width="22" height="22" rx="2.5" opacity="0.45" />
          <rect x="12" y="7" width="22" height="22" rx="2.5" />
          <path d="M12 21C22 21 22 29 28 29C28 18 18 18 18 7" strokeDasharray="1.5 1.5" />
          <circle cx="22" cy="21" r="2" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 5. JadaiHub: Interlocking rings forming sacred hexagon */}
      {slug === 'hub' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="20,5 33,12.5 33,27.5 20,35 7,27.5 7,12.5" strokeDasharray="2 2" opacity="0.4" />
          <circle cx="20" cy="15" r="6" />
          <circle cx="15" cy="24" r="6" />
          <circle cx="25" cy="24" r="6" />
          <circle cx="20" cy="21.5" r="2" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 6. Book of Lies: Open book + question-mark torn page */}
      {slug === 'book-of-lies' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="18" strokeDasharray="2 2" opacity="0.3" />
          <path d="M5 30C12 28 18 30 20 32C22 30 28 28 35 30V10C28 8 22 10 20 12C18 10 12 8 5 10V30Z" />
          <path d="M20 12V32" />
          <path d="M23 15C28 15 28 19 26 21V23" stroke="#C0392B" />
          <circle cx="26" cy="26" r="1" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 7. Selected Works: Three nested frames + gold star */}
      {slug === 'work' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="5" width="30" height="30" rx="3.5" />
          <rect x="10" y="10" width="20" height="20" rx="2" opacity="0.6" />
          <rect x="15" y="15" width="10" height="10" rx="1" opacity="0.3" />
          <polygon points="20,16 21.2,19.2 24.5,19.2 22,21 23,24.2 20,22.2 17,24.2 18,21 15.5,19.2 18.8,19.2" fill={`url(#goldGrad-${slug})`} />
          <circle cx="20" cy="20.5" r="1.5" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 8. Resume Editor: Document + fountain pen */}
      {slug === 'resume-editor' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="18" strokeDasharray="2 2" opacity="0.3" />
          <path d="M8 5H25L32 12V35H8V5Z" />
          <path d="M25 5V12H32" />
          <path d="M13 18H23M13 23H20" opacity="0.6" />
          <path d="M24 30L30 24L33 27L27 33Z" fill="rgba(201,168,76,0.2)" />
          <path d="M24 30L22 35L27 33Z" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 9. Doc Analyzer: Document + rising analytic graph */}
      {slug === 'doc-analyzer' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="18" strokeDasharray="2 2" opacity="0.3" />
          <rect x="7" y="5" width="26" height="30" rx="2.5" />
          <path d="M12 12H28M12 17H22" opacity="0.5" />
          <path d="M12 28L18 22L23 25L28 18" strokeWidth={1.75} />
          <circle cx="28" cy="18" r="2" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 10. Growth Maker: Spiral staircase into sun */}
      {slug === 'growth-maker' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="28" cy="12" r="7" strokeDasharray="2 2" opacity="0.5" />
          <circle cx="28" cy="12" r="2.5" fill="#C0392B" stroke="#C0392B" />
          <path d="M8 33H16M11 28H19M14 23H22M17 18H25M20 13H28" />
          <path d="M8 33L21 13" strokeDasharray="2 2" opacity="0.6" />
        </g>
      )}

      {/* 11. Career Board: Briefcase + compass rose */}
      {slug === 'career-board' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="14" width="26" height="20" rx="3" />
          <path d="M15 14V10C15 8.5 16.5 7 18 7H22C23.5 7 25 8.5 25 10V14" />
          <circle cx="20" cy="24" r="6" opacity="0.6" />
          <polygon points="20,19.5 21.5,23 25,24 21.5,25 20,28.5 18.5,25 15,24 18.5,23" fill="rgba(201,168,76,0.3)" />
          <circle cx="20" cy="24" r="1.3" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* 12. Settings / Systems: Sacred gear */}
      {(slug === 'settings' || slug === 'admin') && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="20" r="14" strokeDasharray="3 2" />
          <circle cx="20" cy="20" r="7" />
          <polygon points="20,8 30,14 30,26 20,32 10,26 10,14" opacity="0.75" />
          <circle cx="20" cy="20" r="2.2" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* Services fallback */}
      {slug === 'services' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="20,5 34,12.5 20,20 6,12.5" fill="rgba(201,168,76,0.15)" />
          <polygon points="6,12.5 20,20 20,35 6,27.5" opacity="0.8" />
          <polygon points="34,12.5 20,20 20,35 34,27.5" opacity="0.5" />
          <circle cx="20" cy="20" r="1.8" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}

      {/* About fallback */}
      {slug === 'about' && (
        <g stroke={`url(#goldGrad-${slug})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="18" r="12" strokeDasharray="2 2" opacity="0.5" />
          <circle cx="20" cy="18" r="7" />
          <path d="M12 34H28M8 37H32" opacity="0.6" />
          <circle cx="20" cy="18" r="1.8" fill="#C0392B" stroke="#C0392B" />
        </g>
      )}
    </svg>
  );
};

export default ModuleIcon;
