'use client';

import Link from 'next/link';
import { Eye, Trash2, Calendar } from 'lucide-react';
import type { EstimateListItem, VisitStatus, EstimateFinancialStatus } from '@/types/api';

interface EstimatesTableProps {
  estimates: EstimateListItem[];
  onDelete: (id: number) => void;
}

const visitStatusColors: Record<VisitStatus, string> = {
  not_scheduled: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

const financialStatusColors: Record<EstimateFinancialStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}

export default function EstimatesTable({ estimates, onDelete }: EstimatesTableProps) {
  if (estimates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates found</h3>
        <p className="text-gray-500">Create your first estimate to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Financial</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {estimates.map((est) => (
              <tr key={est.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm text-purple-600">{est.reference}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{est.customer_name}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 truncate max-w-xs">{est.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(est.scheduled_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${visitStatusColors[est.visit_status]}`}>
                    {est.visit_status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${financialStatusColors[est.financial_status]}`}>
                    {est.financial_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                  {formatCurrency(est.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/crm/estimates/${est.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => onDelete(est.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {estimates.map((est) => (
          <Link key={est.id} href={`/admin/crm/estimates/${est.id}`} className="block p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-mono text-sm text-purple-600">{est.reference}</span>
                <h3 className="font-medium text-gray-900">{est.title}</h3>
                <p className="text-sm text-gray-500">{est.customer_name}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${visitStatusColors[est.visit_status]}`}>
                {est.visit_status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">{formatDate(est.scheduled_date)}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(est.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
