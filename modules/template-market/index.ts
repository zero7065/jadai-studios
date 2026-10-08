import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import TemplateMarketPage from './page';

export const templateMarketModule: JadaiModule = defineModule({
  slug: 'template-market',
  name: 'Elite Template Market',
  description: 'Production-grade boilerplates, luxury design systems, and resilient infrastructure starter kits.',
  icon: 'ShoppingBag',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: TemplateMarketPage,
  routes: {
    page: '/marketplace',
    api: {
      list: async () => ({ success: true, data: [] }),
    },
  },
});

export default templateMarketModule;
