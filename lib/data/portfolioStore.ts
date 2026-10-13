// Server-side portfolio store (fs-backed, survives restarts).
// Seeds live in code; admin edits/new entries persist to data/admin-portfolio.json.
// DO NOT import from client components — use GET /api/portfolio and /api/admin/portfolio/*.

import fs from 'fs';
import path from 'path';
import { SEED_PORTFOLIO, PortfolioProject } from './portfolio';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'admin-portfolio.json');

interface PortfolioStore {
  items: PortfolioProject[];
  deletedSlugs: string[];
}

function readStore(): PortfolioStore {
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

function writeStore(store: PortfolioStore): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

/** Seeds merged with admin overrides and deletions, ordered by display_order. */
export function listProjects(): PortfolioProject[] {
  const store = readStore();
  const deleted = new Set(store.deletedSlugs);
  const bySlug = new Map<string, PortfolioProject>();
  for (const p of SEED_PORTFOLIO) {
    if (!deleted.has(p.slug)) bySlug.set(p.slug, p);
  }
  for (const p of store.items) {
    if (p && typeof p.slug === 'string' && !deleted.has(p.slug)) bySlug.set(p.slug, p);
  }
  return Array.from(bySlug.values()).sort((a, b) => a.display_order - b.display_order);
}

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return listProjects().find((p) => p.slug === slug || p.id === slug);
}

export function saveProject(project: PortfolioProject): PortfolioProject {
  if (!project || typeof project.slug !== 'string' || !project.slug.trim()) {
    throw new Error('Project slug is required');
  }
  const store = readStore();
  store.deletedSlugs = store.deletedSlugs.filter((s) => s !== project.slug);
  const idx = store.items.findIndex((p) => p.slug === project.slug);
  if (idx >= 0) {
    store.items[idx] = { ...store.items[idx], ...project };
  } else {
    // New entry: fill defaults so the public /work page never crashes on missing fields.
    const next: PortfolioProject = {
      ...project,
      id: project.id || `port_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      views_count: project.views_count || 0,
      display_order: project.display_order || store.items.length + SEED_PORTFOLIO.length + 1,
      image_placeholder: project.image_placeholder || project.slug,
      long_description: project.long_description || project.description || '',
    };
    store.items.push(next);
  }
  writeStore(store);
  return project;
}

export function deleteProject(slug: string): boolean {
  const store = readStore();
  const isSeed = SEED_PORTFOLIO.some((p) => p.slug === slug);
  store.items = store.items.filter((p) => p.slug !== slug);
  if (isSeed && !store.deletedSlugs.includes(slug)) store.deletedSlugs.push(slug);
  writeStore(store);
  return true;
}

export function bumpViews(slug: string): void {
  const store = readStore();
  const override = store.items.find((p) => p.slug === slug);
  if (override) {
    override.views_count = (override.views_count || 0) + 1;
    writeStore(store);
    return;
  }
  // Seed project — persist a view-count override entry.
  const seed = SEED_PORTFOLIO.find((p) => p.slug === slug);
  if (!seed) return;
  store.items.push({ ...seed, views_count: (seed.views_count || 0) + 1 });
  writeStore(store);
}

/** Build a title/description/og preview from a fetched URL (no headless browser). */
export async function previewFromUrl(rawUrl: string): Promise<{
  url: string;
  title: string;
  description: string;
  site_name: string;
  image: string;
  favicon: string;
  source: 'fetched' | 'url-derived';
  note?: string;
}> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/^www\./, '');
  const fallback = {
    url,
    title: host,
    description: '',
    site_name: host,
    image: '',
    favicon: `https://${host}/favicon.ico`,
    source: 'url-derived' as const,
  };

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) {
      return { ...fallback, note: `Fetch returned HTTP ${resp.status} — using URL-derived preview.` };
    }
    const html = (await resp.text()).slice(0, 200_000);
    const meta = (name: string): string => {
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`, 'i'),
      ];
      for (const re of patterns) {
        const m = html.match(re);
        if (m?.[1]) return decodeEntities(m[1]).trim();
      }
      return '';
    };
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = meta('og:title') || (titleMatch?.[1] ? decodeEntities(titleMatch[1]).trim() : host);
    const description = meta('og:description') || meta('description') || '';
    const siteName = meta('og:site_name') || host;
    let image = meta('og:image') || meta('twitter:image') || '';
    if (image && !/^https?:\/\//i.test(image)) {
      image = new URL(image, parsed.origin).toString();
    }
    const favicon =
      (html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)?.[1] || '')
        ? new URL(
            html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)![1],
            parsed.origin
          ).toString()
        : `https://${host}/favicon.ico`;

    return { url, title, description, site_name: siteName, image, favicon, source: 'fetched' };
  } catch (err: any) {
    return {
      ...fallback,
      note: `Could not fetch page (${String(err?.message || err)}). Using URL-derived preview — check the URL or network.`,
    };
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
