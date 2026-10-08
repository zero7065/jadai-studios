# 03 — DATA SOURCES & TELEMETRY REGISTRY

All external services and APIs integrated into Jadai Studios operate under the **Free-Until-First-Pay** mandate.

| Service / Data Source | Purpose | Key Required? | Where to Obtain | Fallback Behavior if Missing | Free Tier Limit |
|---|---|---|---|---|---|
| **Groq Cloud** | Primary AI inference (`llama-3.3-70b-versatile`) | Yes (`GROQ_API_KEY`) | [console.groq.com](https://console.groq.com) | Failover directly to Google Gemini | Generous RPM / TPM limits on free tier |
| **Google Gemini** | Secondary AI redundancy (`gemini-3.8-flash`) | Yes (`GEMINI_API_KEY`) | Google AI Studio Settings | Failover to SHA-256 local cache, then graceful message | High daily free requests |
| **Supabase PostgreSQL** | Primary data storage & RLS security | Yes (`NEXT_PUBLIC_SUPABASE_URL`, keys) | [supabase.com](https://supabase.com) | Memory cache + fallback offline responses | 500MB DB, 5GB storage, 50k MAU |
| **Paystack** | Subscriptions & NGN/USD billing | Yes (`PAYSTACK_SECRET_KEY`, `PUBLIC_KEY`) | [paystack.com](https://paystack.com) | Checkout enters demo test mode | 100% free until transactions occur |
| **Google PageSpeed Insights** | Site Diagnostic Core Web Vitals | Optional (`GOOGLE_PSI_API_KEY`) | [console.cloud.google.com](https://console.cloud.google.com) | Internal heuristic performance engine | 25,000 requests / day free |
| **RDAP Protocol** | Domain registration & conflict checks | **No Key Required** | Public ICANN RDAP gateway (`rdap.org`) | Assumes domain is active | Public open protocol |
| **Native TLS** | SSL Certificate grade & expiration probe | **No Key Required** | Node.js native `tls.connect` | Returns TLS timeout warning | Local execution (Unlimited) |
| **axe-core** | Web Accessibility evaluation | **No Key Required** | Self-hosted npm module | Rule heuristic checker | Unlimited local compute |

---

## How to Monitor Usage

1. **Admin Lounge Diagnostic (`/admin`):**
   Displays real-time average latency across all AI providers, 24-hour error rates, and cache hit percentages.
2. **`module_usage` Table:**
   Every single invocation logs tokens consumed, duration in milliseconds, provider utilized, and error details. Run this query in Supabase to inspect:
   ```sql
   SELECT ai_provider, COUNT(*), AVG(duration_ms), SUM(tokens_used)
   FROM module_usage
   GROUP BY ai_provider;
   ```
