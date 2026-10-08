/**
 * JADAI STUDIOS — 9:47 PM CONTENT DELIVERY & RIDDLE EVALUATOR
 * Version 1.0 (Master Spec Part 06)
 */

export interface ContentItem {
  id: string;
  type: 'wisdom' | 'riddle' | 'book_of_lies' | 'motivation' | 'philosophy' | 'lesson' | 'puzzle';
  title: string;
  content: string;
  question?: string;
  answer?: string;
  hint?: string;
  lesson?: string;
  difficulty?: 'initiate' | 'adept' | 'master';
  category?: string;
  scheduled_time?: string;
}

export interface RiddleEvaluationResult {
  similarity: number;
  judgment: 'Correct ✦' | 'Close — nearly there' | "Not quite. Here's the lesson:";
  feedback: string;
  officialAnswer?: string;
}

/**
 * Calculates string vector cosine similarity using character tri-grams & word tokens.
 * Resilient against minor typos, extra words, and synonymous phrasing.
 */
export function calculateCosineSimilarity(str1: string, str2: string): number {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();

  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  // Extract character tri-grams + single words
  const extractFeatures = (text: string): Record<string, number> => {
    const freqs: Record<string, number> = {};
    const words = text.split(/\s+/);

    // Word frequencies
    for (const w of words) {
      if (w.length > 0) freqs[`w_${w}`] = (freqs[`w_${w}`] || 0) + 1.5;
    }

    // 3-gram frequencies
    for (let i = 0; i <= text.length - 3; i++) {
      const gram = text.substring(i, i + 3);
      freqs[`g_${gram}`] = (freqs[`g_${gram}`] || 0) + 1.0;
    }

    return freqs;
  };

  const v1 = extractFeatures(s1);
  const v2 = extractFeatures(s2);

  // Dot product
  let dotProduct = 0;
  for (const key in v1) {
    if (v2[key]) {
      dotProduct += v1[key] * v2[key];
    }
  }

  // Magnitudes
  const mag1 = Math.sqrt(Object.values(v1).reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(Object.values(v2).reduce((sum, val) => sum + val * val, 0));

  if (mag1 === 0 || mag2 === 0) return 0.0;
  const similarity = dotProduct / (mag1 * mag2);

  return Math.min(1.0, Math.max(0.0, similarity));
}

/**
 * Evaluates a user riddle attempt against the true answer using the studio scoring ladder.
 */
export function evaluateRiddleAnswer(
  userAnswer: string,
  officialAnswer: string,
  lessonText?: string
): RiddleEvaluationResult {
  const similarity = calculateCosineSimilarity(userAnswer, officialAnswer);

  if (similarity >= 0.85) {
    return {
      similarity,
      judgment: 'Correct ✦',
      feedback: 'You have pierced the surface. The architecture holds.',
      officialAnswer,
    };
  } else if (similarity >= 0.65) {
    return {
      similarity,
      judgment: 'Close — nearly there',
      feedback: 'Your vector is proximate, but the precision requires calibration. Consider the underlying constraint.',
      officialAnswer: undefined,
    };
  } else {
    return {
      similarity,
      judgment: "Not quite. Here's the lesson:",
      feedback: lessonText || `The required pattern was: "${officialAnswer}". Re-read the premise and test the assumption.`,
      officialAnswer,
    };
  }
}

/**
 * Checks if current local time is proximate to the 9:47 PM transmission cadence (21:47).
 */
export function isTransmissionCadenceTime(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Transmission window between 21:45 and 22:00
  return hours === 21 && minutes >= 45 && minutes <= 59;
}
