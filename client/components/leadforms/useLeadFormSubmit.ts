'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { loadTurnstileScript } from '@/lib/turnstile';
import type { ContactFormData } from '@/types/api';

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
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !turnstileContainerRef.current || !window.turnstile) return;
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
      })
      .catch((err) => console.warn('Turnstile script failed to load', err));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

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

  const submit = useCallback(
    async (payload: LeadFormSubmitPayload): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      setErrorMessage('');

      try {
        // The backend rejects any submission without a Turnstile token, so
        // there's no point sending one — fail fast with an actionable
        // message instead of a doomed request.
        let turnstileToken: string;
        try {
          turnstileToken = await executeTurnstile();
        } catch (turnstileErr) {
          console.warn('Turnstile challenge failed or timed out', turnstileErr);
          setSubmitStatus('error');
          setErrorMessage('Security check failed to load. Please refresh the page and try again, or call us instead.');
          return false;
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
