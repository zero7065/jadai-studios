// Server-side artifact store — fs-backed, server-only.
// Holds AI-generated artifacts (websites, documents, spreadsheets) so they get
// a stable live preview URL + downloadable file. DO NOT import from client.

import fs from 'fs';
import path from 'path';
import { withStoreLock } from '../utils/storeLock';

import { getDataDir } from './dataDir';

const DATA_DIR = getDataDir();
const STORE_FILE = path.join(DATA_DIR, 'artifacts.json');

const MAX_ARTIFACTS = 80;
const MAX_FILES = 30;
const MAX_FILE_CHARS = 1_500_000;

export type ArtifactType = 'website' | 'document' | 'spreadsheet';

export interface ArtifactFile {
  name: string;
  content: string;
}

export interface Artifact {
  id: string;
  builderId: string;
  type: ArtifactType;
  title: string;
  files: ArtifactFile[];
  createdAt: string;
}

interface ArtifactsStore {
  artifacts: Artifact[];
}

const TYPES = new Set<ArtifactType>(['website', 'document', 'spreadsheet']);

function ensureStore(): ArtifactsStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ artifacts: [] }, null, 2));
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return { artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [] };
  } catch {
    return { artifacts: [] };
  }
}

function persist(store: ArtifactsStore): void {
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

export function sanitizeFiles(raw: unknown): ArtifactFile[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_FILES) return null;
  const files: ArtifactFile[] = [];
  for (const f of raw) {
    if (!f || typeof f !== 'object') return null;
    const name = String((f as any).name || '').trim().slice(0, 120);
    const content = String((f as any).content || '');
    if (!name || !content || content.length > MAX_FILE_CHARS) return null;
    files.push({ name, content });
  }
  return files;
}

export function saveArtifact(input: {
  builderId: string;
  type: string;
  title: string;
  files: ArtifactFile[];
}): Artifact | null {
  const type = (TYPES.has(input.type as ArtifactType) ? input.type : 'document') as ArtifactType;
  const artifact: Artifact = {
    id: `art_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    builderId: input.builderId,
    type,
    title: (input.title || 'Untitled artifact').slice(0, 160),
    files: input.files,
    createdAt: new Date().toISOString(),
  };
  const s = ensureStore();
  s.artifacts.unshift(artifact);
  if (s.artifacts.length > MAX_ARTIFACTS) s.artifacts = s.artifacts.slice(0, MAX_ARTIFACTS);
  persist(s);
  return artifact;
}

export function getArtifact(id: string): Artifact | null {
  return ensureStore().artifacts.find((a) => a.id === id) || null;
}

export function listArtifacts(builderId: string) {
  return ensureStore()
    .artifacts.filter((a) => a.builderId === builderId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      createdAt: a.createdAt,
      fileCount: a.files.length,
      previewUrl: `/artifacts/${a.id}/preview`,
      downloadUrl: `/artifacts/${a.id}/download`,
    }));
}

export function deleteArtifact(builderId: string, id: string): boolean {
  const s = ensureStore();
  const before = s.artifacts.length;
  s.artifacts = s.artifacts.filter((a) => !(a.id === id && a.builderId === builderId));
  if (s.artifacts.length === before) return false;
  persist(s);
  return true;
}
