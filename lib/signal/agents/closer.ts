import { supabaseAdmin } from '../../supabase/admin';
import { callSignalLLM } from '../llm';
import { signalStore } from '../store';

function toDbUserId(userId: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    ? userId
    : null;
}

const CLOSER_SYSTEM = `You are an outreach specialist for Jadai Signal.

Given a signal (someone with a problem), write a personalized first message.

Rules:
1. Reference their specific words.
2. Do NOT pitch. Start a conversation.
3. DMs under 300 chars.
4. Include one specific detail from their post.
5. Do NOT mention your product in first message.
6. Sound like a builder, not a marketer.

Output JSON only:
{"message": "text", "approach": "conversational"|"helpful"|"curious"}`;

export async function runCloser(userId: string = 'usr-default', signalId: string) {
  const sb = supabaseAdmin;
  const dbUserId = toDbUserId(userId);

  let signal: any = null;
  try {
    const { data } = await sb
      .from('signals')
      .select('*')
      .eq('id', signalId)
      .maybeSingle();
    signal = data;
  } catch {}

  if (!signal) {
    const fromStore = signalStore.getSignals().find((s) => s.id === signalId);
    if (fromStore) {
      signal = {
        id: fromStore.id,
        platform: fromStore.platform,
        content: fromStore.content,
        author: fromStore.author,
      };
    }
  }

  if (!signal) return;

  let parsed: any;
  try {
    const result = await callSignalLLM(
      CLOSER_SYSTEM,
      `Platform: ${signal.platform}\nTheir words: "${signal.content}"\nAuthor: ${signal.author}`,
      { json: true, maxTokens: 400 }
    );
    parsed = JSON.parse(result);
  } catch (e) {
    console.error('Closer LLM failed:', e);
    parsed = {
      message: `Saw your note on ${signal.platform} regarding the tooling friction. Encountered the same bottleneck recently — happy to share how we addressed it if helpful.`,
      approach: 'helpful',
    };
  }

  try {
    await sb.from('outreach_drafts').insert({
      user_id: dbUserId,
      signal_id: signalId,
      platform: signal.platform,
      message: parsed.message,
      approach: parsed.approach,
      status: 'draft',
    });
  } catch {}

  try {
    await sb.from('signal_analytics').insert({
      user_id: dbUserId,
      signal_id: signalId,
      event_type: 'message_drafted',
    });
  } catch {}

  // Also add to local store for synchronous rendering
  signalStore.addDraft({
    userId,
    signalId,
    platform: signal.platform,
    message: parsed.message,
    approach: parsed.approach,
    charCount: parsed.message.length,
    status: 'draft',
  });

  return parsed;
}

export const runCloserAgent = (signalId: string) => runCloser('usr-default', signalId);
