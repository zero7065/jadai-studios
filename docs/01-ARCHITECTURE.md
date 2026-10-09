# 01 — SYSTEM ARCHITECTURE & DATA FLOWS

**JADAI STUDIOS • BUILD DIFFERENT**

---

## 1. System Topology

```
                      +-----------------------------+
                      |        CLIENT BROWSER       |
                      |  React 19 SPA (Vite bundle) |
                      |  src/App.tsx route table    |
                      +--------------+--------------+
                                     |
              Cloudflare Pages (static dist/) — jadai.dev
              public/_redirects proxies /api/* and /s/*
                                     |
                                     v
                      +-----------------------------+
                      |   RENDER FREE — api.jadai.dev
                      |   server.ts (Express, tsx)  |
                      |  - HMAC admin auth          |
                      |  - per-IP rate limits       |
                      |  - cron secret guard        |
                      |  - SPA fallback + static    |
                      +------+-------------+--------+
                             |             |
              +--------------+--+          v
              v                 v   +-------------------+
   +--------------------+  +-----+-----+   | SUPABASE POSTGRES |
   |     AI LAYER       |  | PAYSTACK  |   | 34 tables, RLS    |
   | 1. Groq (Llama)    |  | checkout +|   | ai_memories       |
   | 2. Gemini          |  | webhook   |   | ai_messages       |
   | 3. SHA-256 cache   |  +-----------+   | template_orders   |
   | 4. graceful text   |                  | admin_audit ...   |
   +--------------------+                  +-------------------+
```

- **Development:** `npm run dev` runs `tsx server.ts`, which mounts Vite as middleware — one origin, HMR on port 3000.
- **Production:** Cloudflare Pages serves the built SPA; `public/_redirects` forwards `/api/*` and `/s/*` to the Render service. Alternatively set `SERVE_STATIC=1` on Render and skip Pages entirely.

---

## 2. Routing

The SPA uses a hand-ordered route table in `src/App.tsx` (not file-system routing):

- `/admin/*` — 20 admin pages behind the 5-tap HMAC session.
- Public: `/`, `/playground`, `/playground/:slug` (intercepts `forge|mirage|sentinel|oracle` into their module pages), `/book-of-lies`, `/marketplace`, `/hub`, `/services`, `/pricing`, `/upgrade`, `/account/*`, `/legal/*`, `/offline`, …
- Server: short links at `/s/:slug`, catch-all `*` serves the SPA shell.

---

## 3. The 4-Step AI Fallback Chain

Every model call through `generateText(prompt, options)` (`lib/ai/index.ts`) guarantees a result — never a white screen:

1. **Groq Primary:** `GROQ_API_KEY` present → fast chat model.
2. **Gemini Secondary:** on Groq rate-limit/timeout → `@google/genai`.
3. **Cache Layer:** both unreachable → `SHA-256(prompt + systemPrompt)` memory/database cache replay.
4. **Graceful Degradation:** cache miss → honest offline message. Client surfaces label these (`OFFLINE STUDY`, `OFFLINE SAMPLE`) and do **not** consume quota.

### Unified Client Transport (`lib/ai/memory.ts`)

All AI surfaces call one client — `askPrime({ prompt, persona, history, memory, scope, systemPrompt })` — instead of hand-rolled fetches:

- Builder identity `bld_*`, scoped transcripts (`oracle`, `guide`, `forge`, …) posted to `POST /api/ai/chat`.
- Facts persisted to IndexedDB (`lib/prime/memory-device.ts`) and mirrored to `POST /api/ai/memory` (`ai_memories`).
- Server continuity protocol (`assembleChatRequest`) injects prior-exchange memory into the next turn.
- Exchanges persist to `ai_messages`; every 12th row triggers extraction into `ai_memories`.
- `primeWelcome` composes personalized openers; `clearAllMemory` wipes device + server memory.

---

## 4. Auth & Security

- **Admin:** 5-tap logo sequence (3s) → passcode → HMAC-signed session cookie over `SESSION_SECRET` (≥32 chars). Password check against `ADMIN_PASSWORD_HASH` (`npm run gen:admin-hash`). All `/api/admin/*` routes pass `requireAdmin`.
- **Public tiers:** `free | foundation | voice | architecture | prime` gated in `lib/auth/tier.ts`; entitlements activate from Paystack webhooks into `subscriptions`.
- **Rate limiting:** per-IP buckets on AI, module, auth, and cron routes.
- **Cron:** `/api/cron/*` requires `CRON_SECRET` (relaxed only outside production).
- **Recovery:** 20-tap logo → Disaster Recovery Terminal (cache purge, SW unregister, PRIME memory wipe).
- Every admin mutation writes `admin_audit` rows.

---

## 5. Payments (Canonical Price Book)

Single source of truth: `STARTUP_PAYSTACK_PLANS` in `lib/paystack/index.ts`.

| Plan | USD | NGN |
|---|---|---|
| free | $0 | ₦0 |
| playground | $9/mo | ₦8,000/mo |
| studio_premium | $5/mo | ₦4,000/mo |
| signal_pro | $19/mo | ₦15,000/mo |
| signal_business | $49/mo | ₦45,000/mo |

`/pricing`, `/upgrade`, SubscribeModal, and UpgradeModal all render from this object; checkout posts `{ email, currency, plan }` to `POST /api/paystack/initialize` and redirects to `authorization_url`. Webhook (`/api/paystack/webhook`) verifies signature and activates entitlements. Reference mismatch → 404-style honest failure, never fake success.

---

## 6. The Self-Contained Module System

Every service is isolated in `/modules/[name]/`:

```
modules/
└── [module-name]/
    ├── index.ts        # defineModule() — metadata, tier, routes
    ├── page.tsx        # React client interface
    ├── api/            # Pure TS handlers
    └── README.md       # Operational notes
```

- Adding a module: copy `modules/_template`, register one line in `lib/modules/modules.config.ts`.
- `POST /api/modules/:slug` dispatches `{ action }` with tier checks, rate limiting, and `module_usage` telemetry (tokens, provider, latency, errors).
- 14 modules registered: forge, mirage, sentinel, diagnostic, oracle, dream-forge, resume-editor, doc-analyzer, growth-maker, template-market, hub, book-of-lies, career-board, _template.

---

## 7. Design & Simplicity Rules

- Nav items: max 4 per header (+ Home sigil). Primary CTA: 1 per screen.
- Max 3 colors per section (void background, one accent, one text).
- Copy voice: plain, human English — every product answers **why it exists, what it does, how to use it, and why us**.
- All failure states are honest: real error text + Retry, never silent fake-success.
