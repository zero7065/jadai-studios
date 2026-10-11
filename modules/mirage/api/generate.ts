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

  const total = Math.min(6, Math.max(1, count || 3));
  const baseSeed = Date.now();
  for (let i = 0; i < total; i++) {
    const seed = baseSeed + i * 9973 + Math.floor(Math.random() * 1000);
    const url = await generateImage(prompt_used, {
      ...dimensions,
      seed,
    });
    images.push(url);
  }

  return { images, prompt_used };
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
