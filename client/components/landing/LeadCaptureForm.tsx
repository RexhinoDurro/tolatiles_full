'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { extractPhoneDigits, formatPhoneNumber } from '@/lib/phoneUtils';
import { loadTurnstileScript } from '@/lib/turnstile';

interface LeadCaptureFormConfig {
  heading?: string;
  button_label?: string;
  success_message?: string;
  project_type?: string;
}

interface LeadCaptureFormProps {
  config: LeadCaptureFormConfig;
  landingPageId: number;
  /** Anchor id so other sections (e.g. a CTA) can link to "#lead-form". */
  id?: string;
}

export default function LeadCaptureForm({ config, landingPageId, id }: LeadCaptureFormProps) {
  const heading = config.heading || 'Get Your Free Quote';
  const buttonLabel = config.button_label || 'Schedule Now';
  const successMessage = config.success_message || "Thank you! We'll call you shortly.";
  const projectType = config.project_type || 'other';

  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneDigits(extractPhoneDigits(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        return;
      }

      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(' ') || firstName;
      const fillTime = Math.floor((Date.now() - mountTimeRef.current) / 1000);
      // Shared between the pixel and the server-side Conversions API call so Meta
      // dedupes them into a single Lead event instead of double-counting.
      const eventId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

      await api.submitContactForm({
        first_name: firstName || 'Lead',
        last_name: lastName,
        phone: phoneDigits ? `+1${phoneDigits}` : undefined,
        project_type: projectType,
        honeypot,
        form_fill_time: fillTime,
        cf_turnstile_response: turnstileToken,
        landing_page_id: landingPageId,
        event_id: eventId,
      });

      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {}, { eventID: eventId });
      }

      setSubmitStatus('success');
      setName('');
      setPhoneDigits('');
      setHoneypot('');
      mountTimeRef.current = Date.now();
    } catch (err) {
      console.error('Landing page lead submission failed:', err);
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit. Please call us instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id={id} className="w-full max-w-md mx-auto">
      <div
        className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-7 sm:px-8 sm:py-8"
        style={{ colorScheme: 'light' }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6">{heading}</h2>

        {submitStatus === 'success' ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-800 text-base font-medium">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="company_website">Company Website</label>
              <input
                type="text"
                id="company_website"
                name="company_website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="lp-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                id="lp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="lp-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Phone Number
              </label>
              <div className="relative flex">
                {phoneDigits && (
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 font-medium select-none text-base">
                    +1
                  </span>
                )}
                <input
                  type="tel"
                  id="lp-phone"
                  value={formatPhoneNumber(phoneDigits)}
                  onChange={handlePhoneChange}
                  required
                  className={`w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    phoneDigits ? 'rounded-r-lg' : 'rounded-lg'
                  }`}
                  placeholder="(904) 123-4567"
                />
              </div>
            </div>

            <div ref={turnstileContainerRef} aria-hidden="true" />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3.5 px-6 rounded-lg font-semibold text-base sm:text-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  {buttonLabel}
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-400">No obligation. Fast response.</p>
          </form>
        )}
      </div>
    </div>
  );
}
