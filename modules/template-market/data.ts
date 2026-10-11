export interface MarketTemplate {
  id: string;
  name: string;
  category: 'Boilerplate' | 'Design System' | 'Infrastructure';
  price: string;
  tags: string[];
  description: string;
  status: 'available' | 'in_build';
}

// Catalog — acquisition routes through hello@jadai.dev (no self-serve checkout yet).
export const MARKET_TEMPLATES: MarketTemplate[] = [
  {
    id: 'tm-1',
    name: 'Sovereign SaaS Starter',
    category: 'Boilerplate',
    price: '₦95,000',
    tags: ['Next.js', 'Auth', 'Paystack', 'PostgreSQL'],
    description:
      'Production SaaS skeleton with tiered subscriptions, webhook verification, and admin session hardening.',
    status: 'available',
  },
  {
    id: 'tm-2',
    name: 'Obsidian Console UI',
    category: 'Design System',
    price: '₦60,000',
    tags: ['React', 'Dark Theme', 'Tokens', 'A11y'],
    description:
      'Dark-first component library: glass surfaces, gold accent scale, WCAG-checked contrast pairs.',
    status: 'available',
  },
  {
    id: 'tm-3',
    name: 'Sentinel Edge Redirector',
    category: 'Infrastructure',
    price: '₦45,000',
    tags: ['Cloudflare Workers', 'Cloaking', 'Analytics'],
    description:
      'Edge worker pack for cloaked short links, click accounting, and noindex-safe redirect handling.',
    status: 'available',
  },
  {
    id: 'tm-4',
    name: 'PRIME Content Pipeline',
    category: 'Infrastructure',
    price: '₦75,000',
    tags: ['OpenAI', 'Groq', 'Cron', 'Scheduling'],
    description:
      'Multi-provider AI content pipeline with quota-aware fallback chains and scheduled dispatch.',
    status: 'available',
  },
  {
    id: 'tm-5',
    name: 'Folio Case Study Kit',
    category: 'Design System',
    price: '₦40,000',
    tags: ['Portfolio', 'Motion', 'MDX'],
    description:
      'Editorial case-study templates with cinematic media stages and self-hosted live preview frames.',
    status: 'in_build',
  },
  {
    id: 'tm-6',
    name: 'Field Sync Starter',
    category: 'Boilerplate',
    price: '₦85,000',
    tags: ['React Native', 'SQLite', 'Offline-first'],
    description:
      'Offline-first mobile baseline with conflict-aware sync queues and background retry policies.',
    status: 'in_build',
  },
];
