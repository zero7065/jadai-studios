export interface HubListing {
  id: string;
  title: string;
  role: string;
  mode: 'Remote' | 'Hybrid';
  engagement: string;
  budgetBand: string;
  status: 'open' | 'reviewing';
  skills: string[];
}

// Curated mission board — applications route through hello@jadai.dev until
// public JadaiHub accounts open.
export const HUB_LISTINGS: HubListing[] = [
  {
    id: 'hub-1',
    title: 'Payments reconciliation service',
    role: 'Backend Engineer',
    mode: 'Remote',
    engagement: '4–6 week contract',
    budgetBand: '₦1.2M – ₦1.8M',
    status: 'open',
    skills: ['Node.js', 'PostgreSQL', 'Paystack API'],
  },
  {
    id: 'hub-2',
    title: 'Design system for a fintech console',
    role: 'Product Designer',
    mode: 'Remote',
    engagement: '3 week sprint',
    budgetBand: '₦800K – ₦1.1M',
    status: 'open',
    skills: ['Figma', 'Design Tokens', 'Dark UI'],
  },
  {
    id: 'hub-3',
    title: 'Peer code review rotation',
    role: 'Senior Reviewer',
    mode: 'Remote',
    engagement: 'Ongoing, 4 hrs/week',
    budgetBand: '₦150K / month',
    status: 'reviewing',
    skills: ['TypeScript', 'Architecture', 'Security'],
  },
  {
    id: 'hub-4',
    title: 'Offline-first field data collector',
    role: 'Mobile Engineer',
    mode: 'Hybrid',
    engagement: '6 week contract',
    budgetBand: '₦1.5M – ₦2.2M',
    status: 'open',
    skills: ['React Native', 'SQLite', 'Sync Engines'],
  },
  {
    id: 'hub-5',
    title: 'Brand motion package (launch reel)',
    role: 'Motion Designer',
    mode: 'Remote',
    engagement: '2 week sprint',
    budgetBand: '₦600K – ₦900K',
    status: 'open',
    skills: ['After Effects', 'Cinema 4D', 'Sound Design'],
  },
  {
    id: 'hub-6',
    title: 'Accessibility audit + remediation',
    role: 'A11y Specialist',
    mode: 'Remote',
    engagement: '2 week engagement',
    budgetBand: '₦700K – ₦1M',
    status: 'reviewing',
    skills: ['WCAG 2.2', 'axe-core', 'Screen Readers'],
  },
];
