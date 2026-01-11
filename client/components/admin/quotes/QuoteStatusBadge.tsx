'use client';

import type { QuoteStatus } from '@/types/api';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700',
  },
  sent: {
    label: 'Sent',
    className: 'bg-blue-100 text-blue-700',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-green-100 text-green-700',
  },
  expired: {
    label: 'Expired',
    className: 'bg-red-100 text-red-700',
  },
};

export default function QuoteStatusBadge({ status, size = 'md' }: QuoteStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
