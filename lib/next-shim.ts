export class NextRequest extends Request {
  get nextUrl() {
    return new URL(this.url);
  }
}

export class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
  }

  static redirect(url: string | URL, status: number = 302) {
    return new Response(null, {
      status,
      headers: {
        Location: typeof url === 'string' ? url : url.toString(),
      },
    });
  }
}
