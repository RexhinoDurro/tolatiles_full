'use client';

import Script from 'next/script';
import { buildGaScript, buildGtmNoscript, buildGtmScript } from '@/lib/tracking-snippets';

interface AnalyticsProps {
  gtmId?: string;
  gaId?: string;
}

const Analytics = ({ gtmId, gaId }: AnalyticsProps) => {
  return (
    <>
      {/* Google Tag Manager */}
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

      {/* Google Analytics */}
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
    </>
  );
};

export default Analytics;
