// Server-side micro-app deployment store. Archives are unpacked with adm-zip
// into dist/services/<slug> (served live) and mirrored to public/services/<slug>
// (survives the next vite build). Pause moves the directory aside; delete
// removes it. Registry persists to data/deployments.json.

import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

export interface DeploymentRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  type: string;
  entry: string;
  status: 'active' | 'paused';
  createdAt: string;
  bundle: 'archive' | 'stub';
  archiveName?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const REGISTRY_FILE = path.join(DATA_DIR, 'deployments.json');
const DIST_ROOT = path.join(process.cwd(), 'dist');
const PUBLIC_ROOT = path.join(process.cwd(), 'public');
const SERVICES_DIR = 'services';
const PAUSED_DIR = 'services-paused';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;

function readRegistry(): DeploymentRecord[] {
  try {
    const raw = fs.readFileSync(REGISTRY_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRegistry(records: DeploymentRecord[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(records, null, 2));
}

export function listDeployments(): DeploymentRecord[] {
  return readRegistry();
}

function serviceDirs(slug: string): Array<{ root: string; active: boolean }> {
  return [
    { root: path.join(DIST_ROOT, SERVICES_DIR, slug), active: true },
    { root: path.join(PUBLIC_ROOT, SERVICES_DIR, slug), active: true },
    { root: path.join(DIST_ROOT, PAUSED_DIR, slug), active: false },
    { root: path.join(PUBLIC_ROOT, PAUSED_DIR, slug), active: false },
  ];
}

function extractArchive(buf: Buffer, targetDir: string): void {
  const zip = new AdmZip(buf);
  const entries = zip.getEntries();
  if (entries.length === 0) throw new Error('Archive is empty');
  if (entries.length > 500) throw new Error('Archive has too many entries (max 500)');

  let hasIndex = false;
  for (const e of entries) {
    const name = e.entryName;
    if (name.includes('..') || name.startsWith('/') || name.includes('\\..') || path.isAbsolute(name)) {
      throw new Error(`Archive entry has an unsafe path: ${name}`);
    }
    if (!e.isDirectory && (name === 'index.html' || name.endsWith('/index.html'))) {
      if (name === 'index.html') hasIndex = true;
    }
  }
  if (!hasIndex) throw new Error('Archive must contain a root index.html');

  fs.mkdirSync(targetDir, { recursive: true });
  zip.extractAllTo(targetDir, true);
}

const STUB_PAGE = (name: string, description: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${name.replace(/[<>&"]/g, '')}</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#050404; color:#c4c0bb; font-family:ui-monospace,monospace; text-align:center; }
  .card { max-width:520px; padding:40px; border:1px solid rgba(201,168,76,0.35); border-radius:18px; }
  h1 { color:#f5f3f0; font-size:1.4rem; margin:0 0 10px; }
  .gold { color:#C9A84C; letter-spacing:.2em; font-size:.7rem; text-transform:uppercase; }
  p { font-size:.85rem; line-height:1.6; }
</style>
</head>
<body>
  <div class="card">
    <div class="gold">Registered Service — bundle pending</div>
    <h1>${name.replace(/[<>&"]/g, '')}</h1>
    <p>${description.replace(/[<>&"]/g, '')}</p>
    <p>Deploy a ZIP containing <strong>index.html</strong> to replace this placeholder.</p>
  </div>
</body>
</html>
`;

export function deployService(
  manifest: Record<string, any>,
  archiveBase64?: string
): { record: DeploymentRecord; url: string; note: string } {
  const slug = String(manifest?.slug || '').toLowerCase().trim();
  if (!SLUG_RE.test(slug)) {
    throw new Error('Slug must be 2-64 chars: a-z, 0-9 and hyphens (not starting/ending with a hyphen)');
  }
  const name = String(manifest?.name || slug);
  const description = String(manifest?.description || 'Custom sovereign deployment');

  const distDir = path.join(DIST_ROOT, SERVICES_DIR, slug);
  const publicDir = path.join(PUBLIC_ROOT, SERVICES_DIR, slug);

  let bundle: 'archive' | 'stub' = 'stub';
  let archiveName: string | undefined;

  if (archiveBase64) {
    const buf = Buffer.from(String(archiveBase64), 'base64');
    if (buf.length === 0) throw new Error('Uploaded archive is empty');
    if (buf.length > 50 * 1024 * 1024) throw new Error('Archive exceeds the 50MB limit');
    extractArchive(buf, distDir);
    bundle = 'archive';
  } else {
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, 'index.html'), STUB_PAGE(name, description));
  }

  // Mirror to public/ so the service survives the next vite build.
  try {
    fs.mkdirSync(publicDir, { recursive: true });
    fs.cpSync(distDir, publicDir, { recursive: true });
  } catch {
    // dist copy is authoritative; public mirror is best-effort
  }

  const records = readRegistry();
  const existingIdx = records.findIndex((r) => r.slug === slug);
  const record: DeploymentRecord = {
    id: existingIdx >= 0 ? records[existingIdx].id : `dep_${Date.now()}`,
    slug,
    name,
    description,
    icon: String(manifest?.icon || 'icon.svg'),
    tier: String(manifest?.tier || 'free'),
    type: String(manifest?.type || 'spa'),
    entry: String(manifest?.entry || 'index.html'),
    status: 'active',
    createdAt: existingIdx >= 0 ? records[existingIdx].createdAt : new Date().toISOString(),
    bundle,
    archiveName,
  };
  if (existingIdx >= 0) records[existingIdx] = record;
  else records.unshift(record);
  writeRegistry(records);

  return {
    record,
    url: `/services/${slug}`,
    note:
      bundle === 'archive'
        ? 'Archive extracted and served live.'
        : 'Registered with a placeholder index.html — upload a ZIP to replace it.',
  };
}

export function toggleDeployment(id: string): DeploymentRecord {
  const records = readRegistry();
  const rec = records.find((r) => r.id === id);
  if (!rec) throw new Error('Deployment not found');

  const movingToPaused = rec.status === 'active';
  for (const base of [DIST_ROOT, PUBLIC_ROOT]) {
    const from = path.join(base, movingToPaused ? SERVICES_DIR : PAUSED_DIR, rec.slug);
    const to = path.join(base, movingToPaused ? PAUSED_DIR : SERVICES_DIR, rec.slug);
    try {
      if (fs.existsSync(from)) {
        fs.mkdirSync(path.dirname(to), { recursive: true });
        if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
        fs.renameSync(from, to);
      }
    } catch {
      // best-effort move; registry status is still updated
    }
  }

  rec.status = movingToPaused ? 'paused' : 'active';
  writeRegistry(records);
  return rec;
}

export function deleteDeployment(id: string): { slug: string } {
  const records = readRegistry();
  const rec = records.find((r) => r.id === id);
  if (!rec) throw new Error('Deployment not found');

  for (const { root } of serviceDirs(rec.slug)) {
    try {
      if (fs.existsSync(root)) fs.rmSync(root, { recursive: true, force: true });
    } catch {
      // best-effort removal
    }
  }

  writeRegistry(records.filter((r) => r.id !== id));
  return { slug: rec.slug };
}
