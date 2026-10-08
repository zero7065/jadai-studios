import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import DreamForgePage from './page';

export const dreamForgeModule: JadaiModule = defineModule({
  slug: 'dream-forge',
  name: 'Dream Forge',
  description: 'Turn concepts and vision documents into actionable architectural blueprints and technical roadmaps.',
  icon: 'Sparkles',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'foundation',
  component: DreamForgePage,
  routes: {
    page: '/dream-forge',
    api: {
      forge: async () => ({ success: true, data: { status: 'forge_ready' } }),
    },
  },
});

export default dreamForgeModule;
