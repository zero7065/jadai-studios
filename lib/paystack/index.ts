import crypto from 'crypto';

/** @todo: import { supabaseAdmin, isSupabaseConfigured } from '../supabase/admin'; */

/** Canonical subscription tiers – MUST match the DB CHECK constraint on
 * user_profiles.subscription_tier / subscriptions.tier:
 *   free | foundation | voice | architecture | prime
 *
 * Price ladder: foundation(₦4k) < voice(₦8k) < architecture(₦15k) < prime(₦45k)
 */
export const STARTUP_PAYSTACK_PLANS: Record<string, {
  id: string;
  name: string;
  amountKobo: number;
  amountUsdCents: number;
  priceNgnFormatted: string;
  priceUsdFormatted: string;
  interval: 'one_time' | 'monthly';
  description: string;
  features: string[];
}> = {
  free: {
    id: 'free',
    name: 'Free Floor',
    amountKobo: 0,
    amountUsdCents: 0,
    priceNgnFormatted: '₦0 / mo',
    priceUsdFormatted: '$0 / mo',
    interval: 'monthly',
    description: 'Explore the sovereign foundation and test core tools with zero commitment.',
    features: [
      '3 free tries across all Playground tools (FORGE, ORACLE, MIRAGE, SENTINEL)',
      'Full Book of Lies philosophical canon preview',
      'Unrestricted JadaiHub collaborative mesh access',
      'Full Marketplace starter kits browsing',
    ],
  },
  playground: {
    id: 'playground',
    name: 'Playground Suite',
    amountKobo: 800000, // ₦8,000.00
    amountUsdCents: 500, // $5.00
    priceNgnFormatted: '₦8,000 / mo',
    priceUsdFormatted: '$5 / mo',
    interval: 'monthly',
    description: 'Unlimited access to all AI creation engines, Document FORGE, MIRAGE, and ORACLE.',
    features: [
      'Unlimited generation on FORGE, ORACLE, MIRAGE & SENTINEL',
      'Canva-grade 4K document exports (PDF, PNG, Word)',
      'Fast Groq LPU inference with Gemini fallback',
      'Local-first persistent workspace & draft continuity',
    ],
  },
  studio_premium: {
    id: 'studio_premium',
    name: 'Studio Premium',
    amountKobo: 400000, // ₦4,000.00
    amountUsdCents: 900, // $9.00
    priceNgnFormatted: '₦4,000 / mo',
    priceUsdFormatted: '$9 / mo',
    interval: 'monthly',
    description: 'Complete unredacted Book of Lies canon, audio transmissions, and gallery assets.',
    features: [
      'Full 70 Book of Lies chapter manuscripts & audio narrations',
      'High-res graphic asset & typography gallery downloads',
      'Weekly 9:47 PM transmission executive briefing archive',
      'Exclusive community verified member badge',
    ],
  },
  signal_pro: {
    id: 'signal_pro',
    name: 'Signal Pro',
    amountKobo: 1500000, // ₦15,000.00
    amountUsdCents: 1900, // $19.00
    priceNgnFormatted: '₦15,000 / mo',
    priceUsdFormatted: '$19 / mo',
    interval: 'monthly',
    description: 'Algorithmic distribution OS scouting high-intent buyer leads across tech forums.',
    features: [
      '100 autonomous signals scanned per day',
      'Multi-platform watchlists (GitHub, Hacker News, Reddit, X)',
      'Smart outreach pitch writer with personalized context',
      'Sub-second velocity alerts & conversion telemetry',
    ],
  },
  signal_business: {
    id: 'signal_business',
    name: 'Signal Business',
    amountKobo: 4500000, // ₦45,000.00
    amountUsdCents: 4900, // $49.00
    priceNgnFormatted: '₦45,000 / mo',
    priceUsdFormatted: '$49 / mo',
    interval: 'monthly',
    description: 'High-volume radar intelligence for agency founders and developer studios.',
    features: [
      '500 autonomous signals scanned per day',
      '5 team member collaborative seats included',
      'Automated outbound lead dispatcher & webhooks',
      'Direct monthly strategy call with Founder Jehu Nanpan',
    ],
  },
};

/**
 * Aliases for backwards compatibility
 */
export const PAYSTACK_PLANS: Record<string, {
  id: string;
  name: string;
  amountKobo: number;
  amountUsdCents: number;
  priceNgnFormatted: string;
  priceUsdFormatted: string;
  interval: 'one_time' | 'monthly';
  description: string;
  features: string[];
}> = {
  ...STARTUP_PAYSTACK_PLANS,
  signal: STARTUP_PAYSTACK_PLANS.signal_pro,
  voice: STARTUP_PAYSTACK_PLANS.playground,
  foundation: STARTUP_PAYSTACK_PLANS.studio_premium,
  architecture: STARTUP_PAYSTACK_PLANS.signal_pro,
  prime: STARTUP_PAYSTACK_PLANS.signal_business,
};

/**
 * Canonical subscription tiers – MUST match the DB CHECK constraint on
 * user_profiles.subscription_tier / subscriptions.tier:
 *   free | foundation | voice | architecture | prime
 *
 * Price ladder: foundation(₦4k) < voice(₦8k) < architecture(₦15k) < prime(₦45k)
 */
export const PLAN_TO_TIER: Record<string, string> = {
  free: 'free',
  studio_premium: 'foundation',
  playground: 'voice',
  signal_pro: 'architecture',
  signal_business: 'prime',
  // legacy aliases
  foundation: 'foundation',
  voice: 'voice',
  architecture: 'architecture',
  prime: 'prime',
  signal: 'architecture',
};

export function tierForPlan(plan?: string | null): string {
  const key = String(plan || 'playground').toLowerCase();
  return PLAN_TO_TIER[key] || 'voice';
}

/**
 * Validates that a Paystack-verified charge actually paid the plan's price.
 * `paidMinor` is amount in kobo (NGN) or cents (USD) as reported by Paystack.
 */
export function chargeCoversPlan(plan: string, paidMinor: number, currency?: string): boolean {
  const matched = STARTUP_PAYSTACK_PLANS[String(plan || '').toLowerCase()];
  if (!matched) return false;
  if (!Number.isFinite(paidMinor) || paidMinor < 0) return false;
  const expected = String(currency || '').toUpperCase() === 'USD' ? matched.amountUsdCents : matched.amountKobo;
  return paidMinor >= expected;
}

/**
 * Resolves the Paystack secret key dynamically from admin_settings or env
 */
export async function getPaystackSecretKey(): Promise<string | undefined> {
  const allowTest = process.env.PAYSTACK_ALLOW_TEST === 'true';
  const sanitize = (key?: string | null): string | undefined => {
    if (!key || typeof key !== 'string') return undefined;
    const trimmed = key.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed.startsWith('sk_')) return undefined;
    if (lower.includes('mock') || lower.includes('placeholder') || lower.includes('your_')) return undefined;
    // Reject any sk_test_ key unless PAYSTACK_ALLOW_TEST=true explicitly opts in.
    // Prevents short test keys from reaching the live API and failing auth.
    if (trimmed.startsWith('sk_test_') && !allowTest) return undefined;
    return trimmed;
  };

  // if (isSupabaseConfigured) {
  //   try {
  //     const { data } = await supabaseAdmin
  //       .from('admin_settings')
  //       .select('value')
  //       .eq('key', 'paystack_secret_key')
  //       .maybeSingle();
  //     const fromDb = sanitize(typeof data?.value === 'string' ? data.value : undefined);
  //     if (fromDb) return fromDb;
  //   } catch {
  //     // Non-blocking fallback
  //   }
  // }

  return sanitize(process.env.PAYSTACK_SECRET_KEY);
}

/**
 * Check if Paystack credentials are fully configured and ready
 */
export function arePaystackKeysConfigured(): boolean {
  const allowTest = process.env.PAYSTACK_ALLOW_TEST === 'true';
  const secret = process.env.PAYSTACK_SECRET_KEY || '';
  const pub = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  if (!secret.startsWith('sk_') || !pub) return false;
  const lower = secret.toLowerCase();
  if (lower.includes('mock') || lower.includes('placeholder') || lower.includes('your_')) return false;
  if (secret.startsWith('sk_test_') && !allowTest) return false;
  return true;
}

/**
 * Checks if a given email is the designated master admin
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === 'jadaistudiosoffcl@gmail.com'.toLowerCase();
}

/**
 * Initializes a transaction with Paystack API.
 */
export async function initializePaystackTransaction(
  options: {
    email: string;
    amountKobo: number;
    planId?: string;
    reference?: string;
    callbackUrl?: string;
    metadata?: Record<string, any>;
    currency?: 'NGN' | 'USD';
  }
): Promise<{ success: boolean; authorization_url?: string; reference: string; error?: string; simulated?: boolean }> {
  const secretKey = await getPaystackSecretKey();
  const reference = options.reference || `JADAI-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const planKey = (options.planId || options.metadata?.plan || 'playground').toLowerCase();

  // Resolve plan price
  const matchedPlan = STARTUP_PAYSTACK_PLANS[planKey] || PAYSTACK_PLANS[planKey] || STARTUP_PAYSTACK_PLANS.playground;
  const isUsd = options.currency === 'USD';
  const amount = options.amountKobo || (isUsd ? matchedPlan.amountUsdCents : matchedPlan.amountKobo);

  const callbackUrl = options.callbackUrl ||
    `${process.env.NEXT_PUBLIC_APP_URL || ''}/account/premium?reference=${reference}&plan=${planKey}&status=success`;

  // If secret key is not configured (placeholder/mock/test-without-optin), return graceful simulated checkout url
  if (!secretKey) {
    return {
      success: true,
      reference,
      authorization_url: callbackUrl,
      simulated: true,
    };
  }

  try {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: options.email,
        amount,
        reference,
        currency: options.currency || 'NGN',
        callback_url: callbackUrl,
        metadata: {
          plan: planKey,
          planName: matchedPlan.name,
          ...(options.metadata || {}),
        },
      }),
    });

    const data = await res.json();
    if (data.status && data.data?.authorization_url) {
      return {
        success: true,
        reference,
        authorization_url: data.data.authorization_url,
      };
    }

    return {
      success: false,
      reference,
      error: data.message || 'Paystack initialization failed',
    };
  } catch (err: any) {
    return {
      success: false,
      reference,
      error: err.message || 'Network connection to payment switch failed',
    };
  }
}

/**
 * Verifies Paystack Webhook signature using HMAC-SHA512 (timing-safe).
 */
export async function verifyPaystackWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader?: string
): Promise<boolean> {
  const secretKey = await getPaystackSecretKey();
  if (!secretKey || !signatureHeader) return false;

  const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

  const a = Buffer.from(hash);
  const b = Buffer.from(String(signatureHeader));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}