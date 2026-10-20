/**
 * app/api/payments/route.ts
 * Payment routes - P21: passes, Sparks, webhook
 * 
 * Handles:
 * - Paystack transaction initialization
 * - Spark purchases
 * - Webhook endpoint (see api-paystack-webhook.ts)
 */

import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { TIERS, type TierId } from "@/lib-pricing";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_BASE = "https://api.paystack.co";

export interface InitializePaymentPayload {
  email: string;
  amount: number; // in kobo (NGN) or cents (USD)
  currency: "NGN" | "USD";
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
      return new Response("Missing required fields (email, amount)", { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return new Response("Paystack secret key not configured", { status: 500 });
    }

    // Initialize transaction with Paystack
    const payload: InitializePaymentPayload = {
      email,
      amount,
      currency,
      plan,
      metadata,
      callback_url,
    };

    const result = await initializeTransaction(payload, secretKey);

    // Create Supabase client to record the transaction
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Store the initial payment record
    await supabase.from("orders").insert({
      user_email: email,
      reference: result.data?.reference || "",
      amount: amount,
      currency: currency,
      tier: plan ? tierFromPaystackPlan(plan) : "creator",
      status: "pending",
      paystack_data: result.data,
    });

    return new Response(
      JSON.stringify({
        authorization_url: result.data?.authorization_url,
        reference: result.data?.reference,
        access_code: result.data?.access_code,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return new Response(error.message || "Payment initialization failed", { status: 500 });
  }
}

/**
 * Verify a Paystack transaction after redirect
 * Used to confirm payment status and update user subscription
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return new Response("Missing reference parameter", { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return new Response("Paystack secret key not configured", { status: 500 });
    }

    const result = await verifyTransaction(reference, secretKey);

    // Update user subscription based on payment result
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (result.data?.status === "success") {
      const tier = tierFromPaystackPlan(result.data?.plan?.plan_code || result.data?.amount / 100);

      await supabase.from("profiles").update({
        subscription_tier: tier,
        subscription_status: "active",
        current_period_end: new Date(result.data?.paid_at || Date.now()),
      }).eq("email", result.data?.customer?.email);

      // Mark order as completed
      await supabase.from("orders").update({ status: "completed" }).eq("reference", reference);
    } else {
      // Mark order as failed
      await supabase.from("orders").update({ status: "failed" }).eq("reference", reference);
    }

    return new Response(
      JSON.stringify({
        status: result.data?.status,
        tier: tierFromPaystackPlan(result.data?.plan?.plan_code || result.data?.amount / 100),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return new Response(error.message || "Payment verification failed", { status: 500 });
  }
}

/**
 * Map Paystack plan code to TierId
 * Uses the same mapping as lib-paystack.ts
 */
function tierFromPaystackPlan(planCodeOrAmount: string | number): TierId {
  const map: Record<string, TierId> = {
    "PLN_creator_monthly": "creator",
    "PLN_studio_monthly": "studio",
    "PLN_foundry_monthly": "foundry",
  };

  if (typeof planCodeOrAmount === "string" && map[planCodeOrAmount]) {
    return map[planCodeOrAmount];
  }

  const amount = Number(planCodeOrAmount);
  if (amount >= 49) return "foundry";
  if (amount >= 19) return "studio";
  if (amount >= 9) return "creator";
  return "free";
}

export { tierFromPaystackPlan };