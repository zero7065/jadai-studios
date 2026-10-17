// Server-side Dream Forge intake store — fs-backed with optional Supabase dual-write.
// Survives restarts and works when Supabase is unconfigured (dev / Render free tier).
// DO NOT import from client components — use /api/dream-forge/intake.

import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '../supabase/admin';
import { withStoreLock } from '../utils/storeLock';

import { getDataDir } from './dataDir';

const DATA_DIR = getDataDir();
const STORE_FILE = path.join(DATA_DIR, 'dream-intakes.json');

export interface DreamIntakeRecord {
  id: string;
  building: string;
  obstacles: string | null;
  tried: string | null;
  vision6mo: string | null;
  email: string | null;
  whatsapp: string | null;
  created_at: string;
}

interface DreamStore {
  intakes: DreamIntakeRecord[];
}

function ensureStore(): DreamStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ intakes: [] }, null, 2));
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return { intakes: Array.isArray(parsed.intakes) ? parsed.intakes : [] };
  } catch {
    return { intakes: [] };
  }
}

function persist(store: DreamStore): void {
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

export async function insertDreamIntake(
  record: Omit<DreamIntakeRecord, 'id' | 'created_at'>
): Promise<DreamIntakeRecord> {
  const intake: DreamIntakeRecord = {
    id: `df-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    ...record,
  };

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabaseAdmin.from('dream_forge_intakes').insert({
        building: intake.building,
        obstacles: intake.obstacles,
        tried: intake.tried,
        vision6mo: intake.vision6mo,
        email: intake.email,
        whatsapp: intake.whatsapp,
      });
      if (!error) return intake;
    } catch {
      // fall through to fs
    }
  }

  await withStoreLock('dream-intakes', () => {
    const s = ensureStore();
    s.intakes.unshift(intake);
    if (s.intakes.length > 500) s.intakes.length = 500;
    persist(s);
  });
  return intake;
}
