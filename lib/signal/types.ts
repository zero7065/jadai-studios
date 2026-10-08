export type SignalPlatform = 'hackernews' | 'github' | 'reddit' | 'x' | 'threads' | 'web';

export type SignalIntentScore = number; // 0 - 100

export type SignalStatus = 'new' | 'reviewed' | 'contacted' | 'replied' | 'converted' | 'ignored';

export type OutreachApproach = 'conversational' | 'helpful' | 'curious';

export type OutreachDraftStatus = 'draft' | 'approved' | 'sent' | 'replied' | 'converted';

export type GeneratedContentPlatform = 'x' | 'linkedin' | 'reddit' | 'threads';

export type GeneratedContentStatus = 'draft' | 'approved' | 'posted' | 'scheduled';

export type SignalPlanTier = 'free' | 'pro' | 'business' | 'agency';

export interface Signal {
  id: string;
  userId: string;
  platform: SignalPlatform;
  sourceUrl: string;
  author: string;
  authorAvatar?: string;
  content: string;
  intentScore: number;
  reason: string;
  suggestedAngle: string;
  status: SignalStatus;
  detectedAt: string;
  outreachDraftId?: string;
  embedding?: number[];
}

export interface OutreachDraft {
  id: string;
  userId: string;
  signalId: string;
  platform: SignalPlatform;
  message: string;
  approach: OutreachApproach;
  status: OutreachDraftStatus;
  sentAt?: string;
  repliedAt?: string;
  convertedAt?: string;
  createdAt: string;
}

export interface GeneratedContent {
  id: string;
  userId: string;
  platform: GeneratedContentPlatform;
  content: string;
  sourceType: 'commit' | 'deployment' | 'milestone' | 'manual';
  sourceRef?: string;
  status: GeneratedContentStatus;
  scheduledFor?: string;
  postedAt?: string;
  createdAt: string;
}

export interface SignalSettings {
  id: string;
  userId: string;
  plan: SignalPlanTier;
  signalsUsedToday: number;
  signalsUsedThisMonth: number;
  dailyLimit: number;
  monthlyLimit: number;
  platformsWatched: SignalPlatform[];
  keywords: string[];
  excludedKeywords: string[];
  autoDraftOutreach: boolean;
  autoDraftContent: boolean;
  notificationEmail: boolean;
  githubConnected?: boolean;
  vercelConnected?: boolean;
  xConnected?: boolean;
}

export interface SignalAnalyticsEvent {
  id: string;
  userId: string;
  signalId?: string;
  eventType: 'signal_found' | 'message_drafted' | 'message_sent' | 'reply_received' | 'conversion';
  platform?: SignalPlatform;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SignalPlan {
  id: SignalPlanTier;
  name: string;
  priceNgn: number;
  priceUsd: number;
  priceNgnFormatted: string;
  priceUsdFormatted: string;
  signalsPerDay: number;
  seats: number;
  features: string[];
  popular?: boolean;
}

export const SIGNAL_PLANS: Record<SignalPlanTier, SignalPlan> = {
  free: {
    id: 'free',
    name: 'Free Radar',
    priceNgn: 0,
    priceUsd: 0,
    priceNgnFormatted: '₦0',
    priceUsdFormatted: '$0',
    signalsPerDay: 10,
    seats: 1,
    features: [
      '10 signals detected per day',
      '1 watched platform (Hacker News)',
      'Manual build-in-public content creator',
      'Basic intent scoring',
      'Community support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Distribution OS',
    priceNgn: 25000,
    priceUsd: 29,
    priceNgnFormatted: '₦25,000 / mo',
    priceUsdFormatted: '$29 / mo',
    signalsPerDay: 100,
    seats: 1,
    popular: true,
    features: [
      '100 signals detected per day',
      'All 5 platforms (HN, GitHub, Reddit, X, Threads)',
      'Automated Git-to-content generation',
      'AI-powered personalized outreach drafts',
      'Full-funnel conversion analytics',
      'Instant notification webhooks',
    ],
  },
  business: {
    id: 'business',
    name: 'Business Team',
    priceNgn: 75000,
    priceUsd: 89,
    priceNgnFormatted: '₦75,000 / mo',
    priceUsdFormatted: '$89 / mo',
    signalsPerDay: 500,
    seats: 5,
    features: [
      '500 signals detected per day',
      '5 team member seats with RBAC',
      'Full REST & Webhook API access',
      'Priority AI intent scoring queue',
      'Custom keyword and negative filters',
      'Exportable CSV and CRM webhooks',
    ],
  },
  agency: {
    id: 'agency',
    name: 'Agency Enterprise',
    priceNgn: 250000,
    priceUsd: 299,
    priceNgnFormatted: '₦250,000 / mo',
    priceUsdFormatted: '$299 / mo',
    signalsPerDay: 99999,
    seats: 20,
    features: [
      'Unlimited daily signals detection',
      '20 collaborative client workspaces',
      'White-label distribution reports',
      'Dedicated sovereign cloud node',
      'Custom fine-tuned closer models',
      '1-on-1 distribution advisory with Jehu Nanpan',
    ],
  },
};

export type SignalTrackerSource = 'github' | 'reddit' | 'x';

export interface SignalTracker {
  id: string;
  userId: string;
  source: SignalTrackerSource;
  query: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

