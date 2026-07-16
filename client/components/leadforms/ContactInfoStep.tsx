'use client';

import type { RefObject } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { formatPhoneNumber, extractPhoneDigits } from '@/lib/phoneUtils';

interface ContactInfoStepProps {
  name: string;
  onNameChange: (value: string) => void;
  phoneDigits: string;
  onPhoneChange: (digits: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitStatus: 'idle' | 'success' | 'error';
  errorMessage: string;
  successMessage: string;
  honeypot: string;
  setHoneypot: (value: string) => void;
  turnstileContainerRef: RefObject<HTMLDivElement>;
  submitButtonLabel?: string;
}

export default function ContactInfoStep({
  name,
  onNameChange,
  phoneDigits,
  onPhoneChange,
  onBack,
  onSubmit,
  isSubmitting,
  submitStatus,
  errorMessage,
  successMessage,
  honeypot,
  setHoneypot,
  turnstileContainerRef,
  submitButtonLabel = 'Get My Free Quote',
}: ContactInfoStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  if (submitStatus === 'success') {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
        <p className="text-green-800 text-base font-medium">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2
        className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-1.5"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        Almost Done!
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">Tell us how to reach you.</p>

      <div className="space-y-4">
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
          <label htmlFor="lf-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            id="lf-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label htmlFor="lf-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
              id="lf-phone"
              value={formatPhoneNumber(phoneDigits)}
              onChange={(e) => onPhoneChange(extractPhoneDigits(e.target.value))}
              required
              className={`w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                phoneDigits ? 'rounded-r-lg' : 'rounded-lg'
              }`}
              placeholder="(904) 123-4567"
            />
          </div>
        </div>

        <div ref={turnstileContainerRef} aria-hidden="true" />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 px-4 py-3.5 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#00a8e8] hover:bg-[#0097d2] disabled:bg-blue-300 text-white py-3.5 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5" />
                {submitButtonLabel}
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400">No obligation. Fast response.</p>
      </div>
    </form>
  );
}
