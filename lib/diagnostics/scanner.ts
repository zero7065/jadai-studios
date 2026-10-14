import { generateText } from '../ai';
import { generateFixGuide, generateMarketingStrategy } from '../ai/prompts';
import { logger } from '../utils/logger';
import { probeTls } from '../net/tls';

export interface ScanResult {
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  } | null;
  metrics: {
    fcp: string;
    lcp: string;
    cls: string;
    tbt: string;
    ttfb: string;
  } | null;
  ssl: {
    secure: boolean;
    grade: string;
    expiry: string;
    issuer?: string;
  };
  domain: {
    name: string;
    available: boolean;
    registered_at?: string;
  };
  accessibility: {
    violations: Array<{ id: string; impact: string; description: string }>;
  };
  broken_links: Array<{ url: string; status: number }>;
  naming_conflicts: Array<{ domain: string; similarity: number }>;
  resources: {
    total_requests: number;
    total_size_kb: number;
  } | null;
  error?: boolean;
  errorReason?: string;
  fix_guide: string;
  marketing_strategy: string;
}

/**
 * Queries RDAP for domain registration status and conflicts.
 */
async function checkRdap(domain: string): Promise<ScanResult['domain']> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500),
    });

    if (res.status === 404) {
      return { name: domain, available: true };
    }

    if (res.ok) {
      const data = await res.json();
      const regEvent = data.events?.find((e: any) => e.eventAction === 'registration');
      return {
        name: domain,
        available: false,
        registered_at: regEvent?.eventDate || 'Registered',
      };
    }
  } catch (err) {
    logger.warn('RDAP lookup timed out or failed', { domain });
  }

  return { name: domain, available: false, registered_at: 'Active' };
}

/**
 * Executes a full-spectrum diagnostic scan for a given URL.
 */
export async function runDiagnosticScan(targetUrl: string, options: { psiApiKey?: string } = {}): Promise<ScanResult> {
  let normalizedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const parsed = new URL(normalizedUrl);
  const hostname = parsed.hostname;
  const timestamp = new Date().toISOString();

  // 1. SSL check via real TLS probe
  const sslPromise = probeTls(hostname).then((r) => ({
    secure: r.secure,
    grade: r.grade,
    expiry: r.expiry,
    issuer: r.issuer,
  }));

  // 2. Domain RDAP check
  const domainParts = hostname.split('.');
  const baseDomain = domainParts.slice(-2).join('.');
  const rdapPromise = checkRdap(baseDomain);

  // 3. PageSpeed Insights — no fabrication when unavailable
  let scores: ScanResult['scores'] = null;
  let metrics: ScanResult['metrics'] = null;
  let psiError: string | undefined;

  if (options.psiApiKey) {
    try {
      const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&key=${options.psiApiKey}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES`;
      const psiRes = await fetch(psiUrl, { signal: AbortSignal.timeout(6000) });
      if (psiRes.ok) {
        const psiData = await psiRes.json();
        const cats = psiData.lighthouseResult?.categories;
        const audits = psiData.lighthouseResult?.audits;

        if (cats) {
          scores = {
            performance: Math.round((cats.performance?.score || 0) * 100),
            seo: Math.round((cats.seo?.score || 0) * 100),
            accessibility: Math.round((cats.accessibility?.score || 0) * 100),
            bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
          };
        }
        if (audits) {
          metrics = {
            fcp: audits['first-contentful-paint']?.displayValue || '—',
            lcp: audits['largest-contentful-paint']?.displayValue || '—',
            cls: audits['cumulative-layout-shift']?.displayValue || '—',
            tbt: audits['total-blocking-time']?.displayValue || '—',
            ttfb: audits['server-response-time']?.displayValue || '—',
          };
        }
      } else {
        psiError = `PageSpeed Insights returned HTTP ${psiRes.status}`;
      }
    } catch (e: any) {
      psiError = `PageSpeed Insights unavailable: ${e?.message || 'timeout'}`;
      logger.info('PSI API call failed — returning honest null scores', { psiError });
    }
  } else {
    psiError = 'GOOGLE_PSI_API_KEY is not configured — PageSpeed Insights requires a key. Add it in Settings & Keys.';
  }

  const [ssl, domain] = await Promise.all([sslPromise, rdapPromise]);

  // Real axe-core accessibility data is not collected in this pipeline — return empty, not fabricated violations.
  const accessibility = { violations: [] as ScanResult['accessibility']['violations'] };

  const broken_links: Array<{ url: string; status: number }> = [];
  // RDAP does not provide lookalike-domain similarity — return empty rather than invented conflicts.
  const naming_conflicts: Array<{ domain: string; similarity: number }> = [];
  // Resource weight requires a real fetch/har pass — unknown here.
  const resources: ScanResult['resources'] = null;

  // Intermediate result for AI generation
  const interimResult = {
    url: normalizedUrl,
    scores,
    metrics,
    ssl,
    accessibility,
    broken_links,
  };

  // Generate fix guide and marketing strategy using our 4-step fallback AI layer
  const fixGuidePrompt = generateFixGuide(interimResult);
  const marketingPrompt = generateMarketingStrategy({ url: normalizedUrl, domain: baseDomain });

  const [fixGuideRes, marketingRes] = await Promise.all([
    generateText(fixGuidePrompt.prompt, {
      systemPrompt: fixGuidePrompt.systemPrompt,
      moduleSlug: 'diagnostic',
    }),
    generateText(marketingPrompt.prompt, {
      systemPrompt: marketingPrompt.systemPrompt,
      moduleSlug: 'diagnostic',
    }),
  ]);

  return {
    url: normalizedUrl,
    timestamp,
    scores,
    metrics,
    ssl,
    domain,
    accessibility,
    broken_links,
    naming_conflicts,
    resources,
    error: scores === null,
    errorReason: scores === null ? psiError : undefined,
    fix_guide: fixGuideRes.text,
    marketing_strategy: marketingRes.text,
  };
}
