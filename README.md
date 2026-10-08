# JADAI STUDIOS

> **BUILD DIFFERENT • Build the floor**  
> Founder: Jehu Nanpan (Jadai / Hudson)  
> Headquarters: Jos, Nigeria  
> Live URL: [jadai.dev](https://jadai.dev)

---

## Foundation & Architecture (Prompt 1 of 3)

This repository contains the complete foundation of the Jadai Studios software platform:
- **Supabase PostgreSQL Schema:** 20 tables with Row Level Security (RLS) in `/lib/supabase/schema.sql`.
- **4-Step AI Fallback Chain:** Groq → Google Gemini → SHA-256 Cache → Graceful Degradation in `/lib/ai/`.
- **Decoupled Module System:** Plug-and-play architecture in `/modules/` with rate limiting and usage telemetry.
- **Site Reliability Diagnostic Engine:** Core Web Vitals, TLS security, accessibility, RDAP check, and AI fix guides in `/lib/diagnostics/` and `/modules/diagnostic/`.
- **Admin Lounge Self-Check:** Autonomous platform health audit.
- **Ask, Don't Assume Settings Engine:** Automatic Nigerian and country-appropriate fallbacks with inline admin prompts.
- **PWA with Safe Invalidation:** Service worker with `CACHE_VERSION = 'jadai-v1'` and offline fallback.
- **Complete Architecture Docs:** All guides located in `/docs/`.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to inspect the live system.
