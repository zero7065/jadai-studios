let serverCustomizationCache: any = null;

export async function GET() {
  return new Response(JSON.stringify({
    success: true,
    data: serverCustomizationCache,
  }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    serverCustomizationCache = { ...serverCustomizationCache, ...body };
    return new Response(JSON.stringify({
      success: true,
      message: 'Customization persisted successfully',
      data: serverCustomizationCache,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify(
      { success: false, error: err?.message || 'Invalid request' }
    ), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
