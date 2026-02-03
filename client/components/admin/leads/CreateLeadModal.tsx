'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type {
  WebsiteLeadCreate,
  LocalAdsLeadCreate,
  LeadStatus,
  LocalAdsLeadStatus,
  LocalAdsLeadType,
  LocalAdsChargeStatus
} from '@/types/api';

type LeadType = 'website' | 'local_ads';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WebsiteLeadCreate | LocalAdsLeadCreate) => Promise<void>;
  type: LeadType;
}

const PROJECT_TYPES = [
  { value: 'backsplash', label: 'Kitchen Backsplash' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'patio', label: 'Patio/Outdoor' },
  { value: 'fireplace', label: 'Fireplace' },
  { value: 'other', label: 'Other' },
];

const WEBSITE_STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'closed'];
const LOCAL_ADS_STATUS_OPTIONS: LocalAdsLeadStatus[] = ['new', 'contacted', 'closed'];
const LEAD_TYPE_OPTIONS: { value: LocalAdsLeadType; label: string }[] = [
  { value: 'phone', label: 'Phone Call' },
  { value: 'message', label: 'Message' },
];
const CHARGE_STATUS_OPTIONS: { value: LocalAdsChargeStatus; label: string }[] = [
  { value: 'not_charged', label: 'Not Charged' },
  { value: 'charged', label: 'Charged' },
];

export default function CreateLeadModal({ isOpen, onClose, onSubmit, type }: CreateLeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Website lead form state
  const [websiteForm, setWebsiteForm] = useState<WebsiteLeadCreate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    project_type: 'other',
    message: '',
    status: 'new',
    notes: '',
  });

  // Local ads lead form state
  const [localAdsForm, setLocalAdsForm] = useState<LocalAdsLeadCreate>({
    customer_phone: '',
    customer_name: '',
    job_type: '',
    location: '',
    lead_type: 'phone',
    charge_status: 'not_charged',
    message: '',
    status: 'new',
    notes: '',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setWebsiteForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        project_type: 'other',
        message: '',
        status: 'new',
        notes: '',
      });
      setLocalAdsForm({
        customer_phone: '',
        customer_name: '',
        job_type: '',
        location: '',
        lead_type: 'phone',
        charge_status: 'not_charged',
        message: '',
        status: 'new',
        notes: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (type === 'website') {
        await onSubmit(websiteForm);
      } else {
        await onSubmit(localAdsForm);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {type === 'website' ? 'Add Website Lead' : 'Add Local Ads Lead'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {type === 'website' ? (
              // Website Lead Form
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={websiteForm.first_name}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={websiteForm.last_name}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={websiteForm.email}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={websiteForm.phone}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Type *
                    </label>
                    <select
                      required
                      value={websiteForm.project_type}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, project_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {PROJECT_TYPES.map((pt) => (
                        <option key={pt.value} value={pt.value}>
                          {pt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={websiteForm.status}
                      onChange={(e) => setWebsiteForm({ ...websiteForm, status: e.target.value as LeadStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {WEBSITE_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={websiteForm.message}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Customer's message or inquiry..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={websiteForm.notes}
                    onChange={(e) => setWebsiteForm({ ...websiteForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Notes for internal use..."
                  />
                </div>
              </>
            ) : (
              // Local Ads Lead Form
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={localAdsForm.customer_phone}
                      onChange={(e) => setLocalAdsForm({ ...localAdsForm, customer_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={localAdsForm.customer_name}
                      onChange={(e) => setLocalAdsForm({ ...localAdsForm, customer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={localAdsForm.job_type}
                    onChange={(e) => setLocalAdsForm({ ...localAdsForm, job_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., Tile Installation, Flooring Repair"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={localAdsForm.location}
                    onChange={(e) => setLocalAdsForm({ ...localAdsForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="City, State"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Type *
                    </label>
                    <select
                      required
                      value={localAdsForm.lead_type}
                      onChange={(e) => setLocalAdsForm({ ...localAdsForm, lead_type: e.target.value as LocalAdsLeadType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {LEAD_TYPE_OPTIONS.map((lt) => (
                        <option key={lt.value} value={lt.value}>
                          {lt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Charge Status
                    </label>
                    <select
                      value={localAdsForm.charge_status}
                      onChange={(e) => setLocalAdsForm({ ...localAdsForm, charge_status: e.target.value as LocalAdsChargeStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {CHARGE_STATUS_OPTIONS.map((cs) => (
                        <option key={cs.value} value={cs.value}>
                          {cs.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={localAdsForm.status}
                      onChange={(e) => setLocalAdsForm({ ...localAdsForm, status: e.target.value as LocalAdsLeadStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {LOCAL_ADS_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={localAdsForm.message}
                    onChange={(e) => setLocalAdsForm({ ...localAdsForm, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Customer's message or call notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={localAdsForm.notes}
                    onChange={(e) => setLocalAdsForm({ ...localAdsForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Notes for internal use..."
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Lead'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
