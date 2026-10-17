/**
 * Mirage Image Provider Chain
 * 0. OpenAI (gpt-image-1 → gpt-image-1-mini) — PRIMARY, server-side only (key never
 *    reaches the browser). Pauses itself automatically while quota is exhausted.
 * 1. Pollinations (free, instant, no key) — works from browser AND server
 * 2. fal.ai FLUX (if FAL_KEY set)
 * 3. Hugging Face FLUX (if HF_KEY set)
 */

type ProviderFn = (prompt: string, opts: any) => Promise<string>;

const OPENAI_IMAGE_MODELS = ['gpt-image-1', 'gpt-image-1-mini', 'dall-e-3'] as const;

function serverEnv(name: string): string | undefined {
  // Browser bundles must never read secrets — guard before touching process.env.
  if (typeof window !== 'undefined') return undefined;
  try {
    return typeof process !== 'undefined' ? process.env?.[name] : undefined;
  } catch {
    return undefined;
  }
}

async function openAIImageProvider(prompt: string, opts: any): Promise<string> {
  const { isOpenAIKey } = await import('../../../lib/config/envTrust');
  const { isOpenAIQuotaExhausted, reportOpenAIQuotaError } = await import('../../../lib/ai/openai');

  const apiKey = serverEnv('OPENAI_API_KEY');
  if (!isOpenAIKey(apiKey)) throw new Error('No OPENAI_API_KEY (or browser context)');
  if (isOpenAIQuotaExhausted()) throw new Error('OpenAI quota cooling down');

  const width = opts.width || 1024;
  const height = opts.height || 1024;
  // OpenAI image sizes are constrained to a supported set.
  const size =
    width === height
      ? '1024x1024'
      : width > height
        ? '1536x1024'
        : '1024x1536';

  let lastError: any = null;

  for (const model of OPENAI_IMAGE_MODELS) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          size,
          n: 1,
        }),
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        let parsed: any = null;
        try {
          parsed = JSON.parse(bodyText);
        } catch {}
        const code = parsed?.error?.code || '';
        const quota =
          code === 'insufficient_quota' ||
          code === 'credit_balance_exhausted' ||
          bodyText.includes('credit_balance_exhausted') ||
          bodyText.includes('insufficient_quota');
        const err: any = new Error(
          `OpenAI image failure (${model}): HTTP ${res.status} - ${parsed?.error?.message || bodyText}`
        );
        err.quota = quota;
        err.modelGone = res.status === 404;
        throw err;
      }

      const data = await res.json();
      const item = data?.data?.[0];
      if (item?.url) return item.url;
      if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
      throw new Error(`OpenAI image (${model}) returned no image data`);
    } catch (err: any) {
      lastError = err;
      if (err.quota) {
        reportOpenAIQuotaError(`images: ${err.message}`);
        break; // out of credits — no point trying other models
      }
      if (!err.modelGone && !String(err.message).includes('fetch')) break; // hard failure
    }
  }

  throw lastError || new Error('OpenAI image generation failed');
}

const PROVIDERS: ProviderFn[] = [
  // 0. OpenAI PRIMARY (server-side only — skips itself in the browser and while cooling down)
  openAIImageProvider,

  // 1. Pollinations (free, no key)
  async (prompt: string, opts: any) => {
    const width = opts.width || 1024;
    const height = opts.height || 1024;
    const rawSeed = Number(opts.seed) || Math.floor(Math.random() * 2000000000);
    const seed = Math.min(2147483647, Math.max(1, Math.floor(rawSeed)));
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&enhance=true&seed=${seed}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 402) {
        // FREE_LIMIT: 1 free image per 45s per IP. Surface retry timing to callers.
        let retryAfter = 45;
        try {
          const body = await res.json();
          const m = String(body?.error?.message || '').match(/Retry after (\d+)/i);
          if (m) retryAfter = parseInt(m[1], 10) + 2;
        } catch {}
        const err: any = new Error(`Pollinations free limit reached — retry in ~${retryAfter}s`);
        err.rateLimit = true;
        err.retryAfter = retryAfter;
        throw err;
      }
      throw new Error(`Pollinations failed (HTTP ${res.status})`);
    }
    return url;
  },

  // 2. fal.ai FLUX (if FAL_KEY set)
  async (prompt: string, opts: any) => {
    const falKey = serverEnv('FAL_KEY');
    if (!falKey) throw new Error('No FAL_KEY');
    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, image_size: opts.size || 'square_hd' }),
    });
    if (!res.ok) throw new Error('fal.ai failed');
    const data = await res.json();
    return data.images[0].url;
  },

  // 3. Hugging Face (if HF_KEY set)
  async (prompt: string, opts: any) => {
    const hfKey = serverEnv('HF_KEY');
    if (!hfKey) throw new Error('No HF_KEY');
    const res = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    if (!res.ok) throw new Error('HF failed');
    const blob = await res.blob();
    if (typeof window !== 'undefined' && typeof URL !== 'undefined' && URL.createObjectURL) {
      return URL.createObjectURL(blob);
    }
    const buffer = Buffer.from(await blob.arrayBuffer());
    return `data:${blob.type || 'image/png'};base64,${buffer.toString('base64')}`;
  },
];

export async function generateImage(prompt: string, opts: any = {}): Promise<string> {
  const options = {
    width: opts.width || 1024,
    height: opts.height || 1024,
    seed: opts.seed || Math.floor(Math.random() * 1000000),
    ...opts,
  };

  let rateLimitErr: any = null;
  for (const provider of PROVIDERS) {
    try {
      const url = await provider(prompt, options);
      if (url) return url;
    } catch (e: any) {
      if (e?.rateLimit) rateLimitErr = e;
      console.error('Provider failed, trying next:', e?.message || e);
    }
  }
  // Free-tier throttling is a distinct, recoverable condition — let callers retry.
  if (rateLimitErr) throw rateLimitErr;
  throw new Error('All image providers failed. Try again in a moment.');
}
