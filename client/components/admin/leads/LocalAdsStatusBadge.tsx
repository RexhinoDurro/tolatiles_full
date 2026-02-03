'use client';

import type { LocalAdsLeadStatus } from '@/types/api';

interface LocalAdsStatusBadgeProps {
  status: LocalAdsLeadStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<LocalAdsLeadStatus, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export default function LocalAdsStatusBadge({ status, size = 'md' }: LocalAdsStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
