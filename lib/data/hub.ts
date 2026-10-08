export interface HubListing {
  id: string;
  user_id?: string;
  type: 'service' | 'product' | 'collab' | 'job';
  title: string;
  description: string;
  stack: string[];
  price_type: 'fixed' | 'hourly' | 'equity' | 'free';
  price: number;
  currency: string;
  portfolio_links: string[];
  contact_method: string;
  status: 'pending' | 'active' | 'paused' | 'rejected';
  views_count: number;
  enquiries_count: number;
  featured: boolean;
  author_name: string;
  author_location: string;
  created_at: string;
}

export const SEED_HUB_LISTINGS: HubListing[] = [
  {
    id: 'hub-001',
    type: 'service',
    title: 'High-Concurrency PostgreSQL Schema & RLS Audit',
    description: 'Deep audit of multi-tenant PostgreSQL schemas, connection pooling optimization, and leak-proof Row Level Security rule hardening.',
    stack: ['PostgreSQL', 'Supabase', 'PgBouncer', 'Security Audit'],
    price_type: 'fixed',
    price: 180000,
    currency: 'NGN',
    portfolio_links: ['https://github.com/jadaistudios'],
    contact_method: 'inquiries@jadai.dev',
    status: 'active',
    views_count: 0,
    enquiries_count: 0,
    featured: true,
    author_name: 'Tariq M.',
    author_location: 'Abuja, Nigeria',
    created_at: '2026-09-10T14:20:00Z',
  },
  {
    id: 'hub-002',
    type: 'collab',
    title: 'Collaborator Wanted: Rust / WASM Audio Engine for Steary',
    description: 'Seeking a systems engineer to build a high-performance audio decimation and spectral analysis module running client-side via WebAssembly.',
    stack: ['Rust', 'WASM', 'WebAudio', 'C++'],
    price_type: 'equity',
    price: 0,
    currency: 'NGN',
    portfolio_links: ['https://steary.jadai.dev'],
    contact_method: 'audio@jadai.dev',
    status: 'active',
    views_count: 0,
    enquiries_count: 0,
    featured: true,
    author_name: 'Jehu Nanpan',
    author_location: 'Jos, Nigeria',
    created_at: '2026-09-15T09:00:00Z',
  },
  {
    id: 'hub-003',
    type: 'service',
    title: 'Full-Stack Next.js 14 & Supabase Production Deployment',
    description: 'End-to-end configuration from zero to Vercel/Cloudflare with automated CI/CD pipelines, SSL certificates, and Paystack subscriptions.',
    stack: ['Next.js 14', 'TypeScript', 'Vercel', 'Paystack'],
    price_type: 'fixed',
    price: 250000,
    currency: 'NGN',
    portfolio_links: ['https://jadai.dev'],
    contact_method: 'build@jadai.dev',
    status: 'active',
    views_count: 0,
    enquiries_count: 0,
    featured: false,
    author_name: 'Emeka K.',
    author_location: 'Lagos, Nigeria',
    created_at: '2026-09-18T11:30:00Z',
  },
  {
    id: 'hub-004',
    type: 'job',
    title: 'Senior Frontend Architect (Contract — 3 Months)',
    description: 'Looking for a senior React/Next.js engineer with deep expertise in 3D WebGL (Three.js) and custom physics-based UI components.',
    stack: ['React', 'Three.js', 'Tailwind CSS', 'Framer Motion'],
    price_type: 'fixed',
    price: 900000,
    currency: 'NGN',
    portfolio_links: [],
    contact_method: 'talent@jadai.dev',
    status: 'active',
    views_count: 0,
    enquiries_count: 0,
    featured: false,
    author_name: 'Jadai Studios Talent Mission',
    author_location: 'Remote / Jos',
    created_at: '2026-09-20T16:00:00Z',
  },
];

export function getAllHubListings(filters?: { type?: string; search?: string }): HubListing[] {
  let list = SEED_HUB_LISTINGS.filter((l) => l.status === 'active');
  if (filters?.type && filters.type !== 'all') {
    list = list.filter((l) => l.type === filters.type);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter((l) => l.title.toLowerCase().includes(s) || l.description.toLowerCase().includes(s));
  }
  return list;
}
