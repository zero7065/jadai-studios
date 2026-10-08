import { NextRequest, NextResponse } from '@/lib/next-shim';
import { createServerClient } from '@/lib/supabase/server';
import { runScout } from '@/lib/signal/agents/scout';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = createServerClient();
  let users: any[] = [];
  try {
    const { data } = await sb
      .from('signal_settings')
      .select('user_id')
      .in('plan', ['free', 'pro', 'business', 'agency']);
    users = data || [];
  } catch {}

  if (!users || users.length === 0) {
    // Run for default user
    users = [{ user_id: 'usr-default' }];
  }

  const results = await Promise.allSettled(
    users.map((u) => runScout(u.user_id))
  );

  return NextResponse.json({
    total: users.length,
    succeeded: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
