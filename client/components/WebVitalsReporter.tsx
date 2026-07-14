'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Reports real-user Core Web Vitals (LCP, INP, CLS) plus FCP/TTFB to GA as
 * events, so mobile performance regressions show up in field data instead of
 * only in synthetic lab tests. No-ops silently if GA hasn't loaded (gtag is
 * injected by Analytics.tsx, which is skipped on landing-site subdomains).
 */
function sendToGA(metric: Metric) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    non_interaction: true,
  });
}

export default function WebVitalsReporter() {
  useEffect(() => {
    onCLS(sendToGA);
    onINP(sendToGA);
    onLCP(sendToGA);
    onFCP(sendToGA);
    onTTFB(sendToGA);
  }, []);

  return null;
}
