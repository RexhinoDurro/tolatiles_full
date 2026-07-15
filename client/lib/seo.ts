/** Sitewide fallback social-share image. Pages that define their own `openGraph`
 * object must include `images` explicitly — Next.js does not deep-merge openGraph
 * from the root layout once a page overrides it, so omitting this silently drops
 * the preview image on shares. */
export const DEFAULT_OG_IMAGE = {
  url: 'https://tolatiles.com/images/tolatiles-team-background-jacksonville-tile-installers.webp',
  width: 2048,
  height: 1143,
  alt: 'Tola Tiles - Tile Installation Team in Jacksonville & St. Augustine, FL',
};

/** Strips a redundant trailing "Tola Tiles" brand suffix from CMS-authored titles.
 * The root layout's title template already appends " | Tola Tiles" to every page,
 * so admin-entered meta titles that already include the brand name would otherwise
 * render duplicated (e.g. "X | Tola Tiles | Tola Tiles"). */
export function cleanPageTitle(title: string): string {
  let cleaned = title.trim();
  const suffixPattern = /\s*[|\-–—]\s*Tola\s*Tiles(\s+(Blog|Guides?|Stories|Design\s*Ideas|Projects))?\s*$/i;
  while (suffixPattern.test(cleaned)) {
    cleaned = cleaned.replace(suffixPattern, '').trim();
  }
  return cleaned;
}
