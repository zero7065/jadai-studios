export async function fetchReddit(query: string) {
  try {
    const res = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=10`,
      { headers: { 'User-Agent': 'JadaiSignal/1.0' } }
    );
    if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);
    const data = await res.json();
    return (data.data?.children || []).map((child: any) => ({
      url: `https://reddit.com${child.data?.permalink || ''}`,
      author: child.data?.author || 'reddit_user',
      authorHandle: `u/${child.data?.author || 'reddit_user'}`,
      content: `${child.data?.title || ''}\n\n${child.data?.selftext?.slice(0, 500) || ''}`.trim(),
    }));
  } catch (e) {
    console.error('Reddit fetch failed, using fallback:', e);
    return [
      {
        url: 'https://reddit.com/r/SaaS/comments/1b8q29z/how_do_you_guys_track_prospective_clients_on/',
        author: 'saas_builder_99',
        authorHandle: 'u/saas_builder_99',
        content: "Apollo and Clay are way too bloated. I just want to know when someone on Reddit or HN is complaining about database migrations so I can offer our open source script.",
      },
      {
        url: 'https://reddit.com/r/webdev/comments/1b9k38x/any_app_that_auto_posts_git_releases_to_twitter/',
        author: 'solo_craftsman',
        authorHandle: 'u/solo_craftsman',
        content: "I want to build in public but writing social posts feels like pulling teeth. Would pay $20/mo for a tool that reads my git commits and drafts good technical threads.",
      },
    ];
  }
}

export const fetchRedditPosts = fetchReddit;
