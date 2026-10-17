import { generateImage } from '../lib/providers';

export async function generateMirageImages(
  prompt: string,
  style?: string,
  aspectRatio: string = '1:1',
  count: number = 3
) {
  if (!prompt || prompt.trim().length < 3) {
    throw new Error('Prompt required (minimum 3 characters)');
  }

  const dimensions =
    {
      '1:1': { width: 1024, height: 1024 },
      '4:5': { width: 1024, height: 1280 },
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
    }[aspectRatio] || { width: 1024, height: 1024 };

  const styleModifier = {
    cinematic: 'cinematic composition, dramatic volumetric lighting, sharp focus, 8k resolution, warm golds and deep void shadows',
    illustration: 'masterpiece digital art, intricate lines, clean cel shading, sacred geometry vectors, ethereal lighting',
    photorealistic: 'photorealistic 35mm lens, raw photograph, hyper-detailed textures, studio lighting, depth of field',
    'jade-art': 'Jadai Studios aesthetic, ancient-blue obsidian, brushed gold trim, Metatron geometry, highland mist',
    blueprint: 'architectural drafting schematic, isometric technical drawing, precise CAD lines, cyan and gold on dark vellum',
  }[style || 'cinematic'] || style || '';

  const prompt_used = styleModifier ? `${prompt.trim()}, ${styleModifier}` : prompt.trim();
  const images: string[] = [];
  let note: string | undefined;

  const total = Math.min(6, Math.max(1, count || 3));
  // Pollinations validates seed <= 2147483647 (Date.now() overflows it).
  const baseSeed = Math.floor(Math.random() * 2000000000);
  for (let i = 0; i < total; i++) {
    const seed = baseSeed + i * 9973 + Math.floor(Math.random() * 1000);
    let url = '';
    try {
      url = await generateImage(prompt_used, {
        ...dimensions,
        seed,
      });
    } catch (e: any) {
      if (e?.rateLimit) {
        // Free tier allows 1 image / 45s. Wait once so we always return at least
        // one real image when possible; then return whatever we have, honestly.
        const waitSec = Math.min(50, Math.max(5, Number(e.retryAfter) || 45));
        if (images.length === 0) {
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          try {
            url = await generateImage(prompt_used, { ...dimensions, seed });
          } catch {}
        }
        if (!url) {
          note = `Provider free-tier limit (1 image / 45s): returned ${images.length} of ${total}. Retry in ~${waitSec}s for more.`;
          break;
        }
      } else {
        throw e;
      }
    }
    if (url) images.push(url);
  }

  if (!images.length) {
    throw new Error(note || "PRIME's image engine is busy. Try again in 30 seconds.");
  }

  return { images, prompt_used, note };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, style, aspectRatio } = body;
    const data = await generateMirageImages(prompt, style, aspectRatio);
    return Response.json(data);
  } catch (err: any) {
    console.error('Mirage API generation error:', err);
    return Response.json(
      { error: err.message || "PRIME's image engine is busy. Try again in 30 seconds." },
      { status: 503 }
    );
  }
}
