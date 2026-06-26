import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const isQuoteSubdomain =
    hostname === 'quote.tolatiles.com' || hostname.startsWith('quote.tolatiles.com:');

  if (!isQuoteSubdomain) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Allow Next.js internals, static PWA files, and quotes-portal paths
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images/') ||
    pathname === '/quotes-portal-manifest.json' ||
    pathname === '/quotes-portal-sw.js' ||
    pathname === '/quotes-portal' ||
    pathname.startsWith('/quotes-portal/')
  ) {
    return NextResponse.next();
  }

  // Redirect everything else to the portal
  const url = request.nextUrl.clone();
  url.pathname = '/quotes-portal/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
