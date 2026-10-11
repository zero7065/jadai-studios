import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import GrowthMakerPage from './page';
import { buildGrowthPlan, GrowthInput } from './engine';

export const growthMakerModule: JadaiModule = defineModule({
  slug: 'growth-maker',
  name: 'Growth Strategy Engine',
  description: 'Autonomous growth roadmaps, conversion teardowns, and market penetration models.',
  icon: 'TrendingUp',
  version: '1.1.0',
  status: 'active',
  requiredTier: 'architecture',
  component: GrowthMakerPage,
  routes: {
    page: '/growth-maker',
    api: {
      strategy: async ({ body }) => {
        const input: GrowthInput = {
          product: typeof body?.product === 'string' ? body.product : '',
          audience: typeof body?.audience === 'string' ? body.audience : '',
          stage: body?.stage === 'launch' || body?.stage === 'scale' ? body.stage : 'idea',
          budget: body?.budget === 'lean' || body?.budget === 'funded' ? body.budget : 'zero',
          channels: Array.isArray(body?.channels) ? body.channels.filter((c: any) => typeof c === 'string') : [],
        };
        const plan = buildGrowthPlan(input);

        // Optional AI synthesis layered over the deterministic plan.
        let aiSummary: string | undefined;
        let provider: string | undefined;
        let tokensUsed: number | undefined;
        if (body?.aiSummary === true) {
          try {
            const { generateText } = await import('../../lib/ai');
            const res = await generateText(
              `You are a growth strategist. Given this plan skeleton, write a 4-sentence strategy summary naming the single biggest lever for a ${plan.stage}-stage product with ${plan.budget} budget.\n\nProduct: ${plan.product}\nAudience: ${plan.audience}\nPillars: ${plan.pillars.map((p) => p.name).join(', ')}\nChannels: ${plan.channels.map((c) => c.channel).join(', ')}`,
              { moduleSlug: 'growth-maker' }
            );
            if (res.provider !== 'graceful_fallback') {
              aiSummary = res.text;
              provider = res.provider;
              tokensUsed = res.tokensUsed;
            }
          } catch {
            // Deterministic plan stands on its own.
          }
        }

        return { success: true, data: { ...plan, aiSummary }, provider, tokensUsed };
      },
    },
  },
});

export default growthMakerModule;
