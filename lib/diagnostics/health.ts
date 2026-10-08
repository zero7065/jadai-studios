export interface HealthCheckResponse {
  ok: boolean;
  ts: string;
  version: string;
}

export function getPublicHealth(): HealthCheckResponse {
  return {
    ok: true,
    ts: new Date().toISOString(),
    version: '1.0.0',
  };
}
