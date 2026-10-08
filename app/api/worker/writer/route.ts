import { NextRequest, NextResponse } from '@/lib/next-shim';
import { runWriter } from '@/lib/signal/agents/writer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, summary, details } = body;
    const result = await runWriter(userId || 'usr-default', {
      type: type || 'git_commit',
      summary: summary || 'Shipped new module update',
      details: details || 'Completed foundational reliability optimization.',
    });
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
