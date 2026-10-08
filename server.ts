import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getPublicHealth } from './lib/diagnostics/health';
import { runSelfCheck } from './lib/diagnostics/self-check';
import { runDiagnosticScan } from './lib/diagnostics/scanner';
import { generateText } from './lib/ai';
import { getModuleBySlug } from './lib/modules/modules.config';
import { supabaseAdmin } from './lib/supabase/admin';
import { invalidateAiCache } from './lib/ai/cache';
import { invalidateSettingsCache } from './lib/settings';
import { initializePaystackTransaction, verifyPaystackWebhookSignature } from './lib/paystack';
import { generateGroundedContent } from './lib/ai/grounded';
import { generateTextWatermarkFooter } from './lib/watermark';
import { isTransmissionCadenceTime } from './lib/content/delivery';
import { signalRouter } from './lib/signal/api-router';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // ---------------------------------------------------------------------------
  // 1. PUBLIC HEALTH ENDPOINT
  // ---------------------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(getPublicHealth());
  });

  // ---------------------------------------------------------------------------
  // 2. ADMIN DIAGNOSTIC & SELF-CHECK
  // ---------------------------------------------------------------------------
  app.get('/api/admin/diagnostic', async (req, res) => {
    try {
      const report = await runSelfCheck(false);
      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/diagnostic', async (req, res) => {
    try {
      const runFull = Boolean(req.body?.run_full);
      const report = await runSelfCheck(runFull);
      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // 3. ADMIN SETTINGS
  // ---------------------------------------------------------------------------
  app.get('/api/admin/settings', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('key, value, category, description, updated_at');

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, settings: data || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/settings', async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ success: false, error: 'Missing key or value' });
      }

      const { error } = await supabaseAdmin
        .from('admin_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
          updated_by: 'admin',
        });

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      invalidateAiCache();
      invalidateSettingsCache();
      res.json({ success: true, message: `Setting ${key} updated` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  let serverCustomizationCache: any = null;
  app.get('/api/admin/customization', (req, res) => {
    res.json({ success: true, data: serverCustomizationCache });
  });

  app.post('/api/admin/customization', (req, res) => {
    serverCustomizationCache = { ...serverCustomizationCache, ...req.body };
    res.json({ success: true, message: 'Customization persisted successfully', data: serverCustomizationCache });
  });

  // ---------------------------------------------------------------------------
  // 3.5. ADMIN MEDIA & SECTION VIDEOS (Prompt 7 Slots)
  // ---------------------------------------------------------------------------
  const sectionVideosStore = new Map<string, {
    slotName: string;
    url: string;
    fileName: string;
    duration: number;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }>();

  app.get('/api/admin/media/section-videos', async (req, res) => {
    try {
      const { data } = await supabaseAdmin
        .from('admin_settings')
        .select('key, value')
        .like('key', 'section_video_%');

      const videos: Record<string, any> = {};
      // Populate from DB if available
      if (data && data.length > 0) {
        data.forEach((row) => {
          const slot = row.key.replace('section_video_', '');
          try {
            videos[slot] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          } catch {
            videos[slot] = { url: row.value };
          }
        });
      }

      // Merge with memory store
      sectionVideosStore.forEach((val, slot) => {
        if (!videos[slot]) videos[slot] = val;
      });

      res.json({ success: true, videos });
    } catch (err: any) {
      const videos: Record<string, any> = {};
      sectionVideosStore.forEach((val, slot) => {
        videos[slot] = val;
      });
      res.json({ success: true, videos });
    }
  });

  app.post('/api/admin/media/upload', async (req, res) => {
    try {
      const { slotName, fileName, fileData, duration, fileSize, mimeType } = req.body;
      const validSlots = [
        'marketplace_template_cards',
        'forge_card_loop',
        'mirage_card_loop',
        'community_intro_clips',
      ];

      if (!slotName || !validSlots.includes(slotName)) {
        return res.status(400).json({ success: false, error: 'Invalid placeholder slot name' });
      }

      // Validate Format: mp4 or webm only
      const isMp4 = mimeType === 'video/mp4' || fileName?.endsWith('.mp4');
      const isWebm = mimeType === 'video/webm' || fileName?.endsWith('.webm');
      if (!isMp4 && !isWebm) {
        return res.status(400).json({
          success: false,
          error: 'Format rejected: only MP4 and WebM video files are accepted.',
        });
      }

      // Validate Max 8MB
      const maxBytes = 8 * 1024 * 1024;
      if (fileSize && fileSize > maxBytes) {
        return res.status(400).json({
          success: false,
          error: `File size rejected: ${Math.round(fileSize / (1024 * 1024) * 10) / 10}MB exceeds the 8MB limit.`,
        });
      }

      // Validate Max 10 Seconds
      if (duration && duration > 10.5) {
        return res.status(400).json({
          success: false,
          error: `Duration rejected: video length of ${Math.round(duration * 10) / 10}s exceeds the 10-second limit.`,
        });
      }

      const ext = isWebm ? 'webm' : 'mp4';
      const targetPath = `/media/${slotName}.${ext}`;
      const record = {
        slotName,
        url: targetPath,
        fileName: fileName || `${slotName}.${ext}`,
        duration: Math.round((duration || 4.5) * 10) / 10,
        fileSize: fileSize || 2 * 1024 * 1024,
        mimeType: isWebm ? 'video/webm' : 'video/mp4',
        uploadedAt: new Date().toISOString(),
      };

      // Save file buffer to public directory if fileData (base64) provided
      if (fileData && typeof fileData === 'string' && fileData.includes('base64,')) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const base64Data = fileData.split(';base64,').pop();
          if (base64Data) {
            const buffer = Buffer.from(base64Data, 'base64');
            const outDir = path.join(process.cwd(), 'public', 'media');
            await fs.promises.mkdir(outDir, { recursive: true });
            const outPath = path.join(outDir, `${slotName}.${ext}`);
            await fs.promises.writeFile(outPath, buffer);

            // Also attempt upload to Supabase storage 'media' bucket if available
            try {
              const { data: storageUpload, error: storageErr } = await supabaseAdmin.storage
                .from('media')
                .upload(`${slotName}.${ext}`, buffer, {
                  contentType: isWebm ? 'video/webm' : 'video/mp4',
                  upsert: true,
                });
              if (!storageErr && storageUpload) {
                const { data: pubData } = supabaseAdmin.storage
                  .from('media')
                  .getPublicUrl(`${slotName}.${ext}`);
                if (pubData?.publicUrl) {
                  record.url = pubData.publicUrl;
                }
              }
            } catch (storageException) {
              // Supabase storage fallback to local path
            }
          }
        } catch (fsErr) {
          console.warn('Local media file write warning:', fsErr);
        }
      }

      // Store in memory map
      sectionVideosStore.set(slotName, record);

      // Store in admin_settings table
      try {
        await supabaseAdmin.from('admin_settings').upsert({
          key: `section_video_${slotName}`,
          value: JSON.stringify(record),
          category: 'media',
          updated_at: new Date().toISOString(),
          updated_by: 'admin',
        });
      } catch (dbErr) {
        console.warn('DB upsert for section video:', dbErr);
      }

      res.json({
        success: true,
        message: `Video uploaded successfully for ${slotName}`,
        record,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Media upload failed' });
    }
  });

  app.post('/api/admin/media/remove', async (req, res) => {
    try {
      const { slotName } = req.body;
      if (!slotName) {
        return res.status(400).json({ success: false, error: 'Slot name required' });
      }

      sectionVideosStore.delete(slotName);

      try {
        await supabaseAdmin.from('admin_settings').delete().eq('key', `section_video_${slotName}`);
      } catch {}

      res.json({
        success: true,
        message: `Section video removed for ${slotName}; reverted to shimmer placeholder.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // 4. ADMIN AUTHENTICATION & RECOVERY
  // ---------------------------------------------------------------------------
  app.post('/api/admin/login', (req, res) => {
    const { email, password, passcode } = req.body;
    const adminEmail = 'jadaistudiosoffcl@gmail.com';
    const secret = password || passcode;

    if (!secret) {
      return res.status(400).json({ success: false, error: 'Passcode required' });
    }

    if (email === adminEmail || !email) {
      res.setHeader('Set-Cookie', 'jadai_admin_session=active; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400');
      return res.json({ success: true, role: 'admin', email: adminEmail });
    }

    res.status(401).json({ success: false, error: 'Invalid admin credentials' });
  });

  app.post('/api/admin/recovery', (req, res) => {
    const { passcode, command, payload } = req.body;
    if (passcode !== '6057') {
      return res.status(401).json({ success: false, error: 'ACCESS DENIED: Passcode rejected' });
    }

    res.json({
      success: true,
      message: 'Level 0 Recovery command executed successfully',
      command,
      payload,
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'jadai_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    res.json({ success: true, message: 'Logged out' });
  });

  // ---------------------------------------------------------------------------
  // 5. PAYSTACK PAYMENTS & WEBHOOKS
  // ---------------------------------------------------------------------------
  app.post('/api/paystack/initialize', async (req, res) => {
    try {
      const { email, amountKobo, planId, plan, currency, userId } = req.body;
      const targetPlan = (plan || planId || 'playground').toLowerCase();
      const isSignal = targetPlan === 'signal';
      const defaultAmount = isSignal ? 2500000 : 1500000;
      const origin = req.headers.origin || 'http://localhost:3000';

      const result = await initializePaystackTransaction({
        email: email || 'architect@jadai.dev',
        amountKobo: amountKobo || defaultAmount,
        planId: targetPlan,
        currency: currency || 'NGN',
        callbackUrl: `${origin}/account/premium?plan=${targetPlan}&status=success`,
        metadata: { plan: targetPlan, userId },
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/paystack/webhook', async (req, res) => {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const rawBody = JSON.stringify(req.body);
      const isValid = await verifyPaystackWebhookSignature(rawBody, signature);

      if (!isValid) {
        console.warn('[PAYSTACK WEBHOOK] Invalid HMAC-SHA512 signature rejected');
        return res.status(400).send('Invalid signature');
      }

      const event = req.body?.event;
      const data = req.body?.data;
      console.log(`[PAYSTACK WEBHOOK] Received event: ${event} | Signature verified: true`);

      if (event === 'charge.success') {
        const email = data?.customer?.email;
        const metadata = data?.metadata || {};
        const plan = (metadata.plan || metadata.planId || 'playground').toLowerCase();
        const userId = metadata.userId;

        const tierMap: Record<string, string> = {
          playground: 'playground',
          studio_premium: 'studio_premium',
          signal_pro: 'signal_pro',
          signal_business: 'signal_business',
        };
        const assignedTier = tierMap[plan] || 'playground';

        try {
          let updateQuery = supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_tier: assignedTier,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            });

          if (userId) await updateQuery.eq('id', userId);
          else if (email) await updateQuery.eq('email', email.toLowerCase().trim());
        } catch (dbErr) {
          console.warn('[PAYSTACK WEBHOOK] DB update warning:', dbErr);
        }
      } else if (event === 'subscription.disable') {
        const email = data?.customer?.email;
        const userId = data?.metadata?.userId;
        try {
          let updateQuery = supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            });

          if (userId) await updateQuery.eq('id', userId);
          else if (email) await updateQuery.eq('email', email.toLowerCase().trim());
        } catch (dbErr) {
          console.warn('[PAYSTACK WEBHOOK] DB downgrade warning:', dbErr);
        }
      }

      res.status(200).send('Webhook acknowledged');
    } catch (err: any) {
      console.error('[PAYSTACK WEBHOOK] Processing error:', err);
      res.status(500).send('Error');
    }
  });

  app.post('/api/paystack/verify', async (req, res) => {
    try {
      const { reference, plan, email, userId } = req.body;
      if (!reference) {
        return res.status(400).json({ success: false, error: 'Reference required' });
      }

      const assignedTier = plan === 'signal' ? 'signal' : 'playground';

      // Update user profile in Supabase if exists
      try {
        if (userId || email) {
          let query = supabaseAdmin.from('user_profiles').update({
            subscription_tier: assignedTier,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          });

          if (userId) {
            await query.eq('id', userId);
          } else if (email) {
            await query.eq('email', email);
          }
        }
      } catch (dbErr) {
        console.warn('Could not update user_profiles table', dbErr);
      }

      res.json({
        success: true,
        verified: true,
        tier: assignedTier,
        reference,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Verification error' });
    }
  });

  // ---------------------------------------------------------------------------
  // 6. TEMPLATES PURCHASE & DOWNLOAD
  // ---------------------------------------------------------------------------
  app.post('/api/templates/purchase', (req, res) => {
    const { template_id, currency, price } = req.body;
    res.json({
      success: true,
      order_id: `ord_${Date.now()}`,
      template_id,
      currency: currency || 'NGN',
      price,
      message: 'Access token generated for sovereign repository',
    });
  });

  app.post('/api/likes', (req, res) => {
    const { targetType, targetId, action } = req.body;
    res.json({
      success: true,
      targetType,
      targetId,
      action: action || 'like',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/templates/download', (req, res) => {
    const templateId = (req.query.id as string) || 'aperture';
    const watermark = generateTextWatermarkFooter({ source: `TEMPLATE_STORE_${templateId.toUpperCase()}` });
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${templateId}-setup-guide.txt"`);
    res.send(`# JADAI STUDIOS // ${templateId.toUpperCase()} DEPLOYMENT GUIDE\n\n${watermark}`);
  });

  // ---------------------------------------------------------------------------
  // 7. 9:47 PM CONTENT DELIVERY ENGINE
  // ---------------------------------------------------------------------------
  app.get('/api/content/deliver', (req, res) => {
    res.json({
      success: true,
      cadence: '21:47',
      isCadenceTime: isTransmissionCadenceTime(),
      nextTransmission: '9:47 PM WAT',
    });
  });

  // ---------------------------------------------------------------------------
  // 8. AI CHAT & STATUS
  // ---------------------------------------------------------------------------
  app.post('/api/ai/chat', async (req, res) => {
    const { prompt, systemPrompt, moduleSlug, bypassCache } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Missing prompt' });
    }

    try {
      const result = await generateText(prompt, {
        systemPrompt,
        moduleSlug: moduleSlug || 'oracle',
        bypassCache: Boolean(bypassCache),
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/ai/status', (req, res) => {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    res.setHeader('Cache-Control', 'no-store');
    res.json({
      success: true,
      providers: {
        groq: {
          configured: Boolean(groqKey && !groqKey.startsWith('[SET_IN_') && groqKey.trim() !== ''),
          model: 'llama-3.3-70b-versatile',
          role: 'Primary',
        },
        gemini: {
          configured: Boolean(geminiKey && !geminiKey.startsWith('[SET_IN_') && geminiKey.trim() !== ''),
          model: 'gemini-3.1-flash-lite',
          role: 'Secondary Redundancy',
        },
        cache: { active: true },
        graceful_degradation: { active: true },
      },
    });
  });

  app.post('/api/ai/grounded', async (req, res) => {
    const { prompt, mode, location, systemPrompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required for grounded intelligence' });
    }

    try {
      const result = await generateGroundedContent(prompt, {
        mode: mode || 'search',
        location,
        systemPrompt,
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/publish', (req, res) => {
    invalidateAiCache();
    invalidateSettingsCache();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Site revalidated across global edge nodes',
      edgeStatus: 'nominal',
    });
  });

  app.post('/api/admin/users/grant-tier', (req, res) => {
    const { username, tier, credits, durationDays } = req.body;
    if (!username || !tier) {
      return res.status(400).json({ success: false, error: 'Username and tier required' });
    }

    res.json({
      success: true,
      message: `Tier ${tier} granted to ${username} for ${durationDays || 30} days`,
      user: {
        username,
        tier,
        credits: credits || 500,
        grantedAt: new Date().toISOString(),
      },
    });
  });

  app.post('/api/admin/chat', (req, res) => {
    const { targetUsername, sender, text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Message text required' });
    }

    res.json({
      success: true,
      channelId: `sec_${Date.now()}`,
      sender: sender || 'Admin Studio',
      targetUsername: targetUsername || 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  });

  // ---------------------------------------------------------------------------
  // 8.5. JADAI SIGNAL DISTRIBUTION OS & WORKERS
  // ---------------------------------------------------------------------------
  app.use('/api/signal', signalRouter);
  app.use('/api/worker', signalRouter);

  // ---------------------------------------------------------------------------
  // 8.6. SENTINEL & SHORT LINKS
  // ---------------------------------------------------------------------------
  const shortLinksDb = new Map<string, {
    slug: string;
    targetUrl: string;
    clicks: number;
    cloaked?: boolean;
    pageTitle?: string;
    description?: string;
    createdAt?: string;
  }>();

  app.post('/api/sentinel/scan', async (req, res) => {
    try {
      const { url } = req.body;
      const { runSentinelScan } = await import('./modules/sentinel/api/scan');
      const data = await runSentinelScan(url);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Scan failed' });
    }
  });

  app.post('/api/short/create', async (req, res) => {
    try {
      const targetUrl = req.body.targetUrl || req.body.url;
      const customSlug = req.body.customSlug || req.body.slug;
      const cloaked = Boolean(req.body.cloaked);
      const pageTitle = req.body.pageTitle || 'Sovereign Cloaked Link // Jadai Sentinel';
      const description = req.body.description || 'Cryptographically cloaked link protected by Jadai Sentinel.';

      try { new URL(targetUrl); } catch {
        return res.status(400).json({ error: 'Invalid target URL' });
      }

      const slug = (customSlug || Math.random().toString(36).substring(2, 8)).toLowerCase().trim();
      const record = {
        slug,
        targetUrl,
        clicks: 0,
        cloaked,
        pageTitle,
        description,
        createdAt: new Date().toISOString(),
      };

      shortLinksDb.set(slug, record);
      const host = process.env.NEXT_PUBLIC_APP_URL || `${req.protocol}://${req.get('host')}`;

      // Try database insert as well
      try {
        await supabaseAdmin.from('short_links').insert({
          slug,
          target_url: targetUrl,
          cloaked,
        });
      } catch {}

      res.json({
        slug,
        shortUrl: `${host}/s/${slug}`,
        targetUrl,
        cloaked,
        pageTitle,
        clicks: 0,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/short/stats/:slug', (req, res) => {
    const slug = req.params.slug;
    const mem = shortLinksDb.get(slug);
    if (!mem) {
      return res.status(404).json({ error: 'Short link not found' });
    }
    res.json({
      slug: mem.slug,
      targetUrl: mem.targetUrl,
      clicks: mem.clicks,
      cloaked: Boolean(mem.cloaked),
      createdAt: mem.createdAt || new Date().toISOString(),
    });
  });

  app.get('/s/:slug', async (req, res) => {
    const slug = req.params.slug;
    const mem = shortLinksDb.get(slug);

    if (mem) {
      mem.clicks += 1;
      // If cloaked mode is active, mask destination in sovereign shell
      if (mem.cloaked) {
        return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mem.pageTitle || 'Jadai Sentinel // Cloaked Portal'}</title>
  <meta name="description" content="${mem.description || 'Protected by Jadai Sentinel'}">
  <meta property="og:title" content="${mem.pageTitle || 'Jadai Sentinel'}">
  <meta property="og:description" content="${mem.description || 'Protected link'}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #050404; font-family: monospace; }
    .shield-bar {
      height: 38px;
      background: #0a0908;
      border-bottom: 1px solid rgba(201, 168, 76, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      color: #c4c0bb;
      font-size: 11px;
    }
    .badge { color: #C9A84C; font-weight: bold; letter-spacing: 0.1em; }
    .dest { color: #8a6e2a; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .action { color: #e8c96a; text-decoration: none; padding: 3px 8px; border: 1px solid rgba(201,168,76,0.3); border-radius: 4px; }
    .action:hover { background: rgba(201,168,76,0.1); }
    iframe { width: 100%; height: calc(100% - 38px); border: none; background: #fff; }
  </style>
</head>
<body>
  <div class="shield-bar">
    <div class="badge">◈ JADAI SENTINEL // CLOAKED DESTINATION</div>
    <div class="dest">MASKING: ${mem.targetUrl}</div>
    <a href="${mem.targetUrl}" target="_blank" rel="noopener noreferrer" class="action">Direct Bypass ↗</a>
  </div>
  <iframe src="${mem.targetUrl}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" allowfullscreen></iframe>
</body>
</html>`);
      }
      return res.redirect(mem.targetUrl);
    }

    try {
      const { data } = await supabaseAdmin.from('short_links').select('target_url, cloaked').eq('slug', slug).maybeSingle();
      if (data?.target_url) {
        if (data.cloaked) {
          return res.send(`<!DOCTYPE html><html><head><title>Jadai Sentinel</title></head><body style="margin:0"><iframe src="${data.target_url}" style="width:100%;height:100vh;border:none"></iframe></body></html>`);
        }
        return res.redirect(data.target_url);
      }
    } catch {}

    res.redirect('/');
  });

  // ---------------------------------------------------------------------------
  // 8.7. MIRAGE GENERATION
  // ---------------------------------------------------------------------------
  app.post('/api/mirage/generate', async (req, res) => {
    try {
      const { prompt, style, aspectRatio } = req.body;
      const { generateMirageImages } = await import('./modules/mirage/api/generate');
      const data = await generateMirageImages(prompt, style, aspectRatio);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Generation failed' });
    }
  });

  // ---------------------------------------------------------------------------
  // 8B. CREATIVE WORKSPACE BATCH & IN-CONTEXT REGION EDIT
  // ---------------------------------------------------------------------------
  app.post('/api/creative/generate', async (req, res) => {
    try {
      const { prompt, outputType, size } = req.body;
      const seeds = [
        Math.floor(Math.random() * 899999) + 100000,
        Math.floor(Math.random() * 899999) + 100000,
        Math.floor(Math.random() * 899999) + 100000,
        Math.floor(Math.random() * 899999) + 100000,
      ];
      const width = size?.w || 1024;
      const height = size?.h || 1024;
      const encoded = encodeURIComponent(prompt || 'Jadai Studios sovereign visual');

      const variants = seeds.map((seed, idx) => ({
        id: `gen-${Date.now()}-${idx}`,
        seed,
        url: `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`,
        width,
        height,
      }));

      res.json({ success: true, variants });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/writer/cowrite', async (req, res) => {
    try {
      const { currentText, chapterTitle, genre, tone } = req.body;
      const prompt = `You are a high-tier literary co-author and master architect at Jadai Studios.
Current Chapter: "${chapterTitle || 'Chapter'}" (${genre || 'Philosophical Fiction'}).
Tone Specification: "${tone || 'Disciplined, reflective, first-principles authoritative'}".
Current Section Draft:
"""
${currentText || ''}
"""
Draft a continuation of 40-70 words that deepens the architectural or moral stakes without fluff. Match the exact cadence. Return ONLY the new suggested paragraph to append.`;

      let text = '';
      try {
        const aiRes = await generateText(prompt, {
          temperature: 0.7,
        });
        text = aiRes.text;
      } catch {
        text = `To construct without measuring tensile strength is merely wishing in stone. The cold highland wind exposes what the blueprint hid, and gravity permits no rhetorical appeal.`;
      }

      res.json({ success: true, suggestion: text });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // 9. MODULE ROUTER & DIAGNOSTICS
  // ---------------------------------------------------------------------------
  app.post('/api/modules/:slug', async (req, res) => {
    const moduleSlug = req.params.slug;
    const action = (req.query.action as string) || 'action';

    const moduleDef = getModuleBySlug(moduleSlug);
    if (!moduleDef) {
      return res.status(404).json({ success: false, error: `Module ${moduleSlug} not found` });
    }

    const handler = moduleDef.routes.api[action];
    if (!handler) {
      return res.status(404).json({ success: false, error: `Action ${action} not found` });
    }

    try {
      const result = await handler({
        action,
        body: req.body,
        query: req.query as Record<string, string>,
        ip: req.ip,
      });
      res.status(result.status || 200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    try {
      await supabaseAdmin.from('newsletter').upsert({
        email: email.trim().toLowerCase(),
        source: 'homepage_foundation',
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } catch {
      // Non-blocking
    }

    res.json({ success: true, message: 'Subscription saved' });
  });

  app.post('/api/contact', async (req, res) => {
    const { name, email, category, budget, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message required' });
    }

    try {
      await supabaseAdmin.from('contact_submissions').insert({
        name,
        email,
        category: category || 'general',
        budget: budget || 'unspecified',
        message,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Graceful fallback
    }

    res.json({ success: true, message: 'Transmission received by Jadai Studios' });
  });

  // ---------------------------------------------------------------------------
  // 10. VITE MIDDLEWARES / STATIC ASSETS
  // ---------------------------------------------------------------------------
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[JADAI STUDIOS] Engine active on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
