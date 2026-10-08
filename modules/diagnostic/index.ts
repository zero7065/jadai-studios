import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import { scanApiHandler } from './api/scan';
import DiagnosticPage from './page';

export const diagnosticModule: JadaiModule = defineModule({
  slug: 'diagnostic',
  name: 'Site Reliability & Architecture Diagnostic',
  description: 'Full-spectrum URL audit: performance, SEO, accessibility, SSL, broken links, RDAP conflict detection and AI fix guides.',
  icon: 'Activity',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: DiagnosticPage,
  routes: {
    page: '/diagnostic',
    api: {
      scan: scanApiHandler,
    },
  },
  config: {
    engine: 'psi+axe',
    cache_ttl_hours: 24,
  },
  metadata: {
    author: 'Jehu Nanpan',
    tagline: 'Ruthless site diagnostic engine',
    freeQuota: 100,
  },
});

export default diagnosticModule;
