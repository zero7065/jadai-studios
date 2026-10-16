import { supabaseAdmin } from '../../supabase/admin';
import { callSignalLLM } from '../llm';
import { generateEmbedding } from '../embedding';
import { fetchHackerNews } from '../fetchers/hackernews';
import { fetchGitHub } from '../fetchers/github';
import { fetchReddit } from '../fetchers/reddit';
import { runCloser } from './closer';
import { signalStore } from '../store';
import { SignalPlatform } from '../types';

// user_profiles.id is UUID; 'usr-default' would violate the FK. Store NULL
// instead so the row inserts cleanly (single-user workspace default).
function toDbUserId(userId: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    ? userId
    : null;
}

const SCOUT_SYSTEM = `You are a signal detection agent. Analyze the given content and determine if the author has an unmet need that a developer tool could solve.

Score intent 0-100:
- 0-30: General discussion
- 31-60: Mild frustration
- 61-85: Clear pain point
- 86-100: Directly asking for a solution

Output JSON only:
{"intentScore": number, "reason": "one sentence", "suggestedAngle": "how a tool could help"}

Be conservative. Only score high for explicit pain.`;

export async function runScout(userId: string = 'usr-default') {
  const sb = supabaseAdmin;
  const dbUserId = toDbUserId(userId);

  // Load settings (with store fallback)
  let settings: any = null;
  try {
    const { data } = await sb
      .from('signal_settings')
      .select('*')
      .eq('user_id', dbUserId)
      .maybeSingle();
    settings = data;
  } catch (e) {
    console.warn('Scout DB settings read failed, using store defaults:', e);
  }

  if (!settings) {
    const storeSettings = signalStore.getSettings();
    settings = {
      user_id: userId,
      daily_limit: storeSettings.dailyLimit || 10,
      platforms_watched: storeSettings.platformsWatched || ['hackernews', 'github', 'reddit'],
      keywords: storeSettings.keywords || ['looking for tool', 'need help with', 'how do I', 'recommend a'],
      excluded_keywords: storeSettings.excludedKeywords || [],
      auto_draft_outreach: storeSettings.autoDraftOutreach ?? true,
    };
    try {
      await sb.from('signal_settings').upsert({ user_id: dbUserId }).select();
    } catch {}
  }

  // Load this user's active trackers — each one becomes a dedicated crawl
  // watch (github → GitHub issues, reddit → Reddit search, x → HN+Reddit
  // keyword fallback since the X API isn't connected yet).
  let trackers: any[] = [];
  try {
    let tq = sb.from('signal_trackers').select('id, source, query');
    tq = dbUserId ? tq.eq('user_id', dbUserId) : tq.is('user_id', null);
    const { data } = await tq.eq('active', true).limit(50);
    trackers = data || [];
  } catch (e) {
    console.warn('Scout tracker load failed:', e);
  }

  // Check daily limit
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let todayCount = 0;
  try {
    const { count } = await sb
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', dbUserId)
      .gte('created_at', todayStart.toISOString());
    todayCount = count || 0;
  } catch {
    todayCount = 0;
  }

  if (todayCount >= (settings.daily_limit || 10)) {
    console.log(`User ${userId} hit daily limit`);
    return { userId, savedCount: 0, status: 'limit_reached' };
  }

  const platforms = settings.platforms_watched || ['hackernews', 'github', 'reddit'];
  const keywords = (settings.keywords && settings.keywords.length > 0)
    ? settings.keywords
    : ['looking for tool', 'need help with', 'how do I', 'recommend a'];
  const excluded = settings.excluded_keywords || [];

  // Build the crawl worklist: settings keywords × platforms, plus one watch
  // per active tracker (tracker queries are the paid continuous-monitoring
  // product — they get first priority in the list).
  type Watch = { platform: SignalPlatform; query: string; trackerId?: string };
  const watches: Watch[] = [];
  for (const t of trackers) {
    const q = String(t.query || '').trim();
    if (!q) continue;
    if (t.source === 'github') {
      watches.push({ platform: 'github', query: q, trackerId: t.id });
    } else if (t.source === 'reddit') {
      watches.push({ platform: 'reddit', query: q.replace(/^r\//i, ''), trackerId: t.id });
    } else if (t.source === 'x') {
      // No X API connected — honest fallback: watch the hashtag/handle as a
      // keyword across HN + Reddit so the tracker still harvests something.
      watches.push({ platform: 'hackernews', query: q, trackerId: t.id });
      watches.push({ platform: 'reddit', query: q, trackerId: t.id });
    }
  }
  for (const platform of platforms) {
    for (const keyword of keywords) {
      watches.push({ platform, query: keyword });
    }
  }

  let savedCount = 0;
  const maxSignals = (settings.daily_limit || 10) - todayCount;

  for (const w of watches.slice(0, 40)) {
    if (savedCount >= maxSignals) break;

    try {
      let posts: any[] = [];
      if (w.platform === 'hackernews') posts = await fetchHackerNews(w.query);
      else if (w.platform === 'github') posts = await fetchGitHub(w.query);
      else if (w.platform === 'reddit') posts = await fetchReddit(w.query);

      for (const post of posts) {
        if (savedCount >= maxSignals) break;

        // Skip if excluded keywords present
        const lower = post.content.toLowerCase();
        if (excluded.some((e: string) => lower.includes(e.toLowerCase()))) continue;

        // Skip if already exists in DB or store
        try {
          const { data: existing } = await sb
            .from('signals')
            .select('id')
      .eq('user_id', dbUserId)
            .eq('source_url', post.url)
            .maybeSingle();
          if (existing) continue;
        } catch {}

        const existsInStore = signalStore.getSignals().some((s) => s.sourceUrl === post.url);
        if (existsInStore) continue;

        // Score intent
        let parsed: any;
        try {
          const result = await callSignalLLM(
            SCOUT_SYSTEM,
            `Platform: ${w.platform}\nContent: ${post.content}\nURL: ${post.url}`,
            { json: true, maxTokens: 300 }
          );
          parsed = JSON.parse(result);
        } catch (e) {
          console.error('Scout LLM failed:', e);
          continue;
        }

        if (!parsed.intentScore || parsed.intentScore < 30) continue;

        // Generate embedding
        let embedding: number[] = [];
        try {
          embedding = await generateEmbedding(post.content);
        } catch (e) {
          console.error('Embedding failed:', e);
        }

        // Save signal to DB
        let createdSignalId = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        try {
          const { data: signal, error } = await sb.from('signals').insert({
            user_id: dbUserId,
            platform: w.platform,
            source_url: post.url,
            author: post.author,
            author_handle: post.authorHandle || post.author,
            content: post.content,
            intent_score: parsed.intentScore,
            reason: parsed.reason,
            suggested_angle: parsed.suggestedAngle,
            embedding: embedding.length === 1536 ? embedding : null,
          }).select().single();

          if (!error && signal?.id) {
            createdSignalId = signal.id;
          } else if (error) {
            console.warn('Signal DB insert failed:', error.message);
          }
        } catch (insertErr) {
          console.warn('DB signal insert fallback to memory:', insertErr);
        }

        // Also add to local store for synchronous instant UI reflection
        signalStore.addSignal({
          id: createdSignalId,
          userId,
          platform: w.platform,
          sourceUrl: post.url,
          author: post.author,
          content: post.content,
          intentScore: parsed.intentScore,
          reason: parsed.reason,
          suggestedAngle: parsed.suggestedAngle,
          status: 'new',
          embedding,
        });

        savedCount++;

        // Log analytics — tracker attribution lets the trackers UI show
        // per-tracker hit counts (GET /trackers reads these events).
        try {
          await sb.from('signal_analytics').insert({
            user_id: dbUserId,
            signal_id: createdSignalId,
            event_type: 'signal_found',
            metadata: {
              platform: w.platform,
              score: parsed.intentScore,
              ...(w.trackerId ? { tracker_id: w.trackerId } : {}),
            },
          });
        } catch {}

        // Auto-draft outreach
        if (settings.auto_draft_outreach) {
          try {
            await runCloser(userId, createdSignalId);
          } catch (e) {
            console.error('Closer failed:', e);
          }
        }
      }
    } catch (e) {
      console.error(`Scout ${w.platform} failed:`, e);
    }
  }

  console.log(`Scout completed for ${userId}: ${savedCount} signals saved (${trackers.length} trackers watched)`);
  return { userId, savedCount, trackersWatched: trackers.length };
}

export const runScoutForUser = runScout;
