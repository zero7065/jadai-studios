import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import ResumeEditorPage from './page';
import { scoreResume } from './engine';

export const resumeEditorModule: JadaiModule = defineModule({
  slug: 'resume-editor',
  name: 'Architectural Resume Editor',
  description: 'Ruthless resume scoring, Pareto summarization, and executive voice rewriting.',
  icon: 'FileText',
  version: '1.1.0',
  status: 'active',
  requiredTier: 'foundation',
  component: ResumeEditorPage,
  routes: {
    page: '/resume-editor',
    api: {
      score: async ({ body }) => {
        const text = typeof body?.text === 'string' ? body.text : '';
        const score = scoreResume(text);

        // Optional AI rewrite of the weakest bullet.
        let aiRewrite: string | undefined;
        let provider: string | undefined;
        let tokensUsed: number | undefined;
        if (body?.rewriteWeak === true && score.weakBullets.length > 0) {
          try {
            const { generateText } = await import('../../lib/ai');
            const res = await generateText(
              `Rewrite this resume bullet to start with a strong action verb, include one quantified metric, and stay under 28 words. Return only the rewritten bullet.\n\n${score.weakBullets[0]}`,
              { moduleSlug: 'resume-editor' }
            );
            if (res.provider !== 'graceful_fallback') {
              aiRewrite = res.text.trim();
              provider = res.provider;
              tokensUsed = res.tokensUsed;
            }
          } catch {
            // Deterministic score stands on its own.
          }
        }

        return { success: true, data: { ...score, aiRewrite }, provider, tokensUsed };
      },
    },
  },
});

export default resumeEditorModule;
