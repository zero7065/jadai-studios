// Shared image request helper for all visual tools (Mirage, Logo, Thumbnail, Creative).
// Server-first: POST /api/mirage/generate runs the provider chain (OpenAI → Pollinations
// → fal → HF). If the server is unreachable, falls back to building Pollinations URLs
// directly in the browser — images still generate, just via the free provider.

export interface ImageRequestOptions {
  width?: number;
  height?: number;
  seeds?: number[];
  /** Extra style suffix appended to the prompt (archetype modifiers, etc). */
  suffix?: string;
}

export interface ImageRequestResult {
  urls: string[];
  /** 'server' = provider chain ran server-side (OpenAI when available). 'browser' = Pollinations only. */
  source: 'server' | 'browser';
}

function pollinationsUrl(prompt: string, width: number, height: number, seed: number): string {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

// Exact dims → server aspect bucket (the server derives its generation dims from this).
const RATIO_BY_DIMS: Record<string, string> = {
  '1024x1024': '1:1',
  '1280x720': '16:9',
  '1024x1280': '4:5',
  '720x1280': '9:16',
};

function aspectBucket(width: number, height: number): string {
  const exact = RATIO_BY_DIMS[`${width}x${height}`];
  if (exact) return exact;
  if (width === height) return '1:1';
  if (width > height) return '16:9';
  // Portrait: closer to 4:5 (0.8) than 9:16 (0.5625)?
  return width / height >= 0.7 ? '4:5' : '9:16';
}

export async function requestImages(
  prompt: string,
  options: ImageRequestOptions = {}
): Promise<ImageRequestResult> {
  const width = options.width || 1024;
  const height = options.height || 1024;
  const fullPrompt = options.suffix ? `${prompt}${options.suffix}` : prompt;
  const count = options.seeds?.length || 3;
  const seeds =
    options.seeds || Array.from({ length: count }, () => Math.floor(Math.random() * 1_000_000));

  // --- Server chain first (OpenAI primary when key + credits exist) ---
  try {
    const res = await fetch('/api/mirage/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: fullPrompt,
        aspectRatio: aspectBucket(width, height),
        count: seeds.length,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.images) && data.images.length > 0) {
        return { urls: data.images, source: 'server' };
      }
    }
  } catch {
    // fall through to browser generation
  }

  // --- Browser fallback: free Pollinations provider ---
  return {
    urls: seeds.map((seed) => pollinationsUrl(fullPrompt, width, height, seed)),
    source: 'browser',
  };
}
