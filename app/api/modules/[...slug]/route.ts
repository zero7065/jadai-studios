import { getModuleBySlug } from '../../../../lib/modules/modules.config';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string, limit: number = 100): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + 60 * 1000 });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const moduleSlug = params.slug?.[0];
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || params.slug?.[1] || 'action';

  // 1. Validate module exists
  if (!moduleSlug) {
    return Response.json({
      success: false,
      error: 'Module slug is required',
      code: 'MISSING_MODULE_SLUG',
    }, { status: 400 });
  }

  const moduleDef = getModuleBySlug(moduleSlug);
  if (!moduleDef) {
    return Response.json({
      success: false,
      error: `Module '${moduleSlug}' not found in registry`,
      code: 'MODULE_NOT_FOUND',
    }, { status: 404 });
  }

  // 2. Validate action handler
  const handler = moduleDef.routes.api[action];
  if (!handler) {
    return Response.json({
      success: false,
      error: `Action '${action}' not supported by module '${moduleSlug}'`,
      code: 'ACTION_NOT_FOUND',
    }, { status: 404 });
  }

  // 3. Rate limiting
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkRateLimit(ip, 100)) {
    return Response.json({
      success: false,
      error: 'Rate limit exceeded (100 requests / minute). Build slower.',
      code: 'RATE_LIMIT_EXCEEDED',
    }, { status: 429 });
  }

  // 4. Parse payload
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // Empty body
  }

  const queryObj: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    queryObj[k] = v;
  });

  const startTime = Date.now();
  try {
    const result = await handler({
      action,
      body,
      query: queryObj,
      ip,
    });

    const durationMs = Date.now() - startTime;

    // Asynchronous audit logging
    try {
      await supabaseAdmin.from('module_usage').insert({
        module_slug: moduleSlug,
        input: { action, bodySummary: typeof body === 'object' ? Object.keys(body) : 'primitive' },
        output: { success: result.success },
        duration_ms: durationMs,
        success: result.success,
        error_message: result.error || null,
      });
    } catch {
      // Non-blocking log catch
    }

    return Response.json(result, { status: result.status || 200 });
  } catch (err: any) {
    return Response.json({
      success: false,
      error: err.message || 'Module execution exception',
      code: 'MODULE_EXECUTION_ERROR',
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  const moduleSlug = params.slug?.[0];
  if (!moduleSlug) {
    return Response.json({ error: 'Missing module slug' }, { status: 400 });
  }

  const moduleDef = getModuleBySlug(moduleSlug);
  if (!moduleDef) {
    return Response.json({ error: 'Module not found' }, { status: 404 });
  }

  return Response.json({
    slug: moduleDef.slug,
    name: moduleDef.name,
    description: moduleDef.description,
    status: moduleDef.status,
    requiredTier: moduleDef.requiredTier,
    availableActions: Object.keys(moduleDef.routes.api),
  });
}
