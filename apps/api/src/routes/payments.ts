/**
 * app/api/payments/route.ts
 * Payment routes – P21: passes, Sparks, webhook
 *
 * Handles:
 * – Paystack transaction initialization
 * – Spark purchases
 * – Webhook endpoint (see lib/paystack/webhook.ts)
 */

import { initializePaystackTransaction } from '@/lib/paystack';
import { TIERS, type Tier } from '@/lib-pricing';
import { createClient } from '@supabase/supabase-js';

export interface InitializePaymentPayload {
  email: string;
  amount: number; // in kobo (NGN) or cents (USD)
  currency: 'NGN' | 'USD';
  plan?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}

/**
 * Initialize a Paystack transaction for a user
 * Returns the authorization URL for redirect
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, amount, currency, plan, metadata, callback_url } = body;

    if (!email || !amount) {
      return new Response('Missing required fields (email, amount)', { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return new Response('Paystack secret key not configured', { status: 500 });
    }

    // Initialize transaction with Paystack
    const payload = {
      email,
      amount,
      currency,
      plan,
      metadata,
      callback_url,
    };

    const result = await initializePaystackTransaction(payload, secretKey);

    // Create Supabase client to record the transaction
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Store the initial payment record
    await supabase.from('orders').insert({
      user_email: email,
      reference: result.reference || '',
      amount: amount,
      currency: currency,
      tier: plan ? (STARTUP_PAYSTACK_PLANS[plan] ? STARTUP_PAYSTACK_PLANS[plan].id : 'voice') : 'voice',
      status: 'pending',
      paystack_data: result,
    });

    return new Response(
      JSON.stringify({
        authorization_url: result.authorization_url,
        reference: result.reference,
        access_code: result.access_code,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return new Response(error.message || 'Payment initialization failed', { status: 500 });
  }
}

/**
 * Verify a Paystack transaction after redirect
 * Used to confirm payment status and update user subscription
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return new Response('Missing reference parameter', { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return new Response('Paystack secret key not configured', { status: 500 });
    }

    // Verify with Paystack API
    const resp = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );
    const json = await resp.json().catch(() => null);

    if (!json?.status || json.data?.status !== 'success') {
      return new Response(
        JSON.stringify({ success: false, error: json?.message || 'Payment not verified' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const plan = String(json.data?.metadata?.plan || '').toLowerCase();
    const paidMinor = Number(json.data?.amount);
    const currency = String(json.data?.currency || 'NGN');

    if (!plan || !STARTUP_PAYSTACK_PLANS[plan] || plan === 'free') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unknown plan on transaction' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const expected = currency.toUpperCase() === 'USD'
      ? STARTUP_PAYSTACK_PLANS[plan].amountUsdCents
      : STARTUP_PAYSTACK_PLANS[plan].amountKobo;

    if (!Number.isFinite(paidMinor) || paidMinor < expected) {
      console.warn(`[PAYMENT VERIFY] underpayment rejected for ${reference}: ${paidMinor} < ${expected}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Paid amount does not match plan price' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Grant subscription (same logic as server.ts grantSubscription)
    const tier = STARTUP_PAYSTACK_PLANS[plan].id;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update user profile
    const { email } = json.data?.customer || {};
    if (email) {
      await supabase.from('profiles').update({
        subscription_tier: tier,
        subscription_status: 'active',
        current_period_end: new Date(json.data?.paid_at || Date.now()),
      }).eq('email', email);
    }

    // Optionally update subscriptions table
    await supabase.from('subscriptions').upsert({
      user_id: json.data?.metadata?.userId || null,
      paystack_subscription_code: reference,
      paystack_plan_code: plan,
      tier,
      status: 'active',
      amount: paidMinor,
      currency: currency.toUpperCase(),
      interval: 'monthly',
      metadata: {
        reference,
        plan,
        paid_minor: paidMinor,
        email: json.data?.customer?.email || null,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        tier,
        plan,
        reference,
        amount: paidMinor,
        currency,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return new Response(error.message || 'Payment verification failed', { status: 500 });
  }
}

/**
 * Map Paystack plan code to tier ID
 */
function tierForPlan(plan?: string): string {
  return tierForPlan(plan || 'playground'); // will be resolved via PLAN_TO_TIER below
}

/** Alias for the function above – kept for backwards compatibility with existing imports */
export { tierForPlan };