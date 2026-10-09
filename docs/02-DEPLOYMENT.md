# 02 — DEPLOYMENT GUIDE

**Deployment Target:** `jadai.dev`
**Frontend:** Cloudflare Pages (static SPA, $0)
**API:** Render Free — `api.jadai.dev` ($0)
**Database:** Supabase PostgreSQL (free tier)
**Payments:** Paystack (per-transaction only)

> Vercel is disqualified: Paystack is a commercial gateway and the Vercel Hobby plan forbids commercial use. This architecture is Cloudflare Pages + Render Free instead.

---

## 1. Domain Setup (Namecheap → Cloudflare)

1. Create a Cloudflare account, add `jadai.dev`.
2. At Namecheap, change the domain's nameservers to the two Cloudflare assigned nameservers.
3. DNS records in Cloudflare:

| Type | Name | Target |
|---|---|---|
| CNAME | `@` | `<project>.pages.dev` (proxied) |
| CNAME | `www` | `jadai.dev` (proxied) |
| CNAME | `api` | `<service>.onrender.com` (proxied) |

4. Create a Page Rules / redirect so `api.jadai.dev` always resolves to the Render service (the `api` CNAME handles this).

---

## 2. Frontend: Cloudflare Pages

1. Push the repository to GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** set `NODE_VERSION=22` (engines require >= 22).
4. Deploy. First build produces the static SPA.
5. Custom domain: add `jadai.dev` + `www.jadai.dev` to the Pages project.
6. `public/_redirects` (shipped with the build) proxies:
   ```
   /api/*   https://api.jadai.dev/api/:splat   200
   /s/*     https://api.jadai.dev/s/:splat     200
   ```

---

## 3. API: Render Free

`render.yaml` at the repo root defines the service:

```yaml
buildCommand: npm ci
startCommand: npm run start      # tsx server.ts
healthCheckPath: /api/health
SERVE_STATIC: "0"                # Pages serves the SPA
```

1. Render → **New → Web Service** → connect the repo (render.yaml is auto-detected).
2. Set the sensitive env vars in the dashboard (see §5).
3. Render assigns `<service>.onrender.com` — point the `api` DNS record at it.
4. Set `NEXT_PUBLIC_APP_URL=https://jadai.dev` so cookies, CORS, and return URLs are correct.

**Alternative (no Pages):** set `SERVE_STATIC=1` on Render and point all DNS at the single service — the SPA is served by Express from `dist/`.

---

## 4. Database: Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. SQL Editor → paste all of `lib/supabase/schema.sql` → **Run**.
   Idempotent (`CREATE TABLE IF NOT EXISTS`): 34 tables, RLS policies, `is_admin()`, updated_at triggers, module seeds. Re-run safely after schema updates.
3. Copy into Render env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never ship to the client)

### Storage buckets (dashboard → Storage)

| Bucket | Access |
|---|---|
| `avatars` | public read / auth write, 5MB |
| `portfolio` | public read / admin write, 10MB |
| `templates` | private / admin write, 50MB |
| `book-of-lies` | public read / admin write, 20MB |

---

## 5. Environment Variables (Render → Environment)

| Key | Purpose |
|---|---|
| `NODE_ENV=production` | production behavior |
| `SERVE_STATIC=0` | API-only mode (Pages serves SPA) |
| `SESSION_SECRET` | ≥32 chars — admin HMAC signing (auto-generated) |
| `CRON_SECRET` | guards `/api/cron/*` (auto-generated) |
| `ADMIN_EMAIL` | admin identity |
| `ADMIN_PASSWORD_HASH` | `npm run gen:admin-hash` output |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | database |
| `SUPABASE_SERVICE_ROLE_KEY` | server-side database writes |
| `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | payments |
| `GROQ_API_KEY` / `GEMINI_API_KEY` | AI chain (either/both — missing keys fail over) |
| `NEXT_PUBLIC_APP_URL=https://jadai.dev` | CORS, cookies, return URLs |
| `CORS_ORIGINS` | optional override (defaults to `NEXT_PUBLIC_APP_URL`) |

> Client-bundle keys are the `NEXT_PUBLIC_*` ones — they are injected by `vite.config.ts` `define`. Everything else is server-only.

---

## 6. Payments: Paystack

1. Register at [paystack.com](https://paystack.com); enable international cards.
2. **Settings → API Keys & Webhooks:**
   - Secret Key → `PAYSTACK_SECRET_KEY`
   - Public Key → `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - Webhook URL: **`https://api.jadai.dev/api/paystack/webhook`**
3. Plan codes in `lib/paystack/index.ts` (`STARTUP_PAYSTACK_PLANS`) must match your Paystack plans.
4. Test first with `sk_test_` / `pk_test_` — checkout redirects to Paystack sandbox.

---

## 7. Cron & Uptime (Free)

| Service | Target | Auth |
|---|---|---|
| [cron-job.org](https://cron-job.org) | `https://api.jadai.dev/api/cron/deliver-content` (nightly 9:47 PM WAT) | header `x-cron-secret: $CRON_SECRET` |
| cron-job.org | `https://api.jadai.dev/api/cron/self-diagnostic` (every 6h) | same |
| [UptimeRobot](https://uptimerobot.com) | `https://api.jadai.dev/api/health` (5 min) | none |

---

## 8. Zero-Cost Guarantee

- **Cloudflare Pages:** free, unlimited bandwidth.
- **Render Free:** free web service (sleeps after inactivity — UptimeRobot pings keep it warm).
- **Supabase Free:** 500MB DB, 5GB storage, 50k MAU.
- **Groq / Gemini:** free tiers with generous limits; either missing still works (failover).
- **Paystack:** ₦0 setup — only per-transaction fees.
- **cron-job.org / UptimeRobot:** free tiers.

First steady-state cost: domain (~$12/year) + transaction fees after your first sale.

---

## 9. Pre-Launch Checklist

- [ ] `lib/supabase/schema.sql` re-run (picks up `ai_memories`, `ai_messages`, `contact_submissions`, `dream_forge_intakes`).
- [ ] `ADMIN_PASSWORD_HASH` generated and set.
- [ ] Nameservers moved; three DNS records live.
- [ ] Pages build green; `curl https://jadai.dev/api/health` → 200 via Render.
- [ ] Paystack webhook fires (check dashboard → Webhooks log).
- [ ] Both cron jobs saved with the secret header.
- [ ] Smoke test: register → subscribe (test key) → entitlement active; PRIME chat answers offline-labelled when keys are absent.
