import { getPublicHealth } from '../../../lib/diagnostics/health';

export async function GET() {
  const health = getPublicHealth();
  return Response.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  });
}
