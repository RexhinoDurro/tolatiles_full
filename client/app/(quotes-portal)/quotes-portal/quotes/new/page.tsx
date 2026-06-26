'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PortalProtectedRoute from '@/components/quotes-portal/PortalProtectedRoute';
import QuoteForm from '@/components/admin/quotes/QuoteForm';
import { portalApi } from '@/lib/portalApi';
import type { QuoteCreate } from '@/types/api';

/**
 * Portal new-quote page.
 *
 * Rep types the customer's name, which is saved as `portal_contact_name`
 * directly on the quote. No customer record is created. The admin links
 * it to a customer/deal in the CRM later.
 */
function NewPortalQuoteContent() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: QuoteCreate) => {
    setIsLoading(true);
    setNameError('');

    const fn = firstName.trim();
    const ln = lastName.trim();

    if (!fn || !ln) {
      setNameError('Please enter both first and last name.');
      setIsLoading(false);
      return;
    }

    try {
      const portal_contact_name = `${fn} ${ln}`;
      await portalApi.createQuote({ ...data, portal_contact_name });
      window.location.href = '/quotes-portal/quotes';
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to create quote');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-base font-semibold text-gray-900 flex-1">New Quote</h1>
          {/* Submit button in header — visible only on mobile */}
          <button
            type="submit"
            form="portal-new-quote"
            disabled={isLoading}
            className="sm:hidden flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
            Create Quote
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* ── Customer name card ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Customer Name
            </h2>
          </div>
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-3">
              Enter the customer's name. The admin will link this quote to the correct CRM
              record later.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setNameError(''); }}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${nameError ? 'border-red-400' : 'border-gray-200'
                    }`}
                  placeholder="Maria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setNameError(''); }}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${nameError ? 'border-red-400' : 'border-gray-200'
                    }`}
                  placeholder="Garcia"
                />
              </div>
            </div>
            {nameError && <p className="text-red-500 text-xs mt-2">{nameError}</p>}
          </div>
        </div>

        {/* ── QuoteForm (rest of fields) ── */}
        <QuoteForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          hideCustomerField
          formId="portal-new-quote"
          hideBottomBarOnMobile
        />
      </div>
    </div>
  );
}

export default function NewPortalQuotePage() {
  return (
    <PortalProtectedRoute>
      <NewPortalQuoteContent />
    </PortalProtectedRoute>
  );
}
