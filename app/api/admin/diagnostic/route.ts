import { runSelfCheck } from '../../../../lib/diagnostics/self-check';

export async function GET(request: Request) {
  try {
    const report = await runSelfCheck(false);
    return Response.json({ success: true, report }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body
    }
    const runFull = Boolean((body as any).run_full);
    const report = await runSelfCheck(runFull);
    return Response.json({ success: true, report }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
