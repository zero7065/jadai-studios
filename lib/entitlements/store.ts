// Server-side entitlement store — fs-backed with optional Supabase dual-write.
// Survives restarts and works when Supabase is unconfigured (dev / Render free tier).
// DO NOT import from client components — use /api/account/tier, /api/paystack/*, /api/templates/*.

import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '../supabase/admin';
import { withStoreLock, withStoreLockSync } from '../utils/storeLock';

import { getDataDir } from '../data/dataDir';

const DATA_DIR = getDataDir();
const STORE_FILE = path.join(DATA_DIR, 'entitlements.json');

export interface EntitlementRecord {
  id: string;
  userId: string | null;
  email: string | null;
  tier: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  interval: string;
  amountMinor: number;
  currency: string;
  reference: string;
  startedAt: string;
  expiresAt: string;
  consecutivePayments: number;
}

export interface TemplateOrderRecord {
  reference: string;
  templateId: string;
  email: string | null;
  paidMinor: number;
  currency: string;
  paidAt: string;
}

interface EntitlementStore {
  subscriptions: EntitlementRecord[];
  templateOrders: TemplateOrderRecord[];
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function readStore(): EntitlementStore {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
      templateOrders: Array.isArray(parsed.templateOrders) ? parsed.templateOrders : [],
    };
  } catch {
    return { subscriptions: [], templateOrders: [] };
  }
}

function writeStore(store: EntitlementStore): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = STORE_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
    fs.renameSync(tmp, STORE_FILE);
  } catch (err) {
    console.warn('[ENTITLEMENTS] fs write failed:', (err as Error).message);
  }
}

function expiresAtFrom(interval: string): string {
  const now = Date.now();
  const span = interval === 'yearly' || interval === 'annual' ? YEAR_MS : MONTH_MS;
  return new Date(now + span).toISOString();
}

/**
 * Grants (or extends) a subscription in the fs store and mirrors to Supabase when available.
 * Idempotent on `reference` — replaying the same reference does not double-grant.
 * Returns the granted tier, or null on failure.
 */
export async function grantSubscriptionFs(params: {
  userId?: string | null;
  email?: string | null;
  tier: string;
  plan: string;
  interval?: string;
  amountMinor: number;
  currency: string;
  reference: string;
}): Promise<string | null> {
  if (!params.tier || !params.reference) return null;
  const record = await withStoreLock('entitlements', (): EntitlementRecord | null => {
    const store = readStore();

    const existing = store.subscriptions.find((s) => s.reference === params.reference);
    if (existing) return null; // idempotent replay — no new grant, mirror skipped below

    const lastForUser = params.userId
      ? store.subscriptions
          .filter((s) => s.userId === params.userId && s.status === 'active')
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
      : undefined;
    const consecutive = (lastForUser?.consecutivePayments || 0) + 1;

    const created: EntitlementRecord = {
      id: `ent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: params.userId || null,
      email: params.email ? params.email.toLowerCase().trim() : null,
      tier: params.tier,
      plan: params.plan,
      status: 'active',
      interval: params.interval || 'monthly',
      amountMinor: Math.round(params.amountMinor),
      currency: (params.currency || 'NGN').toUpperCase(),
      reference: params.reference,
      startedAt: new Date().toISOString(),
      expiresAt: expiresAtFrom(params.interval || 'monthly'),
      consecutivePayments: consecutive,
    };

    store.subscriptions.push(created);
    writeStore(store);
    return created;
  });

  if (!record) {
    // Replay of an existing reference — surface its tier without re-mirroring.
    const store = readStore();
    return store.subscriptions.find((s) => s.reference === params.reference)?.tier || params.tier;
  }

  // Mirror to Supabase when configured (non-blocking, outside the lock).
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (url && !url.includes('demo-placeholder') && key && !key.includes('placeholder')) {
      void supabaseAdmin
        .from('subscriptions')
        .upsert(
          {
            user_id: params.userId || null,
            paystack_subscription_code: params.reference,
            paystack_plan_code: params.plan,
            tier: params.tier,
            status: 'active',
            amount: Math.round(params.amountMinor),
            currency: (params.currency || 'NGN').toUpperCase(),
            interval: params.interval || 'monthly',
            metadata: {
              reference: params.reference,
              plan: params.plan,
              email: params.email || null,
              source: 'entitlements-fs',
            },
          },
          { onConflict: 'paystack_subscription_code', ignoreDuplicates: false }
        )
        .then(({ error }) => {
          if (error) console.warn('[ENTITLEMENTS] supabase mirror warn:', error.message);
        });
    }
  } catch {
    // non-blocking
  }

  return record.tier;
}

/**
 * Records a paid template purchase (idempotent on reference).
 */
export function recordTemplateOrderFs(params: {
  reference: string;
  templateId: string;
  email: string | null;
  paidMinor: number;
  currency: string;
}): boolean {
  if (!params.reference || !params.templateId) return false;
  return withStoreLockSync('entitlements', () => {
    const store = readStore();
    if (store.templateOrders.some((o) => o.reference === params.reference)) return true;
    store.templateOrders.push({
      reference: params.reference,
      templateId: params.templateId,
      email: params.email ? params.email.toLowerCase().trim() : null,
      paidMinor: Math.round(params.paidMinor),
      currency: (params.currency || 'NGN').toUpperCase(),
      paidAt: new Date().toISOString(),
    });
    writeStore(store);
    return true;
  });
}

/**
 * Returns the active entitlement for a builder (userId or email), honoring expiresAt.
 */
export function getEntitlement(identity: { userId?: string | null; email?: string | null }): EntitlementRecord | null {
  const store = readStore();
  const nowIso = new Date().toISOString();
  const idEmail = identity.email ? identity.email.toLowerCase().trim() : null;

  const candidates = store.subscriptions.filter((s) => {
    if (identity.userId && s.userId === identity.userId) return true;
    if (idEmail && s.email === idEmail) return true;
    return false;
  });

  const active = candidates
    .filter((s) => s.status === 'active' && s.expiresAt > nowIso)
    .sort((a, b) => b.expiresAt.localeCompare(a.expiresAt));
  return active[0] || null;
}

/**
 * Whether a builder owns a given template (by email or userId match on a paid order).
 */
export function isTemplateOwned(identity: { userId?: string | null; email?: string | null }, templateId: string): boolean {
  const store = readStore();
  const idEmail = identity.email ? identity.email.toLowerCase().trim() : null;
  return store.templateOrders.some(
    (o) =>
      o.templateId === templateId &&
      ((identity.userId && o.email === idEmail) || (idEmail && o.email === idEmail) || (identity.userId && o.email === idEmail))
  );
}

/**
 * Counts consecutive active subscriptions for a builder (for loyalty display).
 */
export function getConsecutivePayments(identity: { userId?: string | null; email?: string | null }): number {
  const ent = getEntitlement(identity);
  return ent?.consecutivePayments || 0;
}

/**
 * Marks expired subscriptions (expiresAt in the past) as expired. Returns count affected.
 * Called by the daily renewal cron.
 */
export async function expireOverdueSubscriptions(): Promise<number> {
  return withStoreLock('entitlements', () => {
    const store = readStore();
    const nowIso = new Date().toISOString();
    let affected = 0;
    for (const s of store.subscriptions) {
      if (s.status === 'active' && s.expiresAt <= nowIso) {
        s.status = 'expired';
        affected++;
      }
    }
    if (affected > 0) writeStore(store);
    return affected;
  });
}

/**
 * Returns subscriptions expiring within `days` (for renewal reminder cron).
 */
export function getExpiringSoon(days = 7): EntitlementRecord[] {
  const store = readStore();
  const now = Date.now();
  const horizon = new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = new Date(now).toISOString();
  return store.subscriptions.filter((s) => s.status === 'active' && s.expiresAt > nowIso && s.expiresAt <= horizon);
}

/**
 * Admin listing of all entitlements (most recent first).
 */
export function listEntitlements(limit = 100): EntitlementRecord[] {
  const store = readStore();
  return store.subscriptions.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit);
}

/**
 * Admin listing of template orders.
 */
export function listTemplateOrders(limit = 100): TemplateOrderRecord[] {
  const store = readStore();
  return store.templateOrders.sort((a, b) => b.paidAt.localeCompare(a.paidAt)).slice(0, limit);
}
