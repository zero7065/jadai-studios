import { Router } from 'express';
import { randomUUID } from 'crypto';
import { signalStore } from './store';
import { runScoutForUser } from './agents/scout';
import { runCloserAgent } from './agents/closer';
import { runWriterAgent } from './agents/writer';
import { initializePaystackTransaction, getPaystackSecretKey } from '../paystack';
import { SIGNAL_PLANS, SignalPlanTier } from './types';
import { generateText } from '../ai';
import { getEntitlement, grantSubscriptionFs } from '../entitlements/store';
import { TIER_LEVELS, isMasterAdmin } from '../auth/tier';
import { getAdminEmail } from '../data/adminCredentialsStore';
import { supabaseAdmin, isSupabaseConfigured } from '../supabase/admin';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  saveAnalysis,
  saveCompetitors,
  saveSegments,
  saveProspects,
  saveContacts,
  saveEmail,
  markEmailSent,
  deleteCampaign,
  campaignSummaries,
  CampaignCompetitor,
  CampaignSegment,
  CampaignProspect,
  CampaignContact,
  CampaignEmail,
} from './campaignsStore';

export const signalRouter = Router();

// ---------------------------------------------------------------------------
// WRITE-ACTION ENTITLEMENT GATE
// Signal's outbound engine (scout/closer/writer, campaign edits, trackers,
// content) is a paid feature. GET reads stay open so the radar, pricing page,
// and public views render without a subscription; every mutating action
// (POST/PUT/PATCH/DELETE) requires an active Signal Pro+ entitlement.
//
// Identity resolves from ?email / x-user-email or ?builderId / x-builder-id,
// same as /api/account/tier. Fails closed. `/subscribe` and the paystack
// callback are exempt so a user can actually buy their way in.
// ---------------------------------------------------------------------------
const SIGNAL_WRITE_EXEMPT = new Set([
  '/subscribe',
  '/paystack-callback',
  '/settings', // POST /settings has its own granular plan-change gate below.
]);

// Master-admin bypass: match the env ADMIN_EMAIL (lib/auth/tier) OR the
// runtime-editable admin email from the credentials store, so the gate keeps
// working after an admin changes their login email in the settings UI.
function isSignalAdmin(email: string): boolean {
  if (!email) return false;
  if (isMasterAdmin(email)) return true;
  try {
    const runtime = (getAdminEmail(process.env.ADMIN_EMAIL || '') || '').toLowerCase();
    return runtime.length > 0 && email === runtime;
  } catch {
    return false;
  }
}

signalRouter.use((req, res, next) => {
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const path = (req.path || '').replace(/\/+$/, '');
  if (!isWrite || SIGNAL_WRITE_EXEMPT.has(path)) return next();

  const email = String(req.query.email || req.headers['x-user-email'] || '').trim();
  const builderId = String(req.query.builderId || req.headers['x-builder-id'] || '').trim();

  // Master admin always passes.
  if (isSignalAdmin(email)) return next();

  try {
    const ent = getEntitlement({
      userId: builderId.length >= 8 ? builderId : null,
      email: email.includes('@') ? email : null,
    });
    const required = TIER_LEVELS['signal_pro'] ?? 3;
    const current = ent ? (TIER_LEVELS[ent.tier] ?? 0) : 0;
    if (ent && current >= required) return next();

    res.status(402).json({
      success: false,
      requiresPayment: true,
      error: 'Signal outbound actions require an active Signal Pro subscription. Purchase via /signal/pricing.',
      requiredTier: 'signal_pro',
      currentTier: ent?.tier || 'free',
    });
  } catch {
    res.status(402).json({
      success: false,
      requiresPayment: true,
      error: 'Could not verify Signal subscription. Purchase via /signal/pricing.',
      requiredTier: 'signal_pro',
    });
  }
});

// ---------------------------------------------------------------------------
// IDENTITY RESOLUTION (per-user trackers & agent runs)
// Email and/or builderId come from ?query or x-user-* headers — the same
// contract the write-gate and /api/account/tier use. dbUserId is the
// user_profiles.id UUID (FK target for signal_trackers); it's resolved from
// builderId directly, or by email lookup, or created on first tracker write.
// ---------------------------------------------------------------------------
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SignalIdentity {
  email: string | null;
  builderId: string | null;
  dbUserId: string | null;
  isAdmin: boolean;
}

async function resolveSignalIdentity(req: any): Promise<SignalIdentity> {
  const email = String(req.query?.email || req.headers?.['x-user-email'] || '').trim().toLowerCase();
  const rawBuilder = String(req.query?.builderId || req.headers?.['x-builder-id'] || '').trim();
  const builderId = UUID_RE.test(rawBuilder) ? rawBuilder : null;
  const isAdmin = isSignalAdmin(email);
  let dbUserId = builderId;
  if (!dbUserId && email.includes('@') && isSupabaseConfigured) {
    try {
      const { data } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      dbUserId = data?.id || null;
    } catch {}
  }
  return {
    email: email.includes('@') ? email : null,
    builderId,
    dbUserId,
    isAdmin,
  };
}

/** Returns the user_profiles.id (FK target) for tracker writes, creating the
 *  profile row on first use so the signal_trackers FK never rejects. */
async function ensureTrackerProfile(ident: SignalIdentity): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    if (ident.dbUserId) {
      await supabaseAdmin.from('user_profiles').upsert(
        { id: ident.dbUserId, email: ident.email, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );
      return ident.dbUserId;
    }
    if (ident.email) {
      const { data: existing } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('email', ident.email)
        .maybeSingle();
      if (existing?.id) return existing.id;
      const id = randomUUID();
      await supabaseAdmin.from('user_profiles').insert({
        id,
        email: ident.email,
        display_name: ident.email.split('@')[0],
      });
      return id;
    }
  } catch (e) {
    console.warn('[TRACKERS] ensureProfile failed:', e);
  }
  return null;
}

function mapDbTracker(row: any) {
  return {
    id: row.id,
    userId: row.user_id || 'usr-default',
    source: row.source,
    query: row.query,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

// ---------------------------------------------------------------------------
// 1. SIGNALS
// ---------------------------------------------------------------------------
// Map a Supabase signals row to the camelCase Signal shape the frontend expects.
function mapDbSignal(row: any) {
  return {
    id: row.id,
    userId: row.user_id || 'usr-default',
    platform: row.platform,
    sourceUrl: row.source_url,
    author: row.author,
    authorHandle: row.author_handle || undefined,
    content: row.content,
    intentScore: row.intent_score ?? 0,
    reason: row.reason || '',
    suggestedAngle: row.suggested_angle || '',
    status: row.status || 'new',
    detectedAt: row.created_at || new Date().toISOString(),
  };
}

signalRouter.get('/signals', async (req, res) => {
  const platform = req.query.platform as string;
  const status = req.query.status as string;

  // Supabase first — the in-memory store resets on every restart, but scout
  // persists signals to the DB. Reading DB-first makes scouted signals survive.
  let signals: any[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) signals = data.map(mapDbSignal);
    } catch {
      // fall through to in-memory store
    }
  }
  if (signals.length === 0) {
    signals = signalStore.getSignals();
  }

  if (platform && platform !== 'all') {
    signals = signals.filter((s) => s.platform === platform);
  }
  if (status && status !== 'all') {
    signals = signals.filter((s) => s.status === status);
  }

  res.json({ success: true, signals });
});

signalRouter.get('/signals/:id', (req, res) => {
  const signal = signalStore.getSignalById(req.params.id);
  if (!signal) {
    return res.status(404).json({ success: false, error: 'Signal not found' });
  }

  const draft = signalStore.getDraftBySignalId(signal.id);
  res.json({ success: true, signal, draft });
});

signalRouter.post('/signals/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }

  signalStore.updateSignalStatus(req.params.id, status);
  res.json({ success: true, message: `Signal status updated to ${status}` });
});

signalRouter.delete('/signals/:id', (req, res) => {
  signalStore.deleteSignal(req.params.id);
  res.json({ success: true, message: 'Signal removed' });
});

// ---------------------------------------------------------------------------
// 2. DRAFTS
// ---------------------------------------------------------------------------
signalRouter.get('/drafts', async (_req, res) => {
  let drafts: any[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
        .from('outreach_drafts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) {
        drafts = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id || 'usr-default',
          signalId: row.signal_id,
          platform: row.platform,
          message: row.message,
          approach: row.approach || 'conversational',
          status: row.status || 'draft',
          createdAt: row.created_at,
        }));
      }
    } catch {}
  }
  if (drafts.length === 0) drafts = signalStore.getDrafts();
  res.json({ success: true, drafts });
});

signalRouter.post('/drafts/:id', (req, res) => {
  signalStore.updateDraft(req.params.id, req.body);
  res.json({ success: true, message: 'Draft updated' });
});

signalRouter.post('/drafts/generate', async (req, res) => {
  const { signalId } = req.body;
  if (!signalId) {
    return res.status(400).json({ success: false, error: 'signalId required' });
  }

  const draft = await runCloserAgent(signalId);
  res.json({ success: true, draft });
});

// ---------------------------------------------------------------------------
// 3. GENERATED CONTENT (BUILD IN PUBLIC)
// ---------------------------------------------------------------------------
signalRouter.get('/content', async (_req, res) => {
  let content: any[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
        .from('generated_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) {
        content = data.map((row: any) => ({
          id: row.id,
          userId: row.user_id || 'usr-default',
          platform: row.platform,
          content: row.content,
          sourceType: row.source_type || 'manual',
          sourceRef: row.source_ref || undefined,
          status: row.status || 'draft',
          createdAt: row.created_at,
        }));
      }
    } catch {}
  }
  if (content.length === 0) content = signalStore.getContent();
  res.json({ success: true, content });
});

signalRouter.post('/content', (req, res) => {
  const { platform, content, sourceType, sourceRef } = req.body;
  if (!platform || !content) {
    return res.status(400).json({ success: false, error: 'platform and content required' });
  }

  const item = signalStore.addContent({
    userId: 'usr-default',
    platform,
    content,
    sourceType: sourceType || 'manual',
    sourceRef,
    status: 'draft',
  });

  res.json({ success: true, item });
});

signalRouter.post('/content/:id', (req, res) => {
  signalStore.updateContent(req.params.id, req.body);
  res.json({ success: true, message: 'Content updated' });
});

signalRouter.delete('/content/:id', (req, res) => {
  signalStore.deleteContent(req.params.id);
  res.json({ success: true, message: 'Content removed' });
});

// ---------------------------------------------------------------------------
// 3.5. TRACKERS (github | reddit | x) — DB-first, per-user, paid (Signal Pro)
// Trackers are the sellable continuous-monitoring product: each active row
// feeds Scout's crawl loop with its query, and every signal it produces is
// attributed back via signal_analytics.metadata.tracker_id (hit counts).
// ---------------------------------------------------------------------------
signalRouter.get('/trackers', async (req, res) => {
  const ident = await resolveSignalIdentity(req);
  let trackers: any[] = [];

  if (isSupabaseConfigured) {
    try {
      let q = supabaseAdmin.from('signal_trackers').select('*');
      if (!ident.isAdmin) {
        // No identity resolved → nothing private to show (never leak other users' rows).
        if (!ident.dbUserId) return res.json({ success: true, trackers: [] });
        q = q.eq('user_id', ident.dbUserId);
      }
      const { data, error } = await q.order('created_at', { ascending: false }).limit(100);
      if (!error && data) trackers = data.map(mapDbTracker);
    } catch (e) {
      console.warn('[TRACKERS] DB read failed:', e);
    }
  } else {
    const all = signalStore.getTrackers();
    trackers = ident.isAdmin
      ? all
      : all.filter((t) => t.userId === (ident.dbUserId || 'usr-default'));
  }

  // Per-tracker hit stats from scout attribution events.
  if (trackers.length && isSupabaseConfigured) {
    try {
      const ids = trackers.map((t) => t.id);
      const { data: events } = await supabaseAdmin
        .from('signal_analytics')
        .select('metadata, created_at')
        .eq('event_type', 'signal_found')
        .in('metadata->>tracker_id', ids)
        .limit(1000);
      const hits: Record<string, { count: number; last: string }> = {};
      for (const ev of events || []) {
        const tid = ev.metadata?.tracker_id;
        if (!tid) continue;
        if (!hits[tid]) hits[tid] = { count: 0, last: '' };
        hits[tid].count++;
        if (ev.created_at > hits[tid].last) hits[tid].last = ev.created_at;
      }
      trackers = trackers.map((t) => ({
        ...t,
        hits: hits[t.id]?.count || 0,
        lastHitAt: hits[t.id]?.last || null,
      }));
    } catch {}
  }

  res.json({ success: true, trackers });
});

signalRouter.post('/trackers', async (req, res) => {
  const { source, query } = req.body || {};
  if (!source || !['github', 'reddit', 'x'].includes(source)) {
    return res.status(400).json({ success: false, error: 'Valid source (github | reddit | x) required' });
  }
  const q = String(query || '').trim();
  if (q.length < 2 || q.length > 120) {
    return res.status(400).json({ success: false, error: 'Query must be 2-120 characters' });
  }

  const ident = await resolveSignalIdentity(req);
  if (!ident.isAdmin && !ident.dbUserId && !ident.email) {
    return res.status(401).json({ success: false, error: 'Sign in to create trackers' });
  }

  if (isSupabaseConfigured) {
    const ownerId = await ensureTrackerProfile(ident);
    if (ownerId) {
      try {
        const { count } = await supabaseAdmin
          .from('signal_trackers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ownerId);
        if ((count || 0) >= 25) {
          return res.status(429).json({ success: false, error: 'Tracker limit reached (25). Remove one to add another.' });
        }
        const { data, error } = await supabaseAdmin
          .from('signal_trackers')
          .insert({ user_id: ownerId, source, query: q, active: true })
          .select()
          .single();
        if (!error && data) return res.json({ success: true, tracker: mapDbTracker(data) });
        console.warn('[TRACKERS] insert failed:', error?.message);
      } catch (e) {
        console.warn('[TRACKERS] insert error:', e);
      }
    }
  }

  // Memory fallback (DB down / unconfigured) — degraded but honest.
  const tracker = signalStore.addTracker({
    userId: ident.dbUserId || 'usr-default',
    source,
    query: q,
    active: true,
  });
  res.json({ success: true, tracker, degraded: true });
});

signalRouter.post('/trackers/:id/toggle', async (req, res) => {
  const ident = await resolveSignalIdentity(req);
  if (isSupabaseConfigured) {
    try {
      const { data: row } = await supabaseAdmin
        .from('signal_trackers')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();
      if (!row) return res.status(404).json({ success: false, error: 'Tracker not found' });
      if (!ident.isAdmin && row.user_id !== ident.dbUserId) {
        return res.status(404).json({ success: false, error: 'Tracker not found' });
      }
      const { data: updated, error } = await supabaseAdmin
        .from('signal_trackers')
        .update({ active: !row.active, updated_at: new Date().toISOString() })
        .eq('id', row.id)
        .select()
        .single();
      if (!error && updated) return res.json({ success: true, tracker: mapDbTracker(updated) });
    } catch (e) {
      console.warn('[TRACKERS] toggle error:', e);
    }
  }
  const existing = signalStore.getTrackers().find((t) => t.id === req.params.id);
  if (existing && !ident.isAdmin && existing.userId !== (ident.dbUserId || 'usr-default')) {
    return res.status(404).json({ success: false, error: 'Tracker not found' });
  }
  const updated = signalStore.toggleTracker(req.params.id);
  if (!updated) return res.status(404).json({ success: false, error: 'Tracker not found' });
  res.json({ success: true, tracker: updated });
});

signalRouter.delete('/trackers/:id', async (req, res) => {
  const ident = await resolveSignalIdentity(req);
  if (isSupabaseConfigured) {
    try {
      const { data: row } = await supabaseAdmin
        .from('signal_trackers')
        .select('user_id')
        .eq('id', req.params.id)
        .maybeSingle();
      if (!row) return res.status(404).json({ success: false, error: 'Tracker not found' });
      if (!ident.isAdmin && row.user_id !== ident.dbUserId) {
        return res.status(404).json({ success: false, error: 'Tracker not found' });
      }
      const { error } = await supabaseAdmin.from('signal_trackers').delete().eq('id', req.params.id);
      if (!error) return res.json({ success: true, removed: true });
    } catch (e) {
      console.warn('[TRACKERS] delete error:', e);
    }
  }
  const existing = signalStore.getTrackers().find((t) => t.id === req.params.id);
  if (existing && !ident.isAdmin && existing.userId !== (ident.dbUserId || 'usr-default')) {
    return res.status(404).json({ success: false, error: 'Tracker not found' });
  }
  const removed = signalStore.deleteTracker(req.params.id);
  if (!removed) return res.status(404).json({ success: false, error: 'Tracker not found' });
  res.json({ success: true, removed: true });
});

// ---------------------------------------------------------------------------
// 3B. OUTREACH CAMPAIGNS (6-step Explee-style pipeline)
// ---------------------------------------------------------------------------
const uid = () => `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Run a JSON-producing AI step with an honest fallback when no key/credits. */
async function aiJsonStep<T>(
  prompt: string,
  fallback: T,
  opts: { note?: string } = {}
): Promise<{ data: T; provider: string; fallback: boolean; note?: string }> {
  try {
    const result = await generateText(prompt, {
      systemPrompt:
        'You are a precise B2B research and outreach assistant. Respond ONLY with valid JSON. No markdown fences, no commentary.',
    });
    const cleaned = (result.text || '')
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    return {
      data: parsed as T,
      provider: result.provider,
      fallback: false,
    };
  } catch {
    return {
      data: fallback,
      provider: 'fallback',
      fallback: true,
      note:
        opts.note ||
        'AI step unavailable (no provider credits or key). Showing honest fallback data — connect OPENAI_API_KEY or GROQ_API_KEY for live results.',
    };
  }
}

signalRouter.get('/campaigns', (_req, res) => {
  res.json({ success: true, campaigns: listCampaigns(), summaries: campaignSummaries() });
});

signalRouter.get('/campaigns/:id', (req, res) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }
  res.json({ success: true, campaign });
});

signalRouter.post('/campaigns', (req, res) => {
  const domain = String(req.body?.domain || '').trim();
  if (!domain) {
    return res.status(400).json({ success: false, error: 'domain is required (e.g. stripe.com)' });
  }
  try {
    const campaign = createCampaign({ user_id: uid(), domain });
    res.json({ success: true, campaign });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

signalRouter.delete('/campaigns/:id', (req, res) => {
  const ok = deleteCampaign(req.params.id);
  if (!ok) return res.status(404).json({ success: false, error: 'Campaign not found' });
  res.json({ success: true, message: 'Campaign deleted' });
});

// Step 1 — Analyze the company
signalRouter.post('/campaigns/:id/analyze', async (req, res) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

  const { data, provider, fallback, note } = await aiJsonStep<{
    company_name: string;
    company_description: string;
    category: string;
    location_hint: string;
  }>(
    `Analyze the company behind the domain "${campaign.domain}". Infer company name, a one-sentence description, industry category, and likely HQ location. Respond as JSON: {"company_name": string, "company_description": string, "category": string, "location_hint": string}`,
    {
      company_name: campaign.domain.split('.')[0],
      company_description: `Company operating at ${campaign.domain}.`,
      category: 'Unknown',
      location_hint: 'Unknown',
    }
  );

  const updated = saveAnalysis(campaign.id, data);
  res.json({ success: true, campaign: updated, provider, fallback, note });
});

// Step 2 — Competitors
signalRouter.post('/campaigns/:id/competitors', async (req, res) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

  const { data, provider, fallback, note } = await aiJsonStep<{ competitors: Array<{ domain: string; name: string; description: string }> }>(
    `List the top 4 direct competitors of "${campaign.company_name || campaign.domain}" (category: ${campaign.category || 'unknown'}). Respond as JSON: {"competitors": [{"domain": string, "name": string, "description": string}]}`,
    {
      competitors: [
        { domain: 'competitor-one.example', name: 'Competitor One', description: 'Direct competitor (AI-estimated)' },
        { domain: 'competitor-two.example', name: 'Competitor Two', description: 'Direct competitor (AI-estimated)' },
      ],
    },
    { note: 'Google CSE key not connected — using AI-estimated competitors. Add GOOGLE_CSE_KEY/GOOGLE_CSE_CX for live SERP data.' }
  );

  const competitors: CampaignCompetitor[] = (data.competitors || []).slice(0, 6).map((c) => ({
    id: uid(),
    domain: String(c.domain || '').toLowerCase(),
    name: String(c.name || c.domain || 'Unknown'),
    description: String(c.description || ''),
    source: fallback ? 'ai-estimated' : 'google-cse',
  }));

  const updated = saveCompetitors(campaign.id, competitors);
  res.json({ success: true, campaign: updated, provider, fallback, note });
});

// Step 3 — ICP segments
signalRouter.post('/campaigns/:id/icp', async (req, res) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

  const { data, provider, fallback, note } = await aiJsonStep<{ segments: Array<{ name: string; description: string; pain_point: string; estimated_size: string; icon: string }> }>(
    `Define 3 ideal-customer-profile segments for "${campaign.company_name || campaign.domain}" (${campaign.category || 'unknown'}). For each: name, description, primary pain_point, estimated_size, and a single lowercase icon keyword (e.g. "briefcase", "code", "shopping-bag"). Respond as JSON: {"segments": [{"name": string, "description": string, "pain_point": string, "estimated_size": string, "icon": string}]}`,
    {
      segments: [
        { name: 'Early-stage startups', description: 'Seed–Series A teams needing growth leverage.', pain_point: 'Limited budget, need measurable pipeline.', estimated_size: '50–200 companies', icon: 'rocket' },
        { name: 'Agencies', description: 'Boutique agencies serving SMB clients.', pain_point: 'Manual prospecting eats billable hours.', estimated_size: '100–400 companies', icon: 'briefcase' },
        { name: 'E-commerce brands', description: 'DTC and marketplace sellers scaling ads.', pain_point: 'Rising CAC, thin margins.', estimated_size: '200–800 companies', icon: 'shopping-bag' },
      ],
    }
  );

  const segments: CampaignSegment[] = (data.segments || []).slice(0, 5).map((s) => ({
    id: uid(),
    name: String(s.name || 'Segment'),
    description: String(s.description || ''),
    pain_point: String(s.pain_point || ''),
    estimated_size: String(s.estimated_size || 'Unknown'),
    icon: String(s.icon || 'target'),
  }));

  const updated = saveSegments(campaign.id, segments);
  res.json({ success: true, campaign: updated, provider, fallback, note });
});

// Step 4 — Prospects for a segment
signalRouter.post('/campaigns/:id/prospects', async (req, res) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
  const segment = campaign.segments.find((s) => s.id === req.body?.segmentId);
  if (!segment) return res.status(400).json({ success: false, error: 'segmentId required (run ICP step first)' });

  const { data, provider, fallback, note } = await aiJsonStep<{ prospects: Array<{ company_name: string; domain: string; country: string; employees: string; monthly_traffic: string; relevance_score: number }> }>(
    `Find 5 realistic B2B prospect companies for the segment "${segment.name}" (${segment.description}, pain: ${segment.pain_point}) that could buy from "${campaign.company_name || campaign.domain}". For each: company_name, domain, country, employees, monthly_traffic, relevance_score (0-100). Respond as JSON: {"prospects": [{"company_name": string, "domain": string, "country": string, "employees": string, "monthly_traffic": string, "relevance_score": number}]}`,
    {
      prospects: [
        { company_name: 'Acme Growth Co', domain: 'acme-growth.example', country: 'US', employees: '11-50', monthly_traffic: '40k', relevance_score: 82 },
        { company_name: 'Northwind Labs', domain: 'northwind-labs.example', country: 'UK', employees: '51-200', monthly_traffic: '120k', relevance_score: 76 },
        { company_name: 'Zephyr Digital', domain: 'zephyr-digital.example', country: 'NG', employees: '11-50', monthly_traffic: '25k', relevance_score: 71 },
      ],
    },
    { note: 'Meta Ads library API not connected — prospects are AI-estimated. Add META_ADS_* keys for live ad-intent data.' }
  );

  const prospects: CampaignProspect[] = (data.prospects || []).slice(0, 8).map((p) => ({
    id: uid(),
    segment_id: segment.id,
    company_name: String(p.company_name || 'Unknown'),
    domain: String(p.domain || '').toLowerCase(),
    country: String(p.country || 'Unknown'),
    employees: String(p.employees || 'Unknown'),
    monthly_traffic: String(p.monthly_traffic || 'Unknown'),
    relevance_score: Number(p.relevance_score) || 50,
    source: fallback ? 'ai-estimated' : 'meta-verified',
  }));

  const updated = saveProspects(campaign.id, prospects);
  res.json({ success: true, campaign: updated, provider, fallback, note });
});

// Step 5 — Contacts for a prospect
signalRouter.post('/campaigns/:id/contacts', async (req, res) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
  const prospect = campaign.prospects.find((p) => p.id === req.body?.prospectId);
  if (!prospect) return res.status(400).json({ success: false, error: 'prospectId required (run prospects step first)' });

  const { data, provider, fallback, note } = await aiJsonStep<{ contacts: Array<{ name: string; title: string; email: string; linkedin_url: string; confidence_score: number }> }>(
    `Find 2 likely decision-maker contacts at "${prospect.company_name}" (domain: ${prospect.domain}) relevant to buying from "${campaign.company_name || campaign.domain}". For each: full name, title, email (pattern-based guess if unknown), linkedin_url, confidence_score (0-100). Respond as JSON: {"contacts": [{"name": string, "title": string, "email": string, "linkedin_url": string, "confidence_score": number}]}`,
    {
      contacts: [
        { name: 'Jordan Avery', title: 'Head of Growth', email: `growth@${prospect.domain}`, linkedin_url: `https://linkedin.com/in/${prospect.domain.split('.')[0]}`, confidence_score: 64 },
        { name: 'Sam Okonkwo', title: 'Founder', email: `founder@${prospect.domain}`, linkedin_url: '', confidence_score: 58 },
      ],
    },
    { note: 'Hunter.io API not connected — contacts are AI-estimated guesses. Add HUNTER_API_KEY for verified emails.' }
  );

  const contacts: CampaignContact[] = (data.contacts || []).slice(0, 4).map((c) => ({
    id: uid(),
    prospect_id: prospect.id,
    name: String(c.name || 'Unknown'),
    title: String(c.title || 'Unknown'),
    email: String(c.email || '').toLowerCase(),
    linkedin_url: String(c.linkedin_url || ''),
    confidence_score: Number(c.confidence_score) || 50,
    source: fallback ? 'ai-estimated' : 'hunter',
  }));

  const updated = saveContacts(campaign.id, contacts);
  res.json({ success: true, campaign: updated, provider, fallback, note });
});

// Step 6 — Draft email for a contact
signalRouter.post('/campaigns/:id/draft', async (req, res) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
  const contact = campaign.contacts.find((c) => c.id === req.body?.contactId);
  if (!contact) return res.status(400).json({ success: false, error: 'contactId required (run contacts step first)' });
  const prospect = campaign.prospects.find((p) => p.id === contact.prospect_id);

  const { data, provider, fallback, note } = await aiJsonStep<{ subject: string; body: string }>(
    `Write a short, personalized cold outreach email FROM "${campaign.company_name || campaign.domain}" TO ${contact.name} (${contact.title} at ${prospect?.company_name || prospect?.domain || 'their company'}). Their likely pain: reference it naturally. Value prop: help with growth/outreach leverage. Tone: direct, zero fluff, no "I hope this finds you well". Under 120 words. Respond as JSON: {"subject": string, "body": string}`,
    {
      subject: `Quick question about ${prospect?.company_name || 'your growth'}`,
      body: `Hi ${contact.name.split(' ')[0] || 'there'},\n\nI noticed ${prospect?.company_name || 'your team'} is in the ${segmentNameFor(campaign, prospect?.segment_id)} space. We help teams like yours cut prospecting time and book more qualified calls.\n\nWorth a 15-minute look this week?\n\n— ${campaign.company_name || campaign.domain}`,
    },
    { note: 'AI drafting unavailable — using template fallback. Connect a provider key for personalized drafts.' }
  );

  const email: Omit<CampaignEmail, 'created_at'> = {
    id: `eml_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    contact_id: contact.id,
    subject: String(data.subject || 'Quick question'),
    body: String(data.body || ''),
    status: 'draft',
  };

  const updated = saveEmail(campaign.id, email);
  res.json({ success: true, campaign: updated, email, provider, fallback, note });
});

function segmentNameFor(campaign: { segments: CampaignSegment[] }, segmentId?: string): string {
  return campaign.segments.find((s) => s.id === segmentId)?.name || 'your market';
}

// Send email — mailto: fallback (no RESEND key) or mark sent when Resend configured
signalRouter.post('/campaigns/:id/emails/:emailId/send', async (req, res) => {
  const campaign = getCampaign(req.params.id);
  if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
  const email = campaign.emails.find((e) => e.id === req.params.emailId);
  if (!email) return res.status(404).json({ success: false, error: 'Email not found' });
  const contact = campaign.contacts.find((c) => c.id === email.contact_id);

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // Honest fallback: don't fake a send — hand back a mailto the user can open.
    const mailto = `mailto:${contact?.email || ''}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
    return res.json({
      success: true,
      mode: 'mailto',
      mailto,
      message: 'RESEND_API_KEY not connected — opened as a mailto draft instead of a live send. Add RESEND_API_KEY to enable server-side delivery.',
    });
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'outreach@jadai.dev',
        to: [contact?.email],
        subject: email.subject,
        text: email.body,
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return res.status(502).json({ success: false, error: `Resend API error: ${resp.status} ${errText}` });
    }
    const updated = markEmailSent(campaign.id, email.id);
    res.json({ success: true, mode: 'resend', campaign: updated, message: 'Email sent via Resend' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 4. ANALYTICS & SETTINGS
// ---------------------------------------------------------------------------
signalRouter.get('/analytics', (req, res) => {
  res.json({ success: true, data: signalStore.getAnalyticsSummary() });
});

signalRouter.get('/settings', (req, res) => {
  res.json({ success: true, settings: signalStore.getSettings() });
});

signalRouter.post('/settings', (req, res) => {
  const body = req.body || {};
  // Plan changes require a verified Signal entitlement — no more unauthenticated plan:business.
  if (typeof body.plan === 'string' && body.plan !== 'free') {
    const email = String(req.query.email || req.headers['x-user-email'] || '').trim();
    const builderId = String(req.query.builderId || req.headers['x-builder-id'] || '').trim();
    let entitled = false;
    try {
      const { getEntitlement } = require('../entitlements/store');
      const ent = getEntitlement({
        userId: builderId.length >= 8 ? builderId : null,
        email: email.includes('@') ? email : null,
      });
      entitled = Boolean(ent && ['signal_pro', 'signal_business', 'signal'].includes(ent.tier));
    } catch {
      entitled = false;
    }
    if (!entitled) {
      return res.status(403).json({
        success: false,
        error: 'Signal plan upgrade requires an active Signal subscription. Purchase via /signal/pricing.',
      });
    }
  }
  const updated = signalStore.updateSettings(body);
  res.json({ success: true, settings: updated });
});

// ---------------------------------------------------------------------------
// 5. PAYSTACK SUBSCRIPTION (SEPARATE FROM STUDIO)
// ---------------------------------------------------------------------------
signalRouter.post('/subscribe', async (req, res) => {
  const { planTier, currency, email } = req.body;
  const tierKey = (planTier || 'pro').toLowerCase() as SignalPlanTier;
  const plan = SIGNAL_PLANS[tierKey];

  if (!plan) {
    return res.status(400).json({ success: false, error: 'Invalid Signal plan tier' });
  }

  if (tierKey === 'free') {
    signalStore.setPlan('free');
    return res.json({ success: true, message: 'Switched to Free Radar tier', plan: 'free' });
  }

  const amountKobo = (currency === 'USD' ? plan.priceUsd * 100 : plan.priceNgn * 100);

  try {
    const appHost = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://jadai.dev';
    const transaction = await initializePaystackTransaction({
      email: email || 'architect@jadai.dev',
      amountKobo,
      currency: currency || 'NGN',
      callbackUrl: `${appHost}/api/signal/paystack-callback?tier=${tierKey}`,
      metadata: {
        product: 'jadai_signal',
        signal_tier: tierKey,
        is_signal_subscription: true,
      },
    });

    // The plan is NOT applied here — it activates only after Paystack
    // confirms payment via GET /api/signal/paystack-callback.
    res.json({
      ...transaction,
      plan: tierKey,
      message: `Paystack checkout initialized for Jadai Signal ${plan.name} — plan activates after payment confirmation`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5B. PAYSTACK CALLBACK — verifies the transaction, then activates the tier
// ---------------------------------------------------------------------------
signalRouter.get('/paystack-callback', async (req, res) => {
  const reference = String(req.query.reference || req.query.trxref || '');
  const back = '/signal/pricing';
  if (!reference) return res.redirect(`${back}?status=missing_reference`);

  try {
    const secret = await getPaystackSecretKey();
    if (!secret) {
      return res.redirect(`${back}?status=unconfigured`);
    }

    const resp = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    const json = await resp.json().catch(() => null);
    if (!json?.status || json.data?.status !== 'success') {
      return res.redirect(`${back}?status=failed`);
    }

    const meta = json.data?.metadata || {};
    if (!meta.is_signal_subscription) return res.redirect(`${back}?status=failed`);

    const tier = String(meta.signal_tier || '').toLowerCase() as SignalPlanTier;
    const plan = SIGNAL_PLANS[tier];
    if (!plan || tier === 'free') return res.redirect(`${back}?status=failed`);

    const paidCurrency = String(json.data.currency || 'NGN').toUpperCase();
    const expected =
      paidCurrency === 'USD' ? Math.round(plan.priceUsd * 100) : Math.round(plan.priceNgn * 100);
    const paid = Number(json.data.amount);
    if (!Number.isFinite(paid) || paid < expected) {
      return res.redirect(`${back}?status=amount_mismatch`);
    }

    signalStore.setPlan(tier);

    // Bridge to the entitlement store — the write-gate middleware above reads
    // getEntitlement(), not signalStore.setPlan(). Without this, a paying user
    // still gets 402 on every write action.
    const customerEmail = String(json.data?.customer?.email || '').trim() || null;
    const canonicalTier = tier === 'business' ? 'signal_business' : 'signal_pro';
    try {
      await grantSubscriptionFs({
        email: customerEmail,
        tier: canonicalTier,
        plan: `signal_${tier}`,
        interval: 'monthly',
        amountMinor: paid,
        currency: paidCurrency,
        reference,
      });
    } catch (entErr) {
      console.error('[SIGNAL CALLBACK] entitlement grant failed:', entErr);
    }

    return res.redirect(`${back}?status=success&tier=${tier}`);
  } catch {
    return res.redirect(`${back}?status=error`);
  }
});

// ---------------------------------------------------------------------------
// 6. WORKER & CRON TRIGGER ENDPOINTS
// ---------------------------------------------------------------------------
const handleScoutWorker = async (req: any, res: any) => {
  const auth = req.headers?.authorization;
  const cronSecret = process.env.CRON_SECRET;
  const isCron = Boolean(cronSecret && auth === `Bearer ${cronSecret}`);

  // System cron sweep: default workspace + every owner of an active tracker.
  if (isCron) {
    try {
      const results: any[] = [];
      results.push(await runScoutForUser('usr-default'));
      if (isSupabaseConfigured) {
        try {
          const { data: owners } = await supabaseAdmin
            .from('signal_trackers')
            .select('user_id')
            .eq('active', true)
            .not('user_id', 'is', null)
            .limit(50);
          const seen = new Set<string>();
          for (const o of owners || []) {
            if (o.user_id && !seen.has(o.user_id)) {
              seen.add(o.user_id);
              results.push(await runScoutForUser(o.user_id));
            }
          }
        } catch {}
      }
      return res.json({ success: true, message: 'Cron scout sweep completed', results });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // With CRON_SECRET configured, GET stays cron-only (schedulers poll it).
  // User-triggered runs come via POST, already entitlement-gated by the
  // write-gate middleware above (x-user-* headers must identify a Signal Pro+).
  if (cronSecret) {
    if (req.method === 'GET') return res.status(401).json({ error: 'Unauthorized' });
    if (auth) return res.status(401).json({ error: 'Unauthorized' });
  } else if (process.env.NODE_ENV === 'production' && req.method === 'GET') {
    return res.status(503).json({ error: 'CRON_SECRET not configured' });
  }

  // User-triggered run — scout crawls for THAT user's settings + trackers.
  try {
    const ident = await resolveSignalIdentity(req);
    const userId = ident.dbUserId || ident.builderId || 'usr-default';
    const result = await runScoutForUser(userId);
    res.json({ success: true, message: 'Scout agent run completed', result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

signalRouter.get('/scout', handleScoutWorker);
signalRouter.post('/scout', handleScoutWorker);
signalRouter.get('/worker/scout', handleScoutWorker);
signalRouter.post('/worker/scout', handleScoutWorker);

const handleWriterWorker = async (req: any, res: any) => {
  const { summary, details, type } = req.body || {};
  try {
    const items = await runWriterAgent('usr-default', {
      type: type || 'commit',
      summary: summary || 'Shipped new low-latency intent detection engine',
      details: details || 'Compressed multi-platform polling into a single resilient LLM gateway.',
    });
    res.json({ success: true, message: 'Writer agent drafted social posts', items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

signalRouter.get('/writer', handleWriterWorker);
signalRouter.post('/writer', handleWriterWorker);
signalRouter.get('/worker/writer', handleWriterWorker);
signalRouter.post('/worker/writer', handleWriterWorker);

const handleCloserWorker = async (req: any, res: any) => {
  const signalId = req.body?.signalId || req.query?.signalId;
  try {
    const draft = await runCloserAgent(signalId);
    res.json({ success: true, draft });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

signalRouter.get('/closer', handleCloserWorker);
signalRouter.post('/closer', handleCloserWorker);
signalRouter.get('/worker/closer', handleCloserWorker);
signalRouter.post('/worker/closer', handleCloserWorker);
