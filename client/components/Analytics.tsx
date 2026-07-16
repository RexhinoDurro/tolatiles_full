'use client';

import Script from 'next/script';
import {
  buildGtmNoscript,
  buildGtmScript,
  buildMetaPixelNoscript,
  buildMetaPixelScript,
} from '@/lib/tracking-snippets';

interface AnalyticsProps {
  gtmId?: string;
  metaPixelId?: string;
}

const Analytics = ({ gtmId, metaPixelId }: AnalyticsProps) => {
  if (!gtmId && !metaPixelId) return null;

  return (
    <>
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
      {metaPixelId && (
        <>
          <Script
            id="meta-pixel-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: buildMetaPixelScript(metaPixelId) }}
          />
          <noscript dangerouslySetInnerHTML={{ __html: buildMetaPixelNoscript(metaPixelId) }} />
        </>
      )}
    </>
  );
};

export default Analytics;
