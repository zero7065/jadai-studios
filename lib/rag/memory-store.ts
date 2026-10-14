// lib/rag/memory-store.ts
// fs-backed builder memory (facts) that works with no Supabase configured.
// Mirrors the ai_memories table shape so a later Supabase sync is a no-brainer.
// DO NOT import from client components — use the /api/ai/memory routes.

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'ai_memory.json');

export type MemoryType = 'profile' | 'goal' | 'preference' | 'pattern' | 'insight' | 'context';

export interface MemoryFactRecord {
  builderId: string;
  type: MemoryType;
  key: string;
  value: string;
  confidence: number;
  sourceModule: string;
  updatedAt: string;
}

interface MemoryStore {
  /** `${builderId}` → key → fact */
  builders: Record<string, Record<string, MemoryFactRecord>>;
}

const MAX_FACTS_PER_BUILDER = 200;
const MAX_VALUE_LEN = 600;

function readStore(): MemoryStore {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { builders: parsed.builders && typeof parsed.builders === 'object' ? parsed.builders : {} };
  } catch {
    return { builders: {} };
  }
}

function writeStore(store: MemoryStore): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = STORE_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
    fs.renameSync(tmp, STORE_FILE);
  } catch (err) {
    console.warn('[MEMORY] fs write failed:', (err as Error).message);
  }
}

/** Upserts a fact (keyed on builderId+key). Higher confidence wins on conflict. */
export function upsertMemoryFact(params: {
  builderId: string;
  type?: MemoryType;
  key: string;
  value: string;
  confidence?: number;
  sourceModule?: string;
}): MemoryFactRecord | null {
  const { builderId } = params;
  const key = String(params.key || '').trim().slice(0, 64);
  const value = String(params.value || '').trim().slice(0, MAX_VALUE_LEN);
  if (!builderId || !key || !value) return null;

  const store = readStore();
  const bucket = store.builders[builderId] || (store.builders[builderId] = {});
  const existing = bucket[key];
  const confidence = Math.min(1, Math.max(0, Number(params.confidence) || 0.8));

  if (existing && existing.confidence > confidence) {
    return existing; // Keep the stronger fact.
  }

  const record: MemoryFactRecord = {
    builderId,
    type: params.type || inferType(key),
    key,
    value,
    confidence,
    sourceModule: params.sourceModule || 'memory-engine',
    updatedAt: new Date().toISOString(),
  };
  bucket[key] = record;

  // Cap corpus, dropping the lowest-confidence facts first.
  const keys = Object.keys(bucket);
  if (keys.length > MAX_FACTS_PER_BUILDER) {
    keys
      .sort((a, b) => bucket[a].confidence - bucket[b].confidence)
      .slice(0, keys.length - MAX_FACTS_PER_BUILDER)
      .forEach((k) => delete bucket[k]);
  }

  writeStore(store);
  return record;
}

/** Returns a builder's facts, highest confidence first. */
export function getMemoryFacts(builderId: string, limit = 40): MemoryFactRecord[] {
  if (!builderId) return [];
  const bucket = readStore().builders[builderId] || {};
  return Object.values(bucket)
    .sort((a, b) => b.confidence - a.confidence || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

/** Deletes one fact by key. Returns true if removed. */
export function deleteMemoryFact(builderId: string, key: string): boolean {
  const store = readStore();
  const bucket = store.builders[builderId];
  if (!bucket || !bucket[key]) return false;
  delete bucket[key];
  writeStore(store);
  return true;
}

/** Wipes all facts for a builder. Returns count removed. */
export function wipeMemory(builderId: string): number {
  const store = readStore();
  const bucket = store.builders[builderId];
  if (!bucket) return 0;
  const n = Object.keys(bucket).length;
  delete store.builders[builderId];
  writeStore(store);
  return n;
}

function inferType(key: string): MemoryType {
  const k = key.toLowerCase();
  if (k.includes('name') || k.includes('role') || k.includes('location') || k.includes('company')) return 'profile';
  if (k.includes('ambition') || k.includes('goal') || k.includes('building') || k.includes('project')) return 'goal';
  if (k.includes('prefer') || k.includes('style') || k.includes('voice') || k.includes('tone')) return 'preference';
  if (k.includes('weak') || k.includes('blind') || k.includes('pattern') || k.includes('habit')) return 'pattern';
  return 'insight';
}
