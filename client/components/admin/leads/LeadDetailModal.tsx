'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Mail, Calendar, FileText, Loader2, Save, MapPin, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LeadStatusBadge from './LeadStatusBadge';
import PhoneCopy from './PhoneCopy';
import { api } from '@/lib/api';
import type { ContactLead, LeadStatus, ContactResultReason } from '@/types/api';

interface LeadDetailModalProps {
  lead: ContactLead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<ContactLead>) => Promise<void>;
  onConverted?: (id: number) => void;
}

const projectTypeLabels: Record<string, string> = {
  'kitchen-backsplash': 'Kitchen Backsplash',
  bathroom: 'Bathroom Tiles',
  flooring: 'Flooring',
  patio: 'Patio/Outdoor',
  fireplace: 'Fireplace',
  commercial: 'Commercial',
  other: 'Other',
};

const statusOptions: { value: LeadStatus; label: string; color?: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'failed_contact', label: 'Failed Contact', color: 'orange' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'failed_qualified', label: 'Failed Qualified', color: 'orange' },
];

const contactReasonOptions: { value: ContactResultReason; label: string }[] = [
  { value: 'no_answer', label: 'No Answer' },
  { value: 'phone_off', label: 'Phone Off' },
  { value: 'wrong_number', label: 'Wrong Number' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'other', label: 'Other' },
];

export default function LeadDetailModal({ lead, isOpen, onClose, onUpdate, onConverted }: LeadDetailModalProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>('new');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [contactReason, setContactReason] = useState<ContactResultReason | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setNotes(lead.notes || '');
      setAddress(lead.address || '');
      setContactReason(lead.contact_result_reason || '');
      setHasChanges(false);
      setConvertError('');
    }
  }, [lead]);

  const handleStatusChange = (newStatus: LeadStatus) => {
    setStatus(newStatus);
    setHasChanges(true);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!lead || !hasChanges) return;

    setIsSaving(true);
    try {
      const updates: Partial<ContactLead> = {};
      if (status !== lead.status) updates.status = status;
      if (notes !== (lead.notes || '')) updates.notes = notes;
      if (address !== (lead.address || '')) updates.address = address;
      if (status === 'failed_contact' && contactReason !== lead.contact_result_reason) {
        updates.contact_result_reason = contactReason;
      }

      await onUpdate(lead.id, updates);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!lead) return;
    if (!address.trim()) {
      setConvertError('Please fill in the address before converting.');
      return;
    }
    setConvertError('');
    setIsConverting(true);
    try {
      // Save address if it changed
      if (address !== (lead.address || '')) {
        await onUpdate(lead.id, { address });
      }
      const result = await api.convertLeadToCustomer(lead.id, { address });
      onConverted?.(result.customer_id);
      onClose();
      router.push(`/admin/crm/customers/${result.customer_id}`);
    } catch (err) {
      setConvertError(err instanceof Error ? err.message : 'Failed to convert lead.');
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{lead.full_name}</h2>
            <p className="text-sm text-gray-500 mt-1">Lead #{lead.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <LeadStatusBadge status={status} />
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <PhoneCopy phone={lead.phone} />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Project Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {projectTypeLabels[lead.project_type] || lead.project_type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(lead.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setHasChanges(true); setConvertError(''); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Customer address (required to convert)"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.message}</p>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === option.value
                        ? option.color === 'orange'
                          ? 'bg-orange-500 text-white'
                          : 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {status === 'failed_contact' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reason for failed contact</label>
                  <select
                    value={contactReason}
                    onChange={(e) => { setContactReason(e.target.value as ContactResultReason | ''); setHasChanges(true); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select reason...</option>
                    {contactReasonOptions.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add notes about this lead..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
          {convertError && (
            <p className="text-sm text-red-600">{convertError}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hasChanges && <span className="text-orange-600">Unsaved changes</span>}
            </div>
            <div className="flex items-center gap-3">
              {status === 'qualified' && (
                <button
                  onClick={handleConvert}
                  disabled={isConverting || isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isConverting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Converting...</>
                  ) : (
                    <><UserCheck className="w-4 h-4" />Convert to Customer</>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4" />Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
