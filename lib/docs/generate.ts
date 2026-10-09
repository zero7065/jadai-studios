/**
 * Utility to inspect documentation registry and platform structure.
 */

export interface DocMetadata {
  slug: string;
  title: string;
  order: number;
}

export const DOCS_INDEX: DocMetadata[] = [
  { slug: '00-START-HERE', title: 'Orientation & Quickstart', order: 0 },
  { slug: '01-ARCHITECTURE', title: 'System Architecture & Data Flows', order: 1 },
  { slug: '02-DEPLOYMENT', title: 'Deployment Guide (Cloudflare Pages & Render)', order: 2 },
  { slug: '03-DATA-SOURCES', title: 'Data Sources & Free-Tier Limits', order: 3 },
  { slug: '04-MODULES', title: 'Module System Guide', order: 4 },
  { slug: '05-RECOVERY', title: 'Disaster Recovery Playbook', order: 5 },
  { slug: '06-FOUNDER-NOTES', title: 'Founder Notes & Vision', order: 6 },
];

export function getDocBySlug(slug: string): DocMetadata | undefined {
  return DOCS_INDEX.find((d) => d.slug === slug);
}
