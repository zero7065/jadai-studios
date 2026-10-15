import { getSetting } from '@/lib/settings';

// Schema column is vector(1536). Gemini text-embedding-004 returns 768 —
// pad with zeros so inserts never fail the dimension check.
const TARGET_DIMS = 1536;

function pad(vec: number[]): number[] {
  if (vec.length >= TARGET_DIMS) return vec.slice(0, TARGET_DIMS);
  return [...vec, ...new Array(TARGET_DIMS - vec.length).fill(0)];
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const key = await getSetting('gemini_api_key');
  if (!key || key.startsWith('[SET_')) {
    return hashToVector(text);
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text: text.slice(0, 8000) }] },
        }),
      }
    );
    if (!res.ok) throw new Error(`Embedding API error ${res.status}`);
    const data = await res.json();
    if (data.embedding?.values) {
      return pad(data.embedding.values);
    }
    return hashToVector(text);
  } catch {
    return hashToVector(text);
  }
}

function hashToVector(text: string): number[] {
  const vec = new Array(TARGET_DIMS).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % TARGET_DIMS] += text.charCodeAt(i) / 1000;
  }
  const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}
