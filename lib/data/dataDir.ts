import path from 'path';

// Single source of truth for where server-side fs stores live.
// - Local default: <cwd>/data (unchanged behavior)
// - Production: set DATA_DIR to a persistent-disk mount path (render.yaml
//   mounts a disk at /var/data) so chat sessions, artifacts, uploads, the RAG
//   index, memory, and entitlements survive redeploys/restarts.
// Server-only module — never import from client code.
export function getDataDir(): string {
  const override = typeof process !== 'undefined' ? process.env?.DATA_DIR?.trim() : '';
  return override ? path.resolve(override) : path.join(process.cwd(), 'data');
}
