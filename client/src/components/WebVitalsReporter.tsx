import React, { useEffect } from 'react';

const WebVitalsReporter: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
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

        getCLS(reportWebVital);
        getFID(reportWebVital);
        getFCP(reportWebVital);
        getLCP(reportWebVital);
        getTTFB(reportWebVital);
      });
    }
  }, []);

  return null;
};

export default WebVitalsReporter;