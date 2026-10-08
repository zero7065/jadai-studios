import { generateText } from '../../../../lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, systemPrompt, moduleSlug, bypassCache } = body;

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({
        success: false,
        error: 'Missing required prompt parameter',
        code: 'MISSING_PARAMS',
      }, { status: 400 });
    }

    const result = await generateText(prompt, {
      systemPrompt,
      moduleSlug: moduleSlug || 'oracle',
      bypassCache: Boolean(bypassCache),
    });

    return Response.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return Response.json({
      success: false,
      error: err.message || 'AI request failed',
      code: 'AI_ERROR',
    }, { status: 500 });
  }
}
