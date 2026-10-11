import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import OracleModulePage from './page';

export const oracleModule: JadaiModule = defineModule({
  slug: 'oracle',
  name: 'PRIME Oracle',
  description: 'High-bandwidth AI intelligence advisor trained on architectural strategy, logic, and existential reasoning.',
  icon: 'Eye',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: OracleModulePage,
  routes: {
    page: '/oracle',
    api: {
      chat: async ({ body }) => {
        const prompt =
          typeof body?.prompt === 'string'
            ? body.prompt.trim()
            : typeof body?.message === 'string'
              ? body.message.trim()
              : '';
        if (!prompt) return { status: 400, success: false, error: 'prompt is required' };
        try {
          const { generateText } = await import('../../lib/ai');
          const res = await generateText(prompt, {
            systemPrompt:
              'You are PRIME, the Jadai Studios Oracle — a high-bandwidth intelligence advisor. ' +
              'Reason from first principles with architectural strategy, logic, and existential rigor. ' +
              'Be direct and precise; no filler, no hedging.',
            moduleSlug: 'oracle',
          });
          if (res.provider === 'graceful_fallback') {
            return {
              status: 503,
              success: false,
              error: res.error || 'AI providers unavailable',
              data: { fallbackText: res.text },
            };
          }
          return {
            success: true,
            data: { message: res.text },
            provider: res.provider,
            fallbackTriggered: res.fallbackTriggered,
          };
        } catch (err: any) {
          return { status: 500, success: false, error: err.message || 'Oracle chat failed' };
        }
      },
    },
  },
});

export default oracleModule;
