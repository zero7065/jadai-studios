import { NextRequest, NextResponse } from '@/lib/next-shim';
import { createServerClient } from '@/lib/supabase/server';
import { memoryShortLinks } from '@/app/api/short/create/route';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params?.slug;
  if (!slug) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const sb = createServerClient();
  try {
    const { data: link } = await sb
      .from('short_links')
      .select('target_url, clicks')
      .eq('slug', slug)
      .maybeSingle();

    if (link?.target_url) {
      await sb
        .from('short_links')
        .update({ clicks: (link.clicks || 0) + 1 })
        .eq('slug', slug);
      return NextResponse.redirect(link.target_url);
    }
  } catch {}

  const memLink = memoryShortLinks.get(slug);
  if (memLink?.targetUrl) {
    memLink.clicks += 1;
    return NextResponse.redirect(memLink.targetUrl);
  }

  return NextResponse.redirect(new URL('/', req.url));
}
