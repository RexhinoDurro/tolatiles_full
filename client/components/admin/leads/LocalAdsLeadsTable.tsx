'use client';

import { useState } from 'react';
import { Eye, ChevronUp, ChevronDown, MoreVertical, Phone, MessageSquare } from 'lucide-react';
import LocalAdsStatusBadge from './LocalAdsStatusBadge';
import type { LocalAdsLead, LocalAdsLeadStatus } from '@/types/api';

interface LocalAdsLeadsTableProps {
  leads: LocalAdsLead[];
  onViewDetails: (lead: LocalAdsLead) => void;
  onStatusChange: (leadId: number, status: LocalAdsLeadStatus) => void;
  isUpdating?: number | null;
}

type SortField = 'customer_phone' | 'job_type' | 'location' | 'lead_type' | 'charge_status' | 'lead_received' | 'last_activity' | 'status';
type SortDirection = 'asc' | 'desc';

const chargeStatusLabels: Record<string, { label: string; className: string }> = {
  charged: {
    label: 'Charged',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  not_charged: {
    label: 'Not Charged',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

const leadTypeIcons: Record<string, { icon: typeof Phone; label: string }> = {
  phone: { icon: Phone, label: 'Phone Call' },
  message: { icon: MessageSquare, label: 'Message' },
};

const statusOptions: { value: LocalAdsLeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

export default function LocalAdsLeadsTable({
  leads,
  onViewDetails,
  onStatusChange,
  isUpdating,
}: LocalAdsLeadsTableProps) {
  const [sortField, setSortField] = useState<SortField>('lead_received');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<number | null>(null);

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

    if (sortField === 'lead_received' || sortField === 'last_activity') {
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleStatusSelect = (leadId: number, status: LocalAdsLeadStatus) => {
    setStatusDropdown(null);
    onStatusChange(leadId, status);
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl">
        <div className="text-gray-400 text-lg">No local ads leads found</div>
        <p className="text-gray-500 text-sm mt-2">Google Local Services leads will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('customer_phone')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Customer
                  <SortIcon field="customer_phone" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('job_type')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Job Type
                  <SortIcon field="job_type" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('location')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Location
                  <SortIcon field="location" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('lead_type')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Type
                  <SortIcon field="lead_type" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('charge_status')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Charge
                  <SortIcon field="charge_status" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('lead_received')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Received
                  <SortIcon field="lead_received" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedLeads.map((lead) => {
              const LeadTypeIcon = leadTypeIcons[lead.lead_type]?.icon || Phone;
              const chargeConfig = chargeStatusLabels[lead.charge_status] || chargeStatusLabels.not_charged;

              return (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.customer_phone}</div>
                    {lead.customer_name && (
                      <div className="text-sm text-gray-500">{lead.customer_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600 text-sm">{lead.job_type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600 text-sm max-w-[150px] truncate" title={lead.location}>
                      {lead.location}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <LeadTypeIcon className="w-4 h-4" />
                      <span className="text-sm">{leadTypeIcons[lead.lead_type]?.label || lead.lead_type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${chargeConfig.className}`}>
                      {chargeConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500">{formatDateTime(lead.lead_received)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setStatusDropdown(statusDropdown === lead.id ? null : lead.id)}
                        disabled={isUpdating === lead.id}
                        className="focus:outline-none"
                      >
                        <LocalAdsStatusBadge status={lead.status} size="sm" />
                      </button>

                      {statusDropdown === lead.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setStatusDropdown(null)}
                          />
                          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-32">
                            {statusOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleStatusSelect(lead.id, option.value)}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                  lead.status === option.value ? 'bg-gray-50 font-medium' : 'text-gray-700'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewDetails(lead)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden divide-y divide-gray-100">
        {sortedLeads.map((lead) => {
          const LeadTypeIcon = leadTypeIcons[lead.lead_type]?.icon || Phone;
          const chargeConfig = chargeStatusLabels[lead.charge_status] || chargeStatusLabels.not_charged;

          return (
            <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{lead.customer_phone}</h3>
                    <LocalAdsStatusBadge status={lead.status} size="sm" />
                  </div>
                  {lead.customer_name && (
                    <p className="text-sm text-gray-600">{lead.customer_name}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{lead.job_type}</p>
                  <p className="text-sm text-gray-500 truncate">{lead.location}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <LeadTypeIcon className="w-3.5 h-3.5" />
                      <span>{leadTypeIcons[lead.lead_type]?.label || lead.lead_type}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${chargeConfig.className}`}>
                      {chargeConfig.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{formatDateTime(lead.lead_received)}</p>
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
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-40">
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            onViewDetails(lead);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <div className="px-3 py-1.5 text-xs text-gray-500 font-medium">Status</div>
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setActiveMenu(null);
                              onStatusChange(lead.id, option.value);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                              lead.status === option.value ? 'bg-gray-50 font-medium text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
