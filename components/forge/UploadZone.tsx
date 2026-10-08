'use client';
import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';

export function UploadZone({ onProcess }: { onProcess: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const accepted = Array.from(newFiles).slice(0, 10);
    const valid = accepted.filter(
      (f) =>
        f.size <= 50 * 1024 * 1024 &&
        (f.type.startsWith('image/') ||
          f.type === 'application/pdf' ||
          f.name.endsWith('.pdf') ||
          f.name.endsWith('.docx') ||
          f.name.endsWith('.txt') ||
          f.type.includes('word') ||
          f.type === 'text/plain')
    );
    StudioAudio.playClick();
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-16 text-center transition-all ${
          dragging
            ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.08)] scale-[1.01]'
            : 'border-[rgba(201,168,76,0.3)] hover:border-[#C9A84C] bg-[#0a0908]'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.docx,.txt"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="forge-upload"
        />
        <label htmlFor="forge-upload" className="cursor-pointer block space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#e8c96a] mx-auto shadow-[0_0_20px_rgba(201,168,76,0.2)]">
            <Upload className="w-7 h-7" />
          </div>
          <p className="font-display text-2xl font-bold text-white">Drop files here</p>
          <p className="text-[#c4c0bb] text-sm font-mono">
            or click to browse · Max 10 files · 50MB each
          </p>
          <p className="text-[#8a6e2a] text-xs font-mono">
            PDF · DOCX · TXT · PNG · JPG · WebP
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-8 space-y-3">
          <div className="space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] flex items-center justify-between font-mono"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span className="text-[#f5f3f0] text-sm truncate">{f.name}</span>
                </div>
                <span className="text-[#8a6e2a] text-xs shrink-0 ml-2">
                  {(f.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              StudioAudio.playClick();
              onProcess(files);
            }}
            className="w-full py-4 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-sm tracking-widest font-bold hover:bg-[#e8c96a] transition-all shadow-lg cursor-pointer mt-4"
          >
            PROCESS {files.length} FILE{files.length > 1 ? 'S' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
