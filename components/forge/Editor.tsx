'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EditableField, DocPage, exportAs } from '@/modules/forge/lib/convert';
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
  Plus,
  Image as ImageIcon,
  Square as ShapeIcon,
  Trash2,
  Bold,
  Italic,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import { askPrime } from '@/lib/ai/memory';

// ---------------------------------------------------------------------------
// Deterministic layout lint — real checks that work with zero AI providers.
// ---------------------------------------------------------------------------
interface LintHit {
  id: string;
  suggestion: string;
  alignmentIssue?: boolean;
}

function lintFields(fields: EditableField[]): LintHit[] {
  const hits: LintHit[] = [];
  if (fields.length === 0) return hits;

  // Margin consistency: majority x position is the intended margin.
  const xCounts = new Map<number, number>();
  fields.forEach((f) => xCounts.set(f.x, (xCounts.get(f.x) || 0) + 1));
  let margin = fields[0].x;
  let best = 0;
  xCounts.forEach((count, x) => {
    if (count > best) {
      best = count;
      margin = x;
    }
  });
  fields.forEach((f) => {
    if (f.type !== 'text' && f.type !== 'checkbox') return;
    if (Math.abs(f.x - margin) > 4) {
      hits.push({
        id: f.id,
        suggestion: `Align left margin to ${margin}px for visual harmony.`,
        alignmentIssue: true,
      });
    }
  });

  fields.forEach((f) => {
    const value = (f.value || '').trim();
    if (value.length > 0 && value.length < 3) {
      hits.push({ id: f.id, suggestion: 'This text field is nearly empty — complete or remove it.' });
    }
    if (value.length > 60 && value === value.toUpperCase() && /[A-Z]{4}/.test(value)) {
      hits.push({ id: f.id, suggestion: 'Convert long ALL-CAPS text to sentence case for readability.' });
    }
    if (f === fields[0] && (f.fontSize || 16) < 24) {
      hits.push({
        id: f.id,
        suggestion: 'Elevate the title: raise size above 24px to establish hierarchy.',
      });
    }
  });

  return hits.slice(0, 6);
}

export interface EditorProps {
  originalUrl: string;
  initialFields: EditableField[];
  width: number;
  height: number;
  /** Multi-page payload (PDFs). Single-page docs have 1 page. */
  pages?: DocPage[];
  /** Honest provenance label. */
  source?: string;
  /** Real text elements extracted (0 = nothing readable). */
  extractedCount?: number;
  onReset?: () => void;
}

export function Editor({
  originalUrl,
  initialFields,
  width,
  height,
  pages,
  source,
  extractedCount,
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

  // Multi-page navigation + per-page field stores.
  const [currentPage, setCurrentPage] = useState(0);
  const [pageFieldMap, setPageFieldMap] = useState<Record<number, EditableField[]>>(() => {
    const map: Record<number, EditableField[]> = { 0: normalizedInitial };
    (pages || []).forEach((p) => {
      if (p.index !== 0) map[p.index] = p.fields;
    });
    return map;
  });
  const totalPages = Math.max(1, pages?.length || 1);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // Keep the per-page field store in sync with the live `fields` array.
  useEffect(() => {
    setPageFieldMap((map) => ({ ...map, [currentPage]: fields }));
  }, [fields, currentPage]);

  // When the page changes, load that page's fields and clear selection.
  const goToPage = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(totalPages - 1, idx));
      if (clamped === currentPage) return;
      setCurrentPage(clamped);
      setFields(pageFieldMap[clamped] || []);
      setSelectedId((pageFieldMap[clamped] || [])[0]?.id || null);
      setEditingId(null);
    },
    [currentPage, totalPages, pageFieldMap]
  );

  const currentBackground = pages?.[currentPage]?.backgroundUrl || originalUrl;

  // --- WPS-grade insert tools ---
  const insertText = () => {
    recordSnapshot(fields);
    const id = crypto.randomUUID();
    const newField: EditableField = {
      id,
      type: 'text',
      value: 'New text',
      x: Math.round(width / 2 - 80),
      y: Math.round(height / 2 - 12),
      width: 180,
      height: 24,
      fontSize: 16,
      color: '#0a0908',
      bold: false,
      italic: false,
      page: currentPage,
    };
    setFields((fs) => [...fs, newField]);
    setSelectedId(id);
    setEditingId(id);
    showToast('Text layer added', 'success');
  };

  const insertShape = (shape: 'rect' | 'ellipse' | 'line') => {
    recordSnapshot(fields);
    const id = crypto.randomUUID();
    const newField: EditableField = {
      id,
      type: 'shape',
      value: shape,
      shape,
      x: Math.round(width / 2 - 60),
      y: Math.round(height / 2 - 40),
      width: 120,
      height: 80,
      color: '#C9A84C',
      page: currentPage,
    };
    setFields((fs) => [...fs, newField]);
    setSelectedId(id);
    showToast(`${shape} shape added`, 'success');
  };

  const handleInsertImageClick = () => imageInputRef.current?.click();

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      if (!src) return;
      recordSnapshot(fields);
      const id = crypto.randomUUID();
      const newField: EditableField = {
        id,
        type: 'image',
        value: file.name,
        src,
        x: Math.round(width / 2 - 100),
        y: Math.round(height / 2 - 75),
        width: 200,
        height: 150,
        page: currentPage,
      };
      setFields((fs) => [...fs, newField]);
      setSelectedId(id);
      showToast('Image layer placed', 'success');
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    recordSnapshot(fields);
    setFields((fs) => fs.filter((f) => f.id !== selectedId));
    setSelectedId(null);
    setEditingId(null);
    showToast('Layer deleted', 'info');
  };

  // AI Layout & Copy Audit — deterministic lint always runs; live AI adds copy
  // suggestions when the provider chain is up. Honest labelling either way.
  const handleAiAudit = async () => {
    setAiAuditing(true);
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}

    try {
      recordSnapshot(fields);
      const lintHits = lintFields(fields);

      let aiHits: LintHit[] = [];
      let aiProvider: string | undefined;
      try {
        const res = await askPrime({
          prompt:
            'Audit these document fields. Return ONLY a JSON array (max 4 entries), each: {"id":"<field id>","suggestion":"<one concrete copy or layout improvement, max 18 words>"}.\n' +
            JSON.stringify(
              fields.map((f) => ({
                id: f.id,
                type: f.type,
                value: (f.value || '').slice(0, 140),
                x: f.x,
                fontSize: f.fontSize,
              }))
            ),
          systemPrompt:
            'You are a document layout and copy auditor. Respond with raw JSON only — no markdown, no prose.',
          moduleSlug: 'forge',
          scope: 'forge',
        });
        if (res.text && !res.error && res.provider !== 'graceful_fallback') {
          const cleaned = res.text
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            aiHits = parsed
              .filter(
                (p: any) =>
                  p &&
                  typeof p.id === 'string' &&
                  typeof p.suggestion === 'string' &&
                  fields.some((f) => f.id === p.id)
              )
              .map((p: any) => ({ id: p.id, suggestion: String(p.suggestion).slice(0, 160) }));
            aiProvider = res.provider;
          }
        }
      } catch {
        // Lint-only mode — no AI suggestions available.
      }

      // Merge: AI copy suggestions win, deterministic lint fills the rest.
      const merged = fields.map((f) => {
        const ai = aiHits.find((h) => h.id === f.id);
        const lint = lintHits.find((h) => h.id === f.id);
        const hit = ai || lint;
        return hit
          ? { ...f, suggestion: hit.suggestion, alignmentIssue: hit.alignmentIssue || lint?.alignmentIssue || false }
          : { ...f, suggestion: undefined, alignmentIssue: false };
      });
      setFields(merged);
      setShowAiHighlights(true);

      const total = merged.filter((f) => f.suggestion).length;
      if (aiHits.length > 0) {
        showToast(`Audit complete: ${total} suggestion${total === 1 ? '' : 's'} (${aiProvider}).`, 'success', 'AI Audit');
      } else {
        showToast(
          `AI unreachable — audit ran deterministic layout lint only: ${total} finding${total === 1 ? '' : 's'}.`,
          'info',
          'Lint Mode'
        );
      }
    } catch (err: any) {
      showToast(`Audit failed: ${err?.message || 'unknown error'}.`, 'error', 'AI Audit');
    } finally {
      setAiAuditing(false);
    }
  };

  // Apply user AI idea prompt — known local commands execute instantly; unknown
  // phrasing is sent to PRIME for a structured edit spec. Honest toasts either way.
  const handleApplyAiPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    recordSnapshot(fields);
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}

    const instruction = aiPrompt.trim();
    const promptText = instruction.toLowerCase();
    showToast(`Applying instruction: "${instruction.slice(0, 30)}..."`, 'info');

    const applyLocal = (action: 'align' | 'title' | 'polish'): boolean => {
      if (action === 'align') {
        setFields((prev) => prev.map((f) => ({ ...f, x: 40, alignmentIssue: false })));
        showToast('All fields aligned to 40px left margin', 'success');
        return true;
      }
      if (action === 'title') {
        setFields((prev) =>
          prev.map((f, i) =>
            i === 0 ? { ...f, fontSize: 32, color: '#D4AF37', value: f.value.toUpperCase() } : f
          )
        );
        showToast('Header set to 32px gold uppercase', 'success');
        return true;
      }
      setFields((prev) =>
        prev.map((f) => ({
          ...f,
          color: '#f5f3f0',
          suggestion: undefined,
          alignmentIssue: false,
        }))
      );
      showToast('Field styling normalized to high-contrast palette', 'success');
      return true;
    };

    // 1. Local editor commands (instant, no AI needed)
    let localAction: 'align' | 'title' | 'polish' | null = null;
    if (promptText.includes('align') || promptText.includes('margin')) localAction = 'align';
    else if (promptText.includes('title') || promptText.includes('heading')) localAction = 'title';
    else if (promptText.includes('polish') || promptText.includes('contrast') || promptText.includes('style')) localAction = 'polish';

    if (localAction) {
      applyLocal(localAction);
      setAiPrompt('');
      return;
    }

    // 2. Unknown phrasing → ask PRIME which local edit to run
    try {
      const res = await askPrime({
        prompt: `The document editor supports exactly these local edits: "align" (snap all fields to 40px left margin), "title" (index 0: 32px gold uppercase), "polish" (normalize all text to high-contrast white), "none" (instruction is not executable as a local edit).\n\nUser instruction: "${instruction}"\n\nReturn ONLY JSON: {"action":"align|title|polish|none","note":"<max 12 words explaining the result>"}`,
        systemPrompt:
          'You map user formatting instructions to editor commands. Respond with raw JSON only — no markdown, no prose.',
        moduleSlug: 'forge',
        scope: 'forge',
      });

      if (res.text && !res.error && res.provider !== 'graceful_fallback') {
        const cleaned = res.text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        const action = parsed?.action;
        if (action === 'align' || action === 'title' || action === 'polish') {
          applyLocal(action);
        } else {
          showToast(
            `PRIME: ${parsed?.note || 'that instruction does not map to an available edit'} — rephrase with align, title, or polish.`,
            'info',
            'PRIME'
          );
        }
      } else {
        showToast('PRIME unreachable — try a local command: align, title, or polish.', 'info', 'Offline');
      }
    } catch {
      showToast('Instruction could not be parsed and PRIME is unreachable — try: align, title, or polish.', 'info', 'Offline');
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

      // Draw background document (current page).
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = currentBackground;
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
          ctx.font = `${field.bold ? 'bold ' : ''}${field.italic ? 'italic ' : ''}${fontSize}px sans-serif`;
          ctx.fillStyle = field.color || '#f5f3f0';
          ctx.fillText(field.value, field.x + 24, field.y + 13);
        } else if (field.type === 'text') {
          const fontSize = field.fontSize || 16;
          ctx.font = `${field.bold ? 'bold ' : ''}${field.italic ? 'italic ' : ''}${fontSize}px sans-serif`;
          ctx.fillStyle = field.color || '#f5f3f0';
          ctx.fillText(field.value, field.x, field.y + fontSize);
        } else if (field.type === 'shape' && field.shape) {
          ctx.strokeStyle = field.color || '#C9A84C';
          ctx.lineWidth = 2;
          if (field.shape === 'rect') {
            ctx.strokeRect(field.x, field.y, field.width, field.height);
          } else if (field.shape === 'ellipse') {
            ctx.beginPath();
            ctx.ellipse(
              field.x + field.width / 2,
              field.y + field.height / 2,
              field.width / 2,
              field.height / 2,
              0,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          } else if (field.shape === 'line') {
            ctx.beginPath();
            ctx.moveTo(field.x, field.y);
            ctx.lineTo(field.x + field.width, field.y + field.height);
            ctx.stroke();
          }
        } else if (field.type === 'image' && field.src) {
          try {
            const layerImg = new Image();
            layerImg.src = field.src;
            await new Promise((r) => {
              layerImg.onload = () => r(true);
              layerImg.onerror = () => r(false);
            });
            if (layerImg.complete && layerImg.naturalWidth > 0) {
              ctx.drawImage(layerImg, field.x, field.y, field.width, field.height);
            }
          } catch {}
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

          {/* Insert Tools (WPS-grade) */}
          <div className="flex items-center gap-1 border-l border-[rgba(201,168,76,0.2)] pl-2">
            <button
              onClick={insertText}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5"
              title="Insert text layer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertShape('rect')}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5"
              title="Insert rectangle"
            >
              <ShapeIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleInsertImageClick}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5"
              title="Insert image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={deleteSelected}
              disabled={!selectedId}
              className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Delete selected layer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelected}
              className="hidden"
            />
          </div>

          {/* Page Navigation (multi-page PDFs) */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 border-l border-[rgba(201,168,76,0.2)] pl-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-[#D4AF37] px-1">
                {currentPage + 1}/{totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* AI Action Trigger & Export Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Honest provenance badge */}
          {source && (
            <span
              className="px-2 py-1 rounded-full border border-[rgba(201,168,76,0.3)] bg-[#050404] text-[10px] font-mono text-[#8a6e2a]"
              title={
                (extractedCount ?? 0) > 0
                  ? `${extractedCount} real text layers extracted from ${source.toUpperCase()}`
                  : `No readable text found in ${source.toUpperCase()}`
              }
            >
              {source.toUpperCase()} · {extractedCount ?? 0} layers
              {totalPages > 1 ? ` · ${totalPages}pp` : ''}
            </span>
          )}
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
            src={currentBackground}
            alt="Document Base"
            className="absolute inset-0 w-full h-full object-contain opacity-75 pointer-events-none select-none filter contrast-125"
          />

          {/* Canvas Vector Layer with Interactive Text, Checkboxes, Shapes & Images */}
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
                fontWeight: f.bold ? 700 : 400,
                fontStyle: f.italic ? 'italic' : 'normal',
                width: f.type === 'image' || f.type === 'shape' ? `${f.width}px` : undefined,
                height: f.type === 'image' || f.type === 'shape' ? `${f.height}px` : undefined,
                padding: f.type === 'image' || f.type === 'shape' ? 0 : undefined,
              }}
              title="Click and drag to move · Double-click to edit text"
            >
              {f.type === 'image' && f.src ? (
                <img src={f.src} alt={f.value} className="w-full h-full object-contain pointer-events-none" draggable={false} />
              ) : f.type === 'shape' ? (
                <div
                  className="w-full h-full pointer-events-none"
                  style={{
                    border: `2px solid ${f.color || '#C9A84C'}`,
                    borderRadius: f.shape === 'ellipse' ? '50%' : 0,
                  }}
                />
              ) : f.type === 'checkbox' ? (
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

            {/* Bold / Italic toggles */}
            {(selected.type === 'text' || selected.type === 'checkbox') && (
              <div>
                <label className="text-[#D4AF37] block mb-1">Style</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateField(selected.id, { bold: !selected.bold })}
                    className={`px-3 py-1 rounded-lg border text-[11px] flex items-center gap-1 ${
                      selected.bold
                        ? 'bg-[#C9A84C] text-black font-bold border-[#C9A84C]'
                        : 'border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Bold className="w-3 h-3" />
                    <span>Bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField(selected.id, { italic: !selected.italic })}
                    className={`px-3 py-1 rounded-lg border text-[11px] flex items-center gap-1 ${
                      selected.italic
                        ? 'bg-[#C9A84C] text-black font-bold border-[#C9A84C]'
                        : 'border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Italic className="w-3 h-3" />
                    <span>Italic</span>
                  </button>
                </div>
              </div>
            )}

            {/* Width / Height for shapes + images */}
            {(selected.type === 'shape' || selected.type === 'image') && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#D4AF37] block mb-1">Width</label>
                  <input
                    type="number"
                    value={Math.round(selected.width)}
                    onChange={(e) => updateField(selected.id, { width: Math.max(10, parseInt(e.target.value, 10) || 10) })}
                    className="w-full bg-[#050404] border border-[rgba(201,168,76,0.25)] rounded-xl p-2 text-[#f5f3f0]"
                  />
                </div>
                <div>
                  <label className="text-[#D4AF37] block mb-1">Height</label>
                  <input
                    type="number"
                    value={Math.round(selected.height)}
                    onChange={(e) => updateField(selected.id, { height: Math.max(10, parseInt(e.target.value, 10) || 10) })}
                    className="w-full bg-[#050404] border border-[rgba(201,168,76,0.25)] rounded-xl p-2 text-[#f5f3f0]"
                  />
                </div>
              </div>
            )}

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

            <div className="pt-2 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between text-[11px] text-[#D4AF37]">
              <span>X: {Math.round(selected.x)}px · Y: {Math.round(selected.y)}px</span>
              <button
                onClick={deleteSelected}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
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
