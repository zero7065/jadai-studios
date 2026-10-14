// Server-side Signal campaign store (fs-backed, survives restarts).
// Mirrors the Explee-style 6-step outreach pipeline:
//   campaign → competitors → segments (ICP) → prospects → contacts → emails
// When Supabase is configured these rows belong in signal_campaigns /
// signal_competitors / signal_segments / signal_prospects / signal_contacts /
// signal_emails; until then the fs store is the source of truth.
// DO NOT import this from client components — use the /api/signal endpoints.

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'signal-campaigns.json');

export interface CampaignCompetitor {
  id: string;
  domain: string;
  name: string;
  description?: string;
  source: 'google-cse' | 'ai-estimated';
}

export interface CampaignSegment {
  id: string;
  name: string;
  description: string;
  pain_point: string;
  estimated_size: string;
  icon: string;
}

export interface CampaignProspect {
  id: string;
  segment_id: string;
  company_name: string;
  domain: string;
  country: string;
  employees: string;
  monthly_traffic: string;
  relevance_score: number;
  source: 'meta-verified' | 'ai-estimated';
}

export interface CampaignContact {
  id: string;
  prospect_id: string;
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
  confidence_score: number;
  source: 'hunter' | 'ai-estimated';
}

export interface CampaignEmail {
  id: string;
  contact_id: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'replied';
  sent_at?: string;
  created_at: string;
}

export interface SignalCampaign {
  id: string;
  user_id: string;
  domain: string;
  company_name: string;
  company_description: string;
  logo_url: string;
  category: string;
  location_hint: string;
  /** Furthest completed step: 0 = created, 1..6, 0 when incomplete. */
  current_step: number;
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
  competitors: CampaignCompetitor[];
  segments: CampaignSegment[];
  prospects: CampaignProspect[];
  contacts: CampaignContact[];
  emails: CampaignEmail[];
}

interface CampaignStoreFile {
  campaigns: SignalCampaign[];
}

function readStore(): CampaignStoreFile {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [] };
  } catch {
    return { campaigns: [] };
  }
}

function writeStore(store: CampaignStoreFile): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  // Atomic write: temp file + rename so a crash mid-write can't leave a
  // truncated JSON file that would wipe every campaign on next read.
  const tmp = `${STORE_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

function touch(campaign: SignalCampaign): void {
  campaign.updated_at = new Date().toISOString();
}

export function listCampaigns(): SignalCampaign[] {
  return readStore().campaigns;
}

export function getCampaign(id: string): SignalCampaign | undefined {
  return readStore().campaigns.find((c) => c.id === id);
}

export function createCampaign(input: {
  user_id: string;
  domain: string;
}): SignalCampaign {
  const store = readStore();
  const domain = input.domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
  if (!domain || !domain.includes('.')) {
    throw new Error('A valid domain is required (e.g. jadai.dev)');
  }
  const now = new Date().toISOString();
  const campaign: SignalCampaign = {
    id: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    user_id: input.user_id || 'anonymous',
    domain,
    company_name: '',
    company_description: '',
    logo_url: `https://${domain}/favicon.ico`,
    category: '',
    location_hint: '',
    current_step: 0,
    status: 'active',
    created_at: now,
    updated_at: now,
    competitors: [],
    segments: [],
    prospects: [],
    contacts: [],
    emails: [],
  };
  store.campaigns.unshift(campaign);
  writeStore(store);
  return campaign;
}

function updateCampaign(
  id: string,
  mutate: (c: SignalCampaign) => void
): SignalCampaign | undefined {
  const store = readStore();
  const campaign = store.campaigns.find((c) => c.id === id);
  if (!campaign) return undefined;
  mutate(campaign);
  touch(campaign);
  writeStore(store);
  return campaign;
}

/** Step 1 — company research results. */
export function saveAnalysis(
  id: string,
  analysis: {
    company_name: string;
    company_description: string;
    category: string;
    location_hint: string;
    logo_url?: string;
  }
): SignalCampaign | undefined {
  return updateCampaign(id, (c) => {
    c.company_name = analysis.company_name;
    c.company_description = analysis.company_description;
    c.category = analysis.category;
    c.location_hint = analysis.location_hint;
    if (analysis.logo_url) c.logo_url = analysis.logo_url;
    c.current_step = Math.max(c.current_step, 1);
  });
}

/** Step 2 — competitor list (replaces previous run). */
export function saveCompetitors(
  id: string,
  competitors: CampaignCompetitor[]
): SignalCampaign | undefined {
  return updateCampaign(id, (c) => {
    c.competitors = competitors;
    c.current_step = Math.max(c.current_step, 2);
  });
}

/** Step 3 — ICP segments (replaces previous run). */
export function saveSegments(
  id: string,
  segments: CampaignSegment[]
): SignalCampaign | undefined {
  return updateCampaign(id, (c) => {
    c.segments = segments;
    c.current_step = Math.max(c.current_step, 3);
  });
}

/** Step 4 — prospects for one segment (appends, dedupes by domain). */
export function saveProspects(
  id: string,
  prospects: CampaignProspect[]
): SignalCampaign | undefined {
  return updateCampaign(id, (c) => {
    const seen = new Set(c.prospects.map((p) => p.domain));
    for (const p of prospects) {
      if (!seen.has(p.domain)) {
        c.prospects.push(p);
        seen.add(p.domain);
      }
    }
    c.current_step = Math.max(c.current_step, 4);
  });
}

/** Step 5 — contacts for one prospect (appends, dedupes by email). */
export function saveContacts(
  id: string,
  contacts: CampaignContact[]
): SignalCampaign | undefined {
  return updateCampaign(id, (c) => {
    const seen = new Set(c.contacts.map((ct) => ct.email));
    for (const ct of contacts) {
      if (!seen.has(ct.email)) {
        c.contacts.push(ct);
        seen.add(ct.email);
      }
    }
    c.current_step = Math.max(c.current_step, 5);
  });
}

/** Step 6 — email draft for one contact. */
export function saveEmail(
  id: string,
  email: Omit<CampaignEmail, 'created_at'>
): SignalCampaign | undefined {
  return updateCampaign(id, (c) => {
    const idx = c.emails.findIndex((e) => e.contact_id === email.contact_id);
    const record: CampaignEmail = { ...email, created_at: new Date().toISOString() };
    if (idx >= 0) c.emails[idx] = record;
    else c.emails.push(record);
    c.current_step = Math.max(c.current_step, 6);
  });
}

export function markEmailSent(id: string, emailId: string): SignalCampaign | undefined {
  return updateCampaign(id, (c) => {
    const email = c.emails.find((e) => e.id === emailId);
    if (email) {
      email.status = 'sent';
      email.sent_at = new Date().toISOString();
    }
  });
}

export function deleteCampaign(id: string): boolean {
  const store = readStore();
  const before = store.campaigns.length;
  store.campaigns = store.campaigns.filter((c) => c.id !== id);
  writeStore(store);
  return store.campaigns.length < before;
}

/** Compact progress summary for admin lists. */
export function campaignSummaries(): Array<{
  id: string;
  domain: string;
  company_name: string;
  current_step: number;
  status: string;
  created_at: string;
  updated_at: string;
  competitors: number;
  segments: number;
  prospects: number;
  contacts: number;
  emails_draft: number;
  emails_sent: number;
}> {
  return listCampaigns().map((c) => ({
    id: c.id,
    domain: c.domain,
    company_name: c.company_name || c.domain,
    current_step: c.current_step,
    status: c.status,
    created_at: c.created_at,
    updated_at: c.updated_at,
    competitors: c.competitors.length,
    segments: c.segments.length,
    prospects: c.prospects.length,
    contacts: c.contacts.length,
    emails_draft: c.emails.filter((e) => e.status === 'draft').length,
    emails_sent: c.emails.filter((e) => e.status === 'sent').length,
  }));
}
