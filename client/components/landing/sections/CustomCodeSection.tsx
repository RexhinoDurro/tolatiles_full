'use client';

import { useEffect, useRef } from 'react';

interface CustomCodeSectionProps {
  config: {
    html?: string;
  };
}

/**
 * Renders admin-authored HTML/CSS/JS verbatim (admin-trust-level input, same boundary as
 * LandingPage.custom_head_scripts/custom_body_scripts). <style> tags apply automatically via
 * innerHTML, but browsers never execute <script> tags inserted that way — so each one is
 * replaced with a freshly created <script> element to force it to run.
 */
export default function CustomCodeSection({ config }: CustomCodeSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  }, [config.html]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: config.html || '' }} />;
}
