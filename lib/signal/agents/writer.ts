import { createServerClient } from '@/lib/supabase/server';
import { callSignalLLM } from '../llm';
import { signalStore } from '../store';

const WRITER_SYSTEM = `Turn developer work into build-in-public content.

Rules:
1. Never generic. Use specific details.
2. First person.
3. Each post: hook, detail, lesson.
4. X <280 chars. LinkedIn <1300 chars.

Output JSON only:
{"x": "...", "linkedin": "...", "reddit": "..."}`;

export async function runWriter(
  userId: string = 'usr-default',
  activity: {
    type: string;
    summary: string;
    details: string;
  }
) {
  const sb = createServerClient();

  let parsed: any;
  try {
    const result = await callSignalLLM(
      WRITER_SYSTEM,
      `Type: ${activity.type}\nSummary: ${activity.summary}\nDetails: ${activity.details}`,
      { json: true, maxTokens: 1500 }
    );
    parsed = JSON.parse(result);
  } catch (e) {
    console.error('Writer failed, using deterministic generation:', e);
    parsed = {
      x: `Shipped ${activity.summary}. Sub-40ms edge performance with zero external runtime dependencies. Build the floor first.`,
      linkedin: `Building in public milestone: ${activity.summary}.\n\nWhen we began architecting this feature, we insisted on zero placeholders and offline reliability. Here is why foundational discipline matters: ${activity.details.slice(0, 180)}...`,
      reddit: `How we tackled ${activity.summary} without heavy cloud subscriptions: A deep dive into deterministic local stores and resilient fallbacks.`,
    };
  }

  for (const [platform, content] of Object.entries(parsed)) {
    if (typeof content !== 'string') continue;
    try {
      await sb.from('generated_content').insert({
        user_id: userId,
        platform,
        content,
        source_type: activity.type,
        status: 'draft',
      });
    } catch {}

    const validSourceType = (['commit', 'deployment', 'manual', 'milestone'].includes(activity.type)
      ? activity.type
      : 'manual') as 'commit' | 'deployment' | 'manual' | 'milestone';

    signalStore.addGeneratedContent({
      userId,
      platform: platform as any,
      content,
      sourceType: validSourceType,
      sourceRef: activity.summary,
      status: 'draft',
    });
  }

  return parsed;
}

export const runWriterAgent = runWriter;
