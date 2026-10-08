import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import MirageModulePage from './page';

export const mirageModule: JadaiModule = defineModule({
  slug: 'mirage',
  name: 'MIRAGE Visual Studio',
  description: 'Visual generation engine: text-to-image with multi-provider fallback, logo & brand kit output, 3D preview, and Jadai art-style characters.',
  icon: 'Sparkles',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: MirageModulePage,
  routes: {
    page: '/playground/mirage',
    api: {
      generate: async ({ body }) => {
        return { success: true, data: { message: 'Visual generated', result: body } };
      },
    },
  },
  metadata: {
    author: 'Jehu Nanpan',
    tagline: 'High-Dimension Visual Synthesis',
  },
});

export default mirageModule;
