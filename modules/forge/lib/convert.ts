'use client';
import Tesseract from 'tesseract.js';

export interface EditableField {
  id: string;
  type: 'text' | 'checkbox' | 'image' | 'shape';
  value: string;
  checked?: boolean;
  suggestion?: string;
  alignmentIssue?: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  font?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  /** For shape layers. */
  shape?: 'rect' | 'ellipse' | 'line';
  /** For image layers — the object/data URL of the placed image. */
  src?: string;
  /** Page index this field belongs to (multi-page docs). */
  page?: number;
}

/** One rendered page of a document. */
export interface DocPage {
  index: number;
  /** Background image (real render for PDF/images; clean canvas for text docs). */
  backgroundUrl: string;
  width: number;
  height: number;
  fields: EditableField[];
}

export interface ProcessedDoc {
  originalUrl: string;
  fields: EditableField[];
  width: number;
  height: number;
  /** Multi-page payload (populated for PDFs). Single-page docs have 1 page. */
  pages?: DocPage[];
  /** Honest provenance label shown in the editor. */
  source: 'txt' | 'pdf' | 'docx' | 'image' | 'unknown';
  /** Number of real text elements extracted (0 = nothing readable found). */
  extractedCount: number;
}

// ---------------------------------------------------------------------------
// PDF text extraction — real content via pdfjs-dist (no fabrication).
// ---------------------------------------------------------------------------
async function loadPdfjs(): Promise<any> {
  const pdfjs = await import('pdfjs-dist');
  // Vite-friendly worker: bundle the worker module and expose it as a port.
  try {
    const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    (pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;
  } catch {
    // Fall back to fake-worker mode (main-thread parse) if the worker URL fails.
    try {
      (pdfjs as any).GlobalWorkerOptions.workerSrc = '';
    } catch {}
  }
  return pdfjs;
}

async function extractPdf(file: File): Promise<ProcessedDoc> {
  const pdfjs = await loadPdfjs();
  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const numPages: number = Math.min(pdf.numPages, 12); // cap for perf

  const pages: DocPage[] = [];
  let extractedCount = 0;
  const pageWidth = 816; // US Letter @ 96dpi
  const pageHeight = 1056;

  for (let p = 1; p <= numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1 });

    // Render the real page to a canvas so the background is the actual document.
    let backgroundUrl = '';
    try {
      const canvas = document.createElement('canvas');
      const scale = Math.min(2, pageWidth / viewport.width);
      const scaled = page.getViewport({ scale });
      canvas.width = Math.round(scaled.width);
      canvas.height = Math.round(scaled.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport: scaled } as any).promise;
        backgroundUrl = canvas.toDataURL('image/png');
      }
    } catch (renderErr) {
      console.warn('[FORGE] PDF page render skipped:', renderErr);
    }

    // Extract real text content items with positions.
    const content = await page.getTextContent();
    const fields: EditableField[] = [];
    let lineY = -1;
    let lineText = '';
    let lineX = 0;
    let maxFontSize = 16;

    const flushLine = () => {
      const txt = lineText.trim();
      if (txt) {
        fields.push({
          id: crypto.randomUUID(),
          type: 'text',
          value: txt,
          x: Math.round(lineX),
          y: Math.round(lineY),
          width: Math.min(pageWidth - lineX - 24, Math.max(60, txt.length * (maxFontSize * 0.55))),
          height: Math.round(maxFontSize + 6),
          fontSize: Math.round(maxFontSize),
          color: '#0a0908',
          page: p - 1,
        });
        extractedCount++;
      }
      lineText = '';
    };

    for (const item of content.items as any[]) {
      if (!item.str || !item.transform) continue;
      const tx = item.transform;
      const x = tx[4];
      const y = tx[5];
      const fontSize = Math.abs(tx[3]) || 12;
      // pdf.js y grows upward; flip to top-origin for the editor.
      const topY = pageHeight - y;

      if (lineY === -1) lineY = topY;
      // New line when vertical position shifts beyond a threshold.
      if (Math.abs(topY - lineY) > fontSize * 0.6) {
        flushLine();
        lineY = topY;
        lineX = x;
        maxFontSize = fontSize;
      }
      if (!lineText) lineX = x;
      maxFontSize = Math.max(maxFontSize, fontSize);
      lineText += item.str + (item.hasEOL ? ' ' : '');
    }
    flushLine();

    pages.push({
      index: p - 1,
      backgroundUrl,
      width: pageWidth,
      height: pageHeight,
      fields,
    });
  }

  const first = pages[0] || {
    index: 0,
    backgroundUrl: '',
    width: pageWidth,
    height: pageHeight,
    fields: [],
  };

  return {
    originalUrl: first.backgroundUrl,
    fields: first.fields,
    width: first.width,
    height: first.height,
    pages,
    source: 'pdf',
    extractedCount,
  };
}

// ---------------------------------------------------------------------------
// DOCX extraction — real paragraphs via mammoth (no fabrication).
// ---------------------------------------------------------------------------
async function extractDocx(file: File): Promise<ProcessedDoc> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text: string = result.value || '';

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const width = 816;
  const lineHeight = 26;
  const height = Math.max(1056, lines.length * lineHeight + 120);

  // Real clean page background.
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.font = '11px monospace';
    ctx.fillText(`Extracted from ${file.name} — ${lines.length} paragraphs`, 48, 40);
  }
  const backgroundUrl = canvas.toDataURL('image/png');

  const fields: EditableField[] = lines.map((line, idx) => ({
    id: crypto.randomUUID(),
    type: 'text' as const,
    value: line.slice(0, 2000),
    x: 48,
    y: 80 + idx * lineHeight,
    width: width - 96,
    height: lineHeight,
    fontSize: idx === 0 ? 18 : 14,
    color: '#0a0908',
    page: 0,
  }));

  return {
    originalUrl: backgroundUrl,
    fields,
    width,
    height,
    pages: [{ index: 0, backgroundUrl, width, height, fields }],
    source: 'docx',
    extractedCount: fields.length,
  };
}

// ---------------------------------------------------------------------------
// Plain text extraction.
// ---------------------------------------------------------------------------
async function extractTxt(file: File): Promise<ProcessedDoc> {
  const text = await file.text();
  const lines = text.split('\n');
  const width = 816;
  const lineHeight = 24;
  const height = Math.max(1056, lines.length * lineHeight + 80);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  const backgroundUrl = canvas.toDataURL('image/png');

  const fields: EditableField[] = lines
    .map((line, idx) => ({
      id: crypto.randomUUID(),
      type: 'text' as const,
      value: line,
      x: 48,
      y: 48 + idx * lineHeight,
      width: Math.min(width - 96, Math.max(60, line.length * 8)),
      height: lineHeight,
      fontSize: 15,
      color: '#0a0908',
      page: 0,
    }))
    .filter((f) => f.value.trim().length > 0);

  return {
    originalUrl: backgroundUrl,
    fields,
    width,
    height,
    pages: [{ index: 0, backgroundUrl, width, height, fields }],
    source: 'txt',
    extractedCount: fields.length,
  };
}

// ---------------------------------------------------------------------------
// Image intake (OCR) — unchanged behavior, but returns the richer doc shape.
// ---------------------------------------------------------------------------
async function extractImage(file: File): Promise<ProcessedDoc> {
  let rawUrl = '';
  try {
    rawUrl = URL.createObjectURL(file);
  } catch {}

  let imgWidth = 800;
  let imgHeight = 600;
  let standardPngUrl = '';
  let imageLoaded = false;

  if (rawUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = rawUrl;
      imageLoaded = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), 7000);
        img.onload = () => {
          clearTimeout(timer);
          imgWidth = img.naturalWidth || 800;
          imgHeight = img.naturalHeight || 600;
          resolve(true);
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve(false);
        };
      });
      if (imageLoaded) {
        const norm = document.createElement('canvas');
        norm.width = imgWidth;
        norm.height = imgHeight;
        const ctx = norm.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
          standardPngUrl = norm.toDataURL('image/png');
        }
      }
    } catch (e) {
      console.warn('[FORGE] Image prep warning:', e);
    } finally {
      try {
        URL.revokeObjectURL(rawUrl);
      } catch {}
    }
  }

  if (!imageLoaded || !standardPngUrl) {
    const fb = document.createElement('canvas');
    fb.width = 800;
    fb.height = 600;
    const ctx = fb.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0908';
      ctx.fillRect(0, 0, 800, 600);
    }
    standardPngUrl = fb.toDataURL('image/png');
  }

  let fields: EditableField[] = [];
  if (imageLoaded && standardPngUrl) {
    try {
      const ocrJob = Tesseract.recognize(standardPngUrl, 'eng', {
        errorHandler: (err: any) => console.warn('[FORGE] OCR worker error:', err),
      });
      const timeout = new Promise<{ data: any }>((resolve) => setTimeout(() => resolve({ data: null }), 12000));
      const result: any = await Promise.race([ocrJob, timeout]);
      if (result?.data?.blocks?.length) {
        fields = result.data.blocks.flatMap((block: any) =>
          (block.paragraphs || []).flatMap((para: any) =>
            (para.lines || []).flatMap((line: any) =>
              (line.words || []).map((word: any) => ({
                id: crypto.randomUUID(),
                type: 'text' as const,
                value: word.text,
                x: word.bbox.x0,
                y: word.bbox.y0,
                width: Math.max(20, word.bbox.x1 - word.bbox.x0),
                height: Math.max(16, word.bbox.y1 - word.bbox.y0),
                fontSize: Math.max(12, word.bbox.y1 - word.bbox.y0),
                color: '#000000',
                page: 0,
              }))
            )
          )
        );
      }
    } catch (e) {
      console.warn('[FORGE] OCR skipped:', e);
    }
  }

  if (fields.length === 0) {
    fields = [
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: file.name.replace(/\.[^/.]+$/, ''),
        x: 60,
        y: 60,
        width: 300,
        height: 28,
        fontSize: 22,
        color: '#e8c96a',
        page: 0,
      },
    ];
  }

  return {
    originalUrl: standardPngUrl,
    fields,
    width: imgWidth,
    height: imgHeight,
    pages: [{ index: 0, backgroundUrl: standardPngUrl, width: imgWidth, height: imgHeight, fields }],
    source: 'image',
    extractedCount: fields.length,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function processFile(file: File): Promise<ProcessedDoc> {
  const name = (file.name || '').toLowerCase();
  const type = file.type || '';

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    try {
      return await extractPdf(file);
    } catch (e) {
      console.error('[FORGE] PDF extraction failed:', e);
      // Honest failure — no fabricated content. Fall through to a labelled error page.
      return errorDoc(file, 'PDF', 'The PDF could not be parsed. It may be encrypted or corrupted.');
    }
  }

  if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) {
    try {
      return await extractDocx(file);
    } catch (e) {
      console.error('[FORGE] DOCX extraction failed:', e);
      return errorDoc(file, 'Word document', 'The Word document could not be parsed.');
    }
  }

  if (type === 'text/plain' || name.endsWith('.txt') || name.endsWith('.md')) {
    return await extractTxt(file);
  }

  return await extractImage(file);
}

/** Honest error page — states what failed instead of inventing content. */
function errorDoc(file: File, kind: string, reason: string): ProcessedDoc {
  const width = 816;
  const height = 1056;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0a0908';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(201,168,76,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, width - 48, height - 48);
    ctx.fillStyle = '#C9A84C';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('FORGE // EXTRACTION FAILED', 48, 80);
    ctx.fillStyle = '#c4c0bb';
    ctx.font = '14px monospace';
    ctx.fillText(`${kind}: ${file.name}`, 48, 120);
    ctx.fillStyle = '#e8c96a';
    ctx.fillText(reason, 48, 160);
  }
  const backgroundUrl = canvas.toDataURL('image/png');
  const fields: EditableField[] = [
    {
      id: crypto.randomUUID(),
      type: 'text',
      value: `${kind} extraction failed`,
      x: 48,
      y: 220,
      width: 500,
      height: 30,
      fontSize: 20,
      color: '#e8c96a',
      page: 0,
    },
    {
      id: crypto.randomUUID(),
      type: 'text',
      value: reason,
      x: 48,
      y: 260,
      width: 680,
      height: 24,
      fontSize: 14,
      color: '#c4c0bb',
      page: 0,
    },
  ];
  return {
    originalUrl: backgroundUrl,
    fields,
    width,
    height,
    pages: [{ index: 0, backgroundUrl, width, height, fields }],
    source: 'unknown',
    extractedCount: 0,
  };
}

export async function exportAs(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpg' | 'pdf'
): Promise<Blob> {
  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
    return pdf.output('blob');
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      format === 'png' ? 'image/png' : 'image/jpeg',
      0.95
    );
  });
}

/** Export all pages of a multi-page document as a single PDF. */
export async function exportPagesAsPdf(
  pages: DocPage[],
  renderPage: (page: DocPage) => Promise<HTMLCanvasElement>
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  let pdf: any = null;
  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderPage(pages[i]);
    if (!pdf) {
      pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
    } else {
      pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'l' : 'p');
    }
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
  }
  return pdf.output('blob');
}
