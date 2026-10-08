# 01 — SYSTEM ARCHITECTURE & DATA FLOWS

**JADAI STUDIOS • BUILD DIFFERENT**

---

## 1. System Topology Overview

```
                      +-----------------------------+
                      |        CLIENT BROWSER       |
                      |   (Next.js App / PWA sw.js)  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               | (HTTPS / Bearer Auth / Cookies / Tap)     |
               v                                           v
    +----------------------+                   +----------------------+
    |    PUBLIC ROUTES     |                   |    /ADMIN/* ROUTES   |
    |  - /, /diagnostic    |                   |  - Self-Diagnostics  |
    |  - /oracle, /hub     |                   |  - Settings Auditor  |
    |  - /marketplace      |                   |  - Module Management |
    +----------+-----------+                   +----------+-----------+
               |                                           |
               +---------------------+---------------------+
                                     |
                                     v
                        +-------------------------+
                        |      MIDDLEWARE.TS      |
                        | - Rate Limiter (100/m)  |
                        | - Admin Cookie Guard    |
                        | - Security & CSP Headers|
                        +------------+------------+
                                     |
                                     v
                        +-------------------------+
                        |      MODULE ENGINE      |
                        |  /lib/modules/define    |
                        |  modules.config.ts      |
                        +------------+------------+
                                     |
           +-------------------------+-------------------------+
           |                                                   |
           v                                                   v
+-----------------------+                           +---------------------+
|      AI LAYER         |                           |  SUPABASE POSTGRES  |
| 1. Groq (Llama-3.3)   |                           | 20 Tables with RLS  |
| 2. Gemini (3.8-Flash) |                           | is_admin() Checks   |
| 3. SHA-256 Cache      |                           | module_usage logs   |
| 4. Graceful Fallback  |                           | admin_settings      |
+-----------------------+                           +---------------------+
```

---

## 2. The 4-Step AI Fallback Chain

Every AI request executed via `generateText(prompt, options)` guarantees zero white screens and zero unhandled exceptions:

1. **Groq Primary:** Checks if `GROQ_API_KEY` is present. Invokes `llama-3.3-70b-versatile` with sub-300ms latency.
2. **Gemini Secondary:** If Groq encounters rate limiting or network timeout, the request seamlessly shifts to `@google/genai` utilizing `gemini-3.8-flash`.
3. **Cache Layer:** If both external AI APIs are unreachable, the engine computes `SHA-256(prompt + systemPrompt)` and checks the memory and database cache for identical historical answers.
4. **Graceful Degradation:** If cache misses, the platform returns:
   *"AI is temporarily unavailable. Please try again in a moment. Your request has been queued and saved."*

Every call asynchronously writes to `module_usage` with latency, tokens used, provider used, and error logs.

---

## 3. The "Ask, Don't Assume" Settings Architecture

Components never crash when configuration keys are missing.
Instead:
- The system checks `admin_settings` table.
- If missing, checks `process.env`.
- If missing, falls back to `country-defaults.ts` (e.g. Nigerian Naira ₦, Paystack gateways, and Jos headquarters contact email).
- In the Admin Lounge, an explicit prompt is surfaced:
  `"You haven't set your Groq API key yet. Add it in Admin Settings to enable primary inference."`
- Public users never see errors or broken fields.

---

## 4. The Self-Contained Module System

Every service is isolated in `/modules/[name]/`:
```
modules/
└── [module-name]/
    ├── index.ts        # JadaiModule definition & metadata
    ├── page.tsx        # React client interface
    ├── api/            # API endpoints isolated to this module
    └── README.md       # Operational documentation
```
- Adding a module requires:
  1. Dropping the folder into `/modules/`
  2. Adding one line in `lib/modules/modules.config.ts`
- Zero router rewiring. Catch-all `/app/[...module]/page.tsx` and `/app/api/modules/[...slug]/route.ts` dynamically mount the interface, execute tier checks, rate limit, and log telemetry.

---

## 5. Supplement A Design Reference Matrix & Signal Architecture

### A. 4 New Design References
- **Reference 9 — Velopay (Dark Blue-Green with Lime Accent):**
  - Maps to: Signal Radar dashboard
  - Centered massive headline ("SIGNAL"), gradient map with pulsating arcs between platforms and product, converter-style panel (signal in / outreach out).
- **Reference 10 — Flight Tracker HUD (Amber on Navy):**
  - Maps to: Signal Detail panel & telemetry
  - Aerospace command center with curved animated glow arcs, status badges, and labeled metadata rails.
- **Reference 11 — Surface (Fantasy 3D with Bento):**
  - Maps to: Signal empty state, Dream Forge, and Studio landing
  - Floating celestial crystal structures, 60px rounded glass bento cards, minimal clean copy.
- **Reference 12 — GCORE (Central Node with Satellite Web):**
  - Maps to: Jadai Signal landing hero
  - 120px circular central node with orbiting satellite platforms (HN, GitHub, Reddit, X, Threads, Web) with animated pulse lines.

### B. Global Simplicity Rules
- **Nav items:** 4 maximum on any header (+ Home Sigil return button)
- **Primary CTAs:** 1 per screen; secondary CTAs are ghost buttons
- **Text density:** Maximum 60 words visible at once on mobile
- **Whitespace:** Minimum 60% of any viewport
- **Type scale:** Hero = 8–14vw, H1 = 5vw, Body = 1.05rem max
- **Section count:** Maximum 5 sections per page
- **Copy voice:** Plain, human, elegant English without marketing fluff
- **Colors per section:** Maximum 3 (void background, one accent, one text color)
