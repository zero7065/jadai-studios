# 03 — DATA SOURCES & TELEMETRY REGISTRY

All external services integrated into Jadai Studios operate under the **Free-Until-First-Pay** mandate.

| Service / Data Source | Purpose | Key Required? | Where to Obtain | Fallback Behavior if Missing | Free Tier Limit |
|---|---|---|---|---|---|
| **Groq Cloud** | Primary AI inference | Yes (`GROQ_API_KEY`) | [console.groq.com](https://console.groq.com) | Failover directly to Google Gemini | Generous RPM/TPM on free tier |
| **Google Gemini** | Secondary AI redundancy | Yes (`GEMINI_API_KEY`) | Google AI Studio | Failover to SHA-256 cache, then graceful message | High daily free requests |
| **Supabase PostgreSQL** | Primary storage, auth-adjacent data, RLS | Yes (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) | [supabase.com](https://supabase.com) | Memory cache + offline responses | 500MB DB, 5GB storage, 50k MAU |
| **Paystack** | Subscriptions & NGN/USD billing | Yes (`PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`) | [paystack.com](https://paystack.com) | Checkout reports honest gateway error — never fake success | Free until transactions occur |
| **Google PageSpeed Insights** | Diagnostic Core Web Vitals | Optional (`GOOGLE_PSI_API_KEY`) | [console.cloud.google.com](https://console.cloud.google.com) | Internal heuristic performance engine | 25,000 requests/day free |
| **RDAP Protocol** | Domain registration checks | **No Key** | Public ICANN RDAP (`rdap.org`) | Assumes domain active | Public open protocol |
| **Native TLS** | Certificate grade & expiration probe | **No Key** | Node.js `tls.connect` | Returns TLS timeout warning | Unlimited local |
| **axe-core** | Web accessibility evaluation | **No Key** | Self-hosted npm module | Rule heuristic checker | Unlimited local |
| **cron-job.org** | Nightly content + self-diagnostic scheduler | Secret header (`CRON_SECRET`) | [cron-job.org](https://cron-job.org) | Missed runs retry next window; site continues serving | Free tier |
| **UptimeRobot** | `GET /api/health` liveness pings | No Key | [uptimerobot.com](https://uptimerobot.com) | Render cold-starts on next visit | 50 monitors free |

---

## Environment Variable Names

Client-visible keys use the `NEXT_PUBLIC_*` names (injected by `vite.config.ts`). Server-only keys stay plain (`GROQ_API_KEY`, `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `CRON_SECRET`, `ADMIN_PASSWORD_HASH`). Full list in `.env.example` and `docs/02-DEPLOYMENT.md §5`.

---

## How to Monitor Usage

1. **Admin Lounge (`/admin`):** live AI provider latency, error rates, cache hits; PRIME Memory Matrix at `/admin/prime` shows `ai_memories` facts and recent `ai_messages`.
2. **`module_usage` table:** every invocation logs tokens, duration, provider, error. Query:
   ```sql
   SELECT ai_provider, COUNT(*), AVG(duration_ms), SUM(tokens_used)
   FROM module_usage
   GROUP BY ai_provider;
   ```
3. **`GET /api/ai/status`:** provider key presence + health without exposing secrets.
4. **`GET /api/health`:** API liveness for UptimeRobot.
