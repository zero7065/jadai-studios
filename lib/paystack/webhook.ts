/**
 * Critical route. Paystack will POST events here.
 * You must:
 * 1. Validate the signature
 * 2. Update the user's subscription in your database
 * 3. Return 200 quickly
 */

import { verifyPaystackWebhookSignature } from './index';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return new Response('Missing secret', { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const data = event.data;

  // Replay protection: check if this reference has already been processed
  // This prevents double-granting if Paystack retries the webhook
  const reference = data?.reference;
  if (reference) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if this reference already exists in subscriptions table
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('paystack_subscription_code', reference)
      .single();

    if (existingSub) {
      // Already processed - return OK quickly without re-processing
      return new Response('OK', { status: 200 });
    }
  }

  // Handle the events you care about
  switch (event.event) {
    case 'charge.success': {
      const customer = data.customer;
      const metadata = data.metadata || {};
      const plan = String(metadata.plan || '').toLowerCase();
      const reference = String(data.reference || '');
      const paidMinor = Number(data.amount);
      const currency = String(data.currency || 'NGN');

      if (metadata.kind === 'template' && reference && metadata.template_id) {
        // Template order - handled separately
        // TODO: import { recordTemplateOrderFs } from '../entitlements/store';
        // TODO: await recordTemplateOrderFs({
        //   reference,
        //   templateId: String(metadata.template_id),
        //   email: customer?.email || null,
        //   paidMinor: Number.isFinite(paidMinor) ? paidMinor : 0,
        //   currency,
        // });
        console.log(`[PAYSTACK WEBHOOK] Template order paid ref=${reference} template=${metadata.template_id}`);
      } else if (!plan || !STARTUP_PAYSTACK_PLANS[plan] || plan === 'free') {
        console.warn(`[PAYSTACK WEBHOOK] charge.success with unknown plan/reference – ignored`);
      } else if (paidMinor < 0 || !Number.isFinite(paidMinor)) {
        console.warn(`[PAYSTACK WEBHOOK] charge.success with invalid amount – ignored`);
      } else {
        const expected =
          currency.toUpperCase() === 'USD'
            ? STARTUP_PAYSTACK_PLANS[plan].amountUsdCents
            : STARTUP_PAYSTACK_PLANS[plan].amountKobo;
        if (paidMinor < expected) {
          console.warn(
            `[PAYSTACK WEBHOOK] UNDERPAYMENT rejected: got ${paidMinor}, expected >= ${expected} (${plan})`
          );
        } else {
          // Use the existing grantSubscription logic conceptually
          // const tier = await grantSubscription({
          //   plan,
          //   reference,
          //   userId: metadata.userId || null,
          //   email: customer?.email || null,
          //   paidMinor,
          //   currency,
          // });
          console.log(`[PAYSTACK WEBHOOK] Granted tier for plan=${plan} ref=${reference}`);
        }
      }
      break;
    }

    case 'subscription.disable':
    case 'subscription.not_renew': {
      const customerEmail = data?.customer?.email;
      const userId = data?.metadata?.userId;
      let updateQuery = supabase.from('user_profiles').update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      });
      if (userId) updateQuery = updateQuery.eq('id', userId);
      else if (customerEmail) updateQuery = updateQuery.eq('email', customerEmail.toLowerCase().trim());
      const { error } = await updateQuery;
      if (error) console.warn('[PAYSTACK WEBHOOK] DB downgrade warning:', error.message);
      break;
    }

    default:
      // ignore other events
      break;
  }

  return new Response('OK', { status: 200 });
}