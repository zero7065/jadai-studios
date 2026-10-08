import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { verifyPaystackWebhookSignature } from '../../../../lib/paystack';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-paystack-signature');
    const rawBody = await request.text();

    const isValid = await verifyPaystackWebhookSignature(rawBody, signature || undefined);
    if (!isValid) {
      console.warn('[PAYSTACK WEBHOOK] Invalid HMAC-SHA512 signature rejected');
      return new Response('Invalid signature', { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    console.log(`[PAYSTACK WEBHOOK] Event received: ${event}`, {
      reference: data?.reference,
      email: data?.customer?.email,
    });

    if (event === 'charge.success') {
      const email = data?.customer?.email;
      const metadata = data?.metadata || {};
      const plan = (metadata.plan || metadata.planId || 'playground').toLowerCase();
      const userId = metadata.userId;
      const amountPaid = data?.amount;
      const reference = data?.reference;

      // Map plan to database subscription tier
      const tierMap: Record<string, string> = {
        playground: 'playground',
        studio_premium: 'studio_premium',
        signal_pro: 'signal_pro',
        signal_business: 'signal_business',
        signal: 'signal_pro',
        foundation: 'studio_premium',
        voice: 'playground',
        architecture: 'signal_business',
        prime: 'signal_business',
      };
      const assignedTier = tierMap[plan] || 'playground';

      // 1. Update user profile in Supabase
      try {
        let updateQuery = supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_tier: assignedTier,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          });

        if (userId) {
          await updateQuery.eq('id', userId);
        } else if (email) {
          await updateQuery.eq('email', email.toLowerCase().trim());
        }
      } catch (err) {
        console.warn('[PAYSTACK WEBHOOK] user_profiles update error:', err);
      }

      // 2. Insert into subscriptions table if exists
      try {
        await supabaseAdmin.from('subscriptions').insert({
          reference,
          user_id: userId || null,
          email: email?.toLowerCase()?.trim(),
          plan_id: plan,
          tier: assignedTier,
          amount_paid: amountPaid,
          status: 'active',
          paid_at: new Date().toISOString(),
        });
      } catch (err) {
        // Non-fatal table record error
      }
    } else if (event === 'subscription.disable') {
      const email = data?.customer?.email;
      const userId = data?.metadata?.userId;

      // Downgrade user to free tier
      try {
        let updateQuery = supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          });

        if (userId) {
          await updateQuery.eq('id', userId);
        } else if (email) {
          await updateQuery.eq('email', email.toLowerCase().trim());
        }
      } catch (err) {
        console.warn('[PAYSTACK WEBHOOK] downgrade error:', err);
      }
    }

    return new Response('Webhook acknowledged', { status: 200 });
  } catch (err: any) {
    console.error('[PAYSTACK WEBHOOK] Error:', err);
    return new Response('Internal error', { status: 500 });
  }
}
