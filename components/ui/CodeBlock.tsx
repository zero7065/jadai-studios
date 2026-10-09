'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';
import { StudioAudio } from '../../lib/watermark';

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  inline?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  title,
  className = '',
  inline = false,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      try {
        StudioAudio.playClick();
      } catch {}
      showToast('Copied to clipboard', 'success', 'Developer Workspace');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Clipboard refused the snippet — select the code and copy it manually.', 'error');
    }
  };

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#e8c96a] font-mono text-xs ${className}`}>
        <code>{code}</code>
        <button
          onClick={handleCopy}
          type="button"
          className="p-0.5 text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer"
          title="Copy code"
          aria-label="Copy code to clipboard"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </span>
    );
  }

  return (
    <div className={`relative group rounded-xl overflow-hidden bg-[#050404] border border-[rgba(201,168,76,0.2)] shadow-md ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0a0908] border-b border-[rgba(201,168,76,0.15)] text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]/60" />
          <span className="text-[#8a6e2a] uppercase tracking-wider">{title || language}</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[rgba(201,168,76,0.08)] hover:bg-[rgba(201,168,76,0.18)] border border-[rgba(201,168,76,0.25)] text-[#e8c96a] hover:text-[#f5f3f0] transition-colors cursor-pointer text-xs"
          title="Copy to Clipboard"
          aria-label="Copy to Clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Pre & code block */}
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-[#c4c0bb] bg-[#050404] select-text scrollbar-thin scrollbar-thumb-[rgba(201,168,76,0.2)]">
        <code className="text-[#f5f3f0] block whitespace-pre">{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
