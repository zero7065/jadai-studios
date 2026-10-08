/**
 * Mirage Image Provider Chain
 * 1. Pollinations (free, instant, no key required)
 * 2. fal.ai FLUX (if FAL_KEY set)
 * 3. Hugging Face FLUX (if HF_KEY set)
 */

type ProviderFn = (prompt: string, opts: any) => Promise<string>;

const PROVIDERS: ProviderFn[] = [
  // 1. Pollinations (free, no key)
  async (prompt: string, opts: any) => {
    const width = opts.width || 1024;
    const height = opts.height || 1024;
    const seed = opts.seed || Date.now();
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&enhance=true&seed=${seed}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Pollinations failed');
    return url;
  },

  // 2. fal.ai FLUX (if FAL_KEY set)
  async (prompt: string, opts: any) => {
    const falKey = typeof process !== 'undefined' ? process.env?.FAL_KEY : undefined;
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
    const hfKey = typeof process !== 'undefined' ? process.env?.HF_KEY : undefined;
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

  for (const provider of PROVIDERS) {
    try {
      const url = await provider(prompt, options);
      if (url) return url;
    } catch (e) {
      console.error('Provider failed, trying next:', e);
    }
  }
  throw new Error('All image providers failed. Try again in a moment.');
}
