import { Router } from 'express';
import { signalStore } from './store';
import { runScoutForUser } from './agents/scout';
import { runCloserAgent } from './agents/closer';
import { runWriterAgent } from './agents/writer';
import { initializePaystackTransaction } from '../paystack';
import { SIGNAL_PLANS, SignalPlanTier } from './types';

export const signalRouter = Router();

// ---------------------------------------------------------------------------
// 1. SIGNALS
// ---------------------------------------------------------------------------
signalRouter.get('/signals', (req, res) => {
  const platform = req.query.platform as string;
  const status = req.query.status as string;

  let signals = signalStore.getSignals();
  if (platform && platform !== 'all') {
    signals = signals.filter((s) => s.platform === platform);
  }
  if (status && status !== 'all') {
    signals = signals.filter((s) => s.status === status);
  }

  res.json({ success: true, signals });
});

signalRouter.get('/signals/:id', (req, res) => {
  const signal = signalStore.getSignalById(req.params.id);
  if (!signal) {
    return res.status(404).json({ success: false, error: 'Signal not found' });
  }

  const draft = signalStore.getDraftBySignalId(signal.id);
  res.json({ success: true, signal, draft });
});

signalRouter.post('/signals/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }

  signalStore.updateSignalStatus(req.params.id, status);
  res.json({ success: true, message: `Signal status updated to ${status}` });
});

signalRouter.delete('/signals/:id', (req, res) => {
  signalStore.deleteSignal(req.params.id);
  res.json({ success: true, message: 'Signal removed' });
});

// ---------------------------------------------------------------------------
// 2. DRAFTS
// ---------------------------------------------------------------------------
signalRouter.get('/drafts', (req, res) => {
  res.json({ success: true, drafts: signalStore.getDrafts() });
});

signalRouter.post('/drafts/:id', (req, res) => {
  signalStore.updateDraft(req.params.id, req.body);
  res.json({ success: true, message: 'Draft updated' });
});

signalRouter.post('/drafts/generate', async (req, res) => {
  const { signalId } = req.body;
  if (!signalId) {
    return res.status(400).json({ success: false, error: 'signalId required' });
  }

  const draft = await runCloserAgent(signalId);
  res.json({ success: true, draft });
});

// ---------------------------------------------------------------------------
// 3. GENERATED CONTENT (BUILD IN PUBLIC)
// ---------------------------------------------------------------------------
signalRouter.get('/content', (req, res) => {
  res.json({ success: true, content: signalStore.getContent() });
});

signalRouter.post('/content', (req, res) => {
  const { platform, content, sourceType, sourceRef } = req.body;
  if (!platform || !content) {
    return res.status(400).json({ success: false, error: 'platform and content required' });
  }

  const item = signalStore.addContent({
    userId: 'usr-default',
    platform,
    content,
    sourceType: sourceType || 'manual',
    sourceRef,
    status: 'draft',
  });

  res.json({ success: true, item });
});

signalRouter.post('/content/:id', (req, res) => {
  signalStore.updateContent(req.params.id, req.body);
  res.json({ success: true, message: 'Content updated' });
});

signalRouter.delete('/content/:id', (req, res) => {
  signalStore.deleteContent(req.params.id);
  res.json({ success: true, message: 'Content removed' });
});

// ---------------------------------------------------------------------------
// 3.5. TRACKERS (github | reddit | x)
// ---------------------------------------------------------------------------
signalRouter.get('/trackers', (req, res) => {
  res.json({ success: true, trackers: signalStore.getTrackers() });
});

signalRouter.post('/trackers', (req, res) => {
  const { source, query } = req.body;
  if (!source || !['github', 'reddit', 'x'].includes(source) || !query) {
    return res.status(400).json({ success: false, error: 'Valid source (github | reddit | x) and query required' });
  }

  const tracker = signalStore.addTracker({
    userId: 'usr-default',
    source,
    query: query.trim(),
    active: true,
  });

  res.json({ success: true, tracker });
});

signalRouter.post('/trackers/:id/toggle', (req, res) => {
  const updated = signalStore.toggleTracker(req.params.id);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Tracker not found' });
  }
  res.json({ success: true, tracker: updated });
});

signalRouter.delete('/trackers/:id', (req, res) => {
  const removed = signalStore.deleteTracker(req.params.id);
  res.json({ success: true, removed });
});

// ---------------------------------------------------------------------------
// 4. ANALYTICS & SETTINGS
// ---------------------------------------------------------------------------
signalRouter.get('/analytics', (req, res) => {
  res.json({ success: true, data: signalStore.getAnalyticsSummary() });
});

signalRouter.get('/settings', (req, res) => {
  res.json({ success: true, settings: signalStore.getSettings() });
});

signalRouter.post('/settings', (req, res) => {
  const updated = signalStore.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

// ---------------------------------------------------------------------------
// 5. PAYSTACK SUBSCRIPTION (SEPARATE FROM STUDIO)
// ---------------------------------------------------------------------------
signalRouter.post('/subscribe', async (req, res) => {
  const { planTier, currency, email } = req.body;
  const tierKey = (planTier || 'pro').toLowerCase() as SignalPlanTier;
  const plan = SIGNAL_PLANS[tierKey];

  if (!plan) {
    return res.status(400).json({ success: false, error: 'Invalid Signal plan tier' });
  }

  if (tierKey === 'free') {
    signalStore.setPlan('free');
    return res.json({ success: true, message: 'Switched to Free Radar tier', plan: 'free' });
  }

  const amountKobo = (currency === 'USD' ? plan.priceUsd * 100 : plan.priceNgn * 100);

  try {
    const transaction = await initializePaystackTransaction({
      email: email || 'architect@jadai.dev',
      amountKobo,
      currency: currency || 'NGN',
      callbackUrl: `${process.env.APP_URL || 'https://jadai.dev'}/signal/pricing?status=success&tier=${tierKey}`,
      metadata: {
        product: 'jadai_signal',
        signal_tier: tierKey,
        is_signal_subscription: true,
      },
    });

    // Update locally
    signalStore.setPlan(tierKey);

    res.json({
      ...transaction,
      plan: tierKey,
      message: `Paystack checkout initialized for Jadai Signal ${plan.name}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 6. WORKER & CRON TRIGGER ENDPOINTS
// ---------------------------------------------------------------------------
const handleScoutWorker = async (req: any, res: any) => {
  const auth = req.headers?.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth && auth !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await runScoutForUser();
    res.json({ success: true, message: 'Scout agent run completed', result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

signalRouter.get('/scout', handleScoutWorker);
signalRouter.post('/scout', handleScoutWorker);
signalRouter.get('/worker/scout', handleScoutWorker);
signalRouter.post('/worker/scout', handleScoutWorker);

const handleWriterWorker = async (req: any, res: any) => {
  const { summary, details, type } = req.body || {};
  try {
    const items = await runWriterAgent('usr-default', {
      type: type || 'commit',
      summary: summary || 'Shipped new low-latency intent detection engine',
      details: details || 'Compressed multi-platform polling into a single resilient LLM gateway.',
    });
    res.json({ success: true, message: 'Writer agent drafted social posts', items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

signalRouter.get('/writer', handleWriterWorker);
signalRouter.post('/writer', handleWriterWorker);
signalRouter.get('/worker/writer', handleWriterWorker);
signalRouter.post('/worker/writer', handleWriterWorker);

const handleCloserWorker = async (req: any, res: any) => {
  const signalId = req.body?.signalId || req.query?.signalId;
  try {
    const draft = await runCloserAgent(signalId);
    res.json({ success: true, draft });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

signalRouter.get('/closer', handleCloserWorker);
signalRouter.post('/closer', handleCloserWorker);
signalRouter.get('/worker/closer', handleCloserWorker);
signalRouter.post('/worker/closer', handleCloserWorker);
