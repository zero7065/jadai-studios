import { supabase } from './client';

export interface GateCheckResult {
  allowed: boolean;
  reason?: 'unauthenticated' | 'quota_exceeded' | 'tier_required' | 'admin_bypass';
  usageCount: number;
  tier: string;
  userEmail?: string;
  userId?: string;
}

export const ADMIN_EMAIL = 'jadaistudiosoffcl@gmail.com';

/**
 * Retrieves the current authenticated user from Supabase auth or local session
 */
export async function getActiveUser(): Promise<{ id?: string; email?: string } | null> {
  try {
    if (typeof window !== 'undefined') {
      // 1. Check Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        return { id: user.id, email: user.email.toLowerCase() };
      }

      // 2. Check local session
      const raw = localStorage.getItem('jadai_user_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.email) {
          return { id: parsed.id || `usr-${parsed.email}`, email: parsed.email.toLowerCase() };
        }
      }
    }
  } catch (err) {
    console.warn('Error reading active user session', err);
  }
  return null;
}

/**
 * Gate logic for every Playground tool:
 * 1. Check if user is authenticated. If not -> show auth modal.
 * 2. Check user's subscription tier in user_profiles table.
 * 3. If tier is 'free': check module_usage count for this user. If count >= 3 -> show upgrade modal.
 * 4. If tier matches the tool's required tier -> allow.
 * 5. Admin email (jadaistudiosoffcl@gmail.com) bypasses all gates.
 */
export async function checkToolAccess(
  toolSlug: string,
  requiredTier: string = 'free'
): Promise<GateCheckResult> {
  const user = await getActiveUser();

  // 1. Unauthenticated -> block
  if (!user || !user.email) {
    return {
      allowed: false,
      reason: 'unauthenticated',
      usageCount: 0,
      tier: 'anonymous',
    };
  }

  // 5. Admin bypass
  if (user.email === ADMIN_EMAIL.toLowerCase()) {
    return {
      allowed: true,
      reason: 'admin_bypass',
      usageCount: 0,
      tier: 'admin',
      userEmail: user.email,
      userId: user.id,
    };
  }

  let userTier = 'free';
  let usageCount = 0;

  // 2. Check user_profiles table
  try {
    if (user.id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_tier, role')
        .or(`id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();

      if (profile) {
        if (profile.role === 'admin') {
          return {
            allowed: true,
            reason: 'admin_bypass',
            usageCount: 0,
            tier: 'admin',
            userEmail: user.email,
            userId: user.id,
          };
        }
        if (profile.subscription_tier) {
          userTier = profile.subscription_tier.toLowerCase();
        }
      }
    }
  } catch (err) {
    console.warn('Could not query user_profiles, checking local tier fallback', err);
    if (typeof window !== 'undefined') {
      const localTier = localStorage.getItem('jadai-user-tier');
      if (localTier) userTier = localTier.toLowerCase();
    }
  }

  // If tier is playground, signal, or prime -> unlimited access
  if (['playground', 'signal', 'prime', 'architecture', 'voice', 'foundation'].includes(userTier)) {
    return {
      allowed: true,
      usageCount: 0,
      tier: userTier,
      userEmail: user.email,
      userId: user.id,
    };
  }

  // 3. If tier is 'free': check module_usage count
  try {
    if (user.id) {
      const { count } = await supabase
        .from('module_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      usageCount = count || 0;
    }
  } catch (err) {
    console.warn('Error reading module_usage count', err);
  }

  // Synchronize with local storage counter
  if (typeof window !== 'undefined') {
    const localCount = parseInt(localStorage.getItem(`jadai_usage_${user.email}`) || '0', 10);
    usageCount = Math.max(usageCount, localCount);
  }

  if (usageCount >= 3) {
    return {
      allowed: false,
      reason: 'quota_exceeded',
      usageCount,
      tier: 'free',
      userEmail: user.email,
      userId: user.id,
    };
  }

  return {
    allowed: true,
    usageCount,
    tier: 'free',
    userEmail: user.email,
    userId: user.id,
  };
}

/**
 * Records an execution in module_usage table and local cache
 */
export async function recordModuleExecution(
  toolSlug: string,
  userEmail?: string,
  userId?: string
): Promise<number> {
  let newCount = 1;
  const targetEmail = userEmail?.toLowerCase();

  if (typeof window !== 'undefined' && targetEmail) {
    const current = parseInt(localStorage.getItem(`jadai_usage_${targetEmail}`) || '0', 10);
    newCount = current + 1;
    localStorage.setItem(`jadai_usage_${targetEmail}`, String(newCount));
  }

  try {
    if (userId) {
      await supabase.from('module_usage').insert({
        user_id: userId,
        module_slug: toolSlug,
        success: true,
        created_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Failed to record module_usage row', err);
  }

  return newCount;
}
