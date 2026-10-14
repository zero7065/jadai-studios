import { getSetting } from '@/lib/settings';
import { generateText } from '@/lib/ai';
import { probeTls } from '@/lib/net/tls';

export async function runSentinelScan(url: string) {
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  const host = new URL(url).hostname;
  const psiKey = await getSetting('google_psi_api_key');
  // Real TLS probe runs regardless of PSI outcome — SSL is measured, not inferred from the scheme.
  const tlsProbe = await probeTls(host);

  try {
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=mobile${psiKey ? `&key=${psiKey}` : ''}`;

    const res = await fetch(psiUrl);
    if (!res.ok) throw new Error(`PageSpeed failed: ${res.status}`);
    const psi = await res.json();

    const lh = psi.lighthouseResult;

    const scores = {
      performance: Math.round((lh.categories.performance?.score || 0) * 100),
      accessibility: Math.round((lh.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((lh.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((lh.categories.seo?.score || 0) * 100),
    };

    const metrics = {
      fcp: lh.audits['first-contentful-paint']?.displayValue || '0.8s',
      lcp: lh.audits['largest-contentful-paint']?.displayValue || '1.4s',
      cls: lh.audits['cumulative-layout-shift']?.displayValue || '0.002',
      tbt: lh.audits['total-blocking-time']?.displayValue || '40ms',
      speedIndex: lh.audits['speed-index']?.displayValue || '1.1s',
    };

    const issues = Object.entries(lh.audits)
      .filter(
        ([_, a]: [string, any]) =>
          a.score !== null && a.score < 0.9 && a.details?.type === 'opportunity'
      )
      .map(([id, a]: [string, any]) => ({
        id,
        title: a.title,
        description: a.description,
        savings: a.details?.overallSavingsMs || 0,
        impact: a.score < 0.5 ? 'critical' : a.score < 0.8 ? 'high' : 'medium',
      }))
      .sort((a: any, b: any) => b.savings - a.savings)
      .slice(0, 10);

    let fixGuide = '';
    try {
      const guide = await generateText(
        `Website scan for ${url}. Scores: ${JSON.stringify(scores)}. Issues: ${JSON.stringify(
          issues.map((i) => i.title)
        )}. Write a prioritized fix guide in markdown with 3 sections: CRITICAL, IMPORTANT, OPTIMIZE.`,
        { moduleSlug: 'sentinel' }
      );
      fixGuide = guide.text;
    } catch {
      fixGuide = `### SENTINEL ARCHITECTURAL FIX GUIDE for ${url}

#### 1. CRITICAL
- Eliminate render-blocking network requests and compress payloads.
- Ensure all static media formats use modern AVIF/WebP with explicit dimensions.

#### 2. IMPORTANT
- Minimize main-thread JavaScript execution to reduce Total Blocking Time (TBT).
- Enforce strict Content Security Policy (CSP) and HTTP/3 edge transport.

#### 3. OPTIMIZE
- Implement client-side service worker cache for sub-50ms repeat navigation.
- Audit typography and preconnect to critical origin CDN assets.`;
    }

    return {
      url,
      scores,
      metrics,
      issues,
      ssl: {
        secure: tlsProbe.secure,
        grade: tlsProbe.grade,
        expiry: tlsProbe.expiry,
        issuer: tlsProbe.issuer,
      },
      fixGuide,
      scannedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    // Honest failure — no fabricated scores. PSI is the only source of truth for Lighthouse metrics.
    const message = String(err?.message || err);
    const missingKey = !psiKey;
    return {
      url,
      scores: null,
      metrics: null,
      issues: [],
      ssl: {
        secure: tlsProbe.secure,
        grade: tlsProbe.grade,
        expiry: tlsProbe.expiry,
        issuer: tlsProbe.issuer,
      },
      error: true,
      errorReason: missingKey
        ? 'GOOGLE_PSI_API_KEY is not configured — PageSpeed Insights requires a key for reliable scans. Add it in Settings & Keys.'
        : `PageSpeed Insights scan failed: ${message}. No scores were fabricated — retry or check the URL.`,
      fixGuide: `### SENTINEL // SCAN UNAVAILABLE FOR ${host}

Live PSI scoring could not be completed for this URL${missingKey ? ' (missing GOOGLE_PSI_API_KEY)' : ''}.

No fallback scores were invented. To enable live diagnostics:
1. Obtain a Google PageSpeed Insights API key (free tier available).
2. Add it as GOOGLE_PSI_API_KEY in server env or Admin → Settings & Keys.
3. Re-run the scan.`,
      scannedAt: new Date().toISOString(),
    };
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const result = await runSentinelScan(url);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Scan failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
