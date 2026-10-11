// Deterministic resume scoring — runs fully offline (client or server).

export interface ResumeFinding {
  dimension: string;
  passed: boolean;
  weight: number;
  earned: number;
  detail: string;
  fix: string;
}

export interface ResumeScore {
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  findings: ResumeFinding[];
  stats: {
    words: number;
    bullets: number;
    quantified: number;
    actionVerbs: number;
    sections: string[];
  };
  topBullets: string[];
  weakBullets: string[];
}

const ACTION_VERBS = [
  'led', 'built', 'shipped', 'designed', 'architected', 'launched', 'scaled', 'migrated',
  'reduced', 'increased', 'automated', 'optimized', 'delivered', 'owned', 'created',
  'implemented', 'integrated', 'negotiated', 'managed', 'engineered', 'accelerated',
  'consolidated', 'spearheaded', 'established', 'pioneered', 'drove',
];

const FILLER_PHRASES = [
  'team player', 'hard worker', 'go-getter', 'think outside the box',
  'synergy', 'results-oriented individual', 'detail-oriented person',
  'responsible for duties', 'think outside the box',
];

const SECTION_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'Experience', pattern: /\b(work\s*experience|professional\s*experience|experience|employment)\b/i },
  { name: 'Education', pattern: /\b(education|academic|qualifications|degree)\b/i },
  { name: 'Skills', pattern: /\b(skills|technologies|tech\s*stack|tools)\b/i },
];

function grade(total: number): ResumeScore['grade'] {
  if (total >= 85) return 'A';
  if (total >= 70) return 'B';
  if (total >= 55) return 'C';
  if (total >= 40) return 'D';
  return 'F';
}

export function scoreResume(rawText: string): ResumeScore {
  const text = (rawText || '').trim();
  if (text.length < 40) {
    throw new Error('Resume too short to score (minimum 40 characters). Paste the full text.');
  }

  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => /^[-*•]/.test(l) || (/^\d+[.)]\s/.test(l) && l.length > 30));

  const hasEmail = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s()-]{7,}\d)/.test(text);
  const sections = SECTION_PATTERNS.filter((s) => s.pattern.test(text)).map((s) => s.name);

  const quantifiedMatches = text.match(/\b\d+(\.\d+)?%|\$\s?\d|\b\d+x\b|\b\d{2,}\b/g) || [];
  const actionVerbCount = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(text)).length;
  const fillerHits = FILLER_PHRASES.filter((p) => lower.includes(p));

  const findings: ResumeFinding[] = [];

  const contactPassed = hasEmail && hasPhone;
  findings.push({
    dimension: 'Contact block',
    passed: contactPassed,
    weight: 12,
    earned: contactPassed ? 12 : hasEmail || hasPhone ? 6 : 0,
    detail: contactPassed ? 'Email and phone present.' : !hasEmail && !hasPhone ? 'No email or phone found.' : hasEmail ? 'Email found, phone missing.' : 'Phone found, email missing.',
    fix: 'Add a professional email and phone number at the top of the document.',
  });

  const sectionsPassed = sections.length === 3;
  findings.push({
    dimension: 'Core sections',
    passed: sectionsPassed,
    weight: 16,
    earned: sections.length === 3 ? 16 : sections.length * 5,
    detail: sections.length > 0 ? `Found: ${sections.join(', ')}` : 'No Experience/Education/Skills headers detected.',
    fix: 'Add clear Experience, Education, and Skills section headers.',
  });

  const quantifiedPassed = quantifiedMatches.length >= 5;
  findings.push({
    dimension: 'Quantified impact',
    passed: quantifiedPassed,
    weight: 20,
    earned: quantifiedPassed ? 20 : Math.min(18, quantifiedMatches.length * 4),
    detail: `${quantifiedMatches.length} numeric result${quantifiedMatches.length === 1 ? '' : 's'} found (target: 5+).`,
    fix: 'Add metrics to bullets: %, $, time saved, users reached, revenue moved.',
  });

  const verbsPassed = actionVerbCount >= 6;
  findings.push({
    dimension: 'Action verbs',
    passed: verbsPassed,
    weight: 16,
    earned: verbsPassed ? 16 : actionVerbCount * 2,
    detail: `${actionVerbCount} distinct strong action verb${actionVerbCount === 1 ? '' : 's'} found (target: 6+).`,
    fix: 'Start each bullet with a verb like Led, Built, Shipped, Reduced, Scaled.',
  });

  const lengthPassed = words.length >= 350 && words.length <= 1000;
  findings.push({
    dimension: 'Length discipline',
    passed: lengthPassed,
    weight: 12,
    earned: lengthPassed ? 12 : 5,
    detail: `${words.length} words (target 350–1000).`,
    fix: 'Trim filler or add substance to land in the 350–1000 word range.',
  });

  const bulletsPassed = bulletLines.length >= 8;
  findings.push({
    dimension: 'Bullet structure',
    passed: bulletsPassed,
    weight: 12,
    earned: bulletsPassed ? 12 : Math.min(10, bulletLines.length),
    detail: `${bulletLines.length} achievement bullets found (target: 8+).`,
    fix: 'Rewrite paragraph blocks into scannable achievement bullets.',
  });

  const fillerPassed = fillerHits.length === 0;
  findings.push({
    dimension: 'Cliché hygiene',
    passed: fillerPassed,
    weight: 8,
    earned: fillerPassed ? 8 : Math.max(0, 8 - fillerHits.length * 4),
    detail: fillerPassed ? 'No filler clichés detected.' : `Found: ${fillerHits.join(', ')}`,
    fix: 'Replace clichés with specific evidence of the same quality.',
  });

  const toolsPassed = /\b(typescript|javascript|python|react|node|sql|aws|docker|kubernetes|git|figma|graphql|terraform)\b/i.test(text);
  findings.push({
    dimension: 'Stack signal',
    passed: toolsPassed,
    weight: 4,
    earned: toolsPassed ? 4 : 0,
    detail: toolsPassed ? 'Concrete tools/technologies named.' : 'No concrete tools or technologies named.',
    fix: 'Name the actual stack (languages, frameworks, platforms) recruiters search for.',
  });

  const total = Math.max(0, Math.min(100, findings.reduce((s, f) => s + f.earned, 0)));

  const scoredBullets = bulletLines
    .map((b) => ({
      text: b,
      score:
        (b.match(/\b\d+(\.\d+)?%|\$\s?\d|\b\d+x\b/g) || []).length * 3 +
        ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(b)).length,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    total,
    grade: grade(total),
    findings,
    stats: {
      words: words.length,
      bullets: bulletLines.length,
      quantified: quantifiedMatches.length,
      actionVerbs: actionVerbCount,
      sections,
    },
    topBullets: scoredBullets.slice(0, 3).map((b) => b.text),
    weakBullets: scoredBullets.slice(-3).map((b) => b.text),
  };
}
