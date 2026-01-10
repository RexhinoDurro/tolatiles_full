'use client';

import type { LeadStatus } from '@/types/api';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  qualified: {
    label: 'Qualified',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  converted: {
    label: 'Converted',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export default function LeadStatusBadge({ status, size = 'md' }: LeadStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
