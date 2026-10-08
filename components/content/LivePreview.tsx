'use client';

import React, { useState, useEffect, useRef } from 'react';
import EdgeGlow from '../ui/EdgeGlow';
import { ExternalLink, Globe } from 'lucide-react';

interface LivePreviewProps {
  url: string;
  fallbackImage: string;
  className?: string;
}

export function LivePreview({ url, fallbackImage, className = '' }: LivePreviewProps) {
  const [failed, setFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // 3-second timeout verification: if iframe fails or is blocked by X-Frame-Options, show resilient fallback
    const timer = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        if (!doc || !doc.body || doc.body.innerHTML === '') {
          setFailed(true);
        }
      } catch {
        // Cross-origin restriction triggered
        // If it's an external url that blocks iframe, gracefully display fallback
        if (!url.startsWith('/') && !url.includes(window.location.host) && !url.includes('templates')) {
          setFailed(true);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [url]);

  if (failed) {
    return (
      <div className={`relative w-full h-full min-h-[320px] rounded-xl overflow-hidden bg-[#050404] border border-[rgba(201,168,76,0.2)] flex flex-col items-center justify-center p-4 group ${className}`}>
        <img
          src={fallbackImage}
          alt="Preview"
          className="w-full h-full object-cover rounded-lg opacity-70 group-hover:scale-102 transition-transform duration-500"
          onError={(e) => {
            // If image placeholder fails, render obsidian aesthetic grid
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050404] via-[#050404]/60 to-transparent" />
        <div className="absolute bottom-6 inset-x-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-[#f5f3f0] truncate max-w-[200px]">{url}</span>
          </div>
          <EdgeGlow intensity="intense" color="gold" borderRadius={8}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all flex items-center gap-1.5 shadow-lg"
            >
              <span>Open Live</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </EdgeGlow>
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={url}
      className={`w-full h-full min-h-[360px] border-0 rounded-xl bg-white ${className}`}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default LivePreview;
