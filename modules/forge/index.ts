import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import ForgeModulePage from './page';

export const forgeModule: JadaiModule = defineModule({
  slug: 'forge',
  name: 'FORGE Media & Doc Editor',
  description: 'Canva-style document and media editor with OCR image-to-document layout reconstruction, 50MB intake, and multi-format export.',
  icon: 'FileCode',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: ForgeModulePage,
  routes: {
    page: '/playground/forge',
    api: {
      analyze: async ({ body }) => {
        return { success: true, data: { message: 'Document analyzed', result: body } };
      },
    },
  },
  config: {
    maxUploadMb: 50,
    maxFiles: 10,
  },
  metadata: {
    author: 'Jehu Nanpan',
    tagline: 'Document & Media Engine',
  },
});

export default forgeModule;
