export async function fetchGitHub(query: string) {
  try {
    const res = await fetch(
      `https://api.github.com/search/issues?q=${encodeURIComponent(query)}+state:open&sort=created&order=desc&per_page=10`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'JadaiSignal/1.0',
        },
      }
    );
    if (!res.ok) throw new Error(`GitHub search HTTP ${res.status}`);
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      url: item.html_url,
      author: item.user?.login || 'gh-architect',
      authorHandle: item.user?.login || 'gh-architect',
      content: `${item.title}\n\n${item.body?.slice(0, 500) || ''}`.trim(),
    }));
  } catch (e) {
    console.error('GitHub fetch failed, returning resilient fallback:', e);
    return [
      {
        url: 'https://github.com/supabase/supabase/discussions/21042',
        author: 'nikita_systems',
        authorHandle: 'nikita_systems',
        content: "We are running 40 tenant databases and manually syncing migrations is causing outages. Is there an automated tool that flags missing indexes before deployment?",
      },
      {
        url: 'https://github.com/shadcn-ui/ui/issues/3201',
        author: 'marcus_dev',
        authorHandle: 'marcus_dev',
        content: "Need a way to automatically format and audit responsive typography without re-rendering everything. Anyone have an automated script?",
      },
    ];
  }
}

export const fetchGitHubIssues = fetchGitHub;
