declare module 'next/server' {
  export class NextRequest extends Request {
    readonly nextUrl: URL;
    readonly ip?: string;
    readonly geo?: {
      city?: string;
      country?: string;
      region?: string;
    };
  }

  export class NextResponse<Body = any> extends Response {
    static json<JsonBody>(data: JsonBody, init?: ResponseInit): NextResponse<JsonBody>;
    static redirect(url: string | URL, status?: number): NextResponse<never>;
    static next(init?: ResponseInit): NextResponse<never>;
  }
}
