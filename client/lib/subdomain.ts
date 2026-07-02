/** Shared subdomain-parsing logic used by both middleware.ts (edge) and layout.tsx (server). */

const ROOT_HOSTNAMES = new Set(['tolatiles.com', 'www.tolatiles.com', 'localhost']);
// Both spellings exist in the wild (nginx uses "quote", ALLOWED_HOSTS uses "quotes") —
// handle either until that inconsistency is cleaned up at the infra layer.
export const QUOTE_SUBDOMAINS = new Set(['quote', 'quotes']);

export function getSubdomain(hostname: string): string | null {
  // Strip port, e.g. "bathroom.tolatiles.com:3000" -> "bathroom.tolatiles.com"
  const host = hostname.split(':')[0];

  if (ROOT_HOSTNAMES.has(host)) return null;

  if (host.endsWith('.tolatiles.com')) {
    return host.slice(0, -'.tolatiles.com'.length);
  }

  // Local dev convenience: bathroom.localhost -> "bathroom"
  if (host.endsWith('.localhost')) {
    return host.slice(0, -'.localhost'.length);
  }

  return null;
}

export function isLandingPageSubdomain(hostname: string): boolean {
  const subdomain = getSubdomain(hostname);
  return !!subdomain && !QUOTE_SUBDOMAINS.has(subdomain);
}
