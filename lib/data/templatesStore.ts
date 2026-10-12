// Server-side template catalog store (fs-backed, survives restarts).
// Seeds live in code; admin edits/new entries are persisted to
// data/admin-templates.json and bundles to data/template-bundles/<slug>/.
// DO NOT import this from client components — use GET/POST /api/templates.

import fs from 'fs';
import path from 'path';
import { SEED_TEMPLATES, TemplateItem } from './templates';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'admin-templates.json');
const BUNDLE_DIR = path.join(DATA_DIR, 'template-bundles');

interface TemplateStore {
  items: TemplateItem[];
  deletedSlugs: string[];
}

function readStore(): TemplateStore {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      deletedSlugs: Array.isArray(parsed.deletedSlugs) ? parsed.deletedSlugs : [],
    };
  } catch {
    return { items: [], deletedSlugs: [] };
  }
}

function writeStore(store: TemplateStore): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

/** Seeds merged with admin overrides and deletions. */
export function listTemplates(): TemplateItem[] {
  const store = readStore();
  const deleted = new Set(store.deletedSlugs);
  const bySlug = new Map<string, TemplateItem>();
  for (const t of SEED_TEMPLATES) {
    if (!deleted.has(t.slug)) bySlug.set(t.slug, t);
  }
  for (const t of store.items) {
    if (t && typeof t.slug === 'string' && !deleted.has(t.slug)) bySlug.set(t.slug, t);
  }
  return Array.from(bySlug.values());
}

export function saveTemplate(template: TemplateItem): TemplateItem {
  if (!template || typeof template.slug !== 'string' || !template.slug.trim()) {
    throw new Error('Template slug is required');
  }
  const store = readStore();
  store.deletedSlugs = store.deletedSlugs.filter((s) => s !== template.slug);
  const idx = store.items.findIndex((t) => t.slug === template.slug);
  if (idx >= 0) {
    // Preserve bundle_path unless the caller supplies a new one.
    const merged = { ...store.items[idx], ...template } as TemplateItem;
    if (!merged.bundle_path && (store.items[idx] as any).bundle_path) {
      merged.bundle_path = (store.items[idx] as any).bundle_path;
    }
    store.items[idx] = merged;
  } else {
    store.items.push(template);
  }
  writeStore(store);
  return template;
}

export function deleteTemplate(slug: string): void {
  const store = readStore();
  const isSeed = SEED_TEMPLATES.some((t) => t.slug === slug);
  store.items = store.items.filter((t) => t.slug !== slug);
  if (isSeed && !store.deletedSlugs.includes(slug)) store.deletedSlugs.push(slug);
  writeStore(store);
}

/** Stores a real .zip bundle on disk and records its path on the template. */
export function saveTemplateBundle(
  slug: string,
  fileName: string,
  fileDataBase64: string
): { path: string; bytes: number } {
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(slug)) {
    throw new Error('Invalid template slug');
  }
  if (!fileName || !fileName.toLowerCase().endsWith('.zip')) {
    throw new Error('Bundle must be a .zip archive');
  }
  const buf = Buffer.from(String(fileDataBase64 || ''), 'base64');
  if (buf.length === 0) throw new Error('Uploaded bundle is empty');
  if (buf.length > 25 * 1024 * 1024) throw new Error('Bundle exceeds the 25MB limit');

  const dir = path.join(BUNDLE_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const full = path.join(dir, safeName);
  fs.writeFileSync(full, buf);
  const rel = `data/template-bundles/${slug}/${safeName}`;

  const store = readStore();
  const idx = store.items.findIndex((t) => t.slug === slug);
  if (idx >= 0) {
    store.items[idx] = { ...store.items[idx], bundle_path: rel } as TemplateItem;
  } else {
    const seed = SEED_TEMPLATES.find((t) => t.slug === slug);
    if (seed) {
      store.items.push({ ...seed, bundle_path: rel });
    } else {
      store.deletedSlugs = store.deletedSlugs.filter((s) => s !== slug);
    }
  }
  writeStore(store);

  return { path: rel, bytes: buf.length };
}
