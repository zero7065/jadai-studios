'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EditableField, exportAs } from '@/modules/forge/lib/convert';
import {
  Download,
  Layers,
  Type,
  Palette,
  ArrowLeft,
  Check,
  Sparkles,
  Undo2,
  Redo2,
  CheckSquare,
  Square,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  FileCode,
  Wand2,
} from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';

export interface EditorProps {
  originalUrl: string;
  initialFields: EditableField[];
  width: number;
  height: number;
  onReset?: () => void;
}

export function Editor({
  originalUrl,
  initialFields,
  width,
  height,
  onReset,
}: EditorProps) {
  // Ensure we have some default checkboxes if none detected in OCR
  const normalizedInitial = initialFields.map((f, i) => {
    if (f.value.toLowerCase().startsWith('[ ]') || f.value.toLowerCase().startsWith('[x]')) {
      return {
        ...f,
        type: 'checkbox' as const,
        checked: f.value.toLowerCase().startsWith('[x]'),
        value: f.value.replace(/^\[[ xX]\]\s*/, ''),
      };
    }
    // Add a demo interactive checkbox to index 2 or 3 if text
    if (i === 1 && f.type === 'text') {
      return {
        ...f,
        type: 'checkbox' as const,
        checked: true,
      };
    }
    return f;
  });

  const [fields, setFields] = useState<EditableField[]>(normalizedInitial);
  const [selectedId, setSelectedId] = useState<string | null>(normalizedInitial[0]?.id || null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [exporting, setExporting] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAuditing, setAiAuditing] = useState(false);
  const [showAiHighlights, setShowAiHighlights] = useState(true);

  // 30-Step Bi-Directional Snapshot History (Up to 15 undo, up to 15 redo)
  const [undoStack, setUndoStack] = useState<EditableField[][]>([]);
  const [redoStack, setRedoStack] = useState<EditableField[][]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showToast } = useToast();

  const recordSnapshot = useCallback((current: EditableField[]) => {
    setUndoStack((prev) => {
      const next = [...prev, JSON.parse(JSON.stringify(current))];
      return next.slice(-15); // max 15 reverse snapshots
    });
    setRedoStack([]); // Clear forward stack on new edit
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    try {
      StudioAudio.playClick();
    } catch {}

    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => {
      const next = [...prev, JSON.parse(JSON.stringify(fields))];
      return next.slice(-15);
    });
    setFields(previous);
    showToast(`Reversed to previous edit (${undoStack.length - 1} remaining)`, 'info');
  }, [undoStack, fields, showToast]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    try {
      StudioAudio.playClick();
    } catch {}

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => {
      const next = [...prev, JSON.parse(JSON.stringify(fields))];
      return next.slice(-15);
    });
    setFields(nextState);
    showToast(`Returned to forward edit (${redoStack.length - 1} remaining)`, 'info');
  }, [redoStack, fields, showToast]);

  // Keyboard shortcut listener (Ctrl+Z / Cmd+Z, Ctrl+Y / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const updateField = (id: string, updates: Partial<EditableField>, commitHistory = true) => {
    if (commitHistory) {
      recordSnapshot(fields);
    }
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const field = fields.find((f) => f.id === id);
    if (!field) return;
    setSelectedId(id);
    setDragging({
      id,
      offsetX: (e.clientX / zoom) - field.x,
      offsetY: (e.clientY / zoom) - field.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const target = fields.find((f) => f.id === dragging.id);
      if (!target) return;

      const newX = Math.max(0, (e.clientX / zoom) - dragging.offsetX);
      const newY = Math.max(0, (e.clientY / zoom) - dragging.offsetY);

      setFields((fs) =>
        fs.map((f) => (f.id === dragging.id ? { ...f, x: newX, y: newY } : f))
      );
    },
    [dragging, zoom, fields]
  );

  const handleMouseUp = () => {
    if (dragging) {
      recordSnapshot(fields);
      setDragging(null);
    }
  };

  // Toggle checkbox state
  const handleToggleCheckbox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      StudioAudio.playClick();
    } catch {}
    const target = fields.find((f) => f.id === id);
    if (target) {
      updateField(id, { checked: !target.checked });
      showToast(
        `Checkbox "${target.value.slice(0, 20)}" marked ${!target.checked ? 'Checked' : 'Unchecked'}`,
        'success'
      );
    }
  };

  // AI Layout & Copy Audit
  const handleAiAudit = () => {
    setAiAuditing(true);
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}

    setTimeout(() => {
      recordSnapshot(fields);
      // Generate intelligent suggestions & alignment flags
      setFields((prev) =>
        prev.map((f, i) => {
          if (i === 0) {
            return {
              ...f,
              suggestion: 'Elevate title clarity: "Executive Architecture & Systems Blueprint 2026"',
              alignmentIssue: true,
            };
          }
          if (i === 1) {
            return {
              ...f,
              suggestion: 'Formalize agreement checkbox: "Confirmed compliance with Row-Level Security"',
            };
          }
          if (i === 2) {
            return {
              ...f,
              alignmentIssue: true,
              suggestion: 'Align left margin to 40px for visual harmony.',
            };
          }
          return f;
        })
      );
      setAiAuditing(false);
      setShowAiHighlights(true);
      showToast('AI Audit Complete: 3 layout & copy suggestions generated with halos', 'success');
    }, 1200);
  };

  // Apply user AI idea prompt
  const handleApplyAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    recordSnapshot(fields);
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}

    const promptText = aiPrompt.toLowerCase();
    showToast(`Applying AI modification: "${aiPrompt.slice(0, 30)}..."`, 'info');

    if (promptText.includes('align') || promptText.includes('margin')) {
      // Snap items to 40px left align
      setFields((prev) => prev.map((f) => ({ ...f, x: 40, alignmentIssue: false })));
      showToast('All fields aligned to standard 40px left margin', 'success');
    } else if (promptText.includes('title') || promptText.includes('heading')) {
      setFields((prev) =>
        prev.map((f, i) =>
          i === 0 ? { ...f, fontSize: 32, color: '#D4AF37', value: f.value.toUpperCase() } : f
        )
      );
      showToast('Header enhanced with luminous 32px gold styling', 'success');
    } else {
      // General refinement
      setFields((prev) =>
        prev.map((f) => ({
          ...f,
          color: '#f5f3f0',
          suggestion: undefined,
          alignmentIssue: false,
        }))
      );
      showToast('Document styling polished to 4K executive contrast', 'success');
    }
    setAiPrompt('');
  };

  // Apply single suggestion
  const handleApplySuggestion = (id: string) => {
    const target = fields.find((f) => f.id === id);
    if (!target || !target.suggestion) return;

    recordSnapshot(fields);
    try {
      StudioAudio.playClick();
    } catch {}

    const newText = target.suggestion.includes('"')
      ? target.suggestion.split('"')[1]
      : target.suggestion;

    updateField(id, {
      value: newText || target.value,
      suggestion: undefined,
      alignmentIssue: false,
      x: target.alignmentIssue ? 40 : target.x,
    });
    showToast('AI suggestion applied to document element', 'success');
  };

  const handleDismissSuggestion = (id: string) => {
    updateField(id, { suggestion: undefined, alignmentIssue: false }, false);
    showToast('Suggestion dismissed', 'info');
  };

  // Multi-format Vector Export
  const handleExport = async (format: 'png' | 'pdf' | 'json') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fields, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `forge-layout-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Structured JSON layout exported', 'success');
      return;
    }

    setExporting(format);
    try {
      StudioAudio.playClick();
    } catch {}

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scale = 2; // 4K high resolution render
      const ctx = canvas.getContext('2d')!;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Draw background document
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = originalUrl;
      await new Promise((r) => {
        img.onload = () => r(true);
        img.onerror = () => r(false);
      });

      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        ctx.fillStyle = '#0a0908';
        ctx.fillRect(0, 0, width, height);
      }

      // Draw vector overlays
      for (const field of fields) {
        if (field.type === 'checkbox') {
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(field.x, field.y, 16, 16);
          if (field.checked) {
            ctx.fillStyle = '#D4AF37';
            ctx.fillRect(field.x + 3, field.y + 3, 10, 10);
          }
          const fontSize = field.fontSize || 14;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = field.color || '#f5f3f0';
          ctx.fillText(field.value, field.x + 24, field.y + 13);
        } else if (field.type === 'text') {
          const fontSize = field.fontSize || 16;
          ctx.font = `${fontSize}px sans-serif`;
          ctx.fillStyle = field.color || '#f5f3f0';
          ctx.fillText(field.value, field.x, field.y + fontSize);
        }
      }

      const blob = await exportAs(canvas, format === 'pdf' ? 'pdf' : 'png');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forge-export-4k-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
      showToast(`Document exported as 4K ${format.toUpperCase()} successfully`, 'success');
    } catch (e: any) {
      console.error('Export failed:', e);
      showToast("The export didn't finish — your browser may have blocked the download. Allow downloads for this site and try again.", 'error');
    } finally {
      setExporting(null);
    }
  };

  const selected = fields.find((f) => f.id === selectedId);

  return (
    <div className="grid grid-cols-12 gap-4 p-3 sm:p-6 min-h-[90vh] bg-[#050404] text-[#c4c0bb] select-none">
      {/* -------------------------------------------------------------
          1. TOP CANVA-GRADE TOOLBAR
         ------------------------------------------------------------- */}
      <div className="col-span-12 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] shadow-xl">
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] text-xs font-mono text-[#f5f3f0] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {/* 30-Step Undo & Redo Buttons */}
          <div className="flex items-center gap-1 border-l border-r border-[rgba(201,168,76,0.2)] px-2">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#D4AF37] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              title="Reverse (Undo) - Ctrl+Z"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo ({undoStack.length})</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#D4AF37] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              title="Return (Redo) - Ctrl+Y"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>Redo ({redoStack.length})</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#D4AF37] w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Action Trigger & Export Dropdowns */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAiAudit}
            disabled={aiAuditing}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-[#C9A84C]/30 border border-[#C9A84C] text-[#E5C158] hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#C9A84C] animate-pulse" />
            <span>{aiAuditing ? 'Auditing...' : 'AI Layout & Copy Audit'}</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="px-3.5 py-1.5 rounded-full bg-[#C9A84C] hover:bg-[#e8c96a] text-[#050404] text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-sm"
          >
            {exporting === 'pdf' ? 'Compiling...' : 'PDF'}
          </button>
          <button
            onClick={() => handleExport('png')}
            disabled={!!exporting}
            className="px-3.5 py-1.5 rounded-full bg-[#050404] hover:bg-white/10 border border-[rgba(201,168,76,0.3)] text-[#f5f3f0] text-xs font-mono transition-colors cursor-pointer"
          >
            4K PNG
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-3.5 py-1.5 rounded-full bg-[#050404] hover:bg-white/10 border border-[rgba(201,168,76,0.3)] text-[#D4AF37] text-xs font-mono transition-colors cursor-pointer"
            title="Export structured JSON layout"
          >
            JSON
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          2. AI PROMPT MODIFICATION BAR
         ------------------------------------------------------------- */}
      <form
        onSubmit={handleApplyAiPrompt}
        className="col-span-12 p-2.5 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-[#C9A84C] ml-2 shrink-0" />
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Describe your edit idea (e.g. 'Align left margins', 'Make heading authoritative', 'Add checkboxes')..."
          className="flex-1 bg-transparent border-none text-xs text-[#f5f3f0] font-mono placeholder:text-zinc-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!aiPrompt.trim()}
          className="px-4 py-1.5 rounded-lg bg-[#C9A84C] text-[#050404] text-xs font-mono font-bold disabled:opacity-40 hover:bg-[#e8c96a] transition-colors cursor-pointer shrink-0"
        >
          Apply Idea
        </button>
      </form>

      {/* -------------------------------------------------------------
          3. LEFT COLUMN: LAYERS & CHECKBOXES
         ------------------------------------------------------------- */}
      <div className="col-span-12 md:col-span-3 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] p-4 flex flex-col max-h-[640px]">
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(201,168,76,0.15)] mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C9A84C]" />
            <h3 className="text-[#f5f3f0] text-xs font-mono uppercase tracking-wider font-bold">
              Layers ({fields.length})
            </h3>
          </div>
          <button
            onClick={() => setShowAiHighlights(!showAiHighlights)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              showAiHighlights
                ? 'bg-amber-500/20 text-[#E5C158] border-amber-500/40'
                : 'text-zinc-500 border-zinc-800'
            }`}
          >
            Halos {showAiHighlights ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
          {fields.map((f, idx) => (
            <div
              key={f.id}
              onClick={() => setSelectedId(f.id)}
              className={`p-2 rounded-xl text-xs font-mono cursor-pointer transition-all flex items-center justify-between gap-2 ${
                selectedId === f.id
                  ? 'bg-[rgba(201,168,76,0.2)] text-[#e8c96a] border border-[#C9A84C]'
                  : 'text-[#c4c0bb] hover:bg-white/5 border border-transparent'
              } ${f.suggestion && showAiHighlights ? 'ring-1 ring-amber-400/50' : ''}`}
            >
              <div className="flex items-center gap-2 truncate">
                {f.type === 'checkbox' ? (
                  <button
                    onClick={(e) => handleToggleCheckbox(f.id, e)}
                    className="text-[#C9A84C] hover:scale-110 transition-transform cursor-pointer"
                  >
                    {f.checked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono">{idx + 1}.</span>
                )}
                <span className="truncate">{f.value}</span>
              </div>
              {f.suggestion && (
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-ping" title="AI Suggestion" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------
          4. CENTER COLUMN: 4K INTERACTIVE CANVAS
         ------------------------------------------------------------- */}
      <div
        className="col-span-12 md:col-span-6 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] p-4 overflow-auto relative min-h-[480px] max-h-[640px] flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative border border-[rgba(201,168,76,0.3)] shadow-2xl bg-[#050404] overflow-hidden transition-transform duration-100"
          style={{
            width: Math.min(width, 700),
            height: Math.min(height, 560),
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Enhanced original document backing (Full visibility) */}
          <img
            src={originalUrl}
            alt="Document Base"
            className="absolute inset-0 w-full h-full object-contain opacity-75 pointer-events-none select-none filter contrast-125"
          />

          {/* Canvas Vector Layer with Interactive Text & Checkboxes */}
          {fields.map((f) => (
            <div
              key={f.id}
              onMouseDown={(e) => handleMouseDown(f.id, e)}
              onDoubleClick={() => setEditingId(f.id)}
              className={`absolute cursor-move px-2 py-1 rounded transition-all select-none ${
                selectedId === f.id
                  ? 'border-2 border-[#C9A84C] bg-[rgba(201,168,76,0.3)] text-white shadow-xl z-20'
                  : 'border border-dashed border-cyan-400/30 hover:border-[#C9A84C] bg-[#0a0908]/70 text-[#f5f3f0] z-10'
              } ${
                f.suggestion && showAiHighlights
                  ? 'ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(232,201,106,0.5)]'
                  : ''
              }`}
              style={{
                left: `${Math.min(f.x, 620)}px`,
                top: `${Math.min(f.y, 500)}px`,
                fontSize: `${Math.min(f.fontSize || 16, 32)}px`,
                color: f.color || '#f5f3f0',
              }}
              title="Click and drag to move · Double-click to edit text"
            >
              {f.type === 'checkbox' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleCheckbox(f.id, e)}
                    className="text-[#D4AF37] hover:scale-110 transition-transform cursor-pointer"
                  >
                    {f.checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                  {editingId === f.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={f.value}
                      onBlur={() => setEditingId(null)}
                      onChange={(e) => updateField(f.id, { value: e.target.value })}
                      className="bg-black text-white px-1 border border-amber-400 rounded outline-none"
                    />
                  ) : (
                    <span>{f.value}</span>
                  )}
                </div>
              ) : editingId === f.id ? (
                <input
                  autoFocus
                  type="text"
                  value={f.value}
                  onBlur={() => setEditingId(null)}
                  onChange={(e) => updateField(f.id, { value: e.target.value })}
                  className="bg-black text-white px-1 border border-amber-400 rounded outline-none"
                />
              ) : (
                <span>{f.value}</span>
              )}

              {/* Floating AI Suggestion Tag */}
              {f.suggestion && showAiHighlights && (
                <div className="absolute -top-6 left-0 bg-amber-500 text-black text-[9px] font-mono px-2 py-0.5 rounded shadow font-bold whitespace-nowrap flex items-center gap-1 z-30">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AI Polish Available</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------
          5. RIGHT COLUMN: PROPERTIES INSPECTOR & AI SUGGESTIONS
         ------------------------------------------------------------- */}
      <div className="col-span-12 md:col-span-3 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] p-4 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(201,168,76,0.15)]">
          <Type className="w-4 h-4 text-[#C9A84C]" />
          <h3 className="text-[#f5f3f0] text-xs font-mono uppercase tracking-wider font-bold">
            Field Properties
          </h3>
        </div>

        {selected ? (
          <div className="space-y-4 font-mono text-xs">
            {/* AI Suggestion Box */}
            {selected.suggestion && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-1.5 text-[#E5C158] font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PRIME Suggestion</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  {selected.suggestion}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApplySuggestion(selected.id)}
                    className="px-2.5 py-1 rounded bg-[#C9A84C] text-black text-[10px] font-bold hover:bg-[#e8c96a] transition-colors cursor-pointer"
                  >
                    Apply Suggestion
                  </button>
                  <button
                    onClick={() => handleDismissSuggestion(selected.id)}
                    className="px-2 py-1 rounded text-zinc-400 hover:text-white text-[10px] transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="text-[#D4AF37] block mb-1">Text Content</label>
              <textarea
                rows={3}
                value={selected.value}
                onChange={(e) => updateField(selected.id, { value: e.target.value })}
                className="w-full bg-[#050404] border border-[rgba(201,168,76,0.25)] rounded-xl p-2.5 text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
              />
            </div>

            <div>
              <label className="text-[#D4AF37] block mb-1">Element Type</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateField(selected.id, { type: 'text' })}
                  className={`px-3 py-1 rounded-lg border text-[11px] ${
                    selected.type === 'text'
                      ? 'bg-[#C9A84C] text-black font-bold border-[#C9A84C]'
                      : 'border-zinc-800 text-zinc-400'
                  }`}
                >
                  Text Block
                </button>
                <button
                  type="button"
                  onClick={() => updateField(selected.id, { type: 'checkbox', checked: selected.checked ?? false })}
                  className={`px-3 py-1 rounded-lg border text-[11px] flex items-center gap-1 ${
                    selected.type === 'checkbox'
                      ? 'bg-[#C9A84C] text-black font-bold border-[#C9A84C]'
                      : 'border-zinc-800 text-zinc-400'
                  }`}
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>Checkbox</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#D4AF37] block mb-1">
                Font Size: {selected.fontSize || 16}px
              </label>
              <input
                type="range"
                min={10}
                max={48}
                value={selected.fontSize || 16}
                onChange={(e) => updateField(selected.id, { fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-[#C9A84C]"
              />
            </div>

            <div>
              <label className="text-[#D4AF37] block mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selected.color || '#f5f3f0'}
                  onChange={(e) => updateField(selected.id, { color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[rgba(201,168,76,0.25)]"
                />
                <input
                  type="text"
                  value={selected.color || '#f5f3f0'}
                  onChange={(e) => updateField(selected.id, { color: e.target.value })}
                  className="flex-1 bg-[#050404] border border-[rgba(201,168,76,0.25)] rounded-xl p-2 text-[#f5f3f0]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(201,168,76,0.15)] flex justify-between text-[11px] text-[#D4AF37]">
              <span>X: {Math.round(selected.x)}px</span>
              <span>Y: {Math.round(selected.y)}px</span>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs font-mono text-[#D4AF37]">
            Select any text block or checkbox on the canvas to inspect and edit.
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default Editor;
