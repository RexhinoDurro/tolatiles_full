'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { ContactFormData } from '@/types/api';

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export type LeadFormSubmitPayload = Omit<
  ContactFormData,
  'honeypot' | 'form_fill_time' | 'cf_turnstile_response' | 'event_id'
>;

/**
 * Shared Turnstile + honeypot + submit plumbing for the multi-step lead forms
 * (ServiceLeadForm, ServiceTypeForm). Mirrors the anti-bot flow already used by
 * LeadCaptureForm.tsx so all lead-gen forms are protected the same way.
 */
export function useLeadFormSubmit() {
  const [honeypot, setHoneypot] = useState('');
  const mountTimeRef = useRef<number>(Date.now());

  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenResolverRef = useRef<((token: string) => void) | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (turnstileContainerRef.current && window.turnstile) {
        widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
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
      }
    };
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

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

  const submit = useCallback(
    async (payload: LeadFormSubmitPayload): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      setErrorMessage('');

      try {
        let turnstileToken: string | undefined;
        try {
          turnstileToken = await executeTurnstile();
        } catch {
          console.warn('Turnstile challenge failed or timed out');
        }

        const fillTime = Math.floor((Date.now() - mountTimeRef.current) / 1000);
        // Shared between the pixel and the server-side Conversions API call so Meta
        // dedupes them into a single Lead event instead of double-counting.
        const eventId =
          typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

        await api.submitContactForm({
          ...payload,
          honeypot,
          form_fill_time: fillTime,
          cf_turnstile_response: turnstileToken,
          event_id: eventId,
        });

        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Lead', {}, { eventID: eventId });
        }

        setSubmitStatus('success');
        return true;
      } catch (err) {
        console.error('Lead submission failed:', err);
        setSubmitStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to submit. Please call us instead.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [honeypot]
  );

  const reset = useCallback(() => {
    setSubmitStatus('idle');
    setErrorMessage('');
    setHoneypot('');
    mountTimeRef.current = Date.now();
  }, []);

  return {
    isSubmitting,
    submitStatus,
    errorMessage,
    honeypot,
    setHoneypot,
    turnstileContainerRef,
    submit,
    reset,
  };
}
