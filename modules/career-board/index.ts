import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import { CAREER_MISSIONS } from './data';
import CareerBoardPage from './page';

export const careerBoardModule: JadaiModule = defineModule({
  slug: 'career-board',
  name: 'Career & Mission Board',
  description: 'High-impact technology and design missions for developers building beyond standard ceilings.',
  icon: 'Compass',
  version: '1.0.0',
  status: 'coming_soon',
  requiredTier: 'free',
  component: CareerBoardPage,
  routes: {
    page: '/career-board',
    api: {
      missions: async () => ({ success: true, data: CAREER_MISSIONS }),
    },
  },
});

export default careerBoardModule;
