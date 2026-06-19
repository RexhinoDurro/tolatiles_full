'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Edit2, Save, X, Plus, Trash2, Camera, Calendar,
} from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import { api } from '@/lib/api';
import type {
  Deal, DealStage, EstimateVisit, EstimateVisitCreate,
  Appointment, AppointmentCreate, AppointmentType, AppointmentStatus, QuoteListItem, InvoiceListItem,
  VisitStatusNew, CustomJobType, CustomLeadSource,
} from '@/types/api';

// ---- helpers ----

const stageLabels: Record<DealStage, string> = {
  new_deal: 'New Deal',
  estimate_scheduled: 'Estimate Scheduled',
  quote_sent: 'Quote Sent',
  job_scheduled: 'Job Scheduled',
  job_completed: 'Job Completed',
  job_lost: 'Job Lost',
};

const stageBadgeClass: Record<DealStage, string> = {
  new_deal: 'bg-gray-100 text-gray-700',
  estimate_scheduled: 'bg-purple-100 text-purple-700',
  quote_sent: 'bg-orange-100 text-orange-700',
  job_scheduled: 'bg-blue-100 text-blue-700',
  job_completed: 'bg-green-100 text-green-700',
  job_lost: 'bg-red-100 text-red-700',
};

const visitStatusLabels: Record<VisitStatusNew, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const visitStatusClass: Record<VisitStatusNew, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

const apptTypeLabels: Record<AppointmentType, string> = {
  consultation: 'Consultation',
  follow_up: 'Follow-up',
  measurement: 'Measurement',
  other: 'Other',
};

const apptStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const apptStatusClass: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatCurrency(v: number | null) {
  if (!v) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

type TabId = 'details' | 'appointments' | 'estimate' | 'quote' | 'invoices';

// ---- Component ----

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = Number(params.id);

  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('details');

  // Details edit
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    address: '',
    job_type: '',
    estimated_sqft: '',
    lead_source: '',
    value: '',
    notes: '',
    stage: 'new_deal' as DealStage,
  });

  // Dynamic types
  const [jobTypes, setJobTypes] = useState<CustomJobType[]>([]);
  const [leadSources, setLeadSources] = useState<CustomLeadSource[]>([]);

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptForm, setApptForm] = useState<{
    title: string;
    appointment_type: AppointmentType;
    start_date: string;
    end_date: string;
    notes: string;
    day_hours: { date: string; start_time: string; end_time: string }[];
  }>({
    title: '', appointment_type: 'consultation', start_date: '', end_date: '', notes: '', day_hours: [],
  });
  const [savingAppt, setSavingAppt] = useState(false);

  // Estimate visits
  const [visits, setVisits] = useState<EstimateVisit[]>([]);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState<{ title: string; scheduled_date: string; notes: string }>({
    title: '', scheduled_date: '', notes: '',
  });
  const [savingVisit, setSavingVisit] = useState(false);
  const [uploadingVisitId, setUploadingVisitId] = useState<number | null>(null);

  // Quote & Invoices
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);

  const fetchDeal = useCallback(async () => {
    try {
      const d = await api.getDeal(dealId);
      setDeal(d);
      setEditForm({
        address: d.address || '',
        job_type: d.job_type || '',
        estimated_sqft: d.estimated_sqft ? String(d.estimated_sqft) : '',
        lead_source: d.lead_source || '',
        value: d.value ? String(d.value) : '',
        notes: d.notes || '',
        stage: d.stage,
      });
    } catch {
      setError('Failed to load deal');
    }
  }, [dealId]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchDeal();
    const [appts, vs, qs, invs, jts, lss] = await Promise.all([
      api.getAppointments(dealId),
      api.getEstimateVisits(dealId),
      api.getDealQuotes(dealId),
      api.getDealInvoices(dealId),
      api.getJobTypes(),
      api.getLeadSources(),
    ]);
    setAppointments(appts);
    setVisits(vs);
    setQuotes(qs);
    setInvoices(invs);
    setJobTypes(jts.filter((jt) => jt.is_active));
    setLeadSources(lss.filter((ls) => ls.is_active));
    setIsLoading(false);
  }, [dealId, fetchDeal]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveDetails = async () => {
    if (!deal) return;
    setIsSaving(true);
    try {
      const updated = await api.updateDeal(deal.id, {
        address: editForm.address,
        job_type: editForm.job_type || undefined,
        estimated_sqft: editForm.estimated_sqft ? Number(editForm.estimated_sqft) : null,
        lead_source: editForm.lead_source || undefined,
        value: editForm.value ? Number(editForm.value) : null,
        notes: editForm.notes,
        stage: editForm.stage,
      });
      setDeal(updated);
      setIsEditing(false);
    } catch {
      setError('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  function buildApptDayHours(
    start: string, end: string,
    existing: { date: string; start_time: string; end_time: string }[]
  ) {
    if (!start || !end) return [];
    const days: { date: string; start_time: string; end_time: string }[] = [];
    const cur = new Date(start);
    const endD = new Date(end);
    while (cur <= endD) {
      const dateStr = cur.toISOString().slice(0, 10);
      const prev = existing.find((x) => x.date === dateStr);
      days.push({ date: dateStr, start_time: prev?.start_time ?? '09:00', end_time: prev?.end_time ?? '17:00' });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }

  const handleApptStartDate = (v: string) => {
    const effectiveEnd = apptForm.end_date < v ? v : apptForm.end_date;
    setApptForm((f) => ({
      ...f, start_date: v, end_date: effectiveEnd,
      day_hours: buildApptDayHours(v, effectiveEnd, f.day_hours),
    }));
  };

  const handleApptEndDate = (v: string) => {
    setApptForm((f) => ({
      ...f, end_date: v,
      day_hours: buildApptDayHours(f.start_date, v, f.day_hours),
    }));
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAppt(true);
    try {
      const appt = await api.createAppointmentDirect({
        deal: dealId,
        title: apptForm.title,
        appointment_type: apptForm.appointment_type,
        start_date: apptForm.start_date,
        end_date: apptForm.end_date || apptForm.start_date,
        notes: apptForm.notes,
        days: apptForm.day_hours.map((d) => ({
          date: d.date,
          start_time: d.start_time || null,
          end_time: d.end_time || null,
        })),
      });
      setAppointments((prev) => [...prev, appt]);
      setShowApptModal(false);
      setApptForm({ title: '', appointment_type: 'consultation', start_date: '', end_date: '', notes: '', day_hours: [] });
    } catch {
      setError('Failed to create appointment');
    } finally {
      setSavingAppt(false);
    }
  };

  const handleUpdateApptStatus = async (appt: Appointment, status: AppointmentStatus) => {
    const updated = await api.updateAppointment(appt.id, { status });
    setAppointments((prev) => prev.map((a) => a.id === appt.id ? updated : a));
  };

  const handleDeleteAppt = async (id: number) => {
    if (!confirm('Delete this appointment?')) return;
    await api.deleteAppointment(id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVisit(true);
    try {
      const data: EstimateVisitCreate = {
        deal: dealId,
        title: visitForm.title,
        scheduled_date: visitForm.scheduled_date,
        notes: visitForm.notes,
      };
      const visit = await api.createEstimateVisit(data);
      setVisits((prev) => [...prev, visit]);
      setShowVisitModal(false);
      setVisitForm({ title: '', scheduled_date: '', notes: '' });
    } catch {
      setError('Failed to create estimate visit');
    } finally {
      setSavingVisit(false);
    }
  };

  const handleUpdateVisitStatus = async (visit: EstimateVisit, status: VisitStatusNew) => {
    const updated = await api.updateEstimateVisit(visit.id, { status });
    setVisits((prev) => prev.map((v) => v.id === visit.id ? updated : v));
  };

  const handleDeleteVisit = async (id: number) => {
    if (!confirm('Delete this visit?')) return;
    await api.deleteEstimateVisit(id);
    setVisits((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUploadPhoto = async (visitId: number, files: FileList) => {
    setUploadingVisitId(visitId);
    try {
      for (const file of Array.from(files)) {
        const photo = await api.uploadEstimateVisitPhoto(visitId, file);
        setVisits((prev) => prev.map((v) =>
          v.id === visitId ? { ...v, photos: [...v.photos, photo] } : v
        ));
      }
    } catch {
      setError('Failed to upload photo');
    } finally {
      setUploadingVisitId(null);
    }
  };

  const handleDeletePhoto = async (visitId: number, photoId: number) => {
    await api.deleteEstimateVisitPhoto(visitId, photoId);
    setVisits((prev) => prev.map((v) =>
      v.id === visitId ? { ...v, photos: v.photos.filter((p) => p.id !== photoId) } : v
    ));
  };

  if (isLoading) {
    return (
      <CrmLayout title="Deal">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      </CrmLayout>
    );
  }

  if (error || !deal) {
    return (
      <CrmLayout title="Error">
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">{error || 'Deal not found'}</p>
          <Link href="/admin/crm/deals" className="text-blue-600 hover:underline">Back to Deals</Link>
        </div>
      </CrmLayout>
    );
  }

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'details', label: 'Details' },
    { id: 'appointments', label: 'Appointments', count: appointments.length },
    { id: 'estimate', label: 'Estimate', count: visits.length },
    { id: 'quote', label: 'Quote', count: quotes.length },
    { id: 'invoices', label: 'Invoices', count: invoices.length },
  ];

  return (
    <CrmLayout title={`Deal — ${deal.customer_name}`} backHref="/admin/crm/deals" backLabel="Deals">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <Link href={`/admin/crm/customers/${deal.customer}`} className="text-blue-600 hover:underline font-bold text-xl">
                {deal.customer_name}
              </Link>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${stageBadgeClass[deal.stage]}`}>
                  {stageLabels[deal.stage]}
                </span>
                {deal.job_type && (
                  <span className="text-sm text-gray-600">{jobTypes.find((jt) => jt.slug === deal.job_type)?.name ?? deal.job_type}</span>
                )}
                {deal.value && (
                  <span className="text-sm font-semibold text-green-600">{formatCurrency(deal.value)}</span>
                )}
              </div>
              {deal.address && <p className="text-sm text-gray-500 mt-1">{deal.address}</p>}
            </div>
            <div className="text-sm text-gray-500">
              {deal.customer_phone && <p>{deal.customer_phone}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ---- DETAILS TAB ---- */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Deal Details</h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={handleSaveDetails} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Stage</label>
                {isEditing ? (
                  <select value={editForm.stage} onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as DealStage })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {(Object.entries(stageLabels) as [DealStage, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stageBadgeClass[deal.stage]}`}>{stageLabels[deal.stage]}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Job Type</label>
                {isEditing ? (
                  <select value={editForm.job_type} onChange={(e) => setEditForm({ ...editForm, job_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    {jobTypes.map((jt) => <option key={jt.id} value={jt.slug}>{jt.name}</option>)}
                  </select>
                ) : (
                  <p className="text-sm text-gray-900">{deal.job_type ? (jobTypes.find((jt) => jt.slug === deal.job_type)?.name ?? deal.job_type) : '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Job Address</label>
                {isEditing ? (
                  <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="text-sm text-gray-900">{deal.address || '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Deal Value</label>
                {isEditing ? (
                  <input type="number" value={editForm.value} onChange={(e) => setEditForm({ ...editForm, value: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" placeholder="e.g. 5000" />
                ) : (
                  <p className="text-sm text-gray-900">{deal.value ? formatCurrency(deal.value) : '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Estimated Sq Ft</label>
                {isEditing ? (
                  <input type="number" value={editForm.estimated_sqft} onChange={(e) => setEditForm({ ...editForm, estimated_sqft: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" />
                ) : (
                  <p className="text-sm text-gray-900">{deal.estimated_sqft ? `${deal.estimated_sqft} sq ft` : '—'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Lead Source</label>
                {isEditing ? (
                  <select value={editForm.lead_source} onChange={(e) => setEditForm({ ...editForm, lead_source: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    {leadSources.map((ls) => <option key={ls.id} value={ls.slug}>{ls.name}</option>)}
                  </select>
                ) : (
                  <p className="text-sm text-gray-900">{deal.lead_source ? (leadSources.find((ls) => ls.slug === deal.lead_source)?.name ?? deal.lead_source) : '—'}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              {isEditing ? (
                <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Internal notes..." />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{deal.notes || '—'}</p>
              )}
            </div>
          </div>
        )}

        {/* ---- APPOINTMENTS TAB ---- */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Appointments</h3>
              <button onClick={() => setShowApptModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Add Appointment
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-3" />
                No appointments yet
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div key={appt.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-medium text-gray-900">{appt.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${apptStatusClass[appt.status]}`}>
                            {apptStatusLabels[appt.status]}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {apptTypeLabels[appt.appointment_type]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{appt.scheduled_date ? fmt(appt.scheduled_date) : appt.start_date ?? '—'}</p>
                        {appt.notes && <p className="text-sm text-gray-600 mt-1">{appt.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={appt.status}
                          onChange={(e) => handleUpdateApptStatus(appt, e.target.value as AppointmentStatus)}
                          className="px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {(Object.entries(apptStatusLabels) as [AppointmentStatus, string][]).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                        <button onClick={() => handleDeleteAppt(appt.id)} className="p-2 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- ESTIMATE TAB ---- */}
        {activeTab === 'estimate' && (
          <div className="space-y-4">
            {/* Customer info card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-blue-900">{deal.customer_name}</p>
              {deal.customer_phone && <p className="text-blue-700">{deal.customer_phone}</p>}
              {deal.address && <p className="text-blue-700">{deal.address}</p>}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Estimate Visits</h3>
              <button onClick={() => setShowVisitModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Add Visit
              </button>
            </div>

            {visits.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
                No estimate visits yet
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div key={visit.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-medium text-gray-900">{visit.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${visitStatusClass[visit.status]}`}>
                            {visitStatusLabels[visit.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{fmt(visit.scheduled_date)}</p>
                        {visit.notes && <p className="text-sm text-gray-600 mt-1">{visit.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={visit.status}
                          onChange={(e) => handleUpdateVisitStatus(visit, e.target.value as VisitStatusNew)}
                          className="px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {(Object.entries(visitStatusLabels) as [VisitStatusNew, string][]).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                        <button onClick={() => handleDeleteVisit(visit.id)} className="p-2 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Photos */}
                    {visit.photos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                        {visit.photos.map((photo) => (
                          <div key={photo.id} className="relative group aspect-square">
                            <img
                              src={photo.image_url || photo.image}
                              alt={photo.caption || 'Visit photo'}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              onClick={() => handleDeletePhoto(visit.id, photo.id)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {photo.caption && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{photo.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload photos */}
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
                      {uploadingVisitId === visit.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      Add Photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleUploadPhoto(visit.id, e.target.files)}
                        disabled={uploadingVisitId !== null}
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- QUOTE TAB ---- */}
        {activeTab === 'quote' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Quotes</h3>
              <Link
                href={`/admin/crm/quotes/new?deal=${dealId}&customer=${deal.customer}`}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Create Quote
              </Link>
            </div>
            {quotes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
                No quotes linked to this deal yet
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((q) => (
                  <div key={q.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{q.title}</p>
                      <p className="text-xs font-mono text-blue-600">{q.reference}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          q.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          q.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>{q.status}</span>
                        {' '}·{' '}
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(q.total)}
                      </p>
                    </div>
                    <Link href={`/admin/crm/quotes/${q.id}`} className="text-sm text-blue-600 hover:underline">
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- INVOICES TAB ---- */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Invoices</h3>
              <Link
                href={`/admin/crm/invoices/new?deal=${dealId}&customer=${deal.customer}`}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Create Invoice
              </Link>
            </div>
            {invoices.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">No invoices for this deal yet</div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{inv.title}</p>
                      <p className="text-xs font-mono text-green-600">{inv.reference}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                          inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>{inv.status}</span>
                        {' '}·{' '}
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inv.total)}
                        {' '}· Due {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <Link href={`/admin/crm/invoices/${inv.id}`} className="text-sm text-blue-600 hover:underline">
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Add Appointment</h3>
              <button onClick={() => setShowApptModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateAppointment} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" value={apptForm.title} onChange={(e) => setApptForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={apptForm.appointment_type} onChange={(e) => setApptForm((f) => ({ ...f, appointment_type: e.target.value as AppointmentType }))} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {(Object.entries(apptTypeLabels) as [AppointmentType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" value={apptForm.start_date} onChange={(e) => handleApptStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={apptForm.end_date} min={apptForm.start_date} onChange={(e) => handleApptEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              {apptForm.day_hours.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hours per day</label>
                  <div className="space-y-2">
                    {apptForm.day_hours.map((dh, idx) => (
                      <div key={dh.date} className="flex items-center gap-2">
                        <span className="w-28 text-xs text-gray-600 shrink-0">{dh.date}</span>
                        <input type="time" value={dh.start_time} onChange={(e) => setApptForm((f) => { const dhs = [...f.day_hours]; dhs[idx] = { ...dhs[idx], start_time: e.target.value }; return { ...f, day_hours: dhs }; })} className="flex-1 px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <span className="text-gray-400 text-sm">–</span>
                        <input type="time" value={dh.end_time} onChange={(e) => setApptForm((f) => { const dhs = [...f.day_hours]; dhs[idx] = { ...dhs[idx], end_time: e.target.value }; return { ...f, day_hours: dhs }; })} className="flex-1 px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={apptForm.notes} onChange={(e) => setApptForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowApptModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={savingAppt} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                  {savingAppt ? 'Saving...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Estimate Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add Estimate Visit</h3>
              <button onClick={() => setShowVisitModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateVisit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" value={visitForm.title} onChange={(e) => setVisitForm({ ...visitForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={visitForm.scheduled_date} onChange={(e) => setVisitForm({ ...visitForm, scheduled_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={visitForm.notes} onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowVisitModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={savingVisit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                  {savingVisit ? 'Saving...' : 'Add Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CrmLayout>
  );
}
