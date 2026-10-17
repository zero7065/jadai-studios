// Server-side admin credential store — fs-backed, server-only.
// Holds an editable admin email + password hash so the login flow can honor
// runtime changes without a redeploy. Env (.env) values act as the bootstrap
// fallback on first boot / fresh clones. DO NOT import from client components.

import fs from 'fs';
import path from 'path';
import { withStoreLock } from '../utils/storeLock';

import { getDataDir } from './dataDir';

const DATA_DIR = getDataDir();
const STORE_FILE = path.join(DATA_DIR, 'admin-credentials.json');

export interface AdminCredentials {
  email: string;
  passwordHash: string;
  recoveryCode: string;
  updatedAt: string;
}

interface CredentialStore {
  credentials: AdminCredentials | null;
}

function ensureStore(): CredentialStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ credentials: null }, null, 2));
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return { credentials: parsed.credentials || null };
  } catch {
    return { credentials: null };
  }
}

function persist(store: CredentialStore): void {
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

/**
 * Returns the admin email: fs override if present, else env, else the
 * hardcoded legacy default. This is the single source of truth the login
 * route should compare a submitted email against.
 */
export function getAdminEmail(envFallback: string): string {
  const store = ensureStore();
  if (store.credentials?.email) return store.credentials.email.toLowerCase();
  return envFallback.toLowerCase();
}

/**
 * Returns the admin password hash: fs override if present, else env.
 * Empty string when neither is configured.
 */
export function getAdminPasswordHash(envFallback: string | undefined): string {
  const store = ensureStore();
  if (store.credentials?.passwordHash) return store.credentials.passwordHash;
  return envFallback || '';
}

/**
 * Returns the stored 4-digit recovery passcode (terminal gate), or null when
 * none has been minted yet. The server mints one lazily via setAdminRecoveryCode.
 */
export function getAdminRecoveryCode(): string | null {
  const store = ensureStore();
  return store.credentials?.recoveryCode || null;
}

/** Persists the 4-digit recovery passcode used by the recovery terminal. */
export async function setAdminRecoveryCode(code: string): Promise<void> {
  await withStoreLock('admin-credentials', () => {
    const s = ensureStore();
    const current = s.credentials;
    s.credentials = {
      email: current?.email || '',
      passwordHash: current?.passwordHash || '',
      recoveryCode: code,
      updatedAt: new Date().toISOString(),
    };
    persist(s);
  });
}

/** Overwrites the stored admin email + hash. Used by the credentials endpoint. */
export async function setAdminCredentials(email: string, passwordHash: string): Promise<AdminCredentials> {
  const existing = ensureStore().credentials;
  const record: AdminCredentials = {
    email: email.toLowerCase(),
    passwordHash,
    recoveryCode: existing?.recoveryCode || '',
    updatedAt: new Date().toISOString(),
  };
  await withStoreLock('admin-credentials', () => {
    const s = ensureStore();
    s.credentials = record;
    persist(s);
  });
  return record;
}
