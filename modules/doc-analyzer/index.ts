import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import DocAnalyzerPage from './page';

export const docAnalyzerModule: JadaiModule = defineModule({
  slug: 'doc-analyzer',
  name: 'Document Intelligence Analyzer',
  description: 'Deep extraction, bias check, logical fallacy detection, and executive brief generator.',
  icon: 'FileSearch',
  version: '1.0.0',
  status: 'beta',
  requiredTier: 'voice',
  component: DocAnalyzerPage,
  routes: {
    page: '/doc-analyzer',
    api: {
      analyze: async () => ({ success: true, data: { analyzed: true } }),
    },
  },
});

export default docAnalyzerModule;
