import { NextRequest, NextResponse } from '@/lib/next-shim';
import { createServerClient } from '@/lib/supabase/server';

function generateSlug(): string {
  return Math.random().toString(36).substring(2, 8);
}

// In-memory fallback map for links
export const memoryShortLinks = new Map<string, { slug: string; targetUrl: string; clicks: number }>();

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  let user: any = null;
  try {
    const authRes = await sb.auth.getUser();
    user = authRes.data?.user;
  } catch {}

  let targetUrl = '';
  let customSlug = '';
  try {
    const body = await req.json();
    targetUrl = body.targetUrl;
    customSlug = body.customSlug;
  } catch {}

  try {
    new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid target URL' }, { status: 400 });
  }

  const slug = (customSlug || generateSlug()).toLowerCase().trim();

  // Try DB insert
  try {
    const { data, error } = await sb
      .from('short_links')
      .insert({
        user_id: user?.id || null,
        slug,
        target_url: targetUrl,
      })
      .select()
      .single();

    if (!error && data) {
      memoryShortLinks.set(slug, { slug, targetUrl, clicks: 0 });
      const host = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://jadai.dev');
      return NextResponse.json({
        slug: data.slug,
        shortUrl: `${host}/s/${data.slug}`,
        targetUrl: data.target_url,
      });
    }
  } catch (err) {}

  // Fallback to memory map
  memoryShortLinks.set(slug, { slug, targetUrl, clicks: 0 });
  const host = process.env.NEXT_PUBLIC_APP_URL || 'https://jadai.dev';
  return NextResponse.json({
    slug,
    shortUrl: `${host}/s/${slug}`,
    targetUrl,
  });
}
