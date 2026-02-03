'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import type { LeadStatus, LocalAdsLeadStatus, LocalAdsChargeStatus } from '@/types/api';

// Website Leads Filters
export interface WebsiteLeadsFiltersState {
  status: LeadStatus | 'all';
}

interface WebsiteLeadsFiltersProps {
  filters: WebsiteLeadsFiltersState;
  onFiltersChange: (filters: WebsiteLeadsFiltersState) => void;
  statusCounts?: Record<LeadStatus | 'all', number>;
}

const websiteStatusOptions: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

export function WebsiteLeadsFilters({
  filters,
  onFiltersChange,
  statusCounts,
}: WebsiteLeadsFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
      {websiteStatusOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onFiltersChange({ status: option.value })}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            filters.status === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
          {statusCounts && statusCounts[option.value] !== undefined && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                filters.status === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {statusCounts[option.value]}
            </span>
          )}
        </button>
      ))}
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
