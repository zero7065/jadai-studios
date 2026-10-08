import crypto from 'crypto';
import { supabaseAdmin, isSupabaseConfigured } from '../supabase/admin';

/**
 * JADAI STUDIOS — PAYSTACK PAYMENTS ENGINE
 * Affordable Young Startup Pricing (Dual Currency NGN / USD)
 * Subscriptions + Templates One-Time Purchases
 */

export interface PaystackInitializeOptions {
  email: string;
  amountKobo: number;
  planId?: string;
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  currency?: 'NGN' | 'USD';
}

export interface PaystackTierPlan {
  id: string;
  name: string;
  amountKobo: number;
  priceNgnFormatted: string;
  priceUsdFormatted: string;
  amountUsdCents: number;
  interval: 'one_time' | 'monthly';
  description: string;
  features: string[];
}

export const ADMIN_EMAIL = 'jadaistudiosoffcl@gmail.com';

export const STARTUP_PAYSTACK_PLANS: Record<string, PaystackTierPlan> = {
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
    amountUsdCents: 900, // $9.00
    priceNgnFormatted: '₦8,000 / mo',
    priceUsdFormatted: '$9 / mo',
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
    amountUsdCents: 500, // $5.00
    priceNgnFormatted: '₦4,000 / mo',
    priceUsdFormatted: '$5 / mo',
    interval: 'monthly',
    description: 'Complete unredacted Book of Lies canon, audio transmissions, and gallery assets.',
    features: [
      'Full 40+ Book of Lies chapter manuscripts & audio narrations',
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

// Aliases for backwards compatibility
export const PAYSTACK_PLANS: Record<string, PaystackTierPlan> = {
  ...STARTUP_PAYSTACK_PLANS,
  signal: STARTUP_PAYSTACK_PLANS.signal_pro,
  voice: STARTUP_PAYSTACK_PLANS.playground,
  foundation: STARTUP_PAYSTACK_PLANS.studio_premium,
  architecture: STARTUP_PAYSTACK_PLANS.signal_business,
  prime: STARTUP_PAYSTACK_PLANS.signal_business,
};

/**
 * Resolves the Paystack secret key dynamically from admin_settings or env
 */
export async function getPaystackSecretKey(): Promise<string | undefined> {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', 'paystack_secret_key')
        .maybeSingle();

      if (data?.value && typeof data.value === 'string' && data.value.startsWith('sk_')) {
        return data.value;
      }
    } catch {
      // Non-blocking fallback
    }
  }

  return process.env.PAYSTACK_SECRET_KEY;
}

/**
 * Check if Paystack credentials are fully configured and ready
 */
export function arePaystackKeysConfigured(): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const pub = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  return Boolean(
    secret &&
    !secret.startsWith('sk_test_placeholder') &&
    !secret.includes('your_') &&
    secret.startsWith('sk_') &&
    pub &&
    !pub.includes('your_')
  );
}

/**
 * Checks if a given email is the designated master admin
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Initializes a transaction with Paystack API.
 */
export async function initializePaystackTransaction(
  options: PaystackInitializeOptions
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

  // If secret key is not configured or in sandbox/demo, return graceful simulated checkout url
  if (!secretKey || secretKey.startsWith('sk_test_placeholder') || secretKey.includes('your_')) {
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
 * Verifies Paystack Webhook signature using HMAC-SHA512.
 */
export async function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader?: string
): Promise<boolean> {
  const secretKey = await getPaystackSecretKey();
  if (!secretKey || !signatureHeader) return false;

  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex');

  return hash === signatureHeader;
}
