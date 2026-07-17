'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { ContactFormData } from '@/types/api';

export type LeadFormSubmitPayload = Omit<ContactFormData, 'honeypot' | 'form_fill_time' | 'event_id'>;

/**
 * Shared honeypot + submit plumbing for the multi-step lead forms
 * (ServiceLeadForm, ServiceTypeForm).
 */
export function useLeadFormSubmit() {
  const [honeypot, setHoneypot] = useState('');
  const mountTimeRef = useRef<number>(Date.now());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);

  const submit = useCallback(
    async (payload: LeadFormSubmitPayload): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      setErrorMessage('');

      try {
        const fillTime = Math.floor((Date.now() - mountTimeRef.current) / 1000);
        // Shared between the pixel and the server-side Conversions API call so Meta
        // dedupes them into a single Lead event instead of double-counting.
        const eventId =
          typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

        await api.submitContactForm({
          ...payload,
          honeypot,
          form_fill_time: fillTime,
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
    submit,
    reset,
  };
}
