import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import SentinelModulePage from './page';

export const sentinelModule: JadaiModule = defineModule({
  slug: 'sentinel',
  name: 'SENTINEL Diagnostic & Links',
  description: 'Site health monitoring (PageSpeed + accessibility audits), RDAP conflict check, link cloaking, shortener, and QR code generation.',
  icon: 'Activity',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: SentinelModulePage,
  routes: {
    page: '/playground/sentinel',
    api: {
      scan: async ({ query }) => {
        return { success: true, data: { status: 'healthy', url: query.url } };
      },
      shorten: async ({ body }) => {
        return { success: true, data: { shortUrl: 'https://jadai.dev/s/demo', ...body } };
      },
    },
  },
  metadata: {
    author: 'Jehu Nanpan',
    tagline: 'Platform Telemetry & Dispatch Network',
  },
});

export default sentinelModule;
