# 02 — DEPLOYMENT GUIDE

**Deployment Target:** `jadai.dev`  
**Primary Host:** Vercel (Hobby Tier — $0/month)  
**Database:** Supabase PostgreSQL ($0/month free tier)  
**Payments:** Paystack (Zero upfront fee; per-transaction fee only)

---

## 1. Primary Deployment: Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: bootstrap jadai studios foundation architecture"
   git branch -M main
   git remote add origin https://github.com/jadaistudios/jadai-platform.git
   git push -u origin main
   ```
2. Navigate to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `jadai-platform` repository.
4. Framework Preset: **Next.js** (Root Directory: `./`).
5. Configure Environment Variables in the Vercel Dashboard (from `.env.example`).
6. Click **Deploy**. First deployment completes automatically within ~90 seconds.
7. Under **Settings → Domains**, add `jadai.dev` and `www.jadai.dev`.
8. Point your domain DNS records (A record `@` to `76.76.21.21` and CNAME `www` to `cname.vercel-dns.com`).

---

## 2. Fallback Host: Cloudflare Pages

If Vercel ever suffers an upstream outage:
1. Link your repo to Cloudflare Pages.
2. Build command: `npx @cloudflare/next-on-pages`.
3. Output directory: `.vercel/output/static`.
4. Add identical environment variables.
5. Deploy immediately without altering codebase logic.

---

## 3. Database: Supabase PostgreSQL Setup

1. Create a new free organization and project on [supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab.
3. Paste the entire contents of `/lib/supabase/schema.sql` into the editor.
4. Click **Run**. All 20 tables, custom functions (`is_admin`, `current_user_country`), updated_at triggers, RLS policies, indexes, and module seed rows are created in a single transaction.
5. Copy your Project URL and Anon Key to Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 4. Supabase Storage Buckets

Create the following storage buckets manually in the Supabase Dashboard:
1. `avatars` — Public read, Authenticated write, 5MB limit.
2. `portfolio` — Public read, Admin write, 10MB limit.
3. `templates` — Private read, Admin write, 50MB limit.
4. `book-of-lies` — Public read, Admin write, 20MB limit.

---

## 5. Payments: Paystack Integration

1. Register an account at [paystack.com](https://paystack.com) (Nigerian business registration).
2. In the Paystack Dashboard, enable international cards under Preferences.
3. Under **Settings → API Keys & Webhooks**:
   - Copy `Secret Key` to `PAYSTACK_SECRET_KEY`
   - Copy `Public Key` to `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - Set Webhook URL to: `https://jadai.dev/api/paystack/webhook`

---

## 6. Zero-Cost Navigation Guarantee

Every layer of this architecture is $0 before your first transaction:
- **Vercel Hobby:** Free forever (100GB bandwidth, serverless compute).
- **Supabase Free:** 500MB PostgreSQL, 5GB storage, 50,000 monthly active users.
- **Groq:** Free tier with high rate limits for `llama-3.3-70b-versatile`.
- **Google Gemini:** Free quota for `gemini-3.8-flash`.
- **Paystack:** 0 setup fee, 0 monthly maintenance; only deducts a micro-percentage upon successful customer checkout.
- **Resend:** 3,000 free transactional emails / month.
- **jadai.dev Domain:** ~$12/year from registrar.
