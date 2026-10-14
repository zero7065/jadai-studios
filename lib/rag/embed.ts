// lib/rag/embed.ts
// Local, deterministic text embeddings for retrieval.
//
// Design: hashed character n-gram bag → fixed-size unit vector. No model, no
// network call, no API key. Same input always yields the same vector in every
// process, so the index is stable across restarts. Cosine similarity over these
// vectors ranks semantically-overlapping text well enough for RAG recall, and
// the whole path is swappable for a real embedding API later.

export const EMBED_DIM = 384;

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'at', 'by', 'for', 'with', 'to', 'in',
  'on', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'this', 'that', 'as', 'from', 'so',
]);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function hashToken(token: string): number {
  // FNV-1a 32-bit — fast, well-distributed, dependency-free.
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Returns a unit-normalized embedding for `text`.
 * Signed feature hashing keeps the vector unbiased as vocab grows.
 */
export function embedText(text: string): Float32Array {
  const vec = new Float32Array(EMBED_DIM);
  const norm = normalize(text);
  if (!norm) return vec;

  const words = norm.split(' ').filter((w) => w.length > 1 && !STOPWORDS.has(w));
  const grams: string[] = [];

  for (const w of words) {
    grams.push(w);
    // Character trigrams capture morphological overlap (e.g. "connect" / "connection").
    if (w.length >= 4) {
      for (let i = 0; i <= w.length - 3; i++) grams.push(`#${w.slice(i, i + 3)}`);
    }
    // Bigram word pairs capture short phrasal overlap.
  }
  for (let i = 0; i < words.length - 1; i++) grams.push(`${words[i]}_${words[i + 1]}`);

  for (const g of grams) {
    const h = hashToken(g);
    const idx = h % EMBED_DIM;
    const sign = (h & 0x80000000) !== 0 ? -1 : 1;
    vec[idx] += sign;
  }

  // L2 normalize → cosine similarity becomes a plain dot product.
  let sumSq = 0;
  for (let i = 0; i < EMBED_DIM; i++) sumSq += vec[i] * vec[i];
  const mag = Math.sqrt(sumSq);
  if (mag > 0) {
    for (let i = 0; i < EMBED_DIM; i++) vec[i] /= mag;
  }
  return vec;
}

/** Cosine similarity between two unit vectors (dot product). */
export function cosineSim(a: Float32Array, b: Float32Array): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot;
}
