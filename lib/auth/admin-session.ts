import crypto from 'crypto';

/**
 * SERVER-ONLY admin session primitives.
 * - HMAC-SHA256 signed, time-boxed bearer tokens (also set as httpOnly cookies)
 * - scrypt password hashing (no native deps)
 *
 * Env:
 *   SESSION_SECRET        required in production (>= 32 chars)
 *   ADMIN_PASSWORD_HASH   scrypt hash produced by scripts/hash-admin-password.mjs
 */

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const DEV_SECRET = 'jadai-dev-only-session-secret-do-not-use-in-prod';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.trim().length >= 32) return secret.trim();
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set to a random value of at least 32 characters in production');
  }
  return DEV_SECRET;
}

function hmac(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export interface AdminSession {
  email: string;
  exp: number;
}

export function signAdminToken(email: string): { token: string; expiresAt: Date } {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ email, exp }), 'utf8').toString('base64url');
  const signature = hmac(payload, getSessionSecret());
  return { token: `${payload}.${signature}`, expiresAt: new Date(exp) };
}

export function verifyAdminToken(token: string | undefined | null): AdminSession | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = hmac(payload, getSessionSecret());
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    if (!session?.email || typeof session.exp !== 'number') return null;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const N = 16384;
  const r = 8;
  const p = 1;
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string | undefined | null): boolean {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  const N = parseInt(nStr, 10);
  const r = parseInt(rStr, 10);
  const p = parseInt(pStr, 10);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const derived = crypto.scryptSync(password, salt, expected.length, { N, r, p });
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export const ADMIN_COOKIE_NAME = 'jadai_admin_token';

export function buildAdminCookie(token: string, expiresAt: Date): string {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Expires=${expiresAt.toUTCString()}`,
    'Max-Age=86400',
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function buildClearAdminCookie(): string {
  const parts = [`${ADMIN_COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}
