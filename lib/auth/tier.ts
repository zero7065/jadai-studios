import { supabaseAdmin } from '../supabase/admin';

export const ADMIN_EMAIL = 'jadaistudiosoffcl@gmail.com';
export const FREE_TOOL_USAGE_LIMIT = 3;

export type AppFeature = 'playground' | 'studio_premium' | 'signal' | 'marketplace_download';

export type UserSubscriptionTier =
  | 'free'
  | 'playground'
  | 'studio_premium'
  | 'signal_pro'
  | 'signal_business'
  // Legacy mappings:
  | 'foundation'
  | 'voice'
  | 'architecture'
  | 'prime';

const TIER_LEVELS: Record<string, number> = {
  free: 0,
  foundation: 1,
  studio_premium: 1,
  voice: 2,
  playground: 2,
  signal_pro: 3,
  signal: 3,
  architecture: 4,
  signal_business: 4,
  prime: 5,
};

/**
 * Checks if user is master admin (bypasses all gates)
 */
export function isMasterAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Track and enforce free tier 3-use limits on client
 */
export function getClientToolUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem('jadai_free_tool_usage_count');
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementClientToolUsage(): {
  currentCount: number;
  remainingTries: number;
  isLimitReached: boolean;
} {
  if (typeof window === 'undefined') {
    return { currentCount: 0, remainingTries: FREE_TOOL_USAGE_LIMIT, isLimitReached: false };
  }

  try {
    const count = getClientToolUsageCount() + 1;
    localStorage.setItem('jadai_free_tool_usage_count', count.toString());
    const remaining = Math.max(0, FREE_TOOL_USAGE_LIMIT - count);
    return {
      currentCount: count,
      remainingTries: remaining,
      isLimitReached: count > FREE_TOOL_USAGE_LIMIT,
    };
  } catch {
    return { currentCount: 1, remainingTries: 2, isLimitReached: false };
  }
}

export function resetClientToolUsage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('jadai_free_tool_usage_count');
  } catch {}
}

/**
 * Validates whether user tier or usage count satisfies access to feature.
 * Requirements are TIER_LEVELS thresholds so canonical DB tiers
 * (foundation/voice/architecture/prime) and legacy aliases resolve correctly.
 */
export function checkAccessToFeature(
  feature: AppFeature,
  options?: {
    userEmail?: string | null;
    userTier?: string | null;
    isSubscribed?: boolean;
    toolUsageCount?: number;
  }
): {
  allowed: boolean;
  reason?: string;
  isSoftPaywall?: boolean;
  requiredPlan?: string;
  priceNgn?: string;
  priceUsd?: string;
} {
  const email = options?.userEmail;
  if (isMasterAdmin(email)) {
    return { allowed: true, reason: 'Master Admin Override' };
  }

  const currentTier = (options?.userTier || 'free').toLowerCase();
  const isSubscribed = Boolean(options?.isSubscribed);
  const subscribedLevel = isSubscribed ? TIER_LEVELS[currentTier] ?? 0 : 0;

  // 1. PLAYGROUND TOOLS (FORGE, ORACLE, MIRAGE, SENTINEL) — requires level >= 2 (voice)
  if (feature === 'playground') {
    if (subscribedLevel >= TIER_LEVELS.voice) {
      return { allowed: true };
    }

    const usage = options?.toolUsageCount ?? getClientToolUsageCount();
    if (usage < FREE_TOOL_USAGE_LIMIT) {
      return {
        allowed: true,
        reason: `${FREE_TOOL_USAGE_LIMIT - usage} free tries remaining`,
      };
    }

    return {
      allowed: false,
      isSoftPaywall: true,
      requiredPlan: 'playground',
      priceNgn: '₦8,000 / mo',
      priceUsd: '$9 / mo',
      reason: "You've used your 3 free tries. Subscribe to Playground for ₦8,000/mo?",
    };
  }

  // 2. STUDIO PREMIUM (Full Book of Lies, High-res Downloads) — requires level >= 1 (foundation)
  if (feature === 'studio_premium') {
    if (subscribedLevel >= TIER_LEVELS.foundation) {
      return { allowed: true };
    }

    return {
      allowed: false,
      isSoftPaywall: true,
      requiredPlan: 'studio_premium',
      priceNgn: '₦4,000 / mo',
      priceUsd: '$5 / mo',
      reason: 'Unlocks the full 70-episode Book of Lies canon and raw high-res asset downloads.',
    };
  }

  // 3. SIGNAL PRO (Outbound lead velocity radar) — requires level >= 3 (signal_pro)
  if (feature === 'signal') {
    if (subscribedLevel >= TIER_LEVELS.signal_pro) {
      return { allowed: true };
    }

    return {
      allowed: false,
      isSoftPaywall: true,
      requiredPlan: 'signal_pro',
      priceNgn: '₦15,000 / mo',
      priceUsd: '$19 / mo',
      reason: 'Signal actions require Signal Pro or higher.',
    };
  }

  return { allowed: true };
}

/**
 * Validates whether a user's subscription tier satisfies the required tier.
 */
export async function checkTierAccess(
  userId?: string,
  requiredTier: string = 'free',
  userEmail?: string
): Promise<{ allowed: boolean; userTier: string; reason?: string }> {
  // Admin bypass
  if (isMasterAdmin(userEmail)) {
    return { allowed: true, userTier: 'prime', reason: 'Master Admin bypass' };
  }

  // Free tier is unblocked
  if (requiredTier === 'free') {
    return { allowed: true, userTier: 'free' };
  }

  if (!userId) {
    return {
      allowed: false,
      userTier: 'free',
      reason: 'Authentication and active subscription required.',
    };
  }

  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, role, subscription_tier, subscription_status')
      .eq('id', userId)
      .maybeSingle();

    if (isMasterAdmin(profile?.email) || profile?.role === 'admin') {
      return { allowed: true, userTier: 'prime', reason: 'Admin bypass' };
    }

    const currentTier = (profile?.subscription_tier as string) || 'free';
    const isActive = profile?.subscription_status === 'active';

    if (!isActive && requiredTier !== 'free') {
      return {
        allowed: false,
        userTier: currentTier,
        reason: 'Subscription is inactive or cancelled.',
      };
    }

    const currentLevel = TIER_LEVELS[currentTier] || 0;
    const requiredLevel = TIER_LEVELS[requiredTier] || 0;
    const hasTier = currentLevel >= requiredLevel;

    return {
      allowed: hasTier,
      userTier: currentTier,
      reason: hasTier ? undefined : `Requires ${requiredTier.toUpperCase()} tier or higher.`,
    };
  } catch {
    return { allowed: false, userTier: 'free', reason: 'Failed to verify tier access' };
  }
}
