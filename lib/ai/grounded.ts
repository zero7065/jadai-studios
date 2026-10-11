import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger';
import { isRealGeminiKey } from '../config/envTrust';

export interface GroundingSource {
  title?: string;
  url?: string;
  snippet?: string;
  sourceType: 'web' | 'map';
  placeAddress?: string;
  rating?: number;
}

export interface GroundedResponse {
  text: string;
  mode: 'search' | 'maps' | 'standard' | 'offline';
  sources: GroundingSource[];
  webSearchQueries?: string[];
  durationMs: number;
  modelUsed: string;
  /** True when no real grounding provider ran — clients MUST label the output. */
  offline?: boolean;
  offlineReason?: string;
}

export async function generateGroundedContent(
  prompt: string,
  options: {
    mode?: 'search' | 'maps' | 'standard';
    location?: { latitude: number; longitude: number };
    systemPrompt?: string;
    apiKey?: string;
  } = {}
): Promise<GroundedResponse> {
  const startTime = Date.now();
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  const mode = options.mode || 'search';

  if (!isRealGeminiKey(apiKey)) {
    // Honest offline: never fabricate citations or fake "live search" results.
    return getOfflineGroundedResponse(prompt, mode, startTime, 'Gemini API key not configured');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const model = 'gemini-3.8-flash';

  try {
    if (mode === 'maps') {
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (options.systemPrompt) {
        config.systemInstruction = options.systemPrompt;
      }

      if (options.location && options.location.latitude && options.location.longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: options.location.latitude,
              longitude: options.location.longitude,
            },
          },
        };
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response.text || 'No spatial intelligence returned.';
      const sources: GroundingSource[] = [];

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      for (const chunk of rawChunks as any[]) {
        if (chunk.maps) {
          sources.push({
            title: chunk.maps.title || 'Google Maps Location',
            url: chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title || prompt)}`,
            snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0] || 'Verified place listing and spatial coordinates.',
            sourceType: 'map',
            placeAddress: chunk.maps.address,
            rating: chunk.maps.rating,
          });
        }
      }

      return {
        text,
        mode: 'maps',
        sources,
        durationMs: Date.now() - startTime,
        modelUsed: model,
      };
    }

    if (mode === 'search') {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: options.systemPrompt || 'You are the Jadai Studios PRIME Grounded Truth Agent. Provide precise, fact-checked answers citing real-time web information, current events, and verified data.',
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || 'No verified web data returned.';
      const sources: GroundingSource[] = [];
      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const queries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      for (const chunk of rawChunks as any[]) {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Verified Web Source',
            url: chunk.web.uri,
            snippet: chunk.web.snippet || 'Real-time ground truth verification.',
            sourceType: 'web',
          });
        }
      }

      return {
        text,
        mode: 'search',
        sources,
        webSearchQueries: queries,
        durationMs: Date.now() - startTime,
        modelUsed: model,
      };
    }

    // Standard mode without tools
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: options.systemPrompt,
      },
    });

    return {
      text: response.text || '',
      mode: 'standard',
      sources: [],
      durationMs: Date.now() - startTime,
      modelUsed: model,
    };
  } catch (err: any) {
    logger.warn('Grounded Gemini call failed, returning honest offline response', { error: err.message, mode });
    return getOfflineGroundedResponse(prompt, mode, startTime, `Grounding provider error: ${err.message}`);
  }
}

/**
 * Honest degraded response. No invented sources, no fake "verified against live indexes"
 * claims — the caller sees offline:true and labels it for the user.
 */
function getOfflineGroundedResponse(
  prompt: string,
  mode: string,
  startTime: number,
  reason: string
): GroundedResponse {
  return {
    text: `GROUNDING OFFLINE — no live web verification ran for this request.\n\nYour query: "${prompt}"\n\nReason: ${reason}\n\nA GEMINI_API_KEY with search grounding is required for verified real-time citations. Until then, treat any answer you already have as unverified. You can still chat with PRIME via /oracle — chat runs on the Groq provider and is unaffected.`,
    mode: 'offline',
    sources: [],
    webSearchQueries: [],
    durationMs: Date.now() - startTime,
    modelUsed: 'none (offline)',
    offline: true,
    offlineReason: reason,
  };
}
