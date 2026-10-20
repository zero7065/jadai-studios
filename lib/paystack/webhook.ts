/**
 * app/api/paystack/webhook/route.ts
 *
 * Critical route. Paystack will POST events here.
 * You must:
 * 1. Validate the signature
 * 2. Update the user's subscription in your database
 * 3. Return 200 quickly
 */

import { isValidPaystackSignature, tierFromPaystackPlan } from "@/lib/paystack";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return new Response("Missing secret", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!isValidPaystackSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
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

    // Check if this reference already exists in orders table
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .single();

    if (existingOrder && existingOrder.status === "completed") {
      // Already processed - return OK quickly without re-processing
      return new Response("OK", { status: 200 });
    }
  }

  // Handle the events you care about
  switch (event.event) {
    case "charge.success":
    case "subscription.create": {
      const email = data.customer?.email;
      const planCode = data.plan?.plan_code || data.amount / 100;
      const tier = tierFromPaystackPlan(planCode);

      if (email) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await supabase.from("profiles").update({
          subscription_tier: tier,
          subscription_status: "active",
          current_period_end: new Date(data.paid_at || Date.now()),
        }).eq("email", email);
      }
      break;
    }

    case "subscription.disable":
    case "invoice.payment_failed": {
      const email = event.data.customer?.email;
      if (email) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await supabase.from("profiles").update({ subscription_status: "past_due" }).eq("email", email);
      }
      break;
    }

    default:
      // ignore other events
      break;
  }

  return new Response("OK", { status: 200 });
}