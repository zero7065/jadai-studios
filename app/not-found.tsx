import React from 'react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050404] text-[#f5f3f0]">
      {/* Jadai Sigil in Gold */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 mb-4"
      >
        <polygon points="20,2 38,20 20,38 2,20" stroke="#C9A84C" strokeWidth="1.5" />
        <rect x="11" y="11" width="18" height="18" stroke="#8a6e2a" strokeWidth="1" transform="rotate(45 20 20)" />
        <circle cx="20" cy="20" r="2.5" fill="#C9A84C" />
      </svg>
      <span className="text-xs font-mono text-[#8a6e2a] uppercase tracking-widest">404 • UNMAPPED SECTOR</span>
      <h1 className="text-3xl font-display text-[#f5f3f0] mt-2">Beyond the Floor</h1>
      <p className="text-xs font-mono text-[#c4c0bb] mt-2 max-w-sm">
        The requested coordinate does not exist in this plane of the architecture.
      </p>
      <div className="mt-6">
        <a href="/">
          <Button variant="outline" size="sm">
            Return to Prime Core
          </Button>
        </a>
      </div>
    </div>
  );
}
