/**
 * Next.js Edge Middleware — route protection for NotaryChain.
 *
 * This middleware runs on the Edge Runtime (no Node.js APIs).
 * It checks for the presence of a Firebase session cookie or the
 * sessionStorage token is NOT accessible here — instead we rely on
 * a lightweight cookie written by the client after Firebase auth.
 *
 * Flow:
 *  • Unauthenticated user hits /dashboard → redirect to /login
 *  • Authenticated user hits /login       → redirect to /dashboard
 *  • Admin route (/admin) additionally checked server-side in the page itself
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/documents',
  '/notary',
];

// Routes that should redirect authenticated users away
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

// Public routes that never need a redirect
const PUBLIC_ROUTES = [
  '/',
  '/verify-email',
  '/verify-2fa',
  '/phone-verification',
  '/api',
  '/_next',
  '/favicon.ico',
];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for Next.js internals and static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth session cookie (set by client-side auth after login)
  // We use a simple presence check — actual token verification happens
  // server-side in API routes via Firebase Admin SDK.
  const authCookie =
    request.cookies.get('firebase_auth_token')?.value ||
    request.cookies.get('__session')?.value;

  const isAuthenticated = Boolean(authCookie);

  // Redirect unauthenticated users from protected routes
  if (isProtected(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
