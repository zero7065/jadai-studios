// Server-side entitlement gate.
//
// Resolves the caller from the request the same way /api/account/tier does
// (builderId + email, from query or headers), looks up the active fs
// entitlement, and compares its tier rank against the minimum required.
//
// Identity sources (in priority order):
//   ?builderId= / x-builder-id header  -> treated as userId
//   ?email=     / x-user-email header  -> matched on email
//   ?reference=                          -> matched on the granting reference
//
// A user is "entitled" when their active, unexpired entitlement's tier ranks
// at or above `minTier`. Master admin always passes. This is deliberately
// fail-closed: any thrown error denies the request.

import type { Request, Response, NextFunction } from 'express';
import { getEntitlement } from '../entitlements/store';
import { TIER_LEVELS, isMasterAdmin } from '../auth/tier';

export interface EntitlementGateOptions {
  /** Minimum tier rank required (e.g. 'voice', 'signal_pro'). */
  minTier: string;
  /** Human-readable feature name used in the 402/403 message. */
  feature?: string;
  /** Price strings surfaced to the client paywall, if known. */
  priceNgn?: string;
  priceUsd?: string;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function headerStr(req: Request, name: string): string {
  const v = req.headers[name];
  return typeof v === 'string' ? v.trim() : Array.isArray(v) ? String(v[0] || '').trim() : '';
}

/** Resolves the entitlement identity (userId/email) from a request. */
export function identityFromRequest(req: Request): {
  userId: string | null;
  email: string | null;
} {
  const userIdRaw =
    str(req.query.builderId) ||
    str(req.body?.builderId) ||
    headerStr(req, 'x-builder-id');
  const emailRaw =
    str(req.query.email) ||
    str(req.body?.email) ||
    headerStr(req, 'x-user-email');

  return {
    // builderId must look like a real id (matches /api/account/tier bounds).
    userId: userIdRaw.length >= 8 && userIdRaw.length <= 64 ? userIdRaw : null,
    email: emailRaw.includes('@') ? emailRaw : null,
  };
}

/**
 * Express middleware factory. Passes when the caller holds an active
 * entitlement whose tier rank >= options.minTier. Otherwise responds
 * 402 (payment required) with the pricing hint so the client can show
 * the paywall, or 403 when the caller is authenticated but under-tired.
 */
export function requireEntitlement(options: EntitlementGateOptions) {
  const requiredLevel = TIER_LEVELS[options.minTier] ?? 0;
  const feature = options.feature || 'this feature';

  return (req: Request, res: Response, next: NextFunction): void => {
    // Admin always passes.
    const { email } = identityFromRequest(req);
    if (isMasterAdmin(email)) return next();

    // Free-tier requirement is a no-op.
    if (requiredLevel <= 0) return next();

    try {
      const { userId } = identityFromRequest(req);
      const ent = getEntitlement({ userId, email });

      if (!ent) {
        res.status(402).json({
          success: false,
          requiresPayment: true,
          error: `Active subscription required for ${feature}.`,
          requiredTier: options.minTier,
          priceNgn: options.priceNgn,
          priceUsd: options.priceUsd,
        });
        return;
      }

      const currentLevel = TIER_LEVELS[ent.tier] ?? 0;
      if (currentLevel < requiredLevel) {
        res.status(403).json({
          success: false,
          error: `Your ${ent.tier.toUpperCase()} plan does not include ${feature}. Upgrade to ${options.minTier.toUpperCase()} or higher.`,
          requiredTier: options.minTier,
          currentTier: ent.tier,
          priceNgn: options.priceNgn,
          priceUsd: options.priceUsd,
        });
        return;
      }

      // Stash the resolved identity for downstream handlers.
      (req as any).entitlement = ent;
      next();
    } catch (err) {
      // Fail closed: an unexpected error must not grant access.
      res.status(402).json({
        success: false,
        requiresPayment: true,
        error: `Could not verify subscription for ${feature}.`,
        requiredTier: options.minTier,
      });
    }
  };
}
