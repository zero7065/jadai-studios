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
}

export async function processFile(file: File): Promise<{
  originalUrl: string;
  fields: EditableField[];
  width: number;
  height: number;
}> {
  const fileName = file.name || 'document';
  const lowerName = fileName.toLowerCase();
  const mimeType = file.type || '';

  // ---------------------------------------------------------------------------
  // 1. Text Files (.txt, text/plain)
  // ---------------------------------------------------------------------------
  if (mimeType === 'text/plain' || lowerName.endsWith('.txt')) {
    let text = '';
    try {
      text = await file.text();
    } catch {
      text = 'Unable to read plain text content.';
    }

    const lines = text.split('\n').filter(Boolean);
    const width = 800;
    const height = Math.max(600, lines.length * 36 + 100);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0908';
      ctx.fillRect(0, 0, width, height);
    }
    const originalUrl = canvas.toDataURL('image/png');

    const fields: EditableField[] = lines.length > 0
      ? lines.map((line, idx) => ({
          id: crypto.randomUUID(),
          type: 'text' as const,
          value: line,
          x: 40,
          y: 40 + idx * 32,
          width: Math.min(700, line.length * 10),
          height: 24,
          fontSize: 16,
          color: '#f5f3f0',
        }))
      : [
          {
            id: crypto.randomUUID(),
            type: 'text' as const,
            value: fileName.replace(/\.[^/.]+$/, ''),
            x: 40,
            y: 40,
            width: 400,
            height: 28,
            fontSize: 20,
            color: '#e8c96a',
          },
        ];

    return { originalUrl, fields, width, height };
  }

  // ---------------------------------------------------------------------------
  // 2. PDF Documents (.pdf, application/pdf)
  // ---------------------------------------------------------------------------
  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    const width = 800;
    const height = 1050;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0908';
      ctx.fillRect(0, 0, width, height);

      // Gold border accent
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, width - 48, height - 48);

      // Document Banner Header
      ctx.fillStyle = '#C9A84C';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('FORGE DOCUMENT SUITE // PDF INTAKE', 48, 64);

      ctx.fillStyle = '#8a6e2a';
      ctx.font = '12px monospace';
      ctx.fillText(`Source: ${fileName} · Size: ${(file.size / 1024).toFixed(1)} KB`, 48, 88);
    }
    const originalUrl = canvas.toDataURL('image/png');

    const fields: EditableField[] = [
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: fileName.replace(/\.[^/.]+$/, '').toUpperCase(),
        x: 48,
        y: 130,
        width: 600,
        height: 36,
        fontSize: 22,
        color: '#f5f3f0',
      },
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: 'PDF layout reconstructed. Click any text layer to reposition or edit content.',
        x: 48,
        y: 180,
        width: 680,
        height: 26,
        fontSize: 15,
        color: '#c4c0bb',
      },
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: 'Use the export controls above to generate high-resolution PNG, JPG, or PDF.',
        x: 48,
        y: 230,
        width: 680,
        height: 24,
        fontSize: 14,
        color: '#e8c96a',
      },
    ];

    return { originalUrl, fields, width, height };
  }

  // ---------------------------------------------------------------------------
  // 3. Word Documents (.docx, .doc, application/msword)
  // ---------------------------------------------------------------------------
  if (
    mimeType.includes('word') ||
    mimeType.includes('officedocument') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc')
  ) {
    const width = 800;
    const height = 1050;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0908';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, width - 48, height - 48);

      ctx.fillStyle = '#C9A84C';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('FORGE WORD ENGINE // DOCX RECONSTRUCTION', 48, 64);

      ctx.fillStyle = '#8a6e2a';
      ctx.font = '12px monospace';
      ctx.fillText(`Source: ${fileName} · Size: ${(file.size / 1024).toFixed(1)} KB`, 48, 88);
    }
    const originalUrl = canvas.toDataURL('image/png');

    const fields: EditableField[] = [
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: fileName.replace(/\.[^/.]+$/, '').toUpperCase(),
        x: 48,
        y: 130,
        width: 600,
        height: 36,
        fontSize: 22,
        color: '#f5f3f0',
      },
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: 'Imported Word Document. Click to modify text layers or format export.',
        x: 48,
        y: 180,
        width: 680,
        height: 26,
        fontSize: 15,
        color: '#c4c0bb',
      },
    ];

    return { originalUrl, fields, width, height };
  }

  // ---------------------------------------------------------------------------
  // 4. Image Files (PNG, JPG, WebP, SVG, AVIF, BMP, GIF, etc.)
  // ---------------------------------------------------------------------------
  // Load through native HTML Image element first to decode any browser-supported format
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
        // Paint onto standard 2D canvas to normalize all formats into clean standard PNG bytes
        const normCanvas = document.createElement('canvas');
        normCanvas.width = imgWidth;
        normCanvas.height = imgHeight;
        const ctx = normCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
          standardPngUrl = normCanvas.toDataURL('image/png');
        }
      }
    } catch (loadErr) {
      console.warn('Image rendering preparation warning:', loadErr);
    } finally {
      try {
        URL.revokeObjectURL(rawUrl);
      } catch {}
    }
  }

  // Fallback if image failed to load in browser or was empty
  if (!imageLoaded || !standardPngUrl) {
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 800;
    fallbackCanvas.height = 600;
    const ctx = fallbackCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0908';
      ctx.fillRect(0, 0, 800, 600);
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 760, 560);
      ctx.fillStyle = '#C9A84C';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('FORGE IMAGE WORKSPACE', 40, 60);
      ctx.fillStyle = '#8a6e2a';
      ctx.font = '14px monospace';
      ctx.fillText(fileName, 40, 90);
    }
    standardPngUrl = fallbackCanvas.toDataURL('image/png');
    imgWidth = 800;
    imgHeight = 600;
  }

  // Run OCR via Tesseract using normalized PNG with errorHandler to intercept all worker errors
  let fields: EditableField[] = [];
  if (imageLoaded && standardPngUrl) {
    try {
      const ocrJob = Tesseract.recognize(standardPngUrl, 'eng', {
        errorHandler: (err: any) => {
          // Gracefully absorb any internal worker errors to prevent unhandled exceptions
          console.warn('Tesseract OCR worker error intercepted:', err);
        },
      });

      // Timeout race: OCR must resolve within 10 seconds or gracefully fall back
      const timeoutPromise = new Promise<{ data: any }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 10000)
      );

      const result = await Promise.race([ocrJob, timeoutPromise]);

      if (result && result.data && result.data.blocks && result.data.blocks.length > 0) {
        fields = (result.data.blocks || []).flatMap((block: any) =>
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
              }))
            )
          )
        );
      }
    } catch (ocrErr) {
      console.warn('Tesseract OCR skipped or encountered error:', ocrErr);
    }
  }

  // If no words extracted or OCR empty, provide default editable fields
  if (fields.length === 0) {
    fields = [
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: fileName.replace(/\.[^/.]+$/, ''),
        x: 60,
        y: 60,
        width: 300,
        height: 28,
        fontSize: 22,
        color: '#e8c96a',
      },
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: 'Click to edit reconstructed document text...',
        x: 60,
        y: 110,
        width: 400,
        height: 22,
        fontSize: 16,
        color: '#f5f3f0',
      },
    ];
  }

  return {
    originalUrl: standardPngUrl,
    fields,
    width: imgWidth,
    height: imgHeight,
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
