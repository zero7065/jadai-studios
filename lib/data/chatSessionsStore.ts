// Server-side chat session store — fs-backed, server-only.
// Persists PRIME conversations per builder so history survives refresh and
// sessions resume exactly where they left off. DO NOT import from client.

import fs from 'fs';
import path from 'path';
import { withStoreLock } from '../utils/storeLock';

import { getDataDir } from './dataDir';

const DATA_DIR = getDataDir();
const STORE_FILE = path.join(DATA_DIR, 'chat-sessions.json');

const MAX_SESSIONS_PER_USER = 100;
const MAX_MESSAGES_PER_SESSION = 200;
const MAX_CONTENT_CHARS = 32_000;

export interface StoredChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  provider?: string;
}

export interface StoredChatSession {
  id: string;
  builderId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredChatMessage[];
}

interface SessionsStore {
  sessions: StoredChatSession[];
}

function ensureStore(): SessionsStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ sessions: [] }, null, 2));
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return { sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [] };
  } catch {
    return { sessions: [] };
  }
}

function persist(store: SessionsStore): void {
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

const uid = () => `csess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const mid = () => `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function listSessions(builderId: string) {
  return ensureStore()
    .sessions.filter((s) => s.builderId === builderId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      messageCount: s.messages.length,
    }));
}

export function getSession(builderId: string, id: string): StoredChatSession | null {
  return ensureStore().sessions.find((s) => s.id === id && s.builderId === builderId) || null;
}

export async function createSession(builderId: string, title?: string): Promise<StoredChatSession> {
  const session: StoredChatSession = {
    id: uid(),
    builderId,
    title: (title || 'New session').slice(0, 120),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  await withStoreLock('chat-sessions', () => {
    const s = ensureStore();
    s.sessions.unshift(session);
    const mine = s.sessions.filter((x) => x.builderId === builderId);
    if (mine.length > MAX_SESSIONS_PER_USER) {
      const drop = new Set(mine.slice(MAX_SESSIONS_PER_USER).map((x) => x.id));
      s.sessions = s.sessions.filter((x) => !drop.has(x.id));
    }
    persist(s);
  });
  return session;
}

export async function appendMessages(
  builderId: string,
  sessionId: string,
  messages: Array<{ role: string; content: string; provider?: string }>
): Promise<StoredChatSession | null> {
  return withStoreLock('chat-sessions', () => {
    const s = ensureStore();
    const sess = s.sessions.find((x) => x.id === sessionId && x.builderId === builderId);
    if (!sess) return null;
    const now = new Date().toISOString();
    for (const m of messages) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
      const content = String(m.content || '').slice(0, MAX_CONTENT_CHARS);
      if (!content) continue;
      sess.messages.push({
        id: mid(),
        role: m.role,
        content,
        createdAt: now,
        provider: typeof m.provider === 'string' ? m.provider.slice(0, 40) : undefined,
      });
    }
    if (sess.messages.length > MAX_MESSAGES_PER_SESSION) {
      sess.messages = sess.messages.slice(-MAX_MESSAGES_PER_SESSION);
    }
    sess.updatedAt = now;
    if (sess.title === 'New session') {
      const firstUser = sess.messages.find((m) => m.role === 'user');
      if (firstUser) sess.title = firstUser.content.slice(0, 60);
    }
    persist(s);
    return sess;
  });
}

export async function deleteSession(builderId: string, id: string): Promise<boolean> {
  return withStoreLock('chat-sessions', () => {
    const s = ensureStore();
    const before = s.sessions.length;
    s.sessions = s.sessions.filter((x) => !(x.id === id && x.builderId === builderId));
    persist(s);
    return s.sessions.length < before;
  });
}
