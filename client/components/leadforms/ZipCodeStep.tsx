'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ZipCodeStepProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  /** Hide the Back button when this is the first step (e.g. no sub-type step precedes it). */
  showBack?: boolean;
}

export default function ZipCodeStep({ value, onChange, onBack, onNext, showBack = true }: ZipCodeStepProps) {
  const isValid = /^\d{5}$/.test(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2
        className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-1.5"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        What&apos;s Your Zip Code?
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6">So we know if we serve your area.</p>

      <input
        type="text"
        inputMode="numeric"
        pattern="\d{5}"
        maxLength={5}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
        placeholder="32095"
        className="w-full px-4 py-3.5 text-lg text-center tracking-widest text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <div className="flex items-center gap-3 mt-6">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 px-4 py-3.5 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 bg-[#00a8e8] hover:bg-[#0097d2] disabled:bg-gray-200 disabled:text-gray-400 text-white py-3.5 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
