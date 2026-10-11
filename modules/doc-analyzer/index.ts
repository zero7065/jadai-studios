import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import DocAnalyzerPage from './page';
import { analyzeDocument } from './engine';

export const docAnalyzerModule: JadaiModule = defineModule({
  slug: 'doc-analyzer',
  name: 'Document Intelligence Analyzer',
  description: 'Deep extraction, bias check, logical fallacy detection, and executive brief generator.',
  icon: 'FileSearch',
  version: '1.1.0',
  status: 'active',
  requiredTier: 'voice',
  component: DocAnalyzerPage,
  routes: {
    page: '/doc-analyzer',
    api: {
      analyze: async ({ body }) => {
        const text = typeof body?.text === 'string' ? body.text : '';
        const analysis = analyzeDocument(text);

        // Optional AI executive brief layered on top of the deterministic analysis.
        let aiBrief: string | undefined;
        let provider: string | undefined;
        let tokensUsed: number | undefined;
        if (body?.aiBrief === true) {
          try {
            const { generateText } = await import('../../lib/ai');
            const res = await generateText(
              `Write a 3-sentence executive brief of this document. No preamble, no headings.\n\n${text.slice(0, 6000)}`,
              { moduleSlug: 'doc-analyzer' }
            );
            if (res.provider !== 'graceful_fallback') {
              aiBrief = res.text;
              provider = res.provider;
              tokensUsed = res.tokensUsed;
            }
          } catch {
            // Deterministic analysis stands on its own.
          }
        }

        return { success: true, data: { ...analysis, aiBrief }, provider, tokensUsed };
      },
    },
  },
});

export default docAnalyzerModule;
