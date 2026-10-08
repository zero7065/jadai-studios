# 00 — START HERE: JADAI STUDIOS ORIENTATION

**Founder:** Jehu Nanpan (Jadai / Hudson)  
**Location:** Jos, Nigeria  
**Tagline:** BUILD DIFFERENT  
**Motto:** Build the floor  
**Deployment Target:** jadai.dev  
**Platform Version:** 1.0 (Foundation)

---

## What This Platform Is

JADAI STUDIOS is a sovereign, high-tier architectural technology suite and intelligence studio. Built with extreme mathematical discipline, void-and-gold visual authority, and zero tolerance for boilerplate slop.

This platform houses:
1. **Diagnostic Suite:** Ruthless site reliability, Core Web Vitals, TLS security, accessibility, and AI remediation.
2. **PRIME Oracle:** Strategic reasoning and intelligence advisory engine.
3. **Dream Forge:** Multi-step pipeline turning concepts into technical architecture blueprints.
4. **JadaiHub:** Collaborative missions, talent exchange, and code reviews.
5. **The Book of Lies:** Philosophical transmissions released nightly at 9:47 PM.
6. **Elite Template Market:** Production-grade boilerplates and starter architectures.

---

## What Has Been Built in Prompt 1 (The Floor)

Prompt 1 establishes the indestructible foundation upon which Prompts 2 and 3 build:
- **Complete Supabase Database (`/lib/supabase/schema.sql`):** 20 tables with strict Row Level Security (RLS), custom security functions (`is_admin`, `current_user_country`), updated triggers, and initial seed data for 10 modules and 17 admin keys.
- **Module Engine (`/lib/modules/`):** Self-contained modular architecture. Every service is an isolated module with decoupled routing and automated rate limiting. Includes a working reference `_template` and live `diagnostic` module.
- **Unbreakable 4-Step AI Fallback Chain (`/lib/ai/`):** Groq (`llama-3.3-70b-versatile`) → Google Gemini (`gemini-3.8-flash`) → Cache Layer → Graceful Degradation message. Zero silent crashes, zero white screens.
- **Ask, Don't Assume Settings System (`/lib/settings/`):** Missing credentials prompt the admin directly in the Admin Lounge while simultaneously providing country-appropriate Nigerian (or locale-specific) fallbacks to public users.
- **Platform Self-Diagnostics (`/lib/diagnostics/`):** Admin self-checker monitoring PostgreSQL health, API latencies, error rates, and cache hit percentages.
- **PWA & Invalidation Strategy (`/public/`):** `manifest.json`, `sw.js` with `CACHE_VERSION = 'jadai-v1'`, stale-while-revalidate, and offline fallback.
- **Design Tokens & System Atoms (`/components/ui/`):** Button, GlassCard, Metatron's Cube Sacred Geometry, StatusBadge, Modal, Toast, ThemeToggle, and Logo with 5-tap Quick Login and 20-tap Disaster Recovery terminal.

---

## Running Locally

```bash
# 1. Clone repository
git clone https://github.com/jadaistudios/jadai-platform.git
cd jadai-platform

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Launch development server (Port 3000)
npm run dev
```

---

## What Comes Next

- **Prompt 2:** Public Platform & AI Systems (Hero void, holographic browser frames, 3D Book of Lies carousel, interactive PRIME Oracle chat streaming, Dream Forge multi-step builder).
- **Prompt 3:** Admin Lounge & Launch (Full operational Admin Lounge, Paystack automated subscription billing & webhooks, 9:47 PM daily content delivery engine, watermarking, and public launch checklist).
