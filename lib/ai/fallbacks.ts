export interface FallbackRiddle {
  id: number;
  question: string;
  answer: string;
  canonicalTokens: string[];
}

export const FALLBACK_MESSAGES: string[] = [
  "PRIME is catching its breath. Back in a moment. 🌀",
  "The intelligence is recalibrating. Give it a sec.",
  "Even PRIME needs a break. Try again shortly.",
  "Signal lost briefly. Reconnecting you now. ⬡",
  "PRIME is reconnecting. This happens. Stay with me.",
  "The Oracle is dreaming. It'll wake up in a moment.",
  "Fast refresh in progress. Back before you notice.",
  "One moment — PRIME is realigning.",
  "The signal is thin up here. Reconnecting.",
  "PRIME stepped out. It does that. Back soon.",
  "Quiet moment. PRIME is listening to itself.",
  "Rebuilding the connection. Almost there.",
  "The intelligence is offline for 30 seconds. Not broken — just tired.",
  "PRIME is meditating. Give it a heartbeat.",
  "Nothing is wrong. PRIME is just slow right now.",
  "Connection loose. PRIME is tightening it."
];

export const FALLBACK_RIDDLES: FallbackRiddle[] = [
  { id: 1, question: "I am always coming but never arrive. What am I?", answer: "Tomorrow", canonicalTokens: ["tomorrow", "the next day", "morn"] },
  { id: 2, question: "The more you take, the more you leave behind. What am I?", answer: "Footsteps", canonicalTokens: ["footsteps", "footstep", "footprints", "steps"] },
  { id: 3, question: "I speak without a mouth. I hear without ears. What am I?", answer: "Echo", canonicalTokens: ["echo", "an echo", "sound reflection"] },
  { id: 4, question: "The person who makes me doesn't want me. The person who buys me doesn't use me. What am I?", answer: "Coffin", canonicalTokens: ["coffin", "casket", "a coffin"] },
  { id: 5, question: "I have cities but no houses, forests but no trees, water but no fish. What am I?", answer: "A map", canonicalTokens: ["map", "a map", "atlas", "globe"] },
  { id: 6, question: "The more you have of me, the less you see. What am I?", answer: "Darkness", canonicalTokens: ["darkness", "dark", "night", "blindness"] },
  { id: 7, question: "I'm tall when I'm young, short when I'm old. What am I?", answer: "Candle", canonicalTokens: ["candle", "a candle", "pencil", "match"] },
  { id: 8, question: "What gets wetter the more it dries?", answer: "Towel", canonicalTokens: ["towel", "a towel", "sponge"] },
  { id: 9, question: "What can travel around the world while staying in a corner?", answer: "Stamp", canonicalTokens: ["stamp", "a stamp", "postage stamp"] },
  { id: 10, question: "I have keys but no locks, space but no room. What am I?", answer: "Keyboard", canonicalTokens: ["keyboard", "a keyboard", "piano"] },
  { id: 11, question: "What has a head and a tail but no body?", answer: "Coin", canonicalTokens: ["coin", "a coin", "penny", "currency"] },
  { id: 12, question: "What has many teeth but cannot bite?", answer: "Comb", canonicalTokens: ["comb", "a comb", "saw", "gear"] },
  { id: 13, question: "What begins with T, ends with T, and has T in it?", answer: "Teapot", canonicalTokens: ["teapot", "a teapot", "tea pot"] },
  { id: 14, question: "I shave every day but my beard stays the same. What am I?", answer: "Barber", canonicalTokens: ["barber", "a barber", "hairdresser"] },
  { id: 15, question: "What has one eye but cannot see?", answer: "Needle", canonicalTokens: ["needle", "a needle", "storm", "hurricane"] },
];

/**
 * Text similarity calculator using character n-gram cosine & Jaccard index
 */
export function calculateAnswerSimilarity(userAnswer: string, correctAnswer: string, canonicalTokens: string[] = []): number {
  const cleanUser = userAnswer.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const cleanCorrect = correctAnswer.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');

  if (!cleanUser) return 0;
  if (cleanUser === cleanCorrect) return 1.0;

  // Exact or sub-token match with aliases
  for (const token of canonicalTokens) {
    const cleanToken = token.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (cleanUser === cleanToken) return 1.0;
    if (cleanUser.includes(cleanToken) || cleanToken.includes(cleanUser)) {
      const ratio = Math.min(cleanUser.length, cleanToken.length) / Math.max(cleanUser.length, cleanToken.length);
      if (ratio > 0.6) return 0.95;
    }
  }

  // Bigram Cosine Similarity
  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.slice(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const bg1 = getBigrams(cleanUser);
  const bg2 = getBigrams(cleanCorrect);

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  bg1.forEach((val, key) => {
    if (bg2.has(key)) {
      dotProduct += val * (bg2.get(key) || 0);
    }
    mag1 += val * val;
  });

  bg2.forEach((val) => {
    mag2 += val * val;
  });

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  if (magnitude === 0) return 0;
  return dotProduct / magnitude;
}

export function evaluateRiddleAnswer(userAnswer: string, riddle: FallbackRiddle): {
  score: number;
  message: string;
  isCorrect: boolean;
} {
  const score = calculateAnswerSimilarity(userAnswer, riddle.answer, riddle.canonicalTokens);
  if (score >= 0.9) {
    return { score, message: "Correct ✦", isCorrect: true };
  } else if (score >= 0.7) {
    return { score, message: "Close — nearly there", isCorrect: false };
  } else {
    return { score, message: `Not quite. Try again, or the answer is ${riddle.answer}.`, isCorrect: false };
  }
}

export function getRandomFallback() {
  const message = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
  const riddle = FALLBACK_RIDDLES[Math.floor(Math.random() * FALLBACK_RIDDLES.length)];
  return { message, riddle };
}
