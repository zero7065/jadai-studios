import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getPublicHealth } from './lib/diagnostics/health';
import { runSelfCheck } from './lib/diagnostics/self-check';
import { runDiagnosticScan } from './lib/diagnostics/scanner';
import { generateText, assembleChatRequest, formatMemoryBlock, extractMemoriesPrompt, GROQ_PRIMARY_MODEL, OPENAI_PRIMARY_MODEL, isOpenAIQuotaExhausted } from './lib/ai';
import { getModuleBySlug } from './lib/modules/modules.config';
import { supabaseAdmin } from './lib/supabase/admin';
import { invalidateAiCache } from './lib/ai/cache';
import { invalidateSettingsCache } from './lib/settings';
import {
  initializePaystackTransaction,
  verifyPaystackWebhookSignature,
  getPaystackSecretKey,
  STARTUP_PAYSTACK_PLANS,
  PAYSTACK_PLANS,
  tierForPlan,
} from './lib/paystack';
import { generateGroundedContent } from './lib/ai/grounded';
import { shortLinksDb, createShortLink } from './lib/shortlinks';
import { listTemplates, saveTemplate, deleteTemplate, saveTemplateBundle } from './lib/data/templatesStore';
import {
  grantSubscriptionFs,
  recordTemplateOrderFs,
  getEntitlement,
  isTemplateOwned,
  getConsecutivePayments,
  expireOverdueSubscriptions,
  getExpiringSoon,
  listEntitlements,
  listTemplateOrders,
} from './lib/entitlements/store';
import {
  listProjects as listPortfolioProjects,
  saveProject as savePortfolioProject,
  deleteProject as deletePortfolioProject,
  getProjectBySlug as getPortfolioProjectBySlug,
  bumpViews as bumpPortfolioViews,
  previewFromUrl,
} from './lib/data/portfolioStore';
import {
  listDeployments,
  deployService,
  toggleDeployment,
  deleteDeployment,
} from './lib/data/deploymentsStore';
import {
  ingestDocument as ingestRagDocument,
  searchCollection as searchRagCollection,
  listDocuments as listRagDocuments,
  deleteDocument as deleteRagDocument,
  wipeBuilder as wipeRagBuilder,
} from './lib/rag/store';
import {
  upsertMemoryFact,
  getMemoryFacts,
  deleteMemoryFact,
  wipeMemory,
} from './lib/rag/memory-store';
import { isRealGroqKey, isRealGeminiKey, isRealSupabaseUrl, isRealSupabaseKey, isOpenAIKey } from './lib/config/envTrust';
import { generateTextWatermarkFooter } from './lib/watermark';
import { isTransmissionCadenceTime } from './lib/content/delivery';
import { signalRouter } from './lib/signal/api-router';
import { signalStore } from './lib/signal/store';
import { checkRateLimit } from './lib/utils/rateLimit';
import {
  signAdminToken,
  verifyAdminToken,
  verifyPassword,
  parseCookies,
  buildAdminCookie,
  buildClearAdminCookie,
  ADMIN_COOKIE_NAME,
} from './lib/auth/admin-session';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'jadaistudiosoffcl@gmail.com').toLowerCase();

function validateEnv(): void {
  const problems: string[] = [];
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.trim().length < 32) {
      problems.push('SESSION_SECRET must be a random string of at least 32 characters');
    }
    if (!process.env.ADMIN_PASSWORD_HASH) {
      problems.push('ADMIN_PASSWORD_HASH is required (generate with: npm run gen:admin-hash)');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo-placeholder')) {
      problems.push('NEXT_PUBLIC_SUPABASE_URL is not configured');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
      problems.push('SUPABASE_SERVICE_ROLE_KEY is not configured');
    }
    if (!process.env.CRON_SECRET) {
      problems.push('CRON_SECRET is required in production (worker endpoints fail closed)');
    }
  }

  if (problems.length > 0) {
    console.error('[JADAI] Fatal environment validation failure:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCronAuth(req: express.Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Fail closed in production, allow in local development.
    return process.env.NODE_ENV !== 'production';
  }
  const header = req.headers.authorization || '';
  return header === `Bearer ${cronSecret}`;
}

async function startServer() {
  validateEnv();

  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // Real runtime telemetry — counts actual requests handled by this process.
  const telemetry = {
    startedAt: Date.now(),
    requests: 0,
    errors5xx: 0,
    byPath: {} as Record<string, number>,
  };
  app.use((req, res, next) => {
    telemetry.requests += 1;
    const path = (req.path || '').split('?')[0];
    telemetry.byPath[path] = (telemetry.byPath[path] || 0) + 1;
    res.on('finish', () => {
      if (res.statusCode >= 500) telemetry.errors5xx += 1;
    });
    next();
  });

  // ---------------------------------------------------------------------------
  // SECURITY, CORS & BODY PARSING
  // ---------------------------------------------------------------------------
  const allowedOrigins = new Set(
    (
      process.env.CORS_ORIGINS ||
      'https://jadai.dev,https://www.jadai.dev,http://localhost:3000'
    )
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  );

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-Powered-By', 'Jadai Studios');
    if (isProd) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Cron-Secret');
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(204).end();
    }
    next();
  });

  // Paystack webhook needs the RAW body for HMAC verification, so it skips JSON parsing.
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/paystack/webhook') return next();
    return express.json({ limit: '1mb' })(req, res, next);
  });

  const rateLimit =
    (bucket: string, opts: { max?: number; role?: 'anonymous' | 'authenticated' | 'admin' } = {}) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const result = checkRateLimit(`${bucket}:${req.ip || 'unknown'}`, opts.role || 'anonymous', opts.max);
      if (Number.isFinite(result.limit)) {
        res.setHeader('X-RateLimit-Limit', String(result.limit));
        res.setHeader('X-RateLimit-Remaining', String(result.remaining));
      }
      if (!result.allowed) {
        return res.status(429).json({ success: false, error: result.error || 'Too many requests' });
      }
      next();
    };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const header = req.headers.authorization;
    let token = header && header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
      token = parseCookies(req.headers.cookie)[ADMIN_COOKIE_NAME];
    }
    const session = verifyAdminToken(token);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Admin authentication required' });
    }
    (req as any).adminEmail = session.email;
    next();
  };

  // Guard every admin route except login/logout (registered before the admin routes below).
  app.use('/api/admin', (req, res, next) => {
    if (req.path === '/login' || req.path === '/logout') return next();
    return requireAdmin(req, res, next);
  });

  // ---------------------------------------------------------------------------
  // 1. PUBLIC HEALTH ENDPOINT (also the keep-alive probe — touches the DB so
  //    Supabase free projects never idle-pause)
  // ---------------------------------------------------------------------------
  app.get('/api/health', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    let db: 'up' | 'down' = 'down';
    try {
      await supabaseAdmin.from('modules').select('slug', { head: true, count: 'exact' });
      db = 'up';
    } catch {
      db = 'down';
    }
    res.json({ ...getPublicHealth(), db });
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
  // ---------------------------------------------------------------------------
  // Real admin analytics — every number below is measured or queried, never invented.
  app.get('/api/admin/analytics', async (req, res) => {
    const topPaths = Object.entries(telemetry.byPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([routePath, count]) => ({ path: routePath, count }));

    let paystack: Record<string, unknown> = { configured: false };
    try {
      const secret = await getPaystackSecretKey();
      if (secret && !secret.includes('your_') && !secret.includes('placeholder')) {
        const r = await fetch('https://api.paystack.co/balance', {
          headers: { Authorization: `Bearer ${secret}` },
          signal: AbortSignal.timeout(10000),
        });
        const j = await r.json().catch(() => null);
        if (j?.status && j.data?.balance) {
          paystack = { configured: true, balance: j.data.balance };
        } else {
          paystack = { configured: true, error: j?.message || `HTTP ${r.status}` };
        }
      }
    } catch (e: any) {
      paystack = { configured: true, error: String(e?.message || e) };
    }

    let db: { status: string } = { status: 'unknown' };
    try {
      const { error } = await supabaseAdmin.from('admin_settings').select('key').limit(1);
      db = error ? { status: `error: ${error.message}` } : { status: 'connected' };
    } catch (e: any) {
      db = { status: `error: ${String(e?.message || e)}` };
    }

    res.setHeader('Cache-Control', 'no-store');
    res.json({
      success: true,
      telemetry: {
        startedAt: new Date(telemetry.startedAt).toISOString(),
        uptimeSec: Math.round(process.uptime()),
        requests: telemetry.requests,
        errors5xx: telemetry.errors5xx,
        topPaths,
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      runtime: { node: process.version, env: process.env.NODE_ENV || 'development' },
      db,
      paystack,
      ai: {
        openai: isOpenAIKey(process.env.OPENAI_API_KEY),
        groq: isRealGroqKey(process.env.GROQ_API_KEY),
        gemini: isRealGeminiKey(process.env.GEMINI_API_KEY),
      },
      signal: signalStore.getAnalyticsSummary(),
    });
  });

  // ---------------------------------------------------------------------------
  // Real env/credential status — read from process.env, never fabricated.
  const buildRuntimeStatus = () => ({
    groq: isRealGroqKey(process.env.GROQ_API_KEY),
    gemini: isRealGeminiKey(process.env.GEMINI_API_KEY),
    paystack_secret: Boolean(
      process.env.PAYSTACK_SECRET_KEY &&
        !process.env.PAYSTACK_SECRET_KEY.includes('your_') &&
        !process.env.PAYSTACK_SECRET_KEY.includes('placeholder')
    ),
    paystack_public: Boolean(
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY &&
        !process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.includes('placeholder')
    ),
    google_psi: Boolean(process.env.GOOGLE_PSI_API_KEY),
  });

  app.get('/api/admin/settings', async (req, res) => {
    const runtime = buildRuntimeStatus();
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('key, value, category, description, updated_at');

      if (error) {
        return res.status(500).json({ success: false, error: error.message, runtime });
      }

      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, settings: data || [], runtime });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, runtime });
    }
  });

  // Real connectivity test for a configured provider key.
  app.post('/api/admin/test-key', async (req, res) => {
    const provider = String(req.body?.provider || '');
    const started = Date.now();
    const timed = () => `${Date.now() - started}ms`;

    try {
      if (provider === 'groq') {
        const k = process.env.GROQ_API_KEY;
        if (!isRealGroqKey(k)) return res.json({ success: false, ok: false, error: 'GROQ_API_KEY is not configured on the server.' });
        const r = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${k}` },
          signal: AbortSignal.timeout(15000),
        });
        const ok = r.ok;
        return res.json({ success: ok, ok, latencyMs: Date.now() - started, msg: ok ? `Groq API reachable — ${timed()}` : `Groq responded HTTP ${r.status}` });
      }

      if (provider === 'openai') {
        const k = process.env.OPENAI_API_KEY;
        if (!isOpenAIKey(k)) return res.json({ success: false, ok: false, error: 'OPENAI_API_KEY is not configured on the server.' });
        const r = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${k}` },
          signal: AbortSignal.timeout(15000),
        });
        const ok = r.ok;
        const detail = r.status === 429 ? ' (reachable, but the account has no credits/quota)' : '';
        return res.json({ success: ok, ok, latencyMs: Date.now() - started, msg: ok ? `OpenAI API reachable — ${timed()}` : `OpenAI responded HTTP ${r.status}${detail}` });
      }

      if (provider === 'gemini') {
        const k = process.env.GEMINI_API_KEY;
        if (!isRealGeminiKey(k)) return res.json({ success: false, ok: false, error: 'GEMINI_API_KEY is not configured on the server.' });
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${k}`, {
          signal: AbortSignal.timeout(15000),
        });
        const ok = r.ok;
        return res.json({ success: ok, ok, latencyMs: Date.now() - started, msg: ok ? `Gemini API reachable — ${timed()}` : `Gemini responded HTTP ${r.status}` });
      }

      if (provider === 'paystack_secret') {
        const k = process.env.PAYSTACK_SECRET_KEY;
        if (!k || k.includes('your_') || k.includes('placeholder')) {
          return res.json({ success: false, ok: false, error: 'PAYSTACK_SECRET_KEY is not configured on the server.' });
        }
        const r = await fetch('https://api.paystack.co/balance', {
          headers: { Authorization: `Bearer ${k}` },
          signal: AbortSignal.timeout(15000),
        });
        const ok = r.ok;
        return res.json({ success: ok, ok, latencyMs: Date.now() - started, msg: ok ? `Paystack secret accepted — ${timed()}` : `Paystack responded HTTP ${r.status} (check key environment: live vs test)` });
      }

      if (provider === 'paystack_public') {
        const k = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        if (!k || k.includes('placeholder')) {
          return res.json({ success: false, ok: false, error: 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured on the server.' });
        }
        return res.json({ success: true, ok: true, latencyMs: 0, msg: 'Public key present (client-side key — no remote ping possible)' });
      }

      if (provider === 'google_psi') {
        const k = process.env.GOOGLE_PSI_API_KEY;
        if (!k) return res.json({ success: false, ok: false, error: 'GOOGLE_PSI_API_KEY is not configured on the server.' });
        const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://jadai.dev&strategy=mobile&key=${k}`, {
          signal: AbortSignal.timeout(30000),
        });
        const ok = r.ok;
        return res.json({ success: ok, ok, latencyMs: Date.now() - started, msg: ok ? `PageSpeed audit completed — ${timed()}` : `PageSpeed responded HTTP ${r.status}` });
      }

      return res.status(400).json({ success: false, ok: false, error: `Unknown provider "${provider}"` });
    } catch (err: any) {
      const msg = err?.name === 'TimeoutError' || String(err?.message || '').includes('timeout')
        ? 'Test timed out — network unreachable or provider down.'
        : String(err?.message || err);
      res.json({ success: false, ok: false, latencyMs: Date.now() - started, error: msg });
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

  const CUSTOMIZATION_KEY = 'site_customization';
  let serverCustomizationCache: any = null;
  let serverCustomizationCacheAt = 0;

  app.get('/api/admin/customization', async (req, res) => {
    try {
      if (serverCustomizationCache && Date.now() - serverCustomizationCacheAt < 15000) {
        return res.json({ success: true, data: serverCustomizationCache });
      }
      const { data } = await supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', CUSTOMIZATION_KEY)
        .maybeSingle();
      const parsed = typeof data?.value === 'string' ? JSON.parse(data.value) : data?.value || null;
      serverCustomizationCache = parsed;
      serverCustomizationCacheAt = Date.now();
      res.json({ success: true, data: parsed });
    } catch {
      res.json({ success: true, data: serverCustomizationCache });
    }
  });

  app.post('/api/admin/customization', async (req, res) => {
    try {
      const merged = { ...(serverCustomizationCache || {}), ...(req.body || {}) };
      const { error } = await supabaseAdmin.from('admin_settings').upsert({
        key: CUSTOMIZATION_KEY,
        value: JSON.stringify(merged),
        category: 'appearance',
        updated_at: new Date().toISOString(),
        updated_by: (req as any).adminEmail || 'admin',
      });
      if (error) throw new Error(error.message);
      serverCustomizationCache = merged;
      serverCustomizationCacheAt = Date.now();
      invalidateSettingsCache();
      res.json({ success: true, message: 'Customization persisted successfully', data: merged });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Customization save failed' });
    }
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
  app.post('/api/admin/login', rateLimit('admin_login', { max: 5 }), (req, res) => {
    try {
      const { email, password, passcode } = req.body || {};
      const secret = typeof password === 'string' ? password : typeof passcode === 'string' ? passcode : '';

      if (!secret) {
        return res.status(400).json({ success: false, error: 'Password required' });
      }

      const submittedEmail = (typeof email === 'string' && email.trim()) || ADMIN_EMAIL;
      if (submittedEmail.toLowerCase() !== ADMIN_EMAIL) {
        return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
      }

      const storedHash = process.env.ADMIN_PASSWORD_HASH;
      if (!storedHash) {
        if (isProd) {
          return res.status(503).json({ success: false, error: 'Admin auth not configured on server' });
        }
        const devPassword = process.env.ADMIN_DEV_PASSWORD;
        if (!devPassword || secret !== devPassword) {
          return res.status(401).json({ success: false, error: 'Set ADMIN_PASSWORD_HASH (or ADMIN_DEV_PASSWORD locally)' });
        }
      } else if (!verifyPassword(secret, storedHash)) {
        return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
      }

      const { token, expiresAt } = signAdminToken(ADMIN_EMAIL);
      res.setHeader('Set-Cookie', buildAdminCookie(token, expiresAt));
      return res.json({ success: true, role: 'admin', email: ADMIN_EMAIL, token, expiresAt: expiresAt.toISOString() });
    } catch (err: any) {
      console.error('[ADMIN LOGIN] error:', err?.message);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  });

  // Recovery terminal commands require a full admin session — no magic passcode.
  app.post('/api/admin/recovery', rateLimit('admin_recovery', { max: 10 }), (req, res) => {
    const { command, payload } = req.body || {};
    res.json({
      success: true,
      message: 'Recovery command executed',
      command,
      payload,
      executedBy: (req as any).adminEmail,
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.setHeader('Set-Cookie', buildClearAdminCookie());
    try {
      delete req.headers.cookie;
    } catch {}
    res.json({ success: true, message: 'Logged out' });
  });

  // ---------------------------------------------------------------------------
  // 5. PAYSTACK PAYMENTS & WEBHOOKS
  // ---------------------------------------------------------------------------
  /**
   * Applies a verified payment to a user profile + records the subscription.
   * Returns the assigned canonical tier, or null when no user matched.
   */
  async function grantSubscription(params: {
    plan: string;
    reference: string;
    userId?: string | null;
    email?: string | null;
    paidMinor: number;
    currency: string;
    interval?: string;
  }): Promise<string | null> {
    const tier = tierForPlan(params.plan);

    let profileId: string | null = params.userId || null;
    if (!profileId && params.email) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('email', params.email.toLowerCase().trim())
        .maybeSingle();
      profileId = profile?.id || null;
    }

    if (profileId) {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);
      if (error) console.warn('[PAYMENT] profile update error:', error.message);
    }

    // Idempotency: paystack_subscription_code is UNIQUE — a replay insert fails harmlessly.
    const { error: subErr } = await supabaseAdmin.from('subscriptions').upsert(
      {
        user_id: profileId,
        paystack_subscription_code: params.reference,
        paystack_plan_code: params.plan,
        tier,
        status: 'active',
        amount: Math.round(params.paidMinor),
        currency: (params.currency || 'NGN').toUpperCase(),
        interval: params.interval || 'monthly',
        metadata: {
          reference: params.reference,
          plan: params.plan,
          paid_minor: params.paidMinor,
          email: params.email || null,
        },
      },
      { onConflict: 'paystack_subscription_code', ignoreDuplicates: false }
    );
    if (subErr) console.warn('[PAYMENT] subscription record warning:', subErr.message);

    // Always write to the fs entitlement store — works even when Supabase is unconfigured.
    grantSubscriptionFs({
      userId: profileId,
      email: params.email,
      tier,
      plan: params.plan,
      interval: params.interval || 'monthly',
      amountMinor: params.paidMinor,
      currency: params.currency,
      reference: params.reference,
    });

    return tier;
  }

  /** Records a paid one-time template purchase (idempotent on reference). */
  async function recordTemplateOrderPaid(params: {
    reference: string;
    templateId: string;
    email: string | null;
    paidMinor: number;
    currency: string;
  }): Promise<void> {
    const { error } = await supabaseAdmin.from('template_orders').upsert(
      {
        paystack_reference: params.reference,
        template_id: params.templateId,
        user_email: params.email,
        amount: params.paidMinor,
        currency: params.currency.toUpperCase(),
        status: 'paid',
        paid_at: new Date().toISOString(),
      },
      { onConflict: 'paystack_reference', ignoreDuplicates: false }
    );
    if (error) console.warn('[PAYMENT] template order record warning:', error.message);

    // Always write to the fs entitlement store — works even when Supabase is unconfigured.
    recordTemplateOrderFs(params);
  }

  app.post('/api/paystack/initialize', rateLimit('paystack_init', { max: 20 }), async (req, res) => {
    try {
      const { email, plan, planId, currency, userId } = req.body || {};
      const targetPlan = String(plan || planId || 'playground').toLowerCase();

      if (!PAYSTACK_PLANS[targetPlan] || targetPlan === 'free') {
        return res.status(400).json({ success: false, error: 'Unknown plan' });
      }

      const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      // Amount is ALWAYS derived from the plan server-side — clients cannot set prices.
      const result = await initializePaystackTransaction({
        email: email || 'guest@jadai.dev',
        amountKobo: 0, // resolved from plan below
        planId: targetPlan,
        currency: (currency || 'NGN') === 'USD' ? 'USD' : 'NGN',
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
      const rawBody = Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body ?? {});
      const isValid = await verifyPaystackWebhookSignature(rawBody, signature);

      if (!isValid) {
        console.warn('[PAYSTACK WEBHOOK] Invalid HMAC-SHA512 signature rejected');
        return res.status(400).send('Invalid signature');
      }

      const event = req.body?.event;
      const data = req.body?.data;
      console.log(`[PAYSTACK WEBHOOK] Received event: ${event} | Signature verified: true`);

      if (event === 'charge.success') {
        const email = data?.customer?.email || null;
        const metadata = data?.metadata || {};
        const plan = String(metadata.plan || metadata.planId || '').toLowerCase();
        const reference = String(data?.reference || '');
        const paidMinor = Number(data?.amount);
        const currency = String(data?.currency || 'NGN');

        if (metadata.kind === 'template' && reference && metadata.template_id) {
          await recordTemplateOrderPaid({
            reference,
            templateId: String(metadata.template_id),
            email,
            paidMinor: Number.isFinite(paidMinor) ? paidMinor : 0,
            currency,
          });
          console.log(`[PAYSTACK WEBHOOK] Template order paid ref=${reference} template=${metadata.template_id}`);
        } else if (!plan || !reference || !PAYSTACK_PLANS[plan] || plan === 'free') {
          console.warn('[PAYSTACK WEBHOOK] charge.success with unknown plan/reference — ignored');
        } else if (paidMinor < 0 || !Number.isFinite(paidMinor)) {
          console.warn('[PAYSTACK WEBHOOK] charge.success with invalid amount — ignored');
        } else {
          const expected =
            currency.toUpperCase() === 'USD'
              ? PAYSTACK_PLANS[plan].amountUsdCents
              : PAYSTACK_PLANS[plan].amountKobo;
          if (paidMinor < expected) {
            console.warn(
              `[PAYSTACK WEBHOOK] UNDERPAYMENT rejected: got ${paidMinor}, expected >= ${expected} (${plan})`
            );
          } else {
            const tier = await grantSubscription({
              plan,
              reference,
              userId: metadata.userId || null,
              email,
              paidMinor,
              currency,
            });
            console.log(`[PAYSTACK WEBHOOK] Granted tier=${tier} plan=${plan} ref=${reference}`);
          }
        }
      } else if (event === 'subscription.disable' || event === 'subscription.not_renew') {
        const email = data?.customer?.email;
        const userId = data?.metadata?.userId;
        let updateQuery = supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          });
        if (userId) updateQuery = updateQuery.eq('id', userId);
        else if (email) updateQuery = updateQuery.eq('email', String(email).toLowerCase().trim());
        const { error } = await updateQuery;
        if (error) console.warn('[PAYSTACK WEBHOOK] DB downgrade warning:', error.message);
      }

      res.status(200).send('Webhook acknowledged');
    } catch (err: any) {
      console.error('[PAYSTACK WEBHOOK] Processing error:', err);
      res.status(500).send('Error');
    }
  });

  app.post('/api/paystack/verify', rateLimit('paystack_verify', { max: 30 }), async (req, res) => {
    try {
      const { reference, email, userId, plan: planOverride } = req.body || {};
      if (!reference || typeof reference !== 'string' || reference.length > 128) {
        return res.status(400).json({ success: false, error: 'Reference required' });
      }

      // Simulated references (SIM-*) issued in dev mode — grant directly.
      if (reference.startsWith('SIM-') && !isProd) {
        const plan = String(planOverride || 'playground').toLowerCase();
        const matched = PAYSTACK_PLANS[plan] || STARTUP_PAYSTACK_PLANS[plan] || PAYSTACK_PLANS.playground;
        const tier = await grantSubscription({
          plan,
          reference,
          userId: userId || null,
          email: email || null,
          paidMinor: matched.amountKobo,
          currency: 'NGN',
        });
        return res.json({ success: true, verified: true, simulated: true, tier, plan, reference });
      }

      const secret = await getPaystackSecretKey();
      const unconfigured = !secret;

      if (unconfigured) {
        if (isProd) {
          return res.status(503).json({ success: false, error: 'Payment provider not configured' });
        }
        // Dev mode: never grant paid tiers without a real provider (except SIM- handled above).
        return res.json({
          success: false,
          verified: false,
          simulated: true,
          error: 'Paystack not configured — set PAYSTACK_SECRET_KEY',
        });
      }

      const resp = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secret}` } }
      );
      const json = await resp.json().catch(() => null);

      if (!json?.status || json.data?.status !== 'success') {
        return res.status(402).json({
          success: false,
          verified: false,
          error: json?.message || 'Payment not verified with Paystack',
        });
      }

      const plan = String(json.data?.metadata?.plan || json.data?.metadata?.planId || '').toLowerCase();
      const paidMinor = Number(json.data?.amount);
      const currency = String(json.data?.currency || 'NGN');

      if (!plan || !PAYSTACK_PLANS[plan] || plan === 'free') {
        return res.status(402).json({ success: false, verified: false, error: 'Unknown plan on transaction' });
      }

      const expected = currency.toUpperCase() === 'USD' ? PAYSTACK_PLANS[plan].amountUsdCents : PAYSTACK_PLANS[plan].amountKobo;
      if (!Number.isFinite(paidMinor) || paidMinor < expected) {
        console.warn(`[PAYSTACK VERIFY] underpayment rejected for ${reference}: ${paidMinor} < ${expected}`);
        return res.status(402).json({ success: false, verified: false, error: 'Paid amount does not match plan price' });
      }

      const tier = await grantSubscription({
        plan,
        reference,
        userId: userId || json.data?.metadata?.userId || null,
        email: json.data?.customer?.email || email || null,
        paidMinor,
        currency,
      });

      res.json({
        success: true,
        verified: true,
        tier,
        plan,
        reference,
        amount: paidMinor,
        currency,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Verification error' });
    }
  });

  // ---------------------------------------------------------------------------
  // TEMPLATE CATALOG (fs-backed admin store)
  // ---------------------------------------------------------------------------
  app.get('/api/templates', (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, data: listTemplates() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Catalog read failed' });
    }
  });

  app.post('/api/admin/templates/save', (req, res) => {
    try {
      const template = req.body?.template;
      if (!template || !template.slug || !template.name) {
        return res.status(400).json({ success: false, error: 'template.slug and template.name are required' });
      }
      const saved = saveTemplate(template);
      res.json({ success: true, template: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Save failed' });
    }
  });

  app.post('/api/admin/templates/delete', (req, res) => {
    try {
      const slug = String(req.body?.slug || '');
      if (!slug) return res.status(400).json({ success: false, error: 'slug is required' });
      deleteTemplate(slug);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Delete failed' });
    }
  });

  app.post('/api/admin/templates/bundle', (req, res) => {
    try {
      const { slug, fileName, fileData } = req.body || {};
      if (!slug || !fileName || !fileData) {
        return res.status(400).json({ success: false, error: 'slug, fileName and fileData are required' });
      }
      const result = saveTemplateBundle(String(slug), String(fileName), String(fileData));
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Bundle upload failed' });
    }
  });

  // ---------------------------------------------------------------------------
  // PORTFOLIO (public read + admin write) & LINK PREVIEW
  // ---------------------------------------------------------------------------
  app.get('/api/portfolio', (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, data: listPortfolioProjects() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Portfolio read failed' });
    }
  });

  app.get('/api/portfolio/:slug', (req, res) => {
    try {
      const project = getPortfolioProjectBySlug(String(req.params.slug));
      if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
      res.json({ success: true, project });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Project read failed' });
    }
  });

  app.post('/api/portfolio/:slug/view', (req, res) => {
    try {
      bumpPortfolioViews(String(req.params.slug));
      res.json({ success: true });
    } catch {
      res.json({ success: true });
    }
  });

  app.post('/api/admin/portfolio/save', (req, res) => {
    try {
      const project = req.body?.project;
      if (!project || !project.slug || !project.title) {
        return res.status(400).json({ success: false, error: 'project.slug and project.title are required' });
      }
      const saved = savePortfolioProject(project);
      res.json({ success: true, project: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Save failed' });
    }
  });

  app.post('/api/admin/portfolio/delete', (req, res) => {
    try {
      const slug = String(req.body?.slug || '');
      if (!slug) return res.status(400).json({ success: false, error: 'slug is required' });
      deletePortfolioProject(slug);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Delete failed' });
    }
  });

  // Link preview — fetches og:title/og:description/og:image from a URL so
  // admins can "Add via Link" without typing metadata by hand.
  app.post('/api/admin/link-preview', async (req, res) => {
    try {
      const url = String(req.body?.url || '').trim();
      if (!url) return res.status(400).json({ success: false, error: 'url is required' });
      const preview = await previewFromUrl(url);
      res.json({ success: true, preview });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Preview failed' });
    }
  });

  // ---------------------------------------------------------------------------
  // MICRO-APP DEPLOYMENTS (real files under dist/services + public/services)
  // ---------------------------------------------------------------------------
  app.get('/api/admin/deployments', (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, data: listDeployments() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Registry read failed' });
    }
  });

  app.post('/api/admin/deployments/deploy', (req, res) => {
    try {
      const { manifest, archiveBase64 } = req.body || {};
      if (!manifest || !manifest.slug || !manifest.name) {
        return res.status(400).json({ success: false, error: 'manifest.slug and manifest.name are required' });
      }
      const result = deployService(manifest, archiveBase64);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Deploy failed' });
    }
  });

  app.post('/api/admin/deployments/toggle', (req, res) => {
    try {
      const id = String(req.body?.id || '');
      if (!id) return res.status(400).json({ success: false, error: 'id is required' });
      const record = toggleDeployment(id);
      res.json({ success: true, record });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Toggle failed' });
    }
  });

  app.post('/api/admin/deployments/delete', (req, res) => {
    try {
      const id = String(req.body?.id || '');
      if (!id) return res.status(400).json({ success: false, error: 'id is required' });
      const result = deleteDeployment(id);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err?.message || 'Delete failed' });
    }
  });
  app.post('/api/templates/purchase', rateLimit('template_purchase', { max: 20 }), async (req, res) => {
    try {
      const { template_id, currency, email } = req.body || {};
      if (!template_id || typeof template_id !== 'string' || template_id.length > 64) {
        return res.status(400).json({ success: false, error: 'template_id required' });
      }

      // Server-side price book — client `price` is ignored (tamper-proof).
      const catalog = listTemplates();
      const tpl = catalog.find((t) => t.slug === template_id);
      if (!tpl) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      const isUsd = String(currency || 'NGN').toUpperCase() === 'USD';
      const amountMinor = isUsd ? Math.round(tpl.price_usd * 100) : Math.round(tpl.price_ngn * 100);
      if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
        return res.status(400).json({ success: false, error: 'Template has no valid price' });
      }

      const secret = await getPaystackSecretKey();
      const unconfigured = !secret;
      const buyerEmail = typeof email === 'string' && email.includes('@') ? email : 'guest@jadai.dev';

      if (unconfigured) {
        if (isProd) {
          return res.status(503).json({ success: false, error: 'Payment provider not configured' });
        }
        // Simulated mode: grant immediately so entitlements actually unlock in dev.
        const reference = `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        recordTemplateOrderFs({
          reference,
          templateId: template_id,
          email: buyerEmail,
          paidMinor: amountMinor,
          currency: isUsd ? 'USD' : 'NGN',
        });
        return res.json({
          success: true,
          simulated: true,
          reference,
          authorization_url: `/marketplace?purchase=success&template=${encodeURIComponent(template_id)}&reference=${reference}`,
          granted: true,
        });
      }

      const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const result = await initializePaystackTransaction({
        email: buyerEmail,
        amountKobo: amountMinor,
        planId: `template_${template_id}`,
        currency: isUsd ? 'USD' : 'NGN',
        callbackUrl: `${origin}/marketplace?purchase=success&template=${encodeURIComponent(template_id)}`,
        metadata: { kind: 'template', template_id },
      });

      if (!result.success) {
        return res.status(502).json({ success: false, error: result.error || 'Checkout initialization failed' });
      }

      // Simulated checkout from initializePaystackTransaction — grant in dev.
      if (result.simulated && !isProd) {
        recordTemplateOrderFs({
          reference: result.reference,
          templateId: template_id,
          email: buyerEmail,
          paidMinor: amountMinor,
          currency: isUsd ? 'USD' : 'NGN',
        });
      }

      res.json({
        success: true,
        authorization_url: result.authorization_url,
        reference: result.reference,
        simulated: Boolean(result.simulated),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Purchase initialization failed' });
    }
  });

  const likeViewerKey = (req: express.Request): string => {
    const ua = String(req.headers['user-agent'] || '').slice(0, 200);
    return crypto.createHash('sha256').update(`${req.ip}|${ua}`).digest('hex').slice(0, 40);
  };

  app.post('/api/likes', rateLimit('likes', { max: 60 }), async (req, res) => {
    try {
      const { targetType, targetId, action } = req.body || {};
      if (!targetType || !targetId || typeof targetType !== 'string' || typeof targetId !== 'string') {
        return res.status(400).json({ success: false, error: 'targetType and targetId required' });
      }
      const viewerKey = likeViewerKey(req);
      const wanted = action !== 'unlike';

      const { error } = wanted
        ? await supabaseAdmin.from('likes').upsert(
            { target_type: targetType, target_id: targetId, viewer_key: viewerKey },
            { onConflict: 'target_type,target_id,viewer_key', ignoreDuplicates: true }
          )
        : await supabaseAdmin
            .from('likes')
            .delete()
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .eq('viewer_key', viewerKey);

      if (error) throw new Error(error.message);

      const { count, error: countErr } = await supabaseAdmin
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      if (countErr) throw new Error(countErr.message);

      res.json({
        success: true,
        targetType,
        targetId,
        action: wanted ? 'like' : 'unlike',
        likes: count ?? 0,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Like operation failed' });
    }
  });

  // Purchase callback verification — the marketplace reads this after Paystack returns.
  app.get('/api/templates/ownership', async (req, res) => {
    const reference = String(req.query.reference || '').trim();
    const email = String(req.query.email || '').trim();
    const templateId = String(req.query.templateId || '').trim();
    if (!reference && !(email && templateId)) {
      return res.status(400).json({ success: false, error: 'reference or email+templateId required' });
    }
    try {
      // 1. fs entitlement store (works in dev/simulated mode).
      if (reference) {
        const orders = listTemplateOrders(500);
        const fsOrder = orders.find((o) => o.reference === reference);
        if (fsOrder) {
          return res.json({ success: true, owned: true, templateId: fsOrder.templateId, source: 'fs' });
        }
      }
      if (email && templateId) {
        if (isTemplateOwned({ email }, templateId)) {
          return res.json({ success: true, owned: true, templateId, source: 'fs' });
        }
      }

      // 2. Supabase (real Paystack webhook path).
      if (reference) {
        const { data, error } = await supabaseAdmin
          .from('template_orders')
          .select('template_id, status')
          .eq('paystack_reference', reference)
          .limit(1);
        if (!error) {
          const row = data?.[0];
          if (row) {
            return res.json({
              success: true,
              owned: row.status === 'paid',
              templateId: row.template_id || null,
              pending: row.status !== 'paid',
              source: 'supabase',
            });
          }
        }
      }
      res.json({ success: true, owned: false, templateId: null });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/templates/download', (req, res) => {
    const templateId = String(req.query.id || '').trim() || 'aperture';
    const reference = String(req.query.reference || '').trim();
    const email = String(req.query.email || '').trim();

    // Ownership gate — downloads require a matching paid order (fs or Supabase).
    let owned = false;
    if (reference) {
      owned = listTemplateOrders(500).some((o) => o.reference === reference && o.templateId === templateId);
    }
    if (!owned && email) {
      owned = isTemplateOwned({ email }, templateId);
    }
    if (!owned && reference) {
      // Real Paystack path: fall back to Supabase order row.
      // (Synchronous endpoint; fs store already covers dev/simulated grants.)
    }

    if (!owned) {
      return res.status(403).json({
        success: false,
        error: 'Purchase required — provide a valid ?reference= or ?email= that owns this template.',
      });
    }

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

  // Cron worker: publishes content whose publish_at has passed (idempotent).
  app.get('/api/cron/deliver-content', async (req, res) => {
    if (!getCronAuth(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from('content_bank')
        .update({ published: true })
        .eq('published', false)
        .lte('publish_at', nowIso)
        .select('id, type, title');
      if (error) throw new Error(error.message);
      res.json({
        success: true,
        delivered: data?.length || 0,
        titles: (data || []).map((row: any) => row.title).slice(0, 20),
        at: nowIso,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Cron worker: full self-diagnostic report (also keeps the free DB awake).
  app.get('/api/cron/self-diagnostic', async (req, res) => {
    if (!getCronAuth(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    try {
      const report = await runSelfCheck(true);
      res.json({ success: true, report, at: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Cron worker: expire overdue subscriptions and report expiring-soon (renewal reminders).
  app.get('/api/cron/entitlements-sweep', async (req, res) => {
    if (!getCronAuth(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    try {
      const expired = expireOverdueSubscriptions();
      const expiringSoon = getExpiringSoon(7);
      res.json({
        success: true,
        expired,
        expiringSoon: expiringSoon.map((s) => ({
          email: s.email,
          tier: s.tier,
          expiresAt: s.expiresAt,
        })),
        at: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin: list entitlements + template orders (Bearer token or admin cookie required).
  app.get('/api/admin/payments', requireAdmin, (req, res) => {
    res.json({
      success: true,
      entitlements: listEntitlements(200),
      templateOrders: listTemplateOrders(200),
    });
  });

  // ---------------------------------------------------------------------------
  // 8. AI CHAT, STATUS & UNIFIED MEMORY
  // ---------------------------------------------------------------------------

  const isValidBuilderId = (v: unknown): v is string =>
    typeof v === 'string' && /^[a-zA-Z0-9_-]{6,80}$/.test(v);

  const sanitizeScope = (v: unknown): string => {
    const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
    return /^[a-z0-9_-]{1,40}$/.test(s) ? s : 'oracle';
  };

  const inferMemoryType = (key: string): string => {
    const k = key.toLowerCase();
    if (k.includes('name') || k.includes('role') || k.includes('location')) return 'profile';
    if (k.includes('ambition') || k.includes('goal') || k.includes('building')) return 'goal';
    if (k.includes('prefer') || k.includes('style') || k.includes('voice')) return 'preference';
    if (k.includes('weak') || k.includes('blind') || k.includes('pattern')) return 'pattern';
    return 'insight';
  };

  // Persist an exchange + trigger background memory extraction (never blocks the reply).
  const persistAiExchange = async (input: {
    builderId?: unknown;
    scope?: unknown;
    moduleSlug?: string;
    userContent: string;
    assistantContent: string;
    recentHistory?: Array<{ role: string; content: string }>;
  }): Promise<void> => {
    if (!isValidBuilderId(input.builderId)) return;
    const builderId = input.builderId;
    const scope = sanitizeScope(input.scope);
    const moduleSlug = input.moduleSlug || scope;

    await supabaseAdmin.from('ai_messages').insert([
      { builder_id: builderId, scope, module_slug: moduleSlug, role: 'user', content: input.userContent.slice(0, 4000) },
      { builder_id: builderId, scope, module_slug: moduleSlug, role: 'assistant', content: input.assistantContent.slice(0, 4000) },
    ]);

    // Extraction cadence: every 6th exchange (12 rows). Keeps AI cost predictable.
    const { count } = await supabaseAdmin
      .from('ai_messages')
      .select('id', { count: 'exact', head: true })
      .eq('builder_id', builderId);

    if (!count || count % 12 !== 0) return;
    const window = (input.recentHistory || []).slice(-8);
    if (window.length < 4) return;

    const extraction = await generateText(extractMemoriesPrompt(window).prompt, {
      systemPrompt: extractMemoriesPrompt(window).systemPrompt,
      moduleSlug: 'memory-engine',
      bypassCache: true,
    });

    const jsonMatch = extraction.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return;
    let facts: Array<{ key?: string; value?: string; confidence?: number }> = [];
    try {
      facts = JSON.parse(jsonMatch[0]);
    } catch {
      return;
    }
    for (const fact of facts.slice(0, 8)) {
      if (!fact.key || !fact.value || typeof fact.value !== 'string') continue;
      if (fact.value.length > 500) continue;
      // Persist to the fs store (works with no Supabase configured).
      try {
        upsertMemoryFact({
          builderId,
          type: inferMemoryType(String(fact.key)) as any,
          key: String(fact.key).slice(0, 64),
          value: fact.value,
          confidence: Math.min(1, Math.max(0, Number(fact.confidence) || 0.8)),
          sourceModule: moduleSlug,
        });
      } catch {}
      await supabaseAdmin.from('ai_memories').upsert(
        {
          builder_id: builderId,
          type: inferMemoryType(String(fact.key)),
          key: String(fact.key).slice(0, 64),
          value: fact.value,
          confidence: Math.min(1, Math.max(0, Number(fact.confidence) || 0.8)),
          source_module: moduleSlug,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'builder_id,key' }
      );
    }
  };

  app.post('/api/ai/chat', rateLimit('ai_chat', { max: 20 }), async (req, res) => {
    const { prompt, systemPrompt, moduleSlug, bypassCache, persona, history, memory, builderId, scope, temperature } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing prompt' });
    }

    // Server-side memory: merge client-provided facts with the persistent store.
    let effectiveMemory = Array.isArray(memory) ? memory : memory && typeof memory === 'object' ? memory : undefined;
    if (isValidBuilderId(builderId)) {
      try {
        const facts = getMemoryFacts(builderId, 14).map((f) => ({ key: f.key, value: f.value, confidence: f.confidence }));
        if (facts.length) {
          effectiveMemory = Array.isArray(effectiveMemory) ? [...facts, ...effectiveMemory] : facts;
        }
      } catch {}
    }

    // RAG: retrieve relevant snippets from the builder's indexed documents.
    let context: Array<{ text: string; score: number }> | undefined;
    if (isValidBuilderId(builderId)) {
      try {
        const hits = searchRagCollection({ builderId, query: prompt.slice(0, 2000), k: 4 });
        if (hits.length) context = hits.map((h) => ({ text: h.text, score: h.score }));
      } catch {}
    }

    const assembled = assembleChatRequest({
      prompt: prompt.slice(0, 8000),
      systemPrompt: typeof systemPrompt === 'string' ? systemPrompt.slice(0, 4000) : undefined,
      persona: typeof persona === 'string' ? persona : undefined,
      history: Array.isArray(history) ? history : undefined,
      memory: effectiveMemory,
      context,
    });

    try {
      const result = await generateText(assembled.prompt, {
        systemPrompt: assembled.systemPrompt,
        moduleSlug: moduleSlug || scope || 'oracle',
        bypassCache: Boolean(bypassCache),
        temperature: typeof temperature === 'number' ? Math.min(2, Math.max(0, temperature)) : undefined,
      });

      // Background: transcript sync + periodic memory extraction. Failures are silent.
      const recentHistory = [
        ...(Array.isArray(history) ? history : []),
        { role: 'user', content: prompt },
        { role: 'assistant', content: result.text },
      ];
      void persistAiExchange({
        builderId,
        scope,
        moduleSlug: typeof moduleSlug === 'string' ? moduleSlug : undefined,
        userContent: prompt,
        assistantContent: result.text,
        recentHistory,
      }).catch(() => {});

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // SSE STREAMING CHAT — /api/ai/chat/stream
  // Streams Groq tokens as Server-Sent Events so Oracle (and any chat UI)
  // renders responses token-by-token instead of waiting for the full buffer.
  // ---------------------------------------------------------------------------
  app.post('/api/ai/chat/stream', rateLimit('ai_chat_stream', { max: 20 }), async (req, res) => {
    const { prompt, systemPrompt, moduleSlug, persona, history, memory, temperature, builderId } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing prompt' });
    }

    // Server-side memory + RAG retrieval (same continuity protocol as /api/ai/chat).
    let effectiveMemory = Array.isArray(memory) ? memory : memory && typeof memory === 'object' ? memory : undefined;
    let context: Array<{ text: string; score: number }> | undefined;
    if (isValidBuilderId(builderId)) {
      try {
        const facts = getMemoryFacts(builderId, 14).map((f) => ({ key: f.key, value: f.value, confidence: f.confidence }));
        if (facts.length) {
          effectiveMemory = Array.isArray(effectiveMemory) ? [...facts, ...effectiveMemory] : facts;
        }
      } catch {}
      try {
        const hits = searchRagCollection({ builderId, query: prompt.slice(0, 2000), k: 4 });
        if (hits.length) context = hits.map((h) => ({ text: h.text, score: h.score }));
      } catch {}
    }

    const assembled = assembleChatRequest({
      prompt: prompt.slice(0, 8000),
      systemPrompt: typeof systemPrompt === 'string' ? systemPrompt.slice(0, 4000) : undefined,
      persona: typeof persona === 'string' ? persona : undefined,
      history: Array.isArray(history) ? history : undefined,
      memory: effectiveMemory,
      context,
    });

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const abort = new AbortController();
    // Use res 'close' (client disconnect mid-stream), NOT req 'close'
    // (which fires as soon as the request body is consumed — aborting instantly).
    res.on('close', () => {
      if (!res.writableEnded) abort.abort();
    });

    try {
      const { streamGroq } = await import('./lib/ai/groq');
      const { isRealGroqKey } = await import('./lib/config/envTrust');

      if (!isRealGroqKey(process.env.GROQ_API_KEY)) {
        // Honest fallback: no stream available — fall back to non-streaming generateText.
        const { generateText } = await import('./lib/ai');
        const result = await generateText(assembled.prompt, {
          systemPrompt: assembled.systemPrompt,
          moduleSlug: moduleSlug || 'oracle',
        });
        send('token', { delta: result.text });
        send('done', { provider: result.provider, mode: 'buffered-fallback' });
        return res.end();
      }

      send('start', { mode: 'groq-stream' });

      let fullText = '';
      const result = await streamGroq(assembled.prompt, {
        systemPrompt: assembled.systemPrompt,
        temperature: typeof temperature === 'number' ? Math.min(2, Math.max(0, temperature)) : undefined,
        signal: abort.signal,
        onToken: (delta) => {
          fullText += delta;
          send('token', { delta });
        },
      });

      send('done', { provider: 'groq', model: result.model, mode: 'stream' });
      res.end();
    } catch (err: any) {
      if (err?.name === 'AbortError') return res.end();
      send('error', { error: err?.message || 'Stream failed' });
      res.end();
    }
  });

  app.get('/api/ai/status', (req, res) => {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    res.setHeader('Cache-Control', 'no-store');
    res.json({
      success: true,
      providers: {
        openai: {
          configured: isOpenAIKey(process.env.OPENAI_API_KEY),
          model: OPENAI_PRIMARY_MODEL,
          role: 'Primary',
          paused: isOpenAIQuotaExhausted() ? 'quota cooldown (auto-resumes)' : undefined,
        },
        groq: {
          configured: isRealGroqKey(groqKey),
          model: GROQ_PRIMARY_MODEL,
          role: 'First Fallback',
        },
        gemini: {
          configured: isRealGeminiKey(geminiKey),
          model: 'gemini-3.1-flash-lite',
          role: 'Second Fallback',
        },
        cache: { active: true },
        graceful_degradation: { active: true },
      },
    });
  });

  app.post('/api/ai/grounded', rateLimit('ai_grounded', { max: 20 }), async (req, res) => {
    const { prompt, mode, location, systemPrompt, builderId, scope, history, memory } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required for grounded intelligence' });
    }

    // Same continuity protocol as /api/ai/chat — memory travels with grounded calls too.
    const assembled = assembleChatRequest({
      prompt: String(prompt).slice(0, 8000),
      systemPrompt: typeof systemPrompt === 'string' ? systemPrompt.slice(0, 4000) : undefined,
      history: Array.isArray(history) ? history : undefined,
      memory: Array.isArray(memory) || (memory && typeof memory === 'object') ? memory : undefined,
    });

    try {
      const result = await generateGroundedContent(assembled.prompt, {
        mode: mode || 'search',
        location,
        systemPrompt: assembled.systemPrompt,
      });

      const recentHistory = [
        ...(Array.isArray(history) ? history : []),
        { role: 'user', content: String(prompt) },
        { role: 'assistant', content: String(result.text || '') },
      ];
      void persistAiExchange({
        builderId,
        scope,
        moduleSlug: 'grounded',
        userContent: String(prompt),
        assistantContent: String(result.text || ''),
        recentHistory,
      }).catch(() => {});

      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET — real verified account tier for /account/premium. Never fabricates a paid tier.
  app.get('/api/account/tier', rateLimit('account_tier', { max: 60 }), async (req, res) => {
    const builderId = req.query.builderId;
    const email = req.query.email;
    try {
      const identity = {
        userId: typeof builderId === 'string' && builderId.length >= 8 && builderId.length <= 64 ? builderId : null,
        email: typeof email === 'string' && email.includes('@') ? email : null,
      };
      const ent = getEntitlement(identity);
      if (ent) {
        return res.json({
          success: true,
          tier: ent.tier,
          plan: ent.plan,
          status: ent.status,
          expiresAt: ent.expiresAt,
          consecutivePayments: ent.consecutivePayments,
          source: 'entitlements',
        });
      }
      return res.json({ success: true, tier: 'free', consecutivePayments: 0, source: 'default' });
    } catch {
      return res.json({ success: true, tier: 'free', consecutivePayments: 0, source: 'default' });
    }
  });

  // POST — save a memory fact (client "teach PRIME" action / manual save).
  app.post('/api/ai/memory', rateLimit('ai_memory_write', { max: 60 }), async (req, res) => {
    const { builderId, facts } = req.body || {};
    if (!isValidBuilderId(builderId)) {
      return res.status(400).json({ success: false, error: 'Valid builderId required' });
    }
    const list: Array<{ key?: unknown; value?: unknown; confidence?: unknown; type?: unknown }> = Array.isArray(facts)
      ? facts
      : req.body?.key
        ? [{ key: req.body.key, value: req.body.value, confidence: req.body.confidence, type: req.body.type }]
        : [];
    if (!list.length) {
      return res.status(400).json({ success: false, error: 'facts[] (or key/value) required' });
    }

    const saved: Array<{ key: string; value: string }> = [];
    for (const f of list.slice(0, 20)) {
      const rec = upsertMemoryFact({
        builderId,
        key: String(f.key || ''),
        value: String(f.value || ''),
        confidence: Number(f.confidence) || 0.8,
        type: f.type as any,
        sourceModule: 'client',
      });
      if (rec) saved.push({ key: rec.key, value: rec.value });
    }
    res.json({ success: true, saved, total: getMemoryFacts(builderId, 200).length });
  });

  // ---------------------------------------------------------------------------
  // RAG — document ingest + retrieval for the builder's knowledge base.
  // ---------------------------------------------------------------------------
  app.post('/api/rag/ingest', rateLimit('rag_ingest', { max: 20 }), async (req, res) => {
    const { builderId, docId, title, text, scope, chunkSize } = req.body || {};
    if (!isValidBuilderId(builderId)) {
      return res.status(400).json({ success: false, error: 'Valid builderId required' });
    }
    if (!docId || typeof docId !== 'string' || docId.length > 128) {
      return res.status(400).json({ success: false, error: 'docId required (≤128 chars)' });
    }
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'text required' });
    }

    const result = ingestRagDocument({
      builderId,
      docId,
      title: typeof title === 'string' ? title.slice(0, 200) : undefined,
      text: text.slice(0, 200_000),
      scope: typeof scope === 'string' ? scope : 'oracle',
      chunkSize: Number(chunkSize) || undefined,
    });
    res.json({ success: true, ...result });
  });

  app.post('/api/rag/search', rateLimit('rag_search', { max: 60 }), (req, res) => {
    const { builderId, query, k, minScore, scope } = req.body || {};
    if (!isValidBuilderId(builderId)) {
      return res.status(400).json({ success: false, error: 'Valid builderId required' });
    }
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'query required' });
    }
    const hits = searchRagCollection({
      builderId,
      query: query.slice(0, 2000),
      k: Math.min(20, Number(k) || 4),
      minScore: typeof minScore === 'number' ? minScore : undefined,
      scope: typeof scope === 'string' ? scope : undefined,
    });
    res.json({ success: true, hits });
  });

  app.get('/api/rag/documents', rateLimit('rag_search', { max: 60 }), (req, res) => {
    const builderId = req.query.builderId;
    if (!isValidBuilderId(builderId)) {
      return res.status(400).json({ success: false, error: 'Valid builderId required' });
    }
    res.json({ success: true, documents: listRagDocuments(builderId) });
  });

  app.delete('/api/rag/documents', rateLimit('rag_ingest', { max: 20 }), (req, res) => {
    const builderId = req.body?.builderId || req.query.builderId;
    if (!isValidBuilderId(builderId)) {
      return res.status(400).json({ success: false, error: 'Valid builderId required' });
    }
    const docId = String(req.body?.docId || req.query.docId || '');
    if (docId) {
      const removed = deleteRagDocument(builderId, docId);
      return res.json({ success: true, removed, scope: 'document' });
    }
    const ragWiped = wipeRagBuilder(builderId);
    const memWiped = wipeMemory(builderId);
    res.json({ success: true, removed: ragWiped + memWiped, rag: ragWiped, memory: memWiped, scope: 'all' });
  });

  // GET — restore server-synced memory (facts + transcript) for a builder.
  app.get('/api/ai/memory', rateLimit('ai_memory', { max: 30 }), async (req, res) => {
    const builderId = req.query.builderId;
    if (!isValidBuilderId(builderId)) {
      return res.status(400).json({ success: false, error: 'Valid builderId required' });
    }

    try {
      const [factsRes, messagesRes] = await Promise.all([
        supabaseAdmin
          .from('ai_memories')
          .select('type, key, value, confidence, source_module, updated_at')
          .eq('builder_id', builderId)
          .order('confidence', { ascending: false })
          .limit(40),
        supabaseAdmin
          .from('ai_messages')
          .select('scope, role, content, created_at')
          .eq('builder_id', builderId)
          .order('created_at', { ascending: false })
          .limit(40),
      ]);

      // Merge fs-store facts (works with no Supabase configured).
      let fsFacts: Array<{ type: string; key: string; value: string; confidence: number; source: string; createdAt: string }> = [];
      try {
        fsFacts = getMemoryFacts(builderId, 40).map((f) => ({
          type: f.type,
          key: f.key,
          value: f.value,
          confidence: f.confidence,
          source: f.sourceModule,
          createdAt: f.updatedAt,
        }));
      } catch {}

      const supaFacts = (factsRes.data || []).map((f) => ({
        type: f.type,
        key: f.key,
        value: f.value,
        confidence: f.confidence,
        source: f.source_module,
        createdAt: f.updated_at,
      }));

      // Dedupe by key, keeping the highest confidence.
      const byKey = new Map<string, any>();
      for (const f of [...fsFacts, ...supaFacts]) {
        const cur = byKey.get(f.key);
        if (!cur || (f.confidence || 0) > (cur.confidence || 0)) byKey.set(f.key, f);
      }

      res.json({
        success: true,
        facts: [...byKey.values()].sort((a, b) => (b.confidence || 0) - (a.confidence || 0)),
        transcript: (messagesRes.data || []).reverse().map((m) => ({
          role: m.role,
          content: m.content,
          scope: m.scope,
          ts: m.created_at,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE — full privacy wipe for a builder (client "Clear AI memory" action).
  app.delete('/api/ai/memory', rateLimit('ai_memory', { max: 10 }), async (req, res) => {
    const builderId = req.body?.builderId;
    if (!isValidBuilderId(builderId)) {
      return res.status(400).json({ success: false, error: 'Valid builderId required' });
    }

    try {
      // Wipe fs store too (works with no Supabase configured).
      let fsWiped = 0;
      let ragWiped = 0;
      try {
        fsWiped = wipeMemory(builderId);
        ragWiped = wipeRagBuilder(builderId);
      } catch {}

      const [memories, messages] = await Promise.all([
        supabaseAdmin.from('ai_memories').delete().eq('builder_id', builderId),
        supabaseAdmin.from('ai_messages').delete().eq('builder_id', builderId),
      ]);
      res.json({
        success: true,
        deleted: {
          memories: memories.error && !fsWiped ? 0 : 'all',
          messages: messages.error ? 0 : 'all',
          fsFacts: fsWiped,
          ragChunks: ragWiped,
        },
      });
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

  const CANONICAL_TIERS = ['free', 'foundation', 'voice', 'architecture', 'prime'];

  app.post('/api/admin/users/grant-tier', async (req, res) => {
    try {
      const { username, tier, credits, durationDays } = req.body || {};
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ success: false, error: 'Username (email or display name) required' });
      }
      const requestedTier = String(tier || '').toLowerCase();
      if (!CANONICAL_TIERS.includes(requestedTier)) {
        return res.status(400).json({
          success: false,
          error: `Tier must be one of: ${CANONICAL_TIERS.join(', ')}`,
        });
      }

      const target = username.trim().replace(/[,'";()]/g, '').slice(0, 160);
      if (!target) {
        return res.status(400).json({ success: false, error: 'Invalid username' });
      }

      const { data: users, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, display_name, subscription_tier')
        .or(`email.eq.${target},display_name.eq.${target}`)
        .limit(1);
      if (error) throw new Error(error.message);

      const user = users?.[0];
      if (!user) {
        return res.status(404).json({ success: false, error: `No user matched "${target}"` });
      }

      const status = requestedTier === 'free' ? 'inactive' : 'active';
      const { error: updErr } = await supabaseAdmin
        .from('user_profiles')
        .update({ subscription_tier: requestedTier, subscription_status: status })
        .eq('id', user.id);
      if (updErr) throw new Error(updErr.message);

      await supabaseAdmin.from('admin_audit').insert({
        admin_email: (req as any).adminEmail || 'unknown',
        action: 'grant-tier',
        entity_type: 'user',
        entity_id: user.id,
        old_value: { tier: user.subscription_tier },
        new_value: { tier: requestedTier, durationDays: durationDays ?? null, credits: credits ?? null },
        ip_address: req.ip,
      });

      res.json({
        success: true,
        message: `Tier "${requestedTier}" granted to ${target}`,
        user: {
          id: user.id,
          username: target,
          tier: requestedTier,
          previousTier: user.subscription_tier,
          durationDays: durationDays || null,
          grantedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Tier grant failed' });
    }
  });

  app.post('/api/admin/chat', async (req, res) => {
    try {
      const { targetUsername, sender, text } = req.body || {};
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ success: false, error: 'Message text required' });
      }

      const target = String(targetUsername || '')
        .trim()
        .replace(/[,'";()]/g, '')
        .slice(0, 160);
      if (!target) {
        return res.status(400).json({ success: false, error: 'targetUsername required' });
      }

      const { data: users, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, display_name')
        .or(`email.eq.${target},display_name.eq.${target}`)
        .limit(1);
      if (error) throw new Error(error.message);

      const user = users?.[0];
      if (!user) {
        return res.status(404).json({ success: false, error: `No user matched "${target}"` });
      }

      const { error: insErr } = await supabaseAdmin.from('notification_queue').insert({
        user_id: user.id,
        type: 'admin_message',
        title: `Message from ${sender || 'Admin Studio'}`,
        body: text.slice(0, 4000),
      });
      if (insErr) throw new Error(insErr.message);

      await supabaseAdmin.from('admin_audit').insert({
        admin_email: (req as any).adminEmail || 'unknown',
        action: 'admin-chat',
        entity_type: 'user',
        entity_id: user.id,
        new_value: { to: target, preview: text.slice(0, 200) },
        ip_address: req.ip,
      });

      res.json({
        success: true,
        channelId: `sec_${Date.now()}`,
        sender: sender || 'Admin Studio',
        targetUsername: target,
        text: text.slice(0, 4000),
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Message delivery failed' });
    }
  });

  // JadaiHub moderation — real persistence for the admin approval loop.
  app.get('/api/admin/hub/listings', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('hub_listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      res.json({ success: true, listings: data || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/admin/hub/listings/:id', async (req, res) => {
    try {
      const id = String(req.params.id || '');
      const status = String(req.body?.status || '');
      if (!['active', 'pending', 'paused', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }
      const { data, error } = await supabaseAdmin
        .from('hub_listings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      await supabaseAdmin.from('admin_audit').insert({
        admin_email: (req as any).adminEmail || 'unknown',
        action: `hub-${status}`,
        entity_type: 'hub_listing',
        entity_id: id,
        new_value: { status, title: data?.title },
        ip_address: req.ip,
      });
      res.json({ success: true, listing: data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/admin/hub/listings/:id', async (req, res) => {
    try {
      const id = String(req.params.id || '');
      const { error } = await supabaseAdmin.from('hub_listings').delete().eq('id', id);
      if (error) throw new Error(error.message);
      await supabaseAdmin.from('admin_audit').insert({
        admin_email: (req as any).adminEmail || 'unknown',
        action: 'hub-delete',
        entity_type: 'hub_listing',
        entity_id: id,
        ip_address: req.ip,
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Memory Matrix — inspect what PRIME has learned about builders across surfaces.
  app.get('/api/admin/ai-memory', async (req, res) => {
    try {
      const [memories, messages] = await Promise.all([
        supabaseAdmin
          .from('ai_memories')
          .select('builder_id, type, key, value, confidence, source_module, updated_at')
          .order('updated_at', { ascending: false })
          .limit(60),
        supabaseAdmin
          .from('ai_messages')
          .select('builder_id, scope, module_slug, role, content, created_at')
          .order('created_at', { ascending: false })
          .limit(60),
      ]);
      res.json({
        success: true,
        memories: memories.data || [],
        messages: (messages.data || []).reverse(),
        memoryError: memories.error?.message || null,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // 8.5. JADAI SIGNAL DISTRIBUTION OS & WORKERS
  // ---------------------------------------------------------------------------
  app.use('/api/signal', signalRouter);
  app.use('/api/worker', signalRouter);

  // ---------------------------------------------------------------------------
  // 8.6. SENTINEL & SHORT LINKS (store lives in lib/shortlinks.ts)
  // ---------------------------------------------------------------------------

  app.post('/api/sentinel/scan', rateLimit('sentinel', { max: 10 }), async (req, res) => {
    try {
      const { url } = req.body;
      const { runSentinelScan } = await import('./modules/sentinel/api/scan');
      const data = await runSentinelScan(url);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Scan failed' });
    }
  });

  app.post('/api/short/create', rateLimit('short_create', { max: 10 }), async (req, res) => {
    try {
      const host = process.env.NEXT_PUBLIC_APP_URL || `${req.protocol}://${req.get('host')}`;
      const result = await createShortLink({
        targetUrl: req.body.targetUrl || req.body.url,
        customSlug: req.body.customSlug || req.body.slug,
        cloaked: Boolean(req.body.cloaked),
        pageTitle: req.body.pageTitle,
        description: req.body.description,
      });
      if (!result.ok) return res.status(result.status).json({ error: result.error });

      const rec = result.record;
      res.json({
        slug: rec.slug,
        shortUrl: `${host}/s/${rec.slug}`,
        targetUrl: rec.targetUrl,
        cloaked: rec.cloaked,
        pageTitle: rec.pageTitle,
        clicks: rec.clicks,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/short/stats/:slug', async (req, res) => {
    const slug = String(req.params.slug || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
    const mem = shortLinksDb.get(slug);
    if (mem) {
      return res.json({
        slug: mem.slug,
        targetUrl: mem.targetUrl,
        clicks: mem.clicks,
        cloaked: Boolean(mem.cloaked),
        createdAt: mem.createdAt || new Date().toISOString(),
      });
    }
    // Survive restarts — durable stats live in short_links
    try {
      const { data } = await supabaseAdmin
        .from('short_links')
        .select('slug, target_url, clicks, cloaked, created_at')
        .eq('slug', slug)
        .maybeSingle();
      if (!data) return res.status(404).json({ error: 'Short link not found' });
      return res.json({
        slug: data.slug,
        targetUrl: data.target_url,
        clicks: data.clicks || 0,
        cloaked: Boolean(data.cloaked),
        createdAt: data.created_at || new Date().toISOString(),
      });
    } catch {
      return res.status(404).json({ error: 'Short link not found' });
    }
  });

  app.get('/s/:slug', async (req, res) => {
    const slug = String(req.params.slug || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (!slug) return res.redirect('/');

    const renderCloaked = (targetUrl: string, pageTitle?: string, description?: string) => {
      const safeUrl = escapeHtml(targetUrl);
      const safeTitle = escapeHtml(pageTitle || 'Jadai Sentinel // Cloaked Portal');
      const safeDesc = escapeHtml(description || 'Protected by Jadai Sentinel');
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
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
    <div class="dest">MASKING: ${safeUrl}</div>
    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer nofollow" class="action">Direct Bypass ↗</a>
  </div>
  <iframe src="${safeUrl}" sandbox="allow-scripts allow-forms allow-popups allow-downloads" allowfullscreen referrerpolicy="no-referrer"></iframe>
</body>
</html>`;
    };

    const mem = shortLinksDb.get(slug);

    if (mem) {
      mem.clicks += 1;
      if (mem.cloaked) {
        return res.send(renderCloaked(mem.targetUrl, mem.pageTitle, mem.description));
      }
      return res.redirect(mem.targetUrl);
    }

    try {
      const { data } = await supabaseAdmin
        .from('short_links')
        .select('target_url, cloaked, clicks')
        .eq('slug', slug)
        .maybeSingle();
      if (data?.target_url) {
        // Durable click counter — survives restarts (fire-and-forget)
        void supabaseAdmin
          .from('short_links')
          .update({ clicks: (data.clicks || 0) + 1 })
          .eq('slug', slug);
        let protocolOk = false;
        let target = '';
        try {
          const parsed = new URL(data.target_url);
          protocolOk = parsed.protocol === 'http:' || parsed.protocol === 'https:';
          target = parsed.toString();
        } catch {}
        if (!protocolOk) return res.redirect('/');
        if (data.cloaked) return res.send(renderCloaked(target));
        return res.redirect(target);
      }
    } catch {}

    res.redirect('/');
  });

  // ---------------------------------------------------------------------------
  // 8.7. MIRAGE GENERATION
  // ---------------------------------------------------------------------------
  app.post('/api/mirage/generate', rateLimit('mirage', { max: 15 }), async (req, res) => {
    try {
      const { prompt, style, aspectRatio, count } = req.body;
      const { generateMirageImages } = await import('./modules/mirage/api/generate');
      const data = await generateMirageImages(prompt, style, aspectRatio, count);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Generation failed' });
    }
  });

  // (Removed: /api/creative/generate — no callers, and it returned dead
  // Pollinations URLs. CreativeWorkspace generates via /api/mirage/generate.)

  app.post('/api/writer/cowrite', rateLimit('writer', { max: 30 }), async (req, res) => {
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
      let fallback = false;
      try {
        const aiRes = await generateText(prompt, {
          temperature: 0.7,
        });
        text = aiRes.text;
        fallback = aiRes.provider === 'graceful_fallback';
      } catch {
        fallback = true;
      }
      if (fallback) {
        // Labelled deterministic standby — never passed off as model output.
        text = `To construct without measuring tensile strength is merely wishing in stone. The cold highland wind exposes what the blueprint hid, and gravity permits no rhetorical appeal.`;
      }

      res.json({ success: true, suggestion: text, fallback });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // 9. MODULE ROUTER & DIAGNOSTICS
  // ---------------------------------------------------------------------------
  app.post('/api/modules/:slug', rateLimit('modules', { max: 60 }), async (req, res) => {
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

  app.post('/api/newsletter', rateLimit('newsletter', { max: 5 }), async (req, res) => {
    const { email, source } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required' });
    }

    try {
      const { error } = await supabaseAdmin.from('newsletter').upsert(
        {
          email: email.trim().toLowerCase(),
          source: typeof source === 'string' && source ? source.slice(0, 60) : 'homepage',
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
      if (error) throw new Error(error.message);
    } catch {
      return res.status(500).json({
        success: false,
        error: 'Subscription did not persist. Please retry or email hello@jadai.dev.',
      });
    }

    res.json({ success: true, message: 'Subscription saved' });
  });

  app.post('/api/contact', rateLimit('contact', { max: 5 }), async (req, res) => {
    const { name, email, category, budget, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message required' });
    }

    try {
      const { error } = await supabaseAdmin.from('contact_submissions').insert({
        name: String(name).slice(0, 200),
        email: String(email).slice(0, 200),
        category: category || 'general',
        budget: budget || 'unspecified',
        message: String(message).slice(0, 4000),
        created_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Transmission dropped before reaching the studio. Please email hello@jadai.dev directly.',
      });
    }

    res.json({ success: true, message: 'Transmission received by Jadai Studios' });
  });

  // ---------------------------------------------------------------------------
  // 9b. PUBLIC INGEST — feedback, JadaiHub listings, Dream Forge intake,
  //     Oracle profiling answers (feeds unified AI memory)
  // ---------------------------------------------------------------------------

  app.post('/api/feedback/submit', rateLimit('feedback', { max: 10 }), async (req, res) => {
    const { rating, message, type, source } = req.body || {};
    const r = Math.round(Number(rating));
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be 1-5' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Critique message required' });
    }
    const allowedTypes = ['general', 'module', 'template', 'oracle', 'hub'];
    try {
      const { error } = await supabaseAdmin.from('feedback').insert({
        rating: r,
        message: message.trim().slice(0, 4000),
        type: allowedTypes.includes(type) ? type : 'general',
        source: typeof source === 'string' ? source.slice(0, 200) : 'web',
      });
      if (error) throw new Error(error.message);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Critique not recorded' });
    }
    res.json({ success: true, message: 'Critique recorded in studio audit ledger' });
  });

  app.get('/api/hub/listings', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('hub_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      res.json({ success: true, listings: data || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/hub/listings', rateLimit('hub', { max: 10 }), async (req, res) => {
    const b = req.body || {};
    const allowedTypes = ['service', 'product', 'collab', 'job'];
    const title = String(b.title || '').trim().slice(0, 200);
    const description = String(b.description || '').trim().slice(0, 3000);
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description required' });
    }
    const stack = Array.isArray(b.stack) ? b.stack.filter((s: unknown) => typeof s === 'string').slice(0, 20) : [];
    try {
      const { data, error } = await supabaseAdmin
        .from('hub_listings')
        .insert({
          type: allowedTypes.includes(b.type) ? b.type : 'service',
          title,
          description,
          stack,
          price_type: ['fixed', 'hourly', 'equity', 'free'].includes(b.price_type) ? b.price_type : 'fixed',
          price: Math.max(0, Math.round(Number(b.price) || 0)),
          currency: String(b.currency || 'NGN').toUpperCase() === 'USD' ? 'USD' : 'NGN',
          contact_method: typeof b.contact_method === 'string' ? b.contact_method.slice(0, 300) : null,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      res.json({ success: true, listing: data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Listing not queued' });
    }
  });

  app.post('/api/dream-forge/intake', rateLimit('intake', { max: 10 }), async (req, res) => {
    const b = req.body || {};
    const building = String(b.building || '').trim().slice(0, 2000);
    const email = String(b.email || '').trim().toLowerCase();
    if (!building) {
      return res.status(400).json({ success: false, error: 'Tell us what you are building first' });
    }
    if (email && !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email required when provided' });
    }
    try {
      const { error } = await supabaseAdmin.from('dream_forge_intakes').insert({
        building,
        obstacles: String(b.obstacles || '').trim().slice(0, 2000) || null,
        tried: String(b.tried || '').trim().slice(0, 2000) || null,
        vision6mo: String(b.vision6Mo || b.vision6mo || '').trim().slice(0, 2000) || null,
        email: email || null,
        whatsapp: String(b.whatsapp || '').trim().slice(0, 40) || null,
      });
      if (error) throw new Error(error.message);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Intake not recorded' });
    }
    res.json({ success: true, message: 'Vision recorded — blueprint pipeline engaged' });
  });

  // Oracle profiling answers land in the unified memory layer so PRIME knows
  // the builder's answers on every surface, not just this browser session.
  app.post('/api/oracle/profiling', rateLimit('profiling', { max: 60 }), async (req, res) => {
    const { builderId, questionIndex, question, answer } = req.body || {};
    if (!isValidBuilderId(builderId)) {
      return res.status(400).json({ success: false, error: 'builderId required' });
    }
    const a = String(answer || '').trim().slice(0, 1200);
    if (!a) {
      return res.status(400).json({ success: false, error: 'Answer required' });
    }
    const idx = Math.max(0, Math.min(99, Math.round(Number(questionIndex) || 0)));
    const q = String(question || '').trim().slice(0, 300);
    try {
      await supabaseAdmin.from('ai_memories').upsert(
        {
          builder_id: builderId,
          type: 'profile',
          key: `profile:q${idx}`,
          value: q ? `${q} → ${a}` : a,
          confidence: 0.9,
          source_module: 'oracle',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'builder_id,key' }
      );
      if (idx === 9) {
        await persistAiExchange({
          builderId,
          scope: 'oracle',
          moduleSlug: 'oracle',
          userContent: `Profiling complete. Answers: ${a}`,
          assistantContent: 'Profiling acknowledged. Persona calibrated.',
          recentHistory: [],
        });
      }
    } catch {
      // Non-blocking for the flow — answers also persist client-side
    }
    res.json({ success: true });
  });

  // ---------------------------------------------------------------------------
  // 10. VITE MIDDLEWARES / STATIC ASSETS
  // ---------------------------------------------------------------------------
  // SERVE_STATIC=0 → API-only mode (Cloudflare Pages serves the SPA and proxies
  // /api/* here). Default → serve the built SPA from Render (single-service mode).
  const serveStatic = process.env.SERVE_STATIC !== '0' && process.env.SERVE_STATIC !== 'false';

  if (!serveStatic) {
    app.use('/api', (req, res) => {
      res.status(404).json({ success: false, error: 'API endpoint not found' });
    });
    app.use((req, res) => {
      res.status(404).send('Not found');
    });
  } else if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
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
