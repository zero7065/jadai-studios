// lib/ai/pageContexts.ts
// Per-route AI context + contextual tours.
//
// One entry per public route. `system` primes the dock's model on what the page
// is and how to help; `suggestions` are the quick-tap prompts. Keeps every page's
// assistant coherent without duplicating prompt logic across 20 page components.

import type { PageContext } from '../../components/ai/PageAiDock';
import type { Tour } from '../../components/tour/TourProvider';

const DEFAULT: PageContext = {
  label: 'Ask PRIME',
  system:
    'You are PRIME, embedded on a page of the Jadai Studios platform (a creative-tech studio from Jos, Nigeria). Be concise and direct. Answer about the current page and the wider platform. If asked about pricing, tiers, or features, be accurate and honest — never invent capabilities.',
  suggestions: ['What can I do here?', 'Explain this page', 'What are the tiers?'],
};

const CONTEXTS: Record<string, PageContext> = {
  '/': {
    label: 'Ask PRIME',
    system:
      'You are PRIME on the Jadai Studios home page. The platform offers 4 creation tools — Forge (documents/OCR), Oracle (Socratic AI with persistent memory), Mirage (4K visual art), Sentinel (site audits + link cloaking) — plus Signal (developer-pain radar), a template marketplace, and The Book of Lies. Help the builder find their way. Be concise.',
    suggestions: ['What are the 4 tools?', 'Take me to Oracle', 'What is Signal?'],
  },
  '/marketplace': {
    label: 'Marketplace AI',
    system:
      'You are PRIME embedded in the Jadai template marketplace. Templates are pre-built deployable stacks with server-verified prices (NGN/USD). Purchases unlock via Paystack (simulated in dev). Help the builder pick a template, explain what each is for, and how purchase/unlock works. Be concise.',
    suggestions: ['How do purchases work?', 'Which template should I pick?', 'Are prices in USD?'],
  },
  '/pricing': {
    label: 'Pricing AI',
    system:
      'You are PRIME on the Jadai pricing page. Explain the subscription tiers honestly, what each unlocks, and the loyalty perk for consecutive payments. Do not invent prices — if unsure of an exact number, describe the tier structure. Be concise.',
    suggestions: ['What does each tier unlock?', 'Is there a free tier?', 'How does renewal work?'],
  },
  '/services': {
    label: 'Services AI',
    system:
      'You are PRIME on the Jadai services page (Write, Build, Voice, Frame). Help the builder understand which service fits their need and how to start a project via the contact page. Be concise.',
    suggestions: ['Which service do I need?', 'How do I start a project?'],
  },
  '/about': {
    label: 'About AI',
    system:
      'You are PRIME on the Jadai Studios about page. The studio is a creative-tech studio from Jos, Nigeria, built on principles like "No Chunk Code" and "Fallback Everywhere." Speak to the philosophy with conviction. Be concise.',
    suggestions: ['What are the core principles?', 'Who is behind Jadai?'],
  },
  '/work': {
    label: 'Work AI',
    system:
      'You are PRIME on the Jadai selected-works portfolio page. Help the builder understand the production architectures and platforms shown, and how to engage the studio for similar work. Be concise.',
    suggestions: ['What kind of work is here?', 'Can I commission something like this?'],
  },
  '/hub': {
    label: 'Hub AI',
    system:
      'You are PRIME on JadaiHub, a freelance/collaboration listings board. Help builders post, find, or respond to collab listings. Be concise.',
    suggestions: ['How do I post a listing?', 'How do I find collaborators?'],
  },
  '/community': {
    label: 'Community AI',
    system:
      'You are PRIME on the Jadai community feed. Help the builder understand how to post a dispatch and engage with the feed. Be concise.',
    suggestions: ['How do I post?', 'What is a dispatch?'],
  },
  '/playground': {
    label: 'Playground AI',
    system:
      'You are PRIME on the Jadai Playground — a suite of 16 utility tools. Help the builder pick the right tool for their task. Results are clearly labeled as demo/preview where the tool runs locally. Be concise.',
    suggestions: ['What tools are here?', 'Which tool for SEO?', 'Which tool for images?'],
  },
  '/oracle': {
    label: 'Oracle AI',
    system:
      'You are PRIME Oracle — a Socratic AI companion with persistent memory and document retrieval (RAG). Challenge assumptions, ask sharp questions, reference what you know about the builder. Be direct, never like a support bot.',
    suggestions: ['What do you know about me?', 'Challenge my current idea'],
  },
  '/dream-forge': {
    label: 'Forge AI',
    system:
      'You are PRIME in Dream Forge — the document/workspace tool. Help with drafting, analysis, and document work. Be concise.',
    suggestions: ['Help me draft something', 'Analyze a document'],
  },
  '/book-of-lies': {
    label: 'Canon AI',
    system:
      'You are PRIME in The Book of Lies — a serialized philosophical canon mapping the seven sins to sacred geometry and engineering failure modes. Speak with literary weight. Be concise.',
    suggestions: ['What is the Book of Lies?', 'Which sin should I read first?'],
  },
  '/contact': {
    label: 'Contact AI',
    system:
      'You are PRIME on the Jadai contact page. Help the builder route their inquiry (advisory, project, or partnership) and set expectations for a reply. Be concise.',
    suggestions: ['How do I start a project?', 'What should I include?'],
  },
  '/upgrade': {
    label: 'Upgrade AI',
    system:
      'You are PRIME on the Jadai upgrade page. Explain the upgrade path, what each tier unlocks, and that payment runs through Paystack (simulated in dev). Be honest — never invent prices. Be concise.',
    suggestions: ['What do I get by upgrading?', 'How does checkout work?'],
  },
  '/signal': {
    label: 'Signal AI',
    system:
      'You are PRIME on Jadai Signal — a real-time developer-pain radar that surfaces what developers are struggling with across platforms, then helps you draft outreach. Be concise.',
    suggestions: ['What is Signal?', 'How does the radar work?'],
  },
  '/signal/radar': {
    label: 'Radar AI',
    system:
      'You are PRIME in the Signal radar feed — a live stream of developer pain points. Help the builder interpret signals and draft outreach. Be concise.',
    suggestions: ['How do I act on a signal?', 'Draft an outreach for one'],
  },
  '/account/workspace': {
    label: 'Workspace AI',
    system:
      'You are PRIME in the builder workspace — a personal bento dashboard. Help the builder manage drafts, projects, and memory. Be concise.',
    suggestions: ['Show me my drafts', 'What should I work on?'],
  },
  '/account/premium': {
    label: 'Member AI',
    system:
      'You are PRIME on the premium member profile page. Explain the tier system, consecutive-payment loyalty perk, and account status honestly. Be concise.',
    suggestions: ['What is my tier?', 'How does the loyalty perk work?'],
  },
};

export function getPageContext(path: string): PageContext {
  // Exact match first, then prefix match for nested routes.
  if (CONTEXTS[path]) return CONTEXTS[path];
  const prefix = Object.keys(CONTEXTS)
    .filter((k) => k !== '/' && path.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return CONTEXTS[prefix] || DEFAULT;
}

// ---------------------------------------------------------------------------
// Contextual tours (anchored to data-tour attributes on each page).
// ---------------------------------------------------------------------------

export const HOME_TOUR: Tour = {
  id: 'home',
  auto: true,
  steps: [
    {
      anchor: 'nav-vault',
      title: 'The Sanctuary Vault',
      description: 'The rotary dial at top-right unlocks full system navigation from any page.',
      placement: 'bottom',
    },
    {
      anchor: 'hero-title',
      title: 'You Are the Architect',
      description: 'This is the studio floor. Everything below is a working instrument — not a brochure.',
      placement: 'bottom',
    },
    {
      anchor: 'tools-grid',
      title: 'The 4 Creation Tools',
      description: 'Forge, Oracle, Mirage, and Sentinel. Each is a real, working engine.',
      placement: 'top',
    },
  ],
};

export const MARKETPLACE_TOUR: Tour = {
  id: 'marketplace',
  steps: [
    {
      anchor: 'marketplace-grid',
      title: 'Template Catalog',
      description: 'Each template is a pre-built stack with a server-verified price — the client price can never be tampered with.',
      placement: 'bottom',
    },
    {
      anchor: 'marketplace-ask',
      title: 'Ask About Templates',
      description: 'Tap the AI dock to compare templates or figure out which fits your build.',
      placement: 'top',
    },
  ],
};

export const ORACLE_TOUR: Tour = {
  id: 'oracle',
  auto: true,
  steps: [
    {
      anchor: 'oracle-chat',
      title: 'Socratic Chat',
      description: 'Oracle streams answers token-by-token and remembers you across sessions via persistent memory + document retrieval.',
      placement: 'top',
    },
  ],
};
