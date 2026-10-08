import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { STARTUP_PAYSTACK_PLANS, isAdminEmail, getPaystackSecretKey } from '../../../../lib/paystack';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, planId, email, userId, currency = 'NGN', amountUsd, amountNgn, amountKobo } = body;

    if (!email) {
      return Response.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Admin bypass: if user matches jadaistudiosoffcl@gmail.com, instant unlock
    if (isAdminEmail(email)) {
      return Response.json({
        success: true,
        reference: `ADMIN-BYPASS-${Date.now()}`,
        authorization_url: '/account/premium?status=success&admin_bypass=true',
        admin_bypass: true,
      });
    }

    const selectedPlan = (plan || planId || 'playground').toLowerCase();
    const isUsd = currency === 'USD';

    // Pricing map adhering to Young Startup Affordable Tiers
    const planConfig = STARTUP_PAYSTACK_PLANS[selectedPlan] || STARTUP_PAYSTACK_PLANS.playground;
    
    // Amount in cents or kobo
    let amount = isUsd ? planConfig.amountUsdCents : planConfig.amountKobo;
    if (amountKobo) amount = amountKobo;
    else if (isUsd && amountUsd) amount = Math.round(amountUsd * 100);
    else if (!isUsd && amountNgn) amount = Math.round(amountNgn * 100);

    const paystackSecret = await getPaystackSecretKey();
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://jadai.dev';
    const reference = `JADAI-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const callbackUrl = `${origin}/account/premium?reference=${reference}&plan=${selectedPlan}&status=success`;

    // If real paystack secret key exists and starts with sk_
    if (paystackSecret && paystackSecret.startsWith('sk_') && !paystackSecret.includes('your_')) {
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          currency: isUsd ? 'USD' : 'NGN',
          reference,
          callback_url: callbackUrl,
          metadata: {
            plan: selectedPlan,
            planName: planConfig.name,
            userId,
            currency: isUsd ? 'USD' : 'NGN',
          },
        }),
      });

      const result = await paystackRes.json();
      if (result.status && result.data?.authorization_url) {
        return Response.json({
          success: true,
          authorization_url: result.data.authorization_url,
          reference,
        });
      }
    }

    // Fallback sandbox simulation: redirects to verification callback URL with instant upgrade
    return Response.json({
      success: true,
      authorization_url: callbackUrl,
      reference,
      simulated: true,
    });
  } catch (err: any) {
    console.error('Paystack initialization error:', err);
    return Response.json({ success: false, error: err?.message || 'Initialization failed' }, { status: 500 });
  }
}
