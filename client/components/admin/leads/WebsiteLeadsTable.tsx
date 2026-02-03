'use client';

import { useState } from 'react';
import { Eye, Trash2, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import LeadStatusBadge from './LeadStatusBadge';
import type { ContactLead } from '@/types/api';

interface WebsiteLeadsTableProps {
  leads: ContactLead[];
  onView: (lead: ContactLead) => void;
  onDelete: (lead: ContactLead) => void;
}

type SortField = 'full_name' | 'email' | 'project_type' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

const projectTypeLabels: Record<string, string> = {
  'kitchen-backsplash': 'Kitchen Backsplash',
  bathroom: 'Bathroom Tiles',
  flooring: 'Flooring',
  patio: 'Patio/Outdoor',
  fireplace: 'Fireplace',
  commercial: 'Commercial',
  other: 'Other',
};

export default function WebsiteLeadsTable({ leads, onView, onDelete }: WebsiteLeadsTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let aVal: string | Date = a[sortField] as string;
    let bVal: string | Date = b[sortField] as string;

    if (sortField === 'created_at') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-300" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl">
        <div className="text-gray-400 text-lg">No leads found</div>
        <p className="text-gray-500 text-sm mt-2">Contact form submissions will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('full_name')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Name
                  <SortIcon field="full_name" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Email
                  <SortIcon field="email" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('project_type')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Project
                  <SortIcon field="project_type" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Date
                  <SortIcon field="created_at" />
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedLeads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onView(lead)}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{lead.full_name}</div>
                  {lead.phone && <div className="text-sm text-gray-500">{lead.phone}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-600">{lead.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-600">
                    {projectTypeLabels[lead.project_type] || lead.project_type}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <LeadStatusBadge status={lead.status} size="sm" />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onView(lead)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(lead)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
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
      <div className="md:hidden divide-y divide-gray-100">
        {sortedLeads.map((lead) => (
          <div
            key={lead.id}
            className="p-4 hover:bg-gray-50 transition-colors"
            onClick={() => onView(lead)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{lead.full_name}</h3>
                  <LeadStatusBadge status={lead.status} size="sm" />
                </div>
                <p className="text-sm text-gray-600 truncate">{lead.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {projectTypeLabels[lead.project_type] || lead.project_type}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Mobile menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveMenu(activeMenu === lead.id ? null : lead.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {activeMenu === lead.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveMenu(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-32">
                      <button
                        onClick={() => {
                          setActiveMenu(null);
                          onView(lead);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenu(null);
                          onDelete(lead);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
