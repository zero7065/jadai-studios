# 05 — DISASTER RECOVERY PLAYBOOK

**Non-Negotiable:** The platform must never lock the founder out, never enter an unrecoverable cache state, and never crash silently.

---

## 1. The Site Is Down

- **Check Vercel Status:** Visit [vercel-status.com](https://vercel-status.com). If Vercel is experiencing an incident, point your DNS A record to your Cloudflare Pages fallback deployment.
- **Check Supabase Status:** Visit [status.supabase.com](https://status.supabase.com). If the database is restarting, the frontend renders offline notices without throwing React uncaught crashes.
- **Inspect Edge Logs:** Run `vercel logs jadai.dev` or view the **Deployments → Runtime Logs** panel in Vercel.

---

## 2. AI Stopped Responding

If user chats or diagnostics stop generating AI responses:
1. Verify `GROQ_API_KEY` in the Admin Lounge or Vercel environment variables.
2. The system should automatically fail over to `GEMINI_API_KEY`. If Gemini also fails, check the `module_usage` table to see the exact error message.
3. If both external APIs are exhausted, the platform serves cached answers from the database.
4. To test AI status directly, invoke:
   ```bash
   curl https://jadai.dev/api/ai/status
   ```

---

## 3. Payments Aren't Processing

1. Check the Paystack Webhook Log in your Paystack Dashboard (**Settings → Webhooks**).
2. Ensure the Webhook URL is set to `https://jadai.dev/api/paystack/webhook`.
3. Verify that `PAYSTACK_SECRET_KEY` matches the environment (test vs live mode).
4. Inspect the `subscriptions` table in Supabase to confirm whether customer events are arriving.

---

## 4. You Lost Admin Access (The 20-Tap Recovery Terminal)

If you are locked out of `/admin`:
1. Navigate to the homepage `https://jadai.dev`.
2. Locate the **Jadai Sigil** (the gold rhombus/diamond icon in the top navigation).
3. **Tap or click the Sigil 20 times within 5 seconds.**
4. The **Emergency Disaster Recovery Terminal** modal will immediately breach the frontend.
5. From the Recovery Terminal:
   - Click **"Purge Client Cache"** to clear corrupted session tokens.
   - Click **"Emergency Reload"** to force clear service worker registration.
6. Alternatively, use the **5-tap Quick Login** (5 taps within 2 seconds) to enter your master emergency passcode.

---

## 5. A Cache Is Stuck (Service Worker Invalidation)

If users report seeing old code or outdated assets:
1. Open `/public/sw.js`.
2. Locate line 7:
   ```javascript
   const CACHE_VERSION = 'jadai-v1';
   ```
3. Bump the version to `'jadai-v2'` (or higher).
4. Deploy the update. The `activate` event in the service worker immediately purges all obsolete caches from every client browser across the globe on next visit.
5. To bypass cache immediately on any page, append `?nocache=1` to the URL.

---

## 6. Database Corrupted or Accidentally Modified

1. Open Supabase Dashboard → **Settings → Database Backups**.
2. Free tier projects maintain daily backups. Select the point-in-time snapshot and click **Restore**.
3. If restoring manually, re-run `/lib/supabase/schema.sql` in the SQL Editor. The script is idempotent and safely re-creates missing tables and policies without dropping unrelated data.
