'use client';

import { useEffect, useRef } from 'react';
import { X, Phone, MessageSquare, MapPin, Briefcase, Clock, DollarSign, Calendar } from 'lucide-react';
import LocalAdsStatusBadge from './LocalAdsStatusBadge';
import type { LocalAdsLead, LocalAdsLeadStatus } from '@/types/api';

interface LocalAdsDetailDrawerProps {
  lead: LocalAdsLead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (leadId: number, status: LocalAdsLeadStatus) => void;
  isUpdating?: boolean;
}

const statusOptions: { value: LocalAdsLeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

const chargeStatusLabels: Record<string, { label: string; className: string }> = {
  charged: {
    label: 'Charged',
    className: 'bg-green-100 text-green-700',
  },
  not_charged: {
    label: 'Not Charged',
    className: 'bg-gray-100 text-gray-600',
  },
};

export default function LocalAdsDetailDrawer({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  isUpdating,
}: LocalAdsDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Filter out sensitive fields from metadata
  const getSafeMetadata = (metadata?: Record<string, unknown>) => {
    if (!metadata) return null;
    const sensitiveKeys = ['token', 'access_token', 'refresh_token', 'api_key', 'secret', 'password', 'auth'];
    const safeEntries = Object.entries(metadata).filter(
      ([key]) => !sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    );
    return safeEntries.length > 0 ? Object.fromEntries(safeEntries) : null;
  };

  if (!lead) return null;

  const chargeConfig = chargeStatusLabels[lead.charge_status] || chargeStatusLabels.not_charged;
  const safeMetadata = getSafeMetadata(lead.metadata);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 id="drawer-title" className="text-lg font-semibold text-gray-900">
                Lead Details
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Local Ads Lead #{lead.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                  Customer Information
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <a
                        href={`tel:${lead.customer_phone}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {lead.customer_phone}
                      </a>
                    </div>
                  </div>
                  {lead.customer_name && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-medium text-sm">
                        N
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">{lead.customer_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                  Lead Details
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Job Type</p>
                      <p className="text-sm font-medium text-gray-900">{lead.job_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{lead.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {lead.lead_type === 'phone' ? (
                      <Phone className="w-5 h-5 text-gray-400" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Lead Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {lead.lead_type === 'phone' ? 'Phone Call' : 'Message'}
                        {lead.lead_type === 'phone' && lead.call_duration && (
                          <span className="text-gray-500 ml-2">({formatDuration(lead.call_duration)})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Charge Status</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${chargeConfig.className}`}>
                        {chargeConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                  Timeline
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Lead Received</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(lead.lead_received)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Last Activity</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(lead.last_activity)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              {lead.message && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                    Message
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.message}</p>
                  </div>
                </div>
              )}

              {/* Additional Metadata */}
              {safeMetadata && Object.keys(safeMetadata).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                    Additional Details
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <dl className="space-y-2">
                      {Object.entries(safeMetadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <dt className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                          <dd className="text-gray-900 font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                  Internal Status
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Current:</span>
                  <LocalAdsStatusBadge status={lead.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onStatusChange(lead.id, option.value)}
                      disabled={isUpdating || lead.status === option.value}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        lead.status === option.value
                          ? 'bg-blue-600 text-white cursor-default'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
