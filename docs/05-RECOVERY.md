# 05 — DISASTER RECOVERY PLAYBOOK

**Non-Negotiable:** the platform must never lock the founder out, never enter an unrecoverable cache state, and never crash silently.

---

## 1. The Site Is Down

- **Check status pages first:** [Cloudflare status](https://www.cloudflarestatus.com) → [Render status](https://status.render.com) → [Supabase status](https://status.supabase.com).
- **Static loads, actions fail** → Render API is down or asleep. Hit `https://api.jadai.dev/api/health` directly; Render cold-starts within ~30s on free tier. If it 500s, check Render → Logs.
- **Nothing loads** → DNS or Pages. Verify the three CNAME records (`@` → pages.dev, `www` → jadai.dev, `api` → onrender.com) in Cloudflare, and the Pages build in the Cloudflare dashboard.
- **Inspect API logs:** Render → your service → Logs. Client-side failures: browser console + Network tab.

---

## 2. AI Stopped Responding

1. Test the chain directly: `curl https://api.jadai.dev/api/ai/status` — reports which provider keys are present.
2. Verify `GROQ_API_KEY` / `GEMINI_API_KEY` in Render environment variables (a redeploy is required for env changes to take effect).
3. Either key alone is enough — the chain fails over automatically. If both fail, the cache layer serves historical answers; cache misses return the honest graceful message (no crash, no quota consumed).
4. Inspect failures: `SELECT * FROM ai_messages ORDER BY created_at DESC LIMIT 50;` or the PRIME Memory Matrix at `/admin/prime`.

---

## 3. Payments Aren't Processing

1. Paystack Dashboard → **Settings → Webhooks** — confirm the URL is **`https://api.jadai.dev/api/paystack/webhook`** and the recent events returned 200.
2. Verify `PAYSTACK_SECRET_KEY` matches the mode (test vs live) and the plan codes in `lib/paystack/index.ts` exist in Paystack.
3. Check the `subscriptions` and `template_orders` tables for arriving events; check Render logs for `paystack` signature-verification errors.
4. Return URLs depend on `NEXT_PUBLIC_APP_URL=https://jadai.dev` — a missing/mismatched value breaks the post-checkout redirect.

---

## 4. You Lost Admin Access (The Tap Sequences)

1. **5-tap quick login:** tap the Jadai Sigil in the top nav **5 times within 3 seconds** → enter the master passcode. Hash a new passcode anytime with `npm run gen:admin-hash` and update `ADMIN_PASSWORD_HASH` in Render.
2. **20-tap Disaster Recovery Terminal:** tap the Sigil **20 times** → the Recovery Terminal breaches the frontend with:
   - **Purge client caches** (localStorage, IndexedDB, PRIME device memory)
   - **Clear PRIME AI memory** (device facts + server sync, rotates builder identity)
   - **Unregister all service workers** + emergency reload
3. If the session cookie itself is corrupted, the 5-tap flow issues a fresh HMAC session from `SESSION_SECRET`.

---

## 5. A Cache Is Stuck (Service Worker Invalidation)

Users seeing old code:

1. Open `public/sw.js`, line 7: `const CACHE_VERSION = 'jadai-v2';`
2. Bump to `'jadai-v3'` (or higher), commit, deploy.
3. The `activate` handler purges every obsolete cache on each client's next visit.
4. Immediate bypass on any page: append `?nocache=1` to the URL. Nuclear option: Recovery Terminal → "Unregister all service workers".

---

## 6. Database Corrupted or Accidentally Modified

1. Supabase Dashboard → **Settings → Database Backups** → restore the point-in-time snapshot.
2. Schema drift: re-run all of `lib/supabase/schema.sql` in the SQL Editor. It is idempotent (`CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`, guarded functions) — it creates missing tables/policies without touching existing rows.
3. Data-integrity forensics: `admin_audit` records who did what in the Admin Lounge; `module_usage` and `ai_messages` retain request history.

---

## 7. Render or Pages Deployment Failed

- **Render build fails:** almost always Node version (`engines: >= 22`) or `npm ci` lockfile mismatch — run `npm ci` locally to verify. Check the build log for the exact `tsc`/vite error; `npm run lint` reproduces type errors locally.
- **Pages build fails:** same story — the build runs `npm run build` (`vite build`). Keep `dist/` git-ignored (it is).
- **Bad deploy already live:** Rollbacks — Render → Deploys → previous good deploy → **Rollback**; Cloudflare Pages → Deployments → previous deployment → **Rollback to this deployment**. Database changes are forward-only: keep schema edits additive so rollbacks stay safe.

---

## 8. Contact/Newsletter Intake Down

`POST /api/contact` and `/api/newsletter` write to Supabase and return honest 500s on failure. If the table is missing (schema not re-run), submissions fail loudly in Render logs — re-run the schema; no messages are silently dropped.
