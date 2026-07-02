'use client';

import Script from 'next/script';
import {
  buildGaScript,
  buildGtmNoscript,
  buildGtmScript,
  buildMetaPixelNoscript,
  buildMetaPixelScript,
} from '@/lib/tracking-snippets';

interface LandingPageTrackingProps {
  pixelId?: string;
  gtmId?: string;
  gaId?: string;
  headScripts?: string;
  bodyScripts?: string;
}

/**
 * Per-landing-page tracking, sourced entirely from the LandingPage record (not env vars) —
 * every landing page can carry its own Pixel/GTM/GA IDs, unlike the main site's Analytics.tsx.
 * `headScripts`/`bodyScripts` are raw admin-authored HTML and execute as-is: this is an
 * intentional admin-trust-level input, the same trust boundary as Django admin superuser access.
 */
export default function LandingPageTracking({
  pixelId,
  gtmId,
  gaId,
  headScripts,
  bodyScripts,
}: LandingPageTrackingProps) {
  return (
    <>
      {pixelId && (
        <>
          <Script
            id="meta-pixel-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: buildMetaPixelScript(pixelId) }}
          />
          <noscript dangerouslySetInnerHTML={{ __html: buildMetaPixelNoscript(pixelId) }} />
        </>
      )}

      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: buildGtmScript(gtmId) }}
          />
          <noscript dangerouslySetInnerHTML={{ __html: buildGtmNoscript(gtmId) }} />
        </>
      )}

      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script
            id="ga-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: buildGaScript(gaId) }}
          />
        </>
      )}

      {headScripts && (
        <Script id="landing-page-custom-head" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: headScripts }} />
      )}
      {bodyScripts && (
        <Script id="landing-page-custom-body" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: bodyScripts }} />
      )}
    </>
  );
}
