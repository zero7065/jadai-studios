export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: 'Education AI' | 'Edge Infrastructure' | 'Media Systems' | 'Developer Tools' | 'Architecture';
  status: 'Live' | 'In Build' | 'Concept' | 'Prototype' | 'Sold' | 'Archived';
  description: string;
  long_description: string;
  stack: string[];
  live_url?: string;
  /** Self-hosted interactive preview (served by this app under public/previews). */
  preview_url?: string;
  github_url?: string;
  featured: boolean;
  display_order: number;
  views_count: number;
  image_placeholder: string;
}

export const SEED_PORTFOLIO: PortfolioProject[] = [
  {
    id: 'port-001',
    slug: 'exampadi',
    title: 'ExamPadi',
    tagline: 'AI learning companion engineered for West African secondary & university curricula.',
    category: 'Education AI',
    status: 'Live',
    description: 'Autonomous WAEC/JAMB exam preparation engine using adaptive cognitive profiling and low-bandwidth audio synthesis.',
    long_description: `ExamPadi was engineered to solve educational asymmetry in emerging markets. Built with an offline-first service worker architecture, it downloads entire syllabi and syllabus-aligned mock engines directly into the browser storage. Utilizing localized Gemini models and Groq inference, ExamPadi dissects complex physics, chemistry, and mathematics questions into intuitive Socratic explanations.`,
    stack: ['Next.js 14', 'TypeScript', 'Gemini AI', 'Supabase', 'Tailwind CSS', 'PWA'],
    preview_url: '/previews/exampadi/index.html',
    live_url: 'https://exampadi.jadai.dev',
    github_url: 'https://github.com/jadaistudios/exampadi',
    featured: true,
    display_order: 1,
    views_count: 0,
    image_placeholder: 'exampadi_preview',
  },
  {
    id: 'port-002',
    slug: 'gcore-edge-console',
    title: 'GCORE Edge Console',
    tagline: 'High-frequency telemetry & serverless routing interface for distributed CDN nodes.',
    category: 'Edge Infrastructure',
    status: 'Live',
    description: 'Sub-50ms monitoring suite rendering real-time global latency heatmaps, TLS handshakes, and geo-DNS failovers.',
    long_description: `An industrial-grade telemetry panel designed for mission-critical edge deployments. Features real-time WebSockets streaming packet drops, automated DDoS mitigation triggers, and cryptographic routing telemetry with strict zero-pill typographic discipline.`,
    stack: ['React', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'Express', 'Node TLS'],
    preview_url: '/previews/gcore-edge-console/index.html',
    live_url: 'https://edge.jadai.dev',
    featured: false,
    display_order: 2,
    views_count: 0,
    image_placeholder: 'gcore_preview',
  },
  {
    id: 'port-003',
    slug: 'steary-media',
    title: 'Steary Media Platform',
    tagline: 'Glassmorphism streaming and audio intelligence network with sovereign DRM.',
    category: 'Media Systems',
    status: 'In Build',
    description: 'Spatial audio distribution hub designed with void-black aesthetics, live lyric parsing, and lossless streaming.',
    long_description: `Steary redefines African media streaming by stripping away algorithmic advertisement clutter. Designed with pure glassmorphism, dynamic blur attenuation, and sub-second lossless FLAC audio streaming.`,
    stack: ['Next.js', 'WebAudio API', 'Framer Motion', 'Supabase Storage', 'PostgreSQL'],
    preview_url: '/previews/steary-media/index.html',
    live_url: 'https://steary.jadai.dev',
    github_url: 'https://github.com/jadaistudios/steary',
    featured: false,
    display_order: 3,
    views_count: 0,
    image_placeholder: 'steary_preview',
  },
  {
    id: 'port-004',
    slug: 'metatron-cad',
    title: 'Metatron CAD',
    tagline: 'Mathematical spatial compiler translating sacred geometry into CNC machine code.',
    category: 'Architecture',
    status: 'Prototype',
    description: 'Generative design compiler leveraging 13-node Metatron calculations to output stress-tested structural joinery.',
    long_description: `Bridging ancient proportion theory with modern parametric architecture. Metatron CAD parses golden ratios and Platonic solids, outputting directly to G-code for precision 5-axis CNC cutters.`,
    stack: ['WebGL', 'Three.js', 'Rust (WASM)', 'TypeScript'],
    preview_url: '/previews/metatron-cad/index.html',
    github_url: 'https://github.com/jadaistudios/metatron-cad',
    featured: false,
    display_order: 4,
    views_count: 0,
    image_placeholder: 'metatron_preview',
  },
  {
    id: 'port-005',
    slug: 'void-os',
    title: 'Void OS',
    tagline: 'Distraction-free sovereign developer terminal and neural thought canvas.',
    category: 'Developer Tools',
    status: 'Live',
    description: 'A keyboard-first browser desktop environment with integrated AI co-thinker and local encrypted file vaults.',
    long_description: `Built for developers who reject neon notification loops. Void OS is a monochrome, typography-led operating layer operating directly in the browser with offline SQLite databases and local PGP encryption.`,
    stack: ['React', 'TypeScript', 'Web Workers', 'OPFS', 'Tailwind CSS'],
    preview_url: '/previews/void-os/index.html',
    live_url: 'https://void.jadai.dev',
    github_url: 'https://github.com/jadaistudios/void-os',
    featured: false,
    display_order: 5,
    views_count: 0,
    image_placeholder: 'void_preview',
  },
  {
    id: 'port-006',
    slug: 'jadai-hub-core',
    title: 'JadaiHub Collaborative',
    tagline: 'Decentralized mission board, verified code audits, and elite talent matchmaking.',
    category: 'Developer Tools',
    status: 'In Build',
    description: 'Peer-to-peer engineering ecosystem facilitating technical collaborations with automated escrow verification.',
    long_description: `JadaiHub brings together sovereign developers across the African continent and the global diaspora. No recruiters, no fluff: pure repository verification, code reviews, and structured payment milestones.`,
    stack: ['Next.js 14', 'Supabase RLS', 'Paystack', 'TypeScript', 'Tailwind CSS'],
    preview_url: '/previews/jadai-hub-core/index.html',
    live_url: 'https://jadai.dev/hub',
    featured: false,
    display_order: 6,
    views_count: 0,
    image_placeholder: 'hub_preview',
  },
];

export function getFeaturedProject(): PortfolioProject {
  return SEED_PORTFOLIO.find((p) => p.featured) || SEED_PORTFOLIO[0];
}

export function getAllProjects(): PortfolioProject[] {
  return SEED_PORTFOLIO.sort((a, b) => a.display_order - b.display_order);
}

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return SEED_PORTFOLIO.find((p) => p.slug === slug || p.id === slug);
}
