// lib/ai/memory.ts
// Unified builder memory for every PRIME touchpoint.
// One builderId, one fact store (IndexedDB + localStorage mirror via memory-device),
// one transcript store per scope, one request shape for all AI calls.

import {
  saveMemory,
  loadMemories,
  clearMemories,
  PrimeMemoryItem,
} from '../prime/memory-device';

export type MemoryFactType = 'profile' | 'preference' | 'insight' | 'goal' | 'context' | 'pattern';

export interface MemoryFact {
  type: MemoryFactType;
  key: string;
  value: string;
  confidence: number;
  source?: string;
  createdAt?: string;
}

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export interface AskPrimeOptions {
  prompt: string;
  systemPrompt?: string;
  moduleSlug?: string;
  /** Chat scope — transcripts are namespaced per scope (e.g. 'ultron', 'oracle', 'guide'). */
  scope?: string;
  persona?: string;
  temperature?: number;
  bypassCache?: boolean;
  /** Skip transcript persistence for one-off calls (e.g. background utilities). */
  ephemeral?: boolean;
  /** Override transcript-derived history (for UIs with their own message log). */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Override fact-derived memory (for UIs with their own memory panel). */
  memory?: Array<{ key: string; value: string }>;
}

export interface AskPrimeResult {
  text: string;
  provider?: string;
  cached?: boolean;
  fallbackTriggered?: boolean;
  error?: string;
}

export interface AskGroundedOptions {
  prompt: string;
  mode?: 'search' | 'maps' | 'standard';
  location?: { latitude: number; longitude: number } | null;
  systemPrompt?: string;
  scope?: string;
  ephemeral?: boolean;
}

export interface AskGroundedResult {
  text: string;
  sources: Array<Record<string, unknown>>;
  /** True when the grounded chain had no live providers (labelled offline response). */
  offline?: boolean;
  offlineReason?: string;
}

const BUILDER_ID_KEY = 'jadai_builder_id';
const TRANSCRIPT_PREFIX = 'jadai_transcript_';
const MAX_STORED_TRANSCRIPT = 40;
const HISTORY_FOR_PROMPT = 10;
const MAX_FACTS_FOR_PROMPT = 14;
const WELCOME_NAME_FACT = 'display_name';

const isBrowser = () => typeof window !== 'undefined';

// ---------------------------------------------------------------------------
// Builder identity
// ---------------------------------------------------------------------------

export function getBuilderId(): string {
  if (!isBrowser()) return 'server';
  try {
    let id = localStorage.getItem(BUILDER_ID_KEY);
    if (!id || id.length < 8) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? `bld_${crypto.randomUUID()}`
          : `bld_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(BUILDER_ID_KEY, id);
    }
    return id;
  } catch {
    return 'bld_anonymous';
  }
}

// ---------------------------------------------------------------------------
// Transcripts (per scope, localStorage — synchronous and fast)
// ---------------------------------------------------------------------------

function transcriptKey(scope: string): string {
  return `${TRANSCRIPT_PREFIX}${scope.replace(/[^a-z0-9_-]/gi, '_')}`;
}

export function getTranscript(scope: string, lastN?: number): TranscriptEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(transcriptKey(scope));
    const list: TranscriptEntry[] = raw ? JSON.parse(raw) : [];
    return lastN ? list.slice(-lastN) : list;
  } catch {
    return [];
  }
}

export function appendTranscript(
  scope: string,
  role: TranscriptEntry['role'],
  content: string
): void {
  if (!isBrowser() || !content) return;
  try {
    const key = transcriptKey(scope);
    const raw = localStorage.getItem(key);
    const list: TranscriptEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ role, content: content.slice(0, 4000), ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(list.slice(-MAX_STORED_TRANSCRIPT)));
  } catch {
    // Non-blocking — memory must never break a conversation.
  }
}

export function clearTranscript(scope: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(transcriptKey(scope));
  } catch {
    // ignore
  }
}

export function listTranscriptScopes(): string[] {
  if (!isBrowser()) return [];
  try {
    const scopes: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(TRANSCRIPT_PREFIX)) scopes.push(k.slice(TRANSCRIPT_PREFIX.length));
    }
    return scopes;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Facts (IndexedDB + localStorage mirror through memory-device)
// ---------------------------------------------------------------------------

export async function saveFact(
  type: MemoryFactType,
  key: string,
  value: string,
  confidence = 0.85,
  source?: string
): Promise<void> {
  if (!isBrowser()) return;
  if (!value || value.length > 600) return;
  const builderId = getBuilderId();
  try {
    await saveMemory(builderId, { type, key: key.slice(0, 64), value, confidence });
    if (source) {
      // Store provenance as a lightweight sibling fact only once.
      const existing = await getFacts();
      if (!existing.some((f) => f.key === `${key}__source`)) {
        await saveMemory(builderId, {
          type: 'context',
          key: `${key}__source`.slice(0, 64),
          value: source,
          confidence: 0.6,
        });
      }
    }
  } catch {
    // Non-blocking
  }
}

export async function getFacts(): Promise<MemoryFact[]> {
  if (!isBrowser()) return [];
  try {
    const items: PrimeMemoryItem[] = await loadMemories(getBuilderId());
    const byKey = new Map<string, MemoryFact>();
    for (const item of items) {
      if (item.key.endsWith('__source')) continue;
      const prev = byKey.get(item.key);
      if (
        !prev ||
        item.confidence > prev.confidence ||
        (item.createdAt && prev.createdAt && item.createdAt > prev.createdAt)
      ) {
        byKey.set(item.key, {
          type: item.type,
          key: item.key,
          value: item.value,
          confidence: item.confidence,
          createdAt: item.createdAt,
        });
      }
    }
    return Array.from(byKey.values()).sort((a, b) => b.confidence - a.confidence);
  } catch {
    return [];
  }
}

export async function getFact(key: string): Promise<MemoryFact | null> {
  const facts = await getFacts();
  return facts.find((f) => f.key === key) || null;
}

// ---------------------------------------------------------------------------
// Context assembly — the payload every AI call carries
// ---------------------------------------------------------------------------

export interface MemoryPayload {
  builderId: string;
  facts: Array<{ key: string; value: string; confidence: number }>;
  history: Array<{ role: string; content: string }>;
}

export async function buildMemoryPayload(scope: string): Promise<MemoryPayload> {
  const facts = await getFacts();
  const transcript = getTranscript(scope, HISTORY_FOR_PROMPT);
  return {
    builderId: getBuilderId(),
    facts: facts.slice(0, MAX_FACTS_FOR_PROMPT).map((f) => ({
      key: f.key,
      value: f.value,
      confidence: f.confidence,
    })),
    history: transcript.map((t) => ({ role: t.role, content: t.content })),
  };
}

// ---------------------------------------------------------------------------
// Personalized openers
// ---------------------------------------------------------------------------

export async function primeWelcome(agent: string, scope: string): Promise<string> {
  const transcript = getTranscript(scope);
  const hasHistory = transcript.some((t) => t.role === 'user');
  const nameFact = await getFact(WELCOME_NAME_FACT);
  const name = nameFact?.value?.trim();
  if (hasHistory && name) {
    return `Welcome back, ${name}. ${agent} online — continuing from where we left off. What are we building?`;
  }
  if (hasHistory) {
    return `${agent} online. Your previous transmissions are still in memory — continuing where we left off. What are we building?`;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Transport — one request shape for every AI surface
// ---------------------------------------------------------------------------

function normalizeReply(data: any): string {
  return (
    data?.data?.text ||
    data?.text ||
    data?.response ||
    ''
  );
}

export async function askPrime(options: AskPrimeOptions): Promise<AskPrimeResult> {
  const scope = options.scope || options.moduleSlug || 'oracle';
  const payload = await buildMemoryPayload(scope);

  const body: Record<string, unknown> = {
    prompt: options.prompt,
    systemPrompt: options.systemPrompt,
    moduleSlug: options.moduleSlug || scope,
    persona: options.persona,
    temperature: options.temperature,
    bypassCache: options.bypassCache,
    builderId: payload.builderId,
    scope,
    history: options.history ?? payload.history,
    memory: options.memory ?? payload.facts,
  };

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || (data.success === false && data.error)) {
      throw new Error(data.error || `AI request failed (${res.status})`);
    }

    const text = normalizeReply(data) || 'Transmission received. Continue.';

    if (!options.ephemeral) {
      appendTranscript(scope, 'user', options.prompt);
      appendTranscript(scope, 'assistant', text);
    }

    return {
      text,
      provider: data.data?.provider,
      cached: data.data?.cached,
      fallbackTriggered: data.data?.fallbackTriggered,
      error: data.data?.error,
    };
  } catch (err: any) {
    return {
      text: '',
      error: err?.message || 'Signal lost. Retry the transmission.',
    };
  }
}

/**
 * Streaming variant of askPrime — consumes the SSE endpoint
 * (/api/ai/chat/stream) and invokes onToken for each delta.
 * Falls back to the buffered askPrime if the stream errors out.
 */
export async function askPrimeStream(
  options: AskPrimeOptions & {
    onToken: (delta: string) => void;
    signal?: AbortSignal;
  }
): Promise<AskPrimeResult> {
  const scope = options.scope || options.moduleSlug || 'oracle';
  const payload = await buildMemoryPayload(scope);

  const body: Record<string, unknown> = {
    prompt: options.prompt,
    systemPrompt: options.systemPrompt,
    moduleSlug: options.moduleSlug || scope,
    persona: options.persona,
    temperature: options.temperature,
    history: options.history ?? payload.history,
    memory: options.memory ?? payload.facts,
  };

  try {
    const res = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Stream request failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let provider = 'groq';
    let error: string | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';
      for (const chunk of chunks) {
        const eventMatch = chunk.match(/^event: (.+)$/m);
        const dataMatch = chunk.match(/^data: (.+)$/m);
        if (!eventMatch || !dataMatch) continue;
        const event = eventMatch[1].trim();
        let json: any;
        try {
          json = JSON.parse(dataMatch[1]);
        } catch {
          continue;
        }
        if (event === 'token' && json.delta) {
          fullText += json.delta;
          options.onToken(json.delta);
        } else if (event === 'done') {
          provider = json.provider || provider;
        } else if (event === 'error') {
          error = json.error || 'Stream error';
        }
      }
    }

    if (error) throw new Error(error);

    const text = fullText || 'Transmission received. Continue.';
    if (!options.ephemeral) {
      appendTranscript(scope, 'user', options.prompt);
      appendTranscript(scope, 'assistant', text);
    }
    return { text, provider };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { text: '', provider: 'aborted', error: 'aborted' };
    }
    // Stream failed mid-flight — fall back to buffered askPrime (same payload).
    const { onToken: _omit, signal: _omitSignal, ...rest } = options;
    return askPrime(rest);
  }
}

export async function askGrounded(options: AskGroundedOptions): Promise<AskGroundedResult> {
  const scope = options.scope || 'ultron';
  const payload = await buildMemoryPayload(scope);

  try {
    const res = await fetch('/api/ai/grounded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: options.prompt,
        mode: options.mode || 'search',
        location: options.location || undefined,
        systemPrompt: options.systemPrompt,
        builderId: payload.builderId,
        scope,
        history: payload.history,
        memory: payload.facts,
      }),
    });
    const data = await res.json();
    if (!res.ok || (data.success === false && data.error)) {
      throw new Error(data.error || `Grounded request failed (${res.status})`);
    }

    const text = data.text || 'Grounded intelligence retrieved successfully.';
    const sources = data.sources || [];

    if (!options.ephemeral) {
      appendTranscript(scope, 'user', options.prompt);
      appendTranscript(scope, 'assistant', text);
    }

    return { text, sources, offline: Boolean(data.offline), offlineReason: data.offlineReason };
  } catch {
    return { text: '', sources: [], offline: true, offlineReason: 'request failed' };
  }
}

// ---------------------------------------------------------------------------
// Server sync + privacy
// ---------------------------------------------------------------------------

export async function fetchServerMemory(): Promise<{
  facts: MemoryFact[];
  transcript: TranscriptEntry[];
}> {
  try {
    const res = await fetch(`/api/ai/memory?builderId=${encodeURIComponent(getBuilderId())}`);
    if (!res.ok) return { facts: [], transcript: [] };
    const data = await res.json();
    return { facts: data.facts || [], transcript: data.transcript || [] };
  } catch {
    return { facts: [], transcript: [] };
  }
}

/** Full privacy wipe: facts (IndexedDB + mirror), transcripts, and rotate builderId. */
export async function clearAllMemory(): Promise<void> {
  if (!isBrowser()) return;
  const previousBuilderId = getBuilderId();
  try {
    await clearMemories(previousBuilderId);
  } catch {
    // ignore
  }
  try {
    const scopes = listTranscriptScopes();
    for (const scope of scopes) localStorage.removeItem(`${TRANSCRIPT_PREFIX}${scope}`);
    localStorage.removeItem(BUILDER_ID_KEY);
    // Legacy per-surface keys from before the unified layer
    localStorage.removeItem('jadai-human-chat-messages');
    localStorage.removeItem('guide_context');
    localStorage.removeItem('prime_guide_context');
  } catch {
    // ignore
  }
  // Fire-and-forget server-side wipe (best effort) — uses the previous id
  try {
    await fetch('/api/ai/memory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ builderId: previousBuilderId }),
    });
  } catch {
    // ignore
  }
}
