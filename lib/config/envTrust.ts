// Single source of truth for "is this env value a real credential or a placeholder".
// .env.example ships obvious fakes (gsk_your_..., AIzaSy..., eyJ... with ..., your-project).
// Guards, /api/ai/status, and self-check must all treat those as NOT configured —
// otherwise the platform claims live AI it doesn't have and fabricates output.

const PLACEHOLDER_PATTERNS: RegExp[] = [
  /^\[SET_IN_/i, // documented convention: [SET_IN_ENV_FILE]
  /your[_-]/i, // your_groq_api_key_here, your-project, your_admin@email.com
  /\.\.\.$/, // trailing ellipsis: pk_test_..., eyJhbGciOi...
  /^AIzaSy\.\.\./i, // literal "AIzaSy..." from .env.example
  /^gsk_your/i, // gsk_your_groq_api_key_here
  /^generate_a_random_string/i, // SESSION_SECRET example
  /^your-cron/i, // CRON_SECRET example
  /^your_cron/i,
  /example\.com/i, // placeholder hosts
  /demo-placeholder/i,
];

/**
 * Returns true when a value is missing OR is an obvious example/placeholder.
 * Real credentials (gsk_live_..., AIzaSyA..., eyJhbGciOi... full JWT) return false.
 */
export function isPlaceholderValue(value: string | undefined | null): boolean {
  if (value === undefined || value === null) return true;
  const v = String(value).trim();
  if (v === '') return true;
  for (const p of PLACEHOLDER_PATTERNS) {
    if (p.test(v)) return true;
  }
  return false;
}

/** Groq keys: gsk_ + 52 alphanumerics in practice. Placeholder fakes start with gsk_your. */
export function isRealGroqKey(value: string | undefined | null): boolean {
  if (isPlaceholderValue(value)) return false;
  return /^gsk_[A-Za-z0-9]{20,}$/.test(String(value).trim());
}

/** OpenAI keys: sk- or sk-proj- + long token (user keys also carry a _T3BlbkFJ suffix). */
export function isOpenAIKey(value: string | undefined | null): boolean {
  if (isPlaceholderValue(value)) return false;
  return /^sk-[A-Za-z0-9_-]{40,}$/.test(String(value).trim());
}

/** Gemini keys: AIza + 33 chars. */
export function isRealGeminiKey(value: string | undefined | null): boolean {
  if (isPlaceholderValue(value)) return false;
  return /^AIza[A-Za-z0-9_-]{30,}$/.test(String(value).trim());
}

/** Supabase URL must be a real https host, not your-project.supabase.co. */
export function isRealSupabaseUrl(value: string | undefined | null): boolean {
  if (isPlaceholderValue(value)) return false;
  const v = String(value).trim();
  return v.startsWith('https://') && !v.includes('your-project');
}

/** Supabase service/anon key: full HS256 JWT (header.payload.signature). */
export function isRealSupabaseKey(value: string | undefined | null): boolean {
  if (isPlaceholderValue(value)) return false;
  return /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(String(value).trim());
}
