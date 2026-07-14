import { NextRequest, NextResponse } from 'next/server';
import { getSubdomain, QUOTE_SUBDOMAINS } from '@/lib/subdomain';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = getSubdomain(hostname);
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals through untouched
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (!subdomain) return NextResponse.next();

  if (QUOTE_SUBDOMAINS.has(subdomain)) {
    // Allow static PWA files and quotes-portal paths
    if (
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

  // Any other subdomain is a candidate admin-managed landing page. Rewrite (not redirect)
  // so the browser URL bar and generateMetadata both keep the real subdomain. We don't
  // validate the subdomain against the database here — that would mean an API call on
  // every edge request. The /landing-site/[subdomain] route itself 404s if nothing matches.
  // NOTE: deliberately not named "_landing" — Next.js excludes underscore-prefixed folders
  // from routing entirely, so a rewrite target there would always 404.
  if (
    pathname.startsWith('/images/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/landing-site/${subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
