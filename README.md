# JADAI STUDIOS

> **BUILD DIFFERENT • Build the floor**
> Founder: Jehu Nanpan (Jadai / Hudson)
> Headquarters: Jos, Nigeria
> Live URL: [jadai.dev](https://jadai.dev)

Sovereign creative-technology studio: 16 playground engines, a 70-episode Book of Lies canon, an elite template marketplace, JadaiHub, Jadai Signal radar, and the PRIME Oracle — all at $0/month infrastructure cost.

---

## Stack (Locked)

| Layer | Technology |
|---|---|
| Frontend | Vite 8 + React 19 SPA (hand-rolled router in `src/App.tsx`), Tailwind v4, motion/react |
| Backend | Express via `tsx server.ts` (API + Vite dev middleware + static `dist/` in production) |
| Database | Supabase PostgreSQL (34 tables, RLS) — `lib/supabase/schema.sql` |
| Hosting | Cloudflare Pages (static) + Render Free (`api.jadai.dev`) |
| Payments | Paystack (NGN + USD) — canonical plans in `lib/paystack/index.ts` |
| AI | Groq → Gemini → cache → graceful fallback (`lib/ai/index.ts`) |

No Next.js, no Vercel. Deployment details in [`docs/02-DEPLOYMENT.md`](docs/02-DEPLOYMENT.md).

---

## Local Development

```bash
npm install
cp .env.example .env        # fill in the keys
npm run dev                 # Express + Vite on http://localhost:3000
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (tsx server.ts, Vite middleware, HMR) |
| `npm run build` | Production bundle → `dist/` |
| `npm start` | Production server (serves API + static SPA) |
| `npm run lint` | Type check (`tsc --noEmit`) |
| `npm run gen:admin-hash` | Hash a new admin password into `ADMIN_PASSWORD_HASH` |
| `npm run gen:icons` | Regenerate PWA icons |

---

## Documentation

| File | Contents |
|---|---|
| [`docs/00-START-HERE.md`](docs/00-START-HERE.md) | Orientation: what the platform is and what exists |
| [`docs/01-ARCHITECTURE.md`](docs/01-ARCHITECTURE.md) | System topology, AI chain, auth, payments, modules |
| [`docs/02-DEPLOYMENT.md`](docs/02-DEPLOYMENT.md) | Cloudflare Pages + Render + Supabase go-live checklist |
| [`docs/03-DATA-SOURCES.md`](docs/03-DATA-SOURCES.md) | External services registry and free-tier limits |
| [`docs/04-MODULES.md`](docs/04-MODULES.md) | How to add/remove a module in minutes |
| [`docs/05-RECOVERY.md`](docs/05-RECOVERY.md) | Disaster recovery playbook |

---

## Repo Map

```
app/            Page components (site, admin, legal) — imported by src/App.tsx
components/     UI, layout, sections, providers
lib/            Data, AI, paystack, supabase, modules engine
modules/        Self-contained feature modules (+ _template)
src/App.tsx     Route table + shell
server.ts       Express API, auth, rate limits, cron, static serving
public/         PWA (sw.js, manifest), _redirects for Cloudflare Pages
render.yaml     Render service definition
```
