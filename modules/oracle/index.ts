import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import OracleModulePage from './page';

export const oracleModule: JadaiModule = defineModule({
  slug: 'oracle',
  name: 'PRIME Oracle',
  description: 'High-bandwidth AI intelligence advisor trained on architectural strategy, logic, and existential reasoning.',
  icon: 'Eye',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: OracleModulePage,
  routes: {
    page: '/oracle',
    api: {
      chat: async () => ({
        success: true,
        data: { message: 'Oracle foundation ready. Prompt 2 activates streaming.' },
      }),
    },
  },
});

export default oracleModule;
