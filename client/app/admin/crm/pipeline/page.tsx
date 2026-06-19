'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import PipelineBoard from '@/components/admin/crm/pipeline/PipelineBoard';
import { api } from '@/lib/api';
import type { Deal, Customer } from '@/types/api';

export default function CrmPipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dealsData, customersData] = await Promise.all([
        api.getDeals(),
        api.getCustomers(),
      ]);
      setDeals(dealsData);
      setCustomers(customersData);
    } catch {
      setError('Failed to load pipeline data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleArchiveDeal = async (id: number) => {
    await api.archiveDeal(id);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <CrmLayout title="Pipeline">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Drag deals between stages to update their status</p>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <PipelineBoard
            initialDeals={deals}
            customers={customers}
            onRefresh={fetchData}
            onArchive={handleArchiveDeal}
          />
        )}
      </div>
    </CrmLayout>
  );
}
