import { NextRequest, NextResponse } from 'next/server';

/**
 * JADAI STUDIOS — PERIMETER MIDDLEWARE & GATEKEEPER
 * Enforces admin session authentication and master admin bypass
 */

const ADMIN_EMAIL = 'jadaistudiosoffcl@gmail.com';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Admin Lounge Session Protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookieHeader = req.headers.get('cookie') || '';
    const hasAdminCookie = cookieHeader.includes('jadai_admin_session=active');
    const authHeader = req.headers.get('x-admin-key');

    // If no valid admin cookie or header, redirect to /admin/login
    if (!hasAdminCookie && !authHeader) {
      // In Next.js SSR / edge, redirect to login
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
