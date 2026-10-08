import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import ResumeEditorPage from './page';

export const resumeEditorModule: JadaiModule = defineModule({
  slug: 'resume-editor',
  name: 'Architectural Resume Editor',
  description: 'Ruthless resume scoring, Pareto summarization, and executive voice rewriting.',
  icon: 'FileText',
  version: '1.0.0',
  status: 'beta',
  requiredTier: 'foundation',
  component: ResumeEditorPage,
  routes: {
    page: '/resume-editor',
    api: {
      score: async () => ({ success: true, data: { score: 92 } }),
    },
  },
});

export default resumeEditorModule;
