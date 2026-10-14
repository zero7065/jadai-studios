// lib/rag/chunker.ts
// Splits documents into overlapping chunks for retrieval-augmented generation.
// Deterministic and dependency-free so it runs identically in dev and prod.

export interface Chunk {
  id: string;
  docId: string;
  index: number;
  text: string;
  /** Character offset of the chunk start within the source document. */
  start: number;
  end: number;
}

export interface ChunkOptions {
  /** Target chunk size in characters. Default 1200 (~300 tokens). */
  maxSize?: number;
  /** Overlap between consecutive chunks in characters. Default 200. */
  overlap?: number;
}

/**
 * Splits `text` into overlapping chunks, preferring paragraph (\\n\\n), then
 * sentence (.) boundaries so cuts land on natural breaks.
 */
export function chunkText(docId: string, text: string, opts: ChunkOptions = {}): Chunk[] {
  const maxSize = Math.max(200, opts.maxSize ?? 1200);
  const overlap = Math.max(0, Math.min(opts.overlap ?? 200, Math.floor(maxSize / 2)));
  const clean = text.replace(/\r\n/g, '\n').trim();
  if (!clean) return [];

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < clean.length) {
    let end = Math.min(start + maxSize, clean.length);

    // Snap the end to a natural boundary if we are not at the document end.
    if (end < clean.length) {
      const window = clean.slice(start, end);
      const paraBreak = window.lastIndexOf('\n\n');
      const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '));
      const best = paraBreak > maxSize * 0.4 ? paraBreak : sentenceEnd > maxSize * 0.4 ? sentenceEnd : -1;
      if (best > 0) end = start + best + 1;
    }

    const slice = clean.slice(start, end).trim();
    if (slice) {
      chunks.push({
        id: `${docId}#${index}`,
        docId,
        index,
        text: slice,
        start,
        end,
      });
      index += 1;
    }

    if (end >= clean.length) break;
    // Step forward by (chunk size - overlap) to create overlapping windows.
    const next = end - overlap;
    start = next > start ? next : end;
  }

  return chunks;
}
