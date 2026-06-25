'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, User, Phone, Mail, MapPin, Briefcase, Edit, X, Plus, MessageSquare, Send, RotateCcw, Camera, Trash2, ImageIcon,
} from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import { api } from '@/lib/api';
import type { Customer, CustomerCreate, CustomerPhoto, Deal } from '@/types/api';

interface ActivityNote {
  id: number;
  text: string;
  created_at: string;
}

const stageBadge: Record<string, { label: string; className: string }> = {
  new_deal:           { label: 'New Deal',          className: 'bg-gray-100 text-gray-700' },
  estimate_scheduled: { label: 'Est. Scheduled',    className: 'bg-purple-100 text-purple-700' },
  quote_sent:         { label: 'Quote Sent',         className: 'bg-orange-100 text-orange-700' },
  invoice_sent:       { label: 'Invoice Sent',       className: 'bg-blue-100 text-blue-700' },
  won:                { label: 'Won',                className: 'bg-green-100 text-green-700' },
  lost:               { label: 'Lost',               className: 'bg-red-100 text-red-700' },
};

const jobTypeLabels: Record<string, string> = {
  kitchen_backsplash: 'Kitchen Backsplash',
  bathroom: 'Bathroom',
  flooring: 'Flooring',
  patio: 'Patio',
  fireplace: 'Fireplace',
  commercial: 'Commercial',
  other: 'Other',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(v: number | null) {
  if (!v) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [archivedDeals, setArchivedDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<CustomerCreate>({ name: '', phone: '', email: '', address: '', notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [notes, setNotes] = useState<ActivityNote[]>([]);
  const [newNote, setNewNote] = useState('');

  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<CustomerPhoto | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [found, activeDeals, archivedDealsData] = await Promise.all([
        api.getCustomer(customerId),
        api.getDealsForCustomer(customerId),
        api.getArchivedDeals(customerId),
      ]);

      setCustomer(found);
      setEditForm({
        name: found.name,
        phone: found.phone,
        email: found.email || '',
        address: found.address || '',
        notes: found.notes || '',
      });

      setDeals(activeDeals);
      setArchivedDeals(archivedDealsData);
    } catch {
      setError('Customer not found');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  const fetchPhotos = useCallback(async () => {
    setPhotosLoading(true);
    try {
      const data = await api.getCustomerPhotos(customerId);
      setPhotos(data);
    } catch {
      // silently fail — photos are supplementary
    } finally {
      setPhotosLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchData();
    fetchPhotos();
    const saved = localStorage.getItem(`customer_notes_${customerId}`);
    if (saved) setNotes(JSON.parse(saved));
  }, [fetchData, fetchPhotos, customerId]);

  const handleUploadPhotos = async (files: FileList) => {
    if (!files.length) return;
    setUploadingPhoto(true);
    try {
      for (const file of Array.from(files)) {
        const photo = await api.uploadCustomerPhoto(customerId, file);
        setPhotos((prev) => [...prev, photo]);
      }
    } catch {
      setError('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await api.deleteCustomerPhoto(customerId, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      if (lightboxPhoto?.id === photoId) setLightboxPhoto(null);
    } catch {
      setError('Failed to delete photo');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setIsSaving(true);
    try {
      await api.updateCustomer(customer.id, editForm);
      setShowEdit(false);
      fetchData();
    } catch {
      setError('Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: ActivityNote = { id: Date.now(), text: newNote.trim(), created_at: new Date().toISOString() };
    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem(`customer_notes_${customerId}`, JSON.stringify(updated));
    setNewNote('');
  };

  const handleUnarchiveDeal = async (id: number) => {
    try {
      await api.unarchiveDeal(id);
      setArchivedDeals((prev) => prev.filter((d) => d.id !== id));
      fetchData();
    } catch {
      setError('Failed to unarchive deal');
    }
  };

  if (isLoading) {
    return (
      <CrmLayout title="Customer Profile">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </CrmLayout>
    );
  }

  if (error || !customer) {
    return (
      <CrmLayout title="Customer Not Found">
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Customer not found'}</h2>
          <Link href="/admin/crm/customers" className="text-blue-600 hover:underline">
            Back to Customers
          </Link>
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout title={customer.name}>
      <div className="space-y-6">
        {/* Back */}
        <Link href="/admin/crm/customers" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>

        {/* Photos section — full width */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Photos ({photos.length})
            </h3>
            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {uploadingPhoto ? 'Uploading...' : 'Add Photos'}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleUploadPhotos(e.target.files)}
                disabled={uploadingPhoto}
              />
            </label>
          </div>

          {photosLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <Camera className="w-10 h-10 mb-2" />
              <p className="text-sm">No photos yet</p>
              <p className="text-xs mt-1">Tap "Add Photos" to upload from your phone</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square">
                  <button
                    onClick={() => setLightboxPhoto(photo)}
                    className="w-full h-full focus:outline-none"
                  >
                    <img
                      src={photo.image_url || photo.image}
                      alt={photo.caption || 'Customer photo'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Customer Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{customer.name}</h2>
                    <p className="text-xs text-gray-400">Customer since {formatDate(customer.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {customer.phone}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {customer.email}
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="whitespace-pre-wrap">{customer.address}</span>
                  </div>
                )}
              </div>

              {customer.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Middle: Associated Deals */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Deals ({deals.length})
                </h3>
                <Link
                  href={`/admin/crm/deals?customer=${customerId}&new=1`}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Deal
                </Link>
              </div>
              {deals.length === 0 ? (
                <p className="text-sm text-gray-400">No deals yet</p>
              ) : (
                <div className="space-y-2">
                  {deals.map((deal) => {
                    const badge = stageBadge[deal.stage] ?? { label: deal.stage, className: 'bg-gray-100 text-gray-700' };
                    return (
                      <Link
                        key={deal.id}
                        href={`/admin/crm/deals/${deal.id}`}
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {deal.job_type ? jobTypeLabels[deal.job_type] || deal.job_type : 'Deal'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        {deal.address && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{deal.address}</p>
                        )}
                        {deal.value && (
                          <p className="text-xs font-semibold text-green-600 mt-0.5">{formatCurrency(deal.value)}</p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Archived Deals section (only if count > 0) */}
            {archivedDeals.length > 0 && (
              <details className="bg-white rounded-xl shadow-sm p-4">
                <summary className="font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  Archived Deals ({archivedDeals.length})
                </summary>
                <div className="mt-3 space-y-2">
                  {archivedDeals.map((deal) => {
                    const badge = stageBadge[deal.stage] ?? { label: deal.stage, className: 'bg-gray-100 text-gray-700' };
                    return (
                      <div key={deal.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {deal.job_type ? jobTypeLabels[deal.job_type] || deal.job_type : 'Deal'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                          {deal.value && (
                            <p className="text-xs font-semibold text-green-600 mt-0.5">{formatCurrency(deal.value)}</p>
                          )}
                          {deal.archived_at && (
                            <p className="text-xs text-gray-400 mt-0.5">Archived {formatDate(deal.archived_at)}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleUnarchiveDeal(deal.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 flex-shrink-0"
                          title="Unarchive deal"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Unarchive
                        </button>
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
          </div>

          {/* Right: Activity Notes */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4" /> Activity Notes
            </h3>

            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                Add Note
              </button>
            </div>

            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400">No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(note.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhoto.image_url || lightboxPhoto.image}
              alt={lightboxPhoto.caption || 'Customer photo'}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeletePhoto(lightboxPhoto.id)}
              className="absolute bottom-2 right-2 flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            {lightboxPhoto.caption && (
              <p className="text-white text-center mt-2 text-sm">{lightboxPhoto.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Customer</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CrmLayout>
  );
}
