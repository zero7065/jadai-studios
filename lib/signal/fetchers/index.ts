import { fetchHackerNews } from './hackernews';
import { fetchGitHub } from './github';
import { fetchReddit } from './reddit';

export { fetchHackerNews, fetchGitHub, fetchReddit };

export async function fetchPlatformPosts(platform: string, query: string) {
  switch (platform) {
    case 'hackernews':
      return fetchHackerNews(query);
    case 'github':
      return fetchGitHub(query);
    case 'reddit':
      return fetchReddit(query);
    default:
      return fetchHackerNews(query);
  }
}
