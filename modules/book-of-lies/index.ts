import { defineModule, JadaiModule } from '../../lib/modules/defineModule';
import { BOOK_EPISODES } from './data';
import BookOfLiesPage from './page';

export const bookOfLiesModule: JadaiModule = defineModule({
  slug: 'book-of-lies',
  name: 'The Book of Lies',
  description: 'Philosophical fiction, daily wisdom transmissions, and moral puzzles delivered at 9:47 PM.',
  icon: 'BookOpen',
  version: '1.0.0',
  status: 'active',
  requiredTier: 'free',
  component: BookOfLiesPage,
  routes: {
    page: '/book-of-lies',
    api: {
      episodes: async () => ({ success: true, data: BOOK_EPISODES }),
    },
  },
  config: {
    daily_hour: 21,
    daily_minute: 47,
  },
});

export default bookOfLiesModule;
