export async function GET() {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const hasGroq = Boolean(groqKey && !groqKey.startsWith('[SET_IN_') && groqKey.trim() !== '');
  const hasGemini = Boolean(geminiKey && !geminiKey.startsWith('[SET_IN_') && geminiKey.trim() !== '');

  return Response.json({
    success: true,
    providers: {
      groq: {
        configured: hasGroq,
        model: 'llama-3.3-70b-versatile',
        role: 'Primary',
      },
      gemini: {
        configured: hasGemini,
        model: 'gemini-3.1-flash-lite',
        role: 'Fallback',
      },
      cache: {
        active: true,
        ttl_user: '1 hour',
        ttl_admin: '24 hours',
      },
      graceful_fallback: {
        active: true,
        strategy: 'Non-blocking degradation notice',
      },
    },
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
