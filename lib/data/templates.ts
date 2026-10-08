export interface TemplateItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  lore: string;
  description: string;
  category: 'portfolio' | 'saas' | 'marketplace' | 'landing' | 'Full-Stack Starter' | 'AI Systems' | 'Luxury Portfolio' | 'CMS & Publication';
  price_ngn: number;
  price_usd: number;
  stack: string[];
  demo_url: string;
  preview_url: string;
  download_count: number;
  featured: boolean;
  status: 'active' | 'draft' | 'archived';
  includes: string[];
  theme?: {
    bg: string;
    text: string;
    accent: string;
    headingFont?: string;
  };
}

export const SEED_TEMPLATES: TemplateItem[] = [
  {
    id: 'tmpl-aperture',
    slug: 'aperture',
    name: 'Aperture — Studio & Photography Portfolio',
    tagline: 'Clean gallery, EXIF inspection, and client print store.',
    lore: 'Built for photographers and visual artists who want their work to take center stage without unnecessary clutter.',
    description: 'Minimalist luxury photography portfolio with full-bleed masonry gallery, EXIF inspection, collection categorization, inquiry booking flow, and private GitHub template repository.',
    category: 'portfolio',
    price_ngn: 52500,
    price_usd: 35,
    stack: ['Next.js 14', 'Tailwind CSS', 'Framer Motion', 'Supabase Storage', 'TypeScript'],
    demo_url: 'https://templates.jadai.dev/aperture',
    preview_url: '/assets/templates/aperture.png',
    download_count: 312,
    featured: true,
    status: 'active',
    theme: {
      bg: '#050404',
      text: '#F5F3F0',
      accent: '#D4A574',
    },
    includes: [
      'Hero gallery with lazy-loaded masonry layout',
      'Curated collections (Weddings / Portraits / Editorial / Street)',
      'EXIF metadata lightbox inspector with focal length & ISO tags',
      'Inquiry booking form with date selector',
      'Client print shop checkout module wired to Paystack & Stripe',
      'Private GitHub repository invite token',
    ],
  },
  {
    id: 'tmpl-vendor',
    slug: 'vendor',
    name: 'Vendor — High-Converting E-Commerce Store',
    tagline: 'Slide-out cart, instant checkout, and inventory manager.',
    lore: 'Designed for independent brands and merchandise stores to sell globally with zero friction and zero hidden cart drops.',
    description: 'Streamlined, high-conversion e-commerce architecture. Side drawer cart, instant one-page checkout, multi-variant selector, and lightweight admin inventory panel.',
    category: 'saas',
    price_ngn: 82500,
    price_usd: 55,
    stack: ['Next.js 14', 'Paystack & Stripe API', 'Supabase', 'Zustand Cart', 'Tailwind CSS'],
    demo_url: 'https://templates.jadai.dev/vendor',
    preview_url: '/assets/templates/vendor.png',
    download_count: 420,
    featured: true,
    status: 'active',
    theme: {
      bg: '#0A1628',
      text: '#F5F5F0',
      accent: '#C0392B',
    },
    includes: [
      'High-speed product catalog with size/color matrix options',
      'Slide-out persistent cart drawer with instant subtotal math',
      'Global checkout pipeline with dual currency (USD & NGN)',
      'Automated receipt email templates & order history',
      'Discount code promotion engine with usage caps',
      'Responsive inventory management dashboard',
    ],
  },
  {
    id: 'tmpl-shelter',
    slug: 'shelter',
    name: 'Shelter — Animal Rescue & Non-Profit Donation Portal',
    tagline: 'Pet adoption workflow, recurring donations, and volunteer network.',
    lore: 'Created for shelters, animal rescues, and non-profits to coordinate adoptions and raise recurring support seamlessly.',
    description: 'Heartfelt, compassionate animal rescue & adoption portal with species filter, multi-step pet adoption application, recurring donation channels, and foster network coordinator.',
    category: 'marketplace',
    price_ngn: 63000,
    price_usd: 42,
    stack: ['Next.js 14', 'Supabase DB', 'Paystack & Stripe Donations', 'Tailwind CSS'],
    demo_url: 'https://templates.jadai.dev/shelter',
    preview_url: '/assets/templates/shelter.png',
    download_count: 180,
    featured: true,
    status: 'active',
    theme: {
      bg: '#1A2E1F',
      text: '#F5F4EE',
      accent: '#E67E22',
    },
    includes: [
      'Interactive animal listing grid with species/age/temperament filters',
      'Detailed profile cards with behavioral notes and medical history',
      'Multi-step adoption application intake form',
      'Recurring monthly sponsorship & donation widget',
      'Volunteer intake flow and foster home directory',
      'Success stories journal with before/after gallery',
    ],
  },
  {
    id: 'tmpl-bloom',
    slug: 'bloom',
    name: 'Bloom — Boutique Florist & Subscription Box',
    tagline: 'Seasonal plant care cheat-sheets, floral delivery, and recurring gifts.',
    lore: 'Built for artisanal florists and botanical studios to manage seasonal inventories, local delivery zones, and weekly subscriptions.',
    description: 'Artisanal orchidry and boutique flower shop platform featuring seasonal blooming calendars, botanical care guides, recurring flower subscription boxes, and event inquiries.',
    category: 'marketplace',
    price_ngn: 72000,
    price_usd: 48,
    stack: ['Next.js 14', 'Paystack Subscriptions', 'Supabase', 'Tailwind CSS'],
    demo_url: 'https://templates.jadai.dev/bloom',
    preview_url: '/assets/templates/bloom.png',
    download_count: 215,
    featured: true,
    status: 'active',
    theme: {
      bg: '#23151D',
      text: '#F7EBE8',
      accent: '#E8B4B8',
    },
    includes: [
      'Seasonal botanical catalog synchronized with active month',
      'Per-species humidity, light, and watering care cheat-sheets',
      'Weekly, bi-weekly, or monthly floral subscription tiers',
      'Delivery postal radius calculator & dispatch scheduling',
      'Bespoke wedding & corporate floral staging inquiry form',
      'Botanical propagation blog engine',
    ],
  },
  {
    id: 'tmpl-glow',
    slug: 'glow',
    name: 'Glow — Luxury Salon, Clinic & Spa Booking',
    tagline: 'Treatment calendar, deposit checkout, and aesthetic specialist menus.',
    lore: 'Tailored for beauty lounges, skincare clinics, and aesthetic practitioners to manage appointments and retail products in one sleek dashboard.',
    description: 'High-end beauty salon, aesthetics clinic, and cosmetics studio suite with interactive service menus, treatment booking calendar, stylist portfolios, and retail skincare shelf.',
    category: 'landing',
    price_ngn: 72000,
    price_usd: 48,
    stack: ['Next.js 14', 'Appointment Booking', 'Paystack & Stripe', 'Tailwind CSS'],
    demo_url: 'https://templates.jadai.dev/glow',
    preview_url: '/assets/templates/glow.png',
    download_count: 340,
    featured: true,
    status: 'active',
    theme: {
      bg: '#1C1318',
      text: '#F9F1F0',
      accent: '#D4A088',
    },
    includes: [
      'Tiered service menu with pricing and duration indicators',
      'Appointment scheduler with deposit collection',
      'Stylist & technician portfolio galleries with verified reviews',
      'Cosmetics e-commerce shelf with ingredient transparency',
      'Digital gift card generator with instant PDF voucher delivery',
      'Client loyalty rewards and membership tracker',
    ],
  },
  {
    id: 'tmpl-saas-foundation',
    slug: 'saas-foundation',
    name: 'Foundry — Full-Stack Web App & SaaS Starter',
    tagline: '20-table PostgreSQL database, multi-tenant auth, and AI failover chain.',
    lore: 'The production-tested foundation for serious founders. Everything you need to launch a multi-tenant web application with global billing and local resilience.',
    description: 'Production-grade Next.js 14 App Router starter with 20-table Supabase schema, RLS security rules, dual-currency billing, and 4-step AI fallback chain.',
    category: 'Full-Stack Starter',
    price_ngn: 75000,
    price_usd: 50,
    stack: ['Next.js 14', 'Supabase', 'PostgreSQL', 'Paystack', 'Tailwind CSS', 'TypeScript'],
    demo_url: 'https://demo-saas.jadai.dev',
    preview_url: '/assets/templates/sovereign-saas.png',
    download_count: 512,
    featured: false,
    status: 'active',
    includes: [
      '20-table SQL schema with idempotent migrations',
      'Dual currency checkout verification with HMAC-SHA512',
      '4-step AI fallback orchestrator (Groq + Gemini + Cache)',
      'Admin Lounge with self-diagnostic telemetry',
    ],
  },
  {
    id: 'tmpl-codex',
    slug: 'codex',
    name: 'Codex — Novelist, Author & Digital Publishing Studio',
    tagline: 'Distraction-free chapter reader, subscriber unlocks, and manuscript export.',
    lore: 'Built for novelists, essayists, and serialized storytellers who want to distribute their writings directly to readers without platform cuts.',
    description: 'Elegant literary publication engine featuring dark mode reading typography, chapter serialization, subscriber-only drafts, author notes, and one-click PDF/ePub export.',
    category: 'CMS & Publication',
    price_ngn: 97500,
    price_usd: 65,
    stack: ['Next.js 14', 'TipTap Editor', 'Supabase Auth', 'Stripe & Paystack', 'Tailwind CSS'],
    demo_url: 'https://templates.jadai.dev/codex',
    preview_url: '/assets/templates/bloom.png',
    download_count: 140,
    featured: true,
    status: 'active',
    theme: {
      bg: '#0A0908',
      text: '#F5F3F0',
      accent: '#C9A84C',
    },
    includes: [
      'Distraction-free night reading mode with fluid typography',
      'Serialized episode releases with 9:47 PM release timer',
      'Subscriber paywall for premium chapters & bonus lore',
      'Interactive reader reflections & mirror notes journal',
      'Print-ready PDF & ePub manuscript generator',
      'Direct reader tipping & patron supporter wall',
    ],
  },
];

export function getAllTemplates(filters?: { category?: string; stack?: string }): TemplateItem[] {
  let list = SEED_TEMPLATES;
  if (filters?.category && filters.category !== 'All') {
    list = list.filter((t) => t.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.stack && filters.stack !== 'All') {
    list = list.filter((t) => t.stack.some((s) => s.toLowerCase().includes(filters.stack!.toLowerCase())));
  }
  return list;
}

export function getTemplateBySlug(slug: string): TemplateItem | undefined {
  return SEED_TEMPLATES.find((t) => t.slug === slug || t.id === slug);
}
