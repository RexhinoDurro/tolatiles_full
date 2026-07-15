'use client';

import Script from 'next/script';
import { buildGtmNoscript, buildGtmScript } from '@/lib/tracking-snippets';

interface AnalyticsProps {
  gtmId?: string;
}

const Analytics = ({ gtmId }: AnalyticsProps) => {
  if (!gtmId) return null;

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: buildGtmScript(gtmId) }}
      />
      <noscript dangerouslySetInnerHTML={{ __html: buildGtmNoscript(gtmId) }} />
    </>
  );
};

export default Analytics;
