'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { extractPhoneDigits } from '@/lib/phoneUtils';
import { loadTurnstileScript } from '@/lib/turnstile';

declare global {
  interface Window {
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
    let cancelled = false;

    // The Cloudflare script loads asynchronously, so the widget may not be
    // rendered yet when a fast-filled form is submitted — wait for it instead
    // of failing immediately, otherwise every quick submission loses its token
    // and gets rejected server-side.
    const waitForWidgetReady = (timeoutMs = 8000): Promise<void> =>
      new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
          if (window.turnstile && widgetIdRef.current) {
            resolve();
          } else if (Date.now() - start > timeoutMs) {
            reject(new Error('Turnstile failed to load. Please refresh and try again.'));
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });

    const executeTurnstile = async (): Promise<string> => {
      await waitForWidgetReady();
      return new Promise((resolve, reject) => {
        window.turnstile.reset(widgetIdRef.current!);
        tokenResolverRef.current = resolve;
        window.turnstile.execute(widgetIdRef.current!);
        setTimeout(() => {
          tokenResolverRef.current = null;
          reject(new Error('Security check timed out. Please try again.'));
        }, 15000);
      });
    };

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
      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            appearance: 'interaction-only',
            execution: 'execute',
            callback: (token: string) => {
              if (tokenResolverRef.current) {
                tokenResolverRef.current(token);
                tokenResolverRef.current = null;
              }
            },
          });
        })
        .catch((err) => console.warn('Turnstile script failed to load', err));
    }

    return () => {
      cancelled = true;
      delete window.TolaLeads;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [landingPageId]);

  return <div ref={containerRef} aria-hidden="true" />;
}
