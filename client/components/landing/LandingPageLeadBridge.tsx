'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { extractPhoneDigits } from '@/lib/phoneUtils';

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    TolaLeads?: {
      submit: (data: { name: string; phone: string; project_type?: string }) => Promise<void>;
    };
  }
}

interface LandingPageLeadBridgeProps {
  landingPageId: number;
}

/**
 * Exposes window.TolaLeads.submit(...) so a Custom Code section's own <script> can deliver a
 * lead into the CRM without knowing about Cloudflare Turnstile — server/leads/views.py rejects
 * any submission without a valid Turnstile token in production, so a hand-written fetch() in
 * admin-pasted JS can't call the leads API directly. This ports the same Turnstile + submit
 * flow already used internally by sections/LeadFormSection.tsx.
 */
export default function LandingPageLeadBridge({ landingPageId }: LandingPageLeadBridgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenResolverRef = useRef<((token: string) => void) | null>(null);
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    mountTimeRef.current = Date.now();

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    let script: HTMLScriptElement | null = null;

    const executeTurnstile = (): Promise<string> =>
      new Promise((resolve, reject) => {
        if (!window.turnstile || !widgetIdRef.current) {
          reject(new Error('Turnstile not ready'));
          return;
        }
        window.turnstile.reset(widgetIdRef.current);
        tokenResolverRef.current = resolve;
        window.turnstile.execute(widgetIdRef.current);
        setTimeout(() => {
          tokenResolverRef.current = null;
          reject(new Error('Security check timed out. Please try again.'));
        }, 15000);
      });

    window.TolaLeads = {
      submit: async ({ name, phone, project_type }) => {
        let turnstileToken: string | undefined;
        try {
          turnstileToken = await executeTurnstile();
        } catch {
          console.warn('Turnstile challenge failed or timed out');
        }

        const [firstName, ...rest] = name.trim().split(/\s+/);
        const lastName = rest.join(' ') || firstName;
        const phoneDigits = extractPhoneDigits(phone);
        const fillTime = Math.floor((Date.now() - mountTimeRef.current) / 1000);

        await api.submitContactForm({
          first_name: firstName || 'Lead',
          last_name: lastName,
          phone: phoneDigits ? `+1${phoneDigits}` : undefined,
          project_type: project_type || 'other',
          honeypot: '',
          form_fill_time: fillTime,
          cf_turnstile_response: turnstileToken,
          landing_page_id: landingPageId,
        });

        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Lead');
        }
      },
    };

    if (siteKey) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (containerRef.current && window.turnstile) {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            size: 'invisible',
            callback: (token: string) => {
              if (tokenResolverRef.current) {
                tokenResolverRef.current(token);
                tokenResolverRef.current = null;
              }
            },
          });
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      delete window.TolaLeads;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [landingPageId]);

  return <div ref={containerRef} aria-hidden="true" />;
}
