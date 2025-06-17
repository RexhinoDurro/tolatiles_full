import React, { useEffect } from 'react';

const PerformanceOptimizer: React.FC = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadResource = (href: string, as: string, type?: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      document.head.appendChild(link);
    };

    // Preload critical fonts
    preloadResource('/fonts/inter-var.woff2', 'font', 'font/woff2');
    
    // Preload hero images
    preloadResource('/assets/images/hero-bg.webp', 'image');

    // Optimize images for better loading
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Prefetch next likely pages
    const prefetchPages = ['/services', '/gallery', '/contact'];
    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

    return () => {
      imageObserver.disconnect();
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;