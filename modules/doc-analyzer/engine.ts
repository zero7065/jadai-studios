// Deterministic document analysis — runs fully offline (client or server).
// No AI required; the API layer may optionally add an AI-generated brief on top.

export interface DocFlag {
  term: string;
  category: 'risk' | 'bias' | 'hedge' | 'absolutist';
  severity: 'high' | 'medium' | 'low';
  excerpt: string;
}

export interface DocEntity {
  type: 'money' | 'date' | 'percent' | 'email' | 'url';
  value: string;
}

export interface DocAnalysis {
  stats: {
    words: number;
    sentences: number;
    paragraphs: number;
    readingMinutes: number;
    gradeLevel: number;
  };
  structure: {
    headings: number;
    bullets: number;
    numbers: number;
  };
  score: number;
  flags: DocFlag[];
  entities: DocEntity[];
  brief: string;
  recommendations: string[];
}

const RISK_TERMS: Array<{ term: string; severity: DocFlag['severity'] }> = [
  { term: 'indemnify', severity: 'high' },
  { term: 'hold harmless', severity: 'high' },
  { term: 'liquidated damages', severity: 'high' },
  { term: 'unlimited liability', severity: 'high' },
  { term: 'sole discretion', severity: 'high' },
  { term: 'irrevocable', severity: 'high' },
  { term: 'perpetual', severity: 'medium' },
  { term: 'non-refundable', severity: 'medium' },
  { term: 'auto-renew', severity: 'medium' },
  { term: 'auto renewal', severity: 'medium' },
  { term: 'penalty', severity: 'medium' },
  { term: 'waive', severity: 'medium' },
  { term: 'assignment of intellectual property', severity: 'high' },
  { term: 'without notice', severity: 'medium' },
  { term: 'at any time', severity: 'low' },
  { term: 'binding arbitration', severity: 'medium' },
];

const BIAS_TERMS = ['obviously', 'clearly everyone', 'everyone knows', 'undoubtedly', 'no one can deny'];
const HEDGE_TERMS = ['might', 'maybe', 'perhaps', 'possibly', 'seems to', 'somewhat', 'kind of'];
const ABSOLUTIST_TERMS = ['always', 'never', 'every single', 'completely', 'guaranteed', '100%'];

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const groups = w.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 1;
  if (w.endsWith('e') && count > 1) count -= 1;
  return Math.max(1, count);
}

function excerptAround(text: string, index: number, radius = 44): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ')}${end < text.length ? '…' : ''}`;
}

function findFlags(text: string): DocFlag[] {
  const lower = text.toLowerCase();
  const flags: DocFlag[] = [];
  const seen = new Set<string>();

  const scan = (terms: string[], category: DocFlag['category'], severity: DocFlag['severity']) => {
    for (const term of terms) {
      const idx = lower.indexOf(term);
      if (idx === -1) continue;
      const key = `${category}:${term}`;
      if (seen.has(key)) continue;
      seen.add(key);
      flags.push({ term, category, severity, excerpt: excerptAround(text, idx) });
    }
  };

  RISK_TERMS.forEach((r) => scan([r.term], 'risk', r.severity));
  scan(BIAS_TERMS, 'bias', 'medium');
  scan(HEDGE_TERMS, 'hedge', 'low');
  scan(ABSOLUTIST_TERMS, 'absolutist', 'low');

  return flags;
}

function extractEntities(text: string): DocEntity[] {
  const entities: DocEntity[] = [];
  const push = (type: DocEntity['type'], value: string) => {
    if (!entities.some((e) => e.type === type && e.value === value) && entities.length < 40) {
      entities.push({ type, value });
    }
  };

  for (const m of text.matchAll(/\$\s?\d[\d,]*(\.\d+)?\s?(k|m|b|million|billion)?/gi)) push('money', m[0].trim());
  for (const m of text.matchAll(/\b\d+(\.\d+)?%\b/g)) push('percent', m[0]);
  for (const m of text.matchAll(/\b\d{4}-\d{2}-\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? \d{1,2},? \d{4}\b/g)) push('date', m[0]);
  for (const m of text.matchAll(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi)) push('email', m[0]);
  for (const m of text.matchAll(/https?:\/\/[^\s)]+/gi)) push('url', m[0]);

  return entities;
}

function firstSentences(text: string, maxChars: number): string {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 24);
  const picked: string[] = [];
  let total = 0;
  for (const s of sentences) {
    if (total + s.length > maxChars) break;
    picked.push(s.trim());
    total += s.length + 1;
    if (picked.length >= 2) break;
  }
  if (picked.length === 0 && sentences.length > 0) return sentences[0].slice(0, maxChars);
  return picked.join(' ');
}

function buildRecommendations(flags: DocFlag[], stats: DocAnalysis['stats']): string[] {
  const recs: string[] = [];
  const highRisk = flags.filter((f) => f.category === 'risk' && f.severity === 'high');
  const hedges = flags.filter((f) => f.category === 'hedge');
  const absolutes = flags.filter((f) => f.category === 'absolutist');

  if (highRisk.length > 0) {
    recs.push(
      `${highRisk.length} high-severity clause${highRisk.length > 1 ? 's' : ''} found (${highRisk
        .slice(0, 3)
        .map((f) => f.term)
        .join(', ')}). Have counsel review before signing.`
    );
  }
  if (hedges.length >= 3) {
    recs.push('Heavy hedging detected — state commitments directly where you are certain.');
  }
  if (absolutes.length >= 2) {
    recs.push('Absolutist language weakens credibility — qualify claims with evidence or scope.');
  }
  if (stats.words < 120) {
    recs.push('Document is very short — add context, scope, and next steps.');
  }
  if (stats.gradeLevel >= 14) {
    recs.push('Reading level is graduate-tier — shorten sentences for a broader audience.');
  }
  if (recs.length === 0) {
    recs.push('No structural issues detected — document reads clean.');
  }
  return recs;
}

export function analyzeDocument(rawText: string): DocAnalysis {
  const text = (rawText || '').trim();
  if (text.length < 20) {
    throw new Error('Document too short to analyze (minimum 20 characters).');
  }

  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+(\s|$)/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = Math.max(1, words.length);
  const gradeLevel = Math.round(
    (0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59) * 10
  ) / 10;

  const structure = {
    headings: (text.match(/^#{1,6}\s.+$/gm) || []).length + (text.match(/^[A-Z][A-Z \-/]{5,}$/gm) || []).length,
    bullets: (text.match(/^\s*[-*•]\s+/gm) || []).length,
    numbers: (text.match(/\b\d+(\.\d+)?\b/g) || []).length,
  };

  const flags = findFlags(text);
  const entities = extractEntities(text);

  // Score: start perfect, subtract for risk/bias, reward structure.
  let score = 100;
  for (const f of flags) {
    if (f.category === 'risk') score -= f.severity === 'high' ? 8 : f.severity === 'medium' ? 4 : 2;
    else if (f.category === 'bias') score -= 5;
    else if (f.category === 'absolutist') score -= 2;
  }
  if (structure.headings > 0) score += 3;
  if (structure.bullets >= 3) score += 3;
  if (structure.numbers >= 3) score += 3;
  score = Math.max(5, Math.min(100, score));

  const stats = {
    words: wordCount,
    sentences: sentenceCount,
    paragraphs: paragraphs.length,
    readingMinutes: Math.max(1, Math.round(wordCount / 220)),
    gradeLevel,
  };

  const brief =
    firstSentences(text, 420) || text.slice(0, 420);

  return {
    stats,
    structure,
    score,
    flags,
    entities,
    brief,
    recommendations: buildRecommendations(flags, stats),
  };
}
