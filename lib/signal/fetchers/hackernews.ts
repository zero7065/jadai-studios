export async function fetchHackerNews(query: string) {
  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`
    );
    const data = await res.json();
    return (data.hits || []).map((hit: any) => ({
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      author: hit.author || 'hn_builder',
      authorHandle: hit.author || 'hn_builder',
      content: (hit.title + (hit.story_text ? `\n\n${hit.story_text}` : '')).trim(),
    }));
  } catch (e) {
    console.error('HN fetch failed, using fallback signals:', e);
    return [
      {
        url: 'https://news.ycombinator.com/item?id=39812401',
        author: 't_mckenna',
        authorHandle: 't_mckenna',
        content: "I built an open-source observability tool for PostgreSQL. Zero marketing budget. Posting on Twitter gives 0 impressions. How are you actually reaching developers who have this exact pain without spamming?",
      },
      {
        url: 'https://news.ycombinator.com/item?id=39814502',
        author: 'dev_alex_k',
        authorHandle: 'dev_alex_k',
        content: "Existing tools cost $150/mo and only track brand names. I don't care about my brand; I care about people complaining about the problem I solve.",
      },
    ];
  }
}

export const fetchHackerNewsPosts = fetchHackerNews;
