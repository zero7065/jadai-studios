import { GoogleGenAI } from '@google/genai';

interface ProviderConfig {
  name: 'groq' | 'gemini';
  baseUrl?: string;
  model: string;
  maxPerDay: number;
}

const PROVIDERS: ProviderConfig[] = [
  {
    name: 'gemini',
    model: 'gemini-3.8-flash',
    maxPerDay: 5000,
  },
  {
    name: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    maxPerDay: 14400,
  },
];

let currentProviderIndex = 0;
const requestCounts: Record<string, number> = {};

export async function callSignalLLM(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  for (let attempt = 0; attempt < PROVIDERS.length; attempt++) {
    const provider = PROVIDERS[currentProviderIndex];
    const today = new Date().toISOString().split('T')[0];
    const key = `${provider.name}-${today}`;

    if ((requestCounts[key] || 0) >= provider.maxPerDay) {
      currentProviderIndex = (currentProviderIndex + 1) % PROVIDERS.length;
      continue;
    }

    try {
      // 1. Gemini via @google/genai SDK
      if (provider.name === 'gemini') {
        if (!geminiKey || geminiKey.startsWith('[SET_IN_') || geminiKey.trim() === '') {
          currentProviderIndex = (currentProviderIndex + 1) % PROVIDERS.length;
          continue;
        }

        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: { 'User-Agent': 'aistudio-build' },
          },
        });

        const response = await ai.models.generateContent({
          model: provider.model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: options?.temperature ?? 0.7,
            responseMimeType: 'application/json',
          },
        });

        requestCounts[key] = (requestCounts[key] || 0) + 1;
        return response.text || '{}';
      }

      // 2. Groq via fetch (OpenAI format)
      if (provider.name === 'groq') {
        if (!groqKey || groqKey.startsWith('[SET_IN_') || groqKey.trim() === '') {
          currentProviderIndex = (currentProviderIndex + 1) % PROVIDERS.length;
          continue;
        }

        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 2000,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) throw new Error(`Groq HTTP error: ${response.statusText}`);
        requestCounts[key] = (requestCounts[key] || 0) + 1;
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '{}';
      }
    } catch (error) {
      console.warn(`Signal LLM provider ${provider.name} failed, failing over:`, error);
      currentProviderIndex = (currentProviderIndex + 1) % PROVIDERS.length;
    }
  }

  // Graceful deterministic fallback if all external providers are offline/unset
  return getSimulatedLLMResponse(systemPrompt, userPrompt);
}

function getSimulatedLLMResponse(systemPrompt: string, userPrompt: string): string {
  // If Scout Agent prompt
  if (systemPrompt.includes('signal detection') || systemPrompt.includes('intentScore')) {
    const isHighIntent =
      userPrompt.includes('looking for') ||
      userPrompt.includes('need tool') ||
      userPrompt.includes('how do I') ||
      userPrompt.includes('problem') ||
      userPrompt.includes('alternative to');

    const score = isHighIntent ? 85 : 55;
    return JSON.stringify({
      intentScore: score,
      reason: isHighIntent
        ? 'Author is explicitly expressing pain and looking for a dedicated solution.'
        : 'Author has mild frustration with current distribution workflows.',
      suggestedAngle: 'Acknowledge the specific bottleneck and share how sovereign automation solves it without marketing noise.',
    });
  }

  // If Closer Agent prompt
  if (systemPrompt.includes('outreach specialist') || systemPrompt.includes('Under 300 characters')) {
    return JSON.stringify({
      message: 'Saw your note about distribution friction on developer tools. Ran into the exact same wall last month before building an automated signal tracker. How are you currently finding early users?',
      approach: 'conversational',
    });
  }

  // If Writer Agent prompt
  if (systemPrompt.includes('Visibility Engine') || systemPrompt.includes('build-in-public')) {
    return JSON.stringify({
      x: 'Shipped a new zero-latency distribution radar for developers today. Detecting intent before competitors even notice the forum post. Build the floor first.',
      linkedin: 'Most technical founders fail not because their code is bad, but because distribution is treated as an afterthought. We just automated the entire signal-to-outreach loop.',
      reddit: 'Built an open signal detector that catches unmet developer needs across HN and GitHub without marketing fluff.',
    });
  }

  return JSON.stringify({ result: 'Processed with sovereign fallback engine.' });
}
