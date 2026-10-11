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
        const prompt = String(body?.prompt || '').trim();
        if (!prompt) return { status: 400, success: false, error: 'prompt is required' };
        try {
          const { generateMirageImages } = await import('./api/generate');
          const data = await generateMirageImages(
            prompt,
            body?.style,
            body?.aspectRatio,
            body?.count
          );
          return { success: true, data };
        } catch (err: any) {
          return { status: 500, success: false, error: err.message || 'Generation failed' };
        }
      },
    },
  },
  metadata: {
    author: 'Jehu Nanpan',
    tagline: 'High-Dimension Visual Synthesis',
  },
});

export default mirageModule;
