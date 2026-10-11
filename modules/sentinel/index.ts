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
      scan: async ({ body, query }) => {
        const url = (body?.url || query?.url) as string | undefined;
        if (!url) return { status: 400, success: false, error: 'url is required' };
        try {
          const { runSentinelScan } = await import('./api/scan');
          const data = await runSentinelScan(url);
          return { success: true, data };
        } catch (err: any) {
          return { status: 500, success: false, error: err.message || 'Scan failed' };
        }
      },
      shorten: async ({ body }) => {
        const { createShortLink } = await import('../../lib/shortlinks');
        const result = await createShortLink({
          targetUrl: body?.targetUrl || body?.url,
          customSlug: body?.customSlug || body?.slug,
          cloaked: body?.cloaked,
          pageTitle: body?.pageTitle,
          description: body?.description,
        });
        if (!result.ok) {
          return { status: result.status, success: false, error: result.error };
        }
        const host = process.env.NEXT_PUBLIC_APP_URL || 'https://jadai.dev';
        const rec = result.record;
        return {
          success: true,
          data: {
            slug: rec.slug,
            shortUrl: `${host}/s/${rec.slug}`,
            targetUrl: rec.targetUrl,
            cloaked: rec.cloaked,
            clicks: rec.clicks,
          },
        };
      },
    },
  },
  metadata: {
    author: 'Jehu Nanpan',
    tagline: 'Platform Telemetry & Dispatch Network',
  },
});

export default sentinelModule;
