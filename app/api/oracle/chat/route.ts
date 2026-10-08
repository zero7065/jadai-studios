import { generateText } from '@/lib/ai';
import { primeChatWithPersona, PrimePersona } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, history = [], userMemory = {}, persona = 'The Architect' } = body;

    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        {
          success: false,
          error: 'Missing required prompt parameter',
          code: 'MISSING_PARAMS',
        },
        { status: 400 }
      );
    }

    const { prompt: fullPrompt, systemPrompt } = primeChatWithPersona(
      userMemory,
      prompt,
      history,
      persona as PrimePersona
    );

    const result = await generateText(fullPrompt, {
      systemPrompt,
      moduleSlug: 'oracle',
      bypassCache: true,
    });

    return Response.json({
      success: true,
      data: {
        text: result.text,
        provider: result.provider,
        tokensUsed: result.tokensUsed,
      },
    });
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message || 'Oracle intelligence request failed',
        code: 'ORACLE_AI_ERROR',
      },
      { status: 500 }
    );
  }
}
