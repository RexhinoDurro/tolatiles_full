'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';
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

interface LeadFormConfig {
  heading?: string;
  button_label?: string;
  success_message?: string;
  project_type?: string;
}

interface LeadFormSectionProps {
  config: LeadFormConfig;
  landingPageId: number;
}

export default function LeadFormSection({ config, landingPageId }: LeadFormSectionProps) {
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
    <section id="lead-form" className="py-16 px-6 bg-gray-50">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">{heading}</h2>

        {submitStatus === 'success' ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 text-lg">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label htmlFor="lp-name" className="block text-base font-semibold text-gray-900 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="lp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="lp-phone" className="block text-base font-semibold text-gray-900 mb-2">
                Phone Number *
              </label>
              <div className="relative flex">
                {phoneDigits && (
                  <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-300 rounded-l-xl bg-gray-50 text-blue-600 font-bold select-none">
                    +1
                  </span>
                )}
                <input
                  type="tel"
                  id="lp-phone"
                  value={formatPhoneNumber(phoneDigits)}
                  onChange={handlePhoneChange}
                  required
                  className={`w-full px-4 py-4 text-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    phoneDigits ? 'rounded-r-xl' : 'rounded-xl'
                  }`}
                  placeholder="(904) 123-4567"
                />
              </div>
            </div>

            <div ref={turnstileContainerRef} aria-hidden="true" />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-5 px-6 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-200 font-bold text-xl flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-6 w-6" />
                  {buttonLabel}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
