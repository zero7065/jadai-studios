# 00 — START HERE: JADAI STUDIOS ORIENTATION

**Founder:** Jehu Nanpan (Jadai / Hudson)
**Location:** Jos, Nigeria
**Tagline:** BUILD DIFFERENT
**Motto:** Build the floor
**Deployment Target:** jadai.dev (Cloudflare Pages + Render Free + Supabase Free — $0/month)

---

## What This Platform Is

JADAI STUDIOS is a sovereign, high-tier architectural technology suite and intelligence studio. Built with mathematical discipline, void-and-gold visual authority, and zero tolerance for placeholder work.

Live surfaces:

1. **Playground — 16 engines:** FORGE (documents/OCR), ORACLE (PRIME Socratic companion), MIRAGE (4K visual synthesis), SENTINEL (site audits/link cloaking), plus 12 utility engines — every one with why/what/how copy and honest offline fallbacks.
2. **The Book of Lies:** 70 scene-driven episodes across 7 sins + Discernment, nightly transmissions.
3. **Elite Template Marketplace:** Production templates with Paystack checkout, ownership tracking, and download library.
4. **JadaiHub:** Listings, missions, and community with server-backed moderation.
5. **Jadai Signal:** Autonomous signal radar (free/pro/business/agency tiers).
6. **PRIME Oracle:** Strategic reasoning with a persistent memory layer (device + server, scoped per surface).

Plus: Dream Forge pipelines, ghostwriting/writing studio, services catalog, and a 20-page Admin Lounge.

---

## What Exists Today (Foundation + Platform)

- **Database:** 34-table Supabase schema (`/lib/supabase/schema.sql`) with RLS, `is_admin()`, updated_at triggers, and tables for AI memory (`ai_memories`, `ai_messages`), orders (`template_orders`), intakes (`contact_submissions`, `dream_forge_intakes`), and telemetry.
- **AI layer:** 4-step fallback chain (Groq → Gemini → SHA-256 cache → graceful message) in `/lib/ai/`, plus a unified client transport `askPrime`/`askGrounded` (`lib/ai/memory.ts`) that every AI surface uses — scoped transcripts, IndexedDB facts, server memory sync, continuity protocol.
- **Payments:** Paystack checkout with a single canonical price book (`STARTUP_PAYSTACK_PLANS` in `lib/paystack/index.ts`) shared by `/pricing`, `/upgrade`, and both modals. Webhook activates entitlements server-side.
- **Security:** HMAC admin sessions (`SESSION_SECRET` ≥ 32 chars), `ADMIN_PASSWORD_HASH` login, route guards, per-IP rate limits, cron secret, admin audit rows.
- **Module engine:** 14 self-contained modules + `_template` (`/modules/`) registered in `lib/modules/modules.config.ts`.
- **PWA:** `sw.js` with `CACHE_VERSION = 'jadai-v2'`, stale-while-revalidate, offline fallback.
- **Design system:** Button, GlassCard, EdgeGlow, SacredGeometry, Modal (animated), Toast, FAQSection, DefensiveFallback with Retry.

---

## Running Locally

```bash
npm install
cp .env.example .env      # add Supabase, Groq/Gemini, Paystack keys
npm run dev               # http://localhost:3000
```

Admin: tap the logo **5 times within 3 seconds** → enter passcode (hash via `npm run gen:admin-hash`).

---

## What Comes Next

- Move `jadai.dev` nameservers to Cloudflare; DNS: `@` CNAME → `<project>.pages.dev`, `www` → `jadai.dev`, `api` → `<service>.onrender.com`.
- Re-run `lib/supabase/schema.sql` (adds `ai_memories`, `ai_messages`, `contact_submissions`, `dream_forge_intakes`).
- Wire cron-job.org → `/api/cron/deliver-content` + `/api/cron/self-diagnostic`, UptimeRobot → `/api/health`.
