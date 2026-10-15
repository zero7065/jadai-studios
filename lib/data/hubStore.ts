// Server-side JadaiHub listing store — fs-backed with optional Supabase dual-write.
// Survives restarts and works when Supabase is unconfigured (dev / Render free tier).
// DO NOT import from client components — use /api/hub/listings.

import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '../supabase/admin';
import { withStoreLock } from '../utils/storeLock';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'hub-listings.json');

export interface HubListingRecord {
  id: string;
  type: string;
  title: string;
  description: string;
  stack: string[];
  price_type: string;
  price: number;
  currency: string;
  contact_method: string | null;
  status: string;
  created_at: string;
}

interface HubStore {
  listings: HubListingRecord[];
}

function ensureStore(): HubStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ listings: [] }, null, 2));
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return { listings: Array.isArray(parsed.listings) ? parsed.listings : [] };
  } catch {
    return { listings: [] };
  }
}

function persist(store: HubStore): void {
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

export async function listActiveHubListings(): Promise<HubListingRecord[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
        .from('hub_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) return data as HubListingRecord[];
    } catch {
      // fall through to fs
    }
  }
  const store = await withStoreLock('hub-listings', () => {
    const s = ensureStore();
    return s.listings
      .filter((l) => l.status === 'active')
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 100) as HubListingRecord[];
  });
  return store;
}

export async function insertHubListing(
  record: Omit<HubListingRecord, 'id' | 'created_at' | 'status'> & { status?: string }
): Promise<HubListingRecord> {
  const listing: HubListingRecord = {
    id: `hub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    status: record.status || 'pending',
    ...record,
  } as HubListingRecord;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseAdmin
        .from('hub_listings')
        .insert({
          type: listing.type,
          title: listing.title,
          description: listing.description,
          stack: listing.stack,
          price_type: listing.price_type,
          price: listing.price,
          currency: listing.currency,
          contact_method: listing.contact_method,
          status: listing.status,
        })
        .select()
        .single();
      if (!error && data) return data as HubListingRecord;
    } catch {
      // fall through to fs
    }
  }

  await withStoreLock('hub-listings', () => {
    const s = ensureStore();
    s.listings.unshift(listing);
    if (s.listings.length > 500) s.listings.length = 500;
    persist(s);
  });
  return listing;
}
