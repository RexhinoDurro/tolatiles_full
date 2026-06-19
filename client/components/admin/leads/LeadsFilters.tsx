'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import type { LeadStatus, LocalAdsLeadStatus, LocalAdsChargeStatus } from '@/types/api';

// Website Leads Filters
export type WebsiteLeadFilterStatus = LeadStatus | 'all' | 'contacted_group' | 'qualified_group';

export interface WebsiteLeadsFiltersState {
  status: WebsiteLeadFilterStatus;
}

interface WebsiteLeadsFiltersProps {
  filters: WebsiteLeadsFiltersState;
  onFiltersChange: (filters: WebsiteLeadsFiltersState) => void;
  statusCounts?: Record<string, number>;
}

export function WebsiteLeadsFilters({
  filters,
  onFiltersChange,
  statusCounts,
}: WebsiteLeadsFiltersProps) {
  const mainOptions: { value: WebsiteLeadFilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: statusCounts?.['all'] ?? 0 },
    { value: 'new', label: 'New', count: statusCounts?.['new'] ?? 0 },
    { value: 'contacted_group', label: 'Contacted', count: (statusCounts?.['contacted'] ?? 0) + (statusCounts?.['failed_contact'] ?? 0) },
    { value: 'qualified_group', label: 'Qualified', count: (statusCounts?.['qualified'] ?? 0) + (statusCounts?.['failed_qualified'] ?? 0) },
  ];

  const isContactedGroup = filters.status === 'contacted_group' || filters.status === 'contacted' || filters.status === 'failed_contact';
  const isQualifiedGroup = filters.status === 'qualified_group' || filters.status === 'qualified' || filters.status === 'failed_qualified';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {mainOptions.map((option) => {
          const isActive = option.value === 'contacted_group'
            ? isContactedGroup
            : option.value === 'qualified_group'
            ? isQualifiedGroup
            : filters.status === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onFiltersChange({ status: option.value })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {option.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-filters for Contacted group */}
      {isContactedGroup && (
        <div className="flex items-center gap-2 ml-6">
          <span className="text-xs text-gray-500">Show:</span>
          {[
            { value: 'contacted_group' as WebsiteLeadFilterStatus, label: 'All Contacted' },
            { value: 'contacted' as WebsiteLeadFilterStatus, label: 'Contacted' },
            { value: 'failed_contact' as WebsiteLeadFilterStatus, label: 'Failed Contact' },
          ].map((sub) => (
            <button
              key={sub.value}
              onClick={() => onFiltersChange({ status: sub.value })}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filters.status === sub.value ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-filters for Qualified group */}
      {isQualifiedGroup && (
        <div className="flex items-center gap-2 ml-6">
          <span className="text-xs text-gray-500">Show:</span>
          {[
            { value: 'qualified_group' as WebsiteLeadFilterStatus, label: 'All Qualified' },
            { value: 'qualified' as WebsiteLeadFilterStatus, label: 'Qualified' },
            { value: 'failed_qualified' as WebsiteLeadFilterStatus, label: 'Failed Qualified' },
          ].map((sub) => (
            <button
              key={sub.value}
              onClick={() => onFiltersChange({ status: sub.value })}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filters.status === sub.value ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Local Ads Leads Filters
export interface LocalAdsLeadsFiltersState {
  status: LocalAdsLeadStatus | '';
  charge_status: LocalAdsChargeStatus | '';
  date_from: string;
  date_to: string;
}

interface LocalAdsLeadsFiltersProps {
  filters: LocalAdsLeadsFiltersState;
  onFiltersChange: (filters: LocalAdsLeadsFiltersState) => void;
  debounceMs?: number;
}

const localAdsStatusOptions: { value: LocalAdsLeadStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

const chargeStatusOptions: { value: LocalAdsChargeStatus | ''; label: string }[] = [
  { value: '', label: 'All Charges' },
  { value: 'charged', label: 'Charged' },
  { value: 'not_charged', label: 'Not Charged' },
];

export function LocalAdsLeadsFilters({
  filters,
  onFiltersChange,
  debounceMs = 300,
}: LocalAdsLeadsFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Debounce filter changes for date inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        localFilters.date_from !== filters.date_from ||
        localFilters.date_to !== filters.date_to
      ) {
        onFiltersChange(localFilters);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localFilters.date_from, localFilters.date_to, debounceMs, filters.date_from, filters.date_to, onFiltersChange, localFilters]);

  // Immediate update for select changes
  const handleSelectChange = useCallback(
    (key: 'status' | 'charge_status', value: string) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [localFilters, onFiltersChange]
  );

  const handleDateChange = (key: 'date_from' | 'date_to', value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const clearedFilters: LocalAdsLeadsFiltersState = {
      status: '',
      charge_status: '',
      date_from: '',
      date_to: '',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.status || filters.charge_status || filters.date_from || filters.date_to;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>

        <select
          value={localFilters.status}
          onChange={(e) => handleSelectChange('status', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {localAdsStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={localFilters.charge_status}
          onChange={(e) => handleSelectChange('charge_status', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {chargeStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={localFilters.date_from}
            onChange={(e) => handleDateChange('date_from', e.target.value)}
            placeholder="From"
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={localFilters.date_to}
            onChange={(e) => handleDateChange('date_to', e.target.value)}
            placeholder="To"
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
