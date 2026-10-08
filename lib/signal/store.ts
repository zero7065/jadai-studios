import {
  Signal,
  OutreachDraft,
  GeneratedContent,
  SignalSettings,
  SignalAnalyticsEvent,
  SignalPlatform,
  SignalPlanTier,
  SIGNAL_PLANS,
  SignalTracker,
} from './types';

// Real signals start empty until connected accounts sync or scout scan is initiated
const INITIAL_SIGNALS: Signal[] = [];

// Real drafts start empty until generated
const INITIAL_DRAFTS: OutreachDraft[] = [];

// Real generated content starts empty until generated
const INITIAL_CONTENT: GeneratedContent[] = [];

const INITIAL_TRACKERS: SignalTracker[] = [
  { id: 'trk-1', userId: 'usr-default', source: 'github', query: 'jadai-studios/core', active: true, createdAt: new Date().toISOString() },
  { id: 'trk-2', userId: 'usr-default', source: 'reddit', query: 'r/SaaS', active: true, createdAt: new Date().toISOString() },
  { id: 'trk-3', userId: 'usr-default', source: 'x', query: '#buildinpublic', active: true, createdAt: new Date().toISOString() },
];

const INITIAL_SETTINGS: SignalSettings = {
  id: 'set-default',
  userId: 'usr-default',
  plan: 'pro',
  signalsUsedToday: 6,
  signalsUsedThisMonth: 142,
  dailyLimit: 100,
  monthlyLimit: 3000,
  platformsWatched: ['hackernews', 'github', 'reddit', 'x', 'threads'],
  keywords: ['no tool for', 'looking for solution', 'how do I find users', 'distribution problem', 'PostgreSQL outage', 'build in public'],
  excludedKeywords: ['crypto token', 'nft airdrop', 'forex bot'],
  autoDraftOutreach: true,
  autoDraftContent: true,
  notificationEmail: true,
  githubConnected: true,
  vercelConnected: true,
  xConnected: false,
};

// Memory cache that synchronizes with localStorage on the browser
class SignalStore {
  private signals: Signal[] = INITIAL_SIGNALS;
  private drafts: OutreachDraft[] = INITIAL_DRAFTS;
  private content: GeneratedContent[] = INITIAL_CONTENT;
  private settings: SignalSettings = INITIAL_SETTINGS;
  private trackers: SignalTracker[] = INITIAL_TRACKERS;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedSig = localStorage.getItem('jadai_signals');
        if (storedSig) this.signals = JSON.parse(storedSig);

        const storedDrf = localStorage.getItem('jadai_signal_drafts');
        if (storedDrf) this.drafts = JSON.parse(storedDrf);

        const storedCnt = localStorage.getItem('jadai_signal_content');
        if (storedCnt) this.content = JSON.parse(storedCnt);

        const storedSet = localStorage.getItem('jadai_signal_settings');
        if (storedSet) this.settings = JSON.parse(storedSet);

        const storedTrk = localStorage.getItem('jadai_signal_trackers');
        if (storedTrk) this.trackers = JSON.parse(storedTrk);
      } catch {
        // Fallback to initial seeds
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jadai_signals', JSON.stringify(this.signals));
        localStorage.setItem('jadai_signal_drafts', JSON.stringify(this.drafts));
        localStorage.setItem('jadai_signal_content', JSON.stringify(this.content));
        localStorage.setItem('jadai_signal_settings', JSON.stringify(this.settings));
        localStorage.setItem('jadai_signal_trackers', JSON.stringify(this.trackers));
      } catch {
        // Non-blocking
      }
    }
  }

  // Trackers
  getTrackers(): SignalTracker[] {
    return [...this.trackers];
  }

  addTracker(tracker: Omit<SignalTracker, 'id' | 'createdAt'>): SignalTracker {
    const newTrk: SignalTracker = {
      ...tracker,
      id: `trk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.trackers = [newTrk, ...this.trackers];
    this.persist();
    return newTrk;
  }

  updateTracker(id: string, updates: Partial<SignalTracker>): SignalTracker | undefined {
    const idx = this.trackers.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.trackers[idx] = { ...this.trackers[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.trackers[idx];
    }
    return undefined;
  }

  deleteTracker(id: string): boolean {
    const initialLen = this.trackers.length;
    this.trackers = this.trackers.filter((t) => t.id !== id);
    if (this.trackers.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  toggleTracker(id: string): SignalTracker | undefined {
    const trk = this.trackers.find((t) => t.id === id);
    if (trk) {
      return this.updateTracker(id, { active: !trk.active });
    }
    return undefined;
  }

  // Signals
  getSignals(): Signal[] {
    return [...this.signals];
  }

  getSignalById(id: string): Signal | undefined {
    return this.signals.find((s) => s.id === id);
  }

  addSignal(signal: Omit<Signal, 'id' | 'detectedAt'> & { id?: string }): Signal {
    const newSig: Signal = {
      ...signal,
      id: signal.id || `sig-${Date.now()}`,
      detectedAt: 'Just now',
    };
    this.signals = [newSig, ...this.signals];
    this.settings.signalsUsedToday += 1;
    this.settings.signalsUsedThisMonth += 1;
    this.persist();
    return newSig;
  }

  async runImmediateScout() {
    const newMock: Signal = {
      id: `sig-${Date.now()}`,
      userId: 'usr-default',
      platform: 'hackernews',
      sourceUrl: `https://news.ycombinator.com/item?id=${Date.now()}`,
      author: 'founding_engineer',
      content: 'Struggling to find an automated tool for database reliability audits before merging pull requests. Any recommendations?',
      intentScore: 89,
      reason: 'Author articulating concrete workflow bottleneck seeking automated reliability audits.',
      suggestedAngle: 'Introduce Sentinel automated Core Web Vitals and database migration scanners.',
      status: 'new',
      detectedAt: 'Just now',
    };
    this.signals = [newMock, ...this.signals];
    this.persist();
    return { savedCount: 1, signals: this.signals };
  }

  updateSignalStatus(id: string, status: Signal['status']) {
    this.signals = this.signals.map((s) => (s.id === id ? { ...s, status } : s));
    this.persist();
  }

  deleteSignal(id: string) {
    this.signals = this.signals.filter((s) => s.id !== id);
    this.persist();
  }

  // Drafts
  getDrafts(): OutreachDraft[] {
    return [...this.drafts];
  }

  getDraftBySignalId(signalId: string): OutreachDraft | undefined {
    return this.drafts.find((d) => d.signalId === signalId);
  }

  addDraft(draft: Omit<OutreachDraft, 'id' | 'createdAt'> & { charCount?: number }): OutreachDraft {
    const newDraft: OutreachDraft = {
      userId: draft.userId,
      signalId: draft.signalId,
      platform: draft.platform,
      message: draft.message,
      approach: draft.approach,
      status: draft.status,
      id: `drf-${Date.now()}`,
      createdAt: 'Just now',
    };
    this.drafts = [newDraft, ...this.drafts];
    this.persist();
    return newDraft;
  }

  updateDraft(id: string, updates: Partial<OutreachDraft>) {
    this.drafts = this.drafts.map((d) => (d.id === id ? { ...d, ...updates } : d));
    this.persist();
  }

  // Generated Content
  getContent(): GeneratedContent[] {
    return [...this.content];
  }

  addGeneratedContent(item: Omit<GeneratedContent, 'id' | 'createdAt'>): GeneratedContent {
    return this.addContent(item);
  }

  addContent(item: Omit<GeneratedContent, 'id' | 'createdAt'>): GeneratedContent {
    const newItem: GeneratedContent = {
      ...item,
      id: `cnt-${Date.now()}`,
      createdAt: 'Just now',
    };
    this.content = [newItem, ...this.content];
    this.persist();
    return newItem;
  }

  updateContent(id: string, updates: Partial<GeneratedContent>) {
    this.content = this.content.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.persist();
  }

  deleteContent(id: string) {
    this.content = this.content.filter((c) => c.id !== id);
    this.persist();
  }

  // Settings & Tiers
  getSettings(): SignalSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<SignalSettings>): SignalSettings {
    this.settings = { ...this.settings, ...updates };
    const planConfig = SIGNAL_PLANS[this.settings.plan];
    if (planConfig) {
      this.settings.dailyLimit = planConfig.signalsPerDay;
    }
    this.persist();
    return { ...this.settings };
  }

  setPlan(plan: SignalPlanTier) {
    this.updateSettings({ plan });
  }

  // Analytics
  getAnalyticsSummary() {
    const totalSignals = this.signals.length;
    const contacted = this.signals.filter((s) => s.status === 'contacted' || s.status === 'replied' || s.status === 'converted').length;
    const replied = this.signals.filter((s) => s.status === 'replied' || s.status === 'converted').length;
    const converted = this.signals.filter((s) => s.status === 'converted').length;

    const platformCounts: Record<SignalPlatform, number> = {
      hackernews: 0,
      github: 0,
      reddit: 0,
      x: 0,
      threads: 0,
      web: 0,
    };

    for (const s of this.signals) {
      platformCounts[s.platform] = (platformCounts[s.platform] || 0) + 1;
    }

    return {
      totalSignals,
      messagesSent: contacted,
      replies: replied,
      conversions: converted,
      funnel: [
        { label: 'Signals Detected', count: totalSignals, rate: '100%' },
        { label: 'Outreach Sent', count: contacted, rate: totalSignals > 0 ? `${Math.round((contacted / totalSignals) * 100)}%` : '0%' },
        { label: 'Replies Received', count: replied, rate: contacted > 0 ? `${Math.round((replied / contacted) * 100)}%` : '0%' },
        { label: 'Conversions', count: converted, rate: replied > 0 ? `${Math.round((converted / replied) * 100)}%` : '0%' },
      ],
      platformCounts,
    };
  }

  resetAll() {
    this.signals = INITIAL_SIGNALS;
    this.drafts = INITIAL_DRAFTS;
    this.content = INITIAL_CONTENT;
    this.settings = INITIAL_SETTINGS;
    this.persist();
  }
}

export const signalStore = new SignalStore();
