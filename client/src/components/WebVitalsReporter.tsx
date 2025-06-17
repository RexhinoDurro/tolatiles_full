// src/components/WebVitalsReporter.tsx
import React, { useEffect } from 'react';

const WebVitalsReporter: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        const reportWebVital = (metric: any) => {
          // Send to analytics
          if (window.gtag) {
            window.gtag('event', metric.name, {
              custom_parameter_1: metric.value,
              custom_parameter_2: metric.rating,
              non_interaction: true,
            });
          }

          // Send to console in development
          if (import.meta.env.DEV) {
            console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
          }
        };

        // Use current Core Web Vitals API
        onCLS(reportWebVital);   // Cumulative Layout Shift
        onINP(reportWebVital);   // Interaction to Next Paint (replaced FID on March 12, 2024)
        onFCP(reportWebVital);   // First Contentful Paint
        onLCP(reportWebVital);   // Largest Contentful Paint
        onTTFB(reportWebVital);  // Time to First Byte
      }).catch((error) => {
        console.error('Failed to load web-vitals:', error);
      });
    }
  }, []);

  return null;
};

export default WebVitalsReporter;