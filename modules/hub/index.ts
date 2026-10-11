import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import { HUB_LISTINGS } from './data';
import HubModulePage from './page';

export const hubModule: JadaiModule = defineModule({
  slug: 'hub',
  name: 'JadaiHub Collaborative',
  description: 'Decentralized talent, freelance missions, peer code reviews, and tactical collaborations.',
  icon: 'Users',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: HubModulePage,
  routes: {
    page: '/hub',
    api: {
      listings: async () => ({ success: true, data: HUB_LISTINGS }),
    },
  },
});

export default hubModule;
