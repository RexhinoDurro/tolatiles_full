'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import EstimateForm from '@/components/admin/crm/estimates/EstimateForm';
import { api } from '@/lib/api';
import type { EstimateCreate } from '@/types/api';

function NewEstimateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCustomerId = searchParams.get('customer') ? Number(searchParams.get('customer')) : undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EstimateCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const estimate = await api.createEstimate(data);
      router.push(`/admin/crm/estimates/${estimate.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create estimate');
      setIsLoading(false);
    }
  };

  return (
    <CrmLayout title="New Estimate">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/crm/estimates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Estimates
          </Link>
        </div>
        {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
        <EstimateForm
          defaultCustomerId={defaultCustomerId}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </CrmLayout>
  );
}

export default function NewEstimatePage() {
  return (
    <Suspense fallback={null}>
      <NewEstimateContent />
    </Suspense>
  );
}
