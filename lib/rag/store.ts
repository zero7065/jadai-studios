// lib/rag/store.ts
// fs-backed, per-builder vector store for retrieval-augmented generation.
// Works with no external DB (dev / Render free tier) and mirrors to Supabase
// when available. DO NOT import from client components — use the /api/rag/* routes.
//
// Scalability note: cosine search runs in-process over each builder's own
// collection, so per-user corpus size (not total users) bounds query cost. That
// matches the "scale to 500+ users" target on a single node and keeps the hot
// path free of a vector DB. Swapping in pgvector later is a drop-in at
// `searchCollection`.

import fs from 'fs';
import path from 'path';
import { Chunk, chunkText } from './chunker';
import { embedText, cosineSim, EMBED_DIM } from './embed';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'rag_store.json');

export interface IndexedChunk {
  id: string;
  docId: string;
  scope: string;
  text: string;
  /** Base64-encoded Float32Array of the embedding. */
  vec: string;
  createdAt: string;
}

interface RagStore {
  /** builderId → chunks */
  builders: Record<string, IndexedChunk[]>;
}

const MAX_CHUNKS_PER_BUILDER = 2000;
const MAX_STORED_TEXT = 4000;

function readStore(): RagStore {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { builders: parsed.builders && typeof parsed.builders === 'object' ? parsed.builders : {} };
  } catch {
    return { builders: {} };
  }
}

function writeStore(store: RagStore): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = STORE_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(store));
    fs.renameSync(tmp, STORE_FILE);
  } catch (err) {
    console.warn('[RAG] fs write failed:', (err as Error).message);
  }
}

function encodeVec(vec: Float32Array): string {
  return Buffer.from(vec.buffer.slice(vec.byteOffset, vec.byteOffset + vec.byteLength)).toString('base64');
}

function decodeVec(b64: string): Float32Array {
  const buf = Buffer.from(b64, 'base64');
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}

/**
 * Ingests a document for a builder: chunks it, embeds each chunk, and upserts
 * by docId (re-ingesting the same docId replaces the previous version).
 * Returns the number of chunks indexed.
 */
export function ingestDocument(params: {
  builderId: string;
  docId: string;
  title?: string;
  text: string;
  scope?: string;
  chunkSize?: number;
}): { indexed: number; total: number } {
  const { builderId, docId, title, text, scope = 'oracle' } = params;
  if (!builderId || !docId || !text) return { indexed: 0, total: 0 };

  const chunks = chunkText(docId, text, { maxSize: params.chunkSize });
  if (!chunks.length) return { indexed: 0, total: 0 };

  const store = readStore();
  const existing = (store.builders[builderId] || []).filter((c) => c.docId !== docId);

  const now = new Date().toISOString();
  const indexed: IndexedChunk[] = chunks.map((c) => ({
    id: c.id,
    docId,
    scope,
    text: (title ? `${title}\n\n` : '').slice(0, 200) + c.text.slice(0, MAX_STORED_TEXT),
    vec: encodeVec(embedText((title ? title + ' ' : '') + c.text)),
    createdAt: now,
  }));

  // Cap per-builder corpus, dropping the oldest first.
  const merged = [...existing, ...indexed];
  const overflow = merged.length - MAX_CHUNKS_PER_BUILDER;
  const kept = overflow > 0 ? merged.slice(overflow) : merged;

  store.builders[builderId] = kept;
  writeStore(store);
  return { indexed: indexed.length, total: kept.length };
}

export interface SearchResult {
  id: string;
  docId: string;
  scope: string;
  text: string;
  score: number;
  createdAt: string;
}

/**
 * Ranks a builder's indexed chunks by cosine similarity to `query`.
 * Returns the top `k` matches above `minScore`.
 */
export function searchCollection(params: {
  builderId: string;
  query: string;
  k?: number;
  minScore?: number;
  scope?: string;
}): SearchResult[] {
  const { builderId, query, k = 5, minScore = 0.15, scope } = params;
  if (!builderId || !query) return [];

  const store = readStore();
  const chunks = store.builders[builderId] || [];
  if (!chunks.length) return [];

  const qVec = embedText(query);
  const scored: SearchResult[] = [];

  for (const c of chunks) {
    if (scope && c.scope && c.scope !== scope) continue;
    let sim: number;
    try {
      sim = cosineSim(qVec, decodeVec(c.vec));
    } catch {
      continue;
    }
    if (sim >= minScore) {
      scored.push({ id: c.id, docId: c.docId, scope: c.scope, text: c.text, score: sim, createdAt: c.createdAt });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

/** Lists indexed docs for a builder (id + chunk count), for UI management. */
export function listDocuments(builderId: string): Array<{ docId: string; chunks: number; createdAt: string }> {
  const store = readStore();
  const chunks = store.builders[builderId] || [];
  const byDoc = new Map<string, { docId: string; chunks: number; createdAt: string }>();
  for (const c of chunks) {
    const cur = byDoc.get(c.docId);
    if (cur) cur.chunks += 1;
    else byDoc.set(c.docId, { docId: c.docId, chunks: 1, createdAt: c.createdAt });
  }
  return [...byDoc.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Removes a single document's chunks. Returns how many were removed. */
export function deleteDocument(builderId: string, docId: string): number {
  const store = readStore();
  const before = store.builders[builderId] || [];
  const after = before.filter((c) => c.docId !== docId);
  const removed = before.length - after.length;
  if (removed > 0) {
    store.builders[builderId] = after;
    writeStore(store);
  }
  return removed;
}

/** Wipes all indexed chunks for a builder. Returns how many were removed. */
export function wipeBuilder(builderId: string): number {
  const store = readStore();
  const removed = (store.builders[builderId] || []).length;
  if (removed > 0) {
    delete store.builders[builderId];
    writeStore(store);
  }
  return removed;
}

export { EMBED_DIM };
