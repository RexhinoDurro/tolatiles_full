'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, PhoneCall } from 'lucide-react';
import { api } from '@/lib/api';
import { extractPhoneDigits, formatPhoneNumber } from '@/lib/phoneUtils';

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

/**
 * Deliberately old-school "2010s web form" look: a bold bordered card, a glossy
 * gradient header bar, oversized labels/inputs, and a chunky 3D press-button —
 * chosen for maximum clarity for older, less tech-savvy visitors rather than a
 * modern flat aesthetic.
 */
export default function LeadCaptureForm({ config, landingPageId, id }: LeadCaptureFormProps) {
  const heading = config.heading || 'Get Your Free Quote';
  const buttonLabel = config.button_label || 'Get My Free Quote';
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneDigits(extractPhoneDigits(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(' ') || firstName;
      const fillTime = Math.floor((Date.now() - mountTimeRef.current) / 1000);

      await api.submitContactForm({
        first_name: firstName || 'Lead',
        last_name: lastName,
        phone: phoneDigits ? `+1${phoneDigits}` : undefined,
        project_type: projectType,
        honeypot,
        form_fill_time: fillTime,
        cf_turnstile_response: turnstileToken,
        landing_page_id: landingPageId,
      });

      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead');
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
    <div id={id} className="w-full max-w-md mx-auto" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div
        className="rounded-lg overflow-hidden border-4 border-blue-900"
        style={{ boxShadow: '0 8px 0 rgba(0,0,0,0.2), 0 14px 28px rgba(0,0,0,0.35)' }}
      >
        <div className="bg-gradient-to-b from-blue-500 to-blue-800 px-5 py-4 text-center border-b-4 border-blue-900">
          <p className="text-white font-extrabold text-xl sm:text-2xl uppercase tracking-wide">{heading}</p>
        </div>

        <div className="bg-white px-5 py-6 sm:px-7 sm:py-7">
          {submitStatus === 'success' ? (
            <div className="p-4 bg-green-50 border-2 border-green-600 rounded-md flex items-start gap-3">
              <CheckCircle className="h-7 w-7 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-800 text-lg font-semibold">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border-2 border-red-600 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 text-base font-semibold">{errorMessage}</p>
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
                <label htmlFor="lp-name" className="block text-lg font-bold text-gray-900 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="lp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-4 text-xl border-2 border-gray-500 rounded-md focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label htmlFor="lp-phone" className="block text-lg font-bold text-gray-900 mb-2">
                  Your Phone Number
                </label>
                <div className="relative flex">
                  {phoneDigits && (
                    <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-500 rounded-l-md bg-gray-100 text-blue-800 font-bold select-none text-xl">
                      +1
                    </span>
                  )}
                  <input
                    type="tel"
                    id="lp-phone"
                    value={formatPhoneNumber(phoneDigits)}
                    onChange={handlePhoneChange}
                    required
                    className={`w-full px-4 py-4 text-xl border-2 border-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 ${
                      phoneDigits ? 'rounded-r-md' : 'rounded-md'
                    }`}
                    placeholder="(904) 123-4567"
                  />
                </div>
              </div>

              <div ref={turnstileContainerRef} aria-hidden="true" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-b from-green-400 to-green-600 disabled:from-green-300 disabled:to-green-400 text-white py-5 px-6 rounded-md border-2 border-green-800 font-extrabold text-xl uppercase tracking-wide flex items-center justify-center gap-3 transition-all"
                style={{ boxShadow: isSubmitting ? 'none' : '0 5px 0 #14532d', transform: isSubmitting ? 'translateY(3px)' : undefined }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-6 w-6" />
                    {buttonLabel}
                  </>
                )}
              </button>

              <p className="text-center text-sm sm:text-base font-semibold text-gray-500">
                100% Free &nbsp;•&nbsp; No Obligation &nbsp;•&nbsp; Fast Response
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
