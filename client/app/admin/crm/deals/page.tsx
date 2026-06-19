'use client';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2, RefreshCw, Briefcase, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import { api } from '@/lib/api';
import type {
  Deal, DealCreate, Customer, DealStage,
  QuoteListItem, InvoiceListItem, EstimateListItem, Appointment,
  CustomJobType, CustomLeadSource,
} from '@/types/api';

// ---- constants ----

const PAGE_SIZE = 10;

const stageLabels: Record<DealStage, string> = {
  new_deal: 'New Deal',
  estimate_scheduled: 'Est. Scheduled',
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

type DocType = 'quotes' | 'invoices' | 'estimates' | 'appointments';

const docTypeLabels: Record<DocType, string> = {
  quotes: 'Quotes',
  invoices: 'Invoices',
  estimates: 'Estimates',
  appointments: 'Appointments',
};

// ---- helpers ----

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(v: number | null) {
  if (!v) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-2.5 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-xs">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p as number)}
                className={`w-8 h-8 text-xs rounded ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === pages}
          className="p-2.5 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ---- main component ----

function DealsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Deals state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingApptId, setDeletingApptId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<number | ''>('');
  const [dealsPage, setDealsPage] = useState(1);

  // Documents panel state
  const [docCustomer, setDocCustomer] = useState<number | ''>('');
  const [docType, setDocType] = useState<DocType>('quotes');
  const [docPage, setDocPage] = useState(1);
  const [docLoading, setDocLoading] = useState(false);
  const [allQuotes, setAllQuotes] = useState<QuoteListItem[] | null>(null);
  const [allInvoices, setAllInvoices] = useState<InvoiceListItem[] | null>(null);
  const [allEstimates, setAllEstimates] = useState<EstimateListItem[] | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[] | null>(null);

  const initialCustomerId = searchParams.get('customer');
  const openNew = searchParams.get('new');

  const [jobTypes, setJobTypes] = useState<CustomJobType[]>([]);
  const [leadSources, setLeadSources] = useState<CustomLeadSource[]>([]);

  const [form, setForm] = useState<{
    customer_id: number | '';
    address: string;
    job_type: string;
    estimated_sqft: string;
    lead_source: string;
    value: string;
    stage: DealStage;
  }>({
    customer_id: initialCustomerId ? Number(initialCustomerId) : '',
    address: '',
    job_type: '',
    estimated_sqft: '',
    lead_source: '',
    value: '',
    stage: 'new_deal',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dealsData, customersData, jts, lss] = await Promise.all([api.getDeals(), api.getCustomers(), api.getJobTypes(), api.getLeadSources()]);
      setDeals(dealsData);
      setCustomers(customersData);
      setJobTypes(jts.filter((jt) => jt.is_active));
      setLeadSources(lss.filter((ls) => ls.is_active));
    } catch {
      setError('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (openNew === '1' && initialCustomerId && customers.length > 0) {
      const cust = customers.find((c) => c.id === Number(initialCustomerId));
      setShowModal(true);
      setForm((f) => ({ ...f, customer_id: Number(initialCustomerId), address: cust?.address ?? f.address }));
    }
  }, [openNew, initialCustomerId, customers]);

  // Load all doc types on mount independently so one failure doesn't block others
  useEffect(() => {
    async function loadDocs() {
      setDocLoading(true);
      const [qs, invs, ests, appts] = await Promise.allSettled([
        api.getQuotes(),
        api.getInvoices(),
        api.getEstimates(),
        api.getAllAppointments(),
      ]);
      if (qs.status === 'fulfilled') setAllQuotes(qs.value);
      if (invs.status === 'fulfilled') setAllInvoices(invs.value);
      if (ests.status === 'fulfilled') setAllEstimates(ests.value);
      if (appts.status === 'fulfilled') setAllAppointments(appts.value);
      setDocLoading(false);
    }
    loadDocs();
  }, []);

  // Reset page when type or customer changes
  useEffect(() => {
    setDocPage(1);
  }, [docType, docCustomer]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this deal? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.deleteDeal(id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError('Failed to delete deal');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAppointment = async (e: React.MouseEvent, id: number) => {
   e.preventDefault();
   e.stopPropagation();
   
   if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
   setDeletingApptId(id);

   try {
     await api.deleteAppointment(id);
     setAllAppointments((prev) => prev ? prev.filter((a) => a.id !== id) : null);
     } catch {
       setError('Failed to delete appointment');
     } finally {
       setDeletingApptId(null);
     }
   };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.address || !form.job_type) return;
    setIsSaving(true);
    try {
      const payload: DealCreate = {
        customer_id: form.customer_id as number,
        address: form.address,
        job_type: form.job_type || undefined,
        lead_source: form.lead_source || undefined,
        estimated_sqft: form.estimated_sqft ? Number(form.estimated_sqft) : null,
        value: form.value ? Number(form.value) : null,
        stage: form.stage,
      };
      const deal = await api.createDeal(payload);
      setShowModal(false);
      router.push(`/admin/crm/deals/${deal.id}`);
    } catch {
      setError('Failed to create deal');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = deals.filter((d) => {
    if (customerFilter && d.customer !== customerFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.customer_name.toLowerCase().includes(q) ||
        (d.address && d.address.toLowerCase().includes(q)) ||
        (d.job_type && d.job_type.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pagedDeals = filtered.slice((dealsPage - 1) * PAGE_SIZE, dealsPage * PAGE_SIZE);

  // Customer deals used for filtering appointments by customer
  const customerDealIds = useMemo(() => {
    if (!docCustomer) return null;
    return new Set(deals.filter((d) => d.customer === docCustomer).map((d) => d.id));
  }, [docCustomer, deals]);

  // Filtered docs
  const filteredDocs = useMemo(() => {
    if (docType === 'quotes') {
      const items = allQuotes ?? [];
      return docCustomer ? items.filter((q) => q.customer === docCustomer) : items;
    }
    if (docType === 'invoices') {
      const items = allInvoices ?? [];
      return docCustomer ? items.filter((i) => i.customer === docCustomer) : items;
    }
    if (docType === 'estimates') {
      const items = allEstimates ?? [];
      return docCustomer ? items.filter((e) => e.customer === docCustomer) : items;
    }
    if (docType === 'appointments') {
      const items = allAppointments ?? [];
      return docCustomer && customerDealIds
        ? items.filter((a) => a.deal !== null && customerDealIds.has(a.deal as number))
        : items;
    }
    return [];
  }, [docType, docCustomer, allQuotes, allInvoices, allEstimates, allAppointments, customerDealIds]);

  const pagedDocs = filteredDocs.slice((docPage - 1) * PAGE_SIZE, docPage * PAGE_SIZE);

  const quoteStatusClass: Record<string, string> = {
    accepted: 'bg-green-100 text-green-700',
    sent: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-600',
    expired: 'bg-red-100 text-red-600',
  };

  const invStatusClass: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    sent: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-600',
  };

  const apptTypeClass: Record<string, string> = {
    consultation: 'bg-purple-100 text-purple-700',
    follow_up: 'bg-pink-100 text-pink-700',
    measurement: 'bg-violet-100 text-violet-700',
    other: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <CrmLayout title="Deals">
      <div className="space-y-6">
        {/* ---- DEALS SECTION ---- */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-gray-600">All project deals</p>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchData()} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-5 h-5" />
                New Deal
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by customer, address, job type..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setDealsPage(1); }}
              className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={customerFilter}
              onChange={(e) => { setCustomerFilter(e.target.value ? Number(e.target.value) : ''); setDealsPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Customers</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {deals.length === 0 ? 'No deals yet' : 'No results found'}
              </h3>
              {deals.length === 0 && (
                <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create First Deal
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pagedDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => router.push(`/admin/crm/deals/${deal.id}`)}>
                        <td className="px-6 py-4 font-medium text-blue-600">{deal.customer_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{deal.job_type ? deal.job_type ? (jobTypes.find((jt) => jt.slug === deal.job_type)?.name ?? deal.job_type) : '—' : '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{deal.address || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${stageBadgeClass[deal.stage]}`}>{stageLabels[deal.stage]}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(deal.value)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(deal.created_at)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(deal.id); }}
                            disabled={deletingId === deal.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete deal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-3">
                  <Pagination page={dealsPage} total={filtered.length} onPage={setDealsPage} />
                </div>
              </div>

              {/* Mobile list */}
              <div className="md:hidden space-y-2">
                {pagedDeals.map((deal) => (
                  <div key={deal.id} className="relative bg-white rounded-lg shadow-sm p-4">
                    <Link href={`/admin/crm/deals/${deal.id}`} className="block">
                      <div className="flex items-center justify-between gap-2 mb-1 pr-8">
                        <p className="font-medium text-gray-900">{deal.customer_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${stageBadgeClass[deal.stage]}`}>{stageLabels[deal.stage]}</span>
                      </div>
                      <p className="text-sm text-gray-500">{deal.job_type ? deal.job_type ? (jobTypes.find((jt) => jt.slug === deal.job_type)?.name ?? deal.job_type) : '—' : '—'}</p>
                      {deal.address && <p className="text-xs text-gray-400 truncate">{deal.address}</p>}
                      {deal.value && <p className="text-sm font-semibold text-green-600 mt-1">{formatCurrency(deal.value)}</p>}
                    </Link>
                    <button
                      onClick={() => handleDelete(deal.id)}
                      disabled={deletingId === deal.id}
                      className="absolute top-3 right-3 p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Pagination page={dealsPage} total={filtered.length} onPage={setDealsPage} />
              </div>
            </>
          )}
        </div>

        {/* ---- DOCUMENTS PANEL ---- */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-900">Customer Documents</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={docCustomer}
                onChange={(e) => { setDocCustomer(e.target.value ? Number(e.target.value) : ''); setDocPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Customers</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                value={docType}
                onChange={(e) => { setDocType(e.target.value as DocType); setDocPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.entries(docTypeLabels) as [DocType, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {docLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : pagedDocs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No {docTypeLabels[docType].toLowerCase()} found</p>
          ) : (
            <div className="space-y-2">
              {/* Quotes */}
              {docType === 'quotes' && (pagedDocs as QuoteListItem[]).map((q) => (
                <Link key={q.id} href={`/admin/crm/quotes/${q.id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 truncate">{q.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${quoteStatusClass[q.status] ?? 'bg-gray-100 text-gray-600'}`}>{q.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{q.customer_name} · {q.reference}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 ml-4 shrink-0">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(q.total)}
                  </span>
                </Link>
              ))}

              {/* Invoices */}
              {docType === 'invoices' && (pagedDocs as InvoiceListItem[]).map((inv) => (
                <Link key={inv.id} href={`/admin/crm/invoices/${inv.id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 truncate">{inv.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${invStatusClass[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>{inv.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{inv.customer_name} · {inv.reference} · Due {formatDate(inv.due_date)}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 ml-4 shrink-0">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(inv.total)}
                  </span>
                </Link>
              ))}

              {/* Estimates */}
              {docType === 'estimates' && (pagedDocs as EstimateListItem[]).map((est) => (
                <Link key={est.id} href={`/admin/crm/estimates/${est.id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 truncate">{est.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 capitalize">{est.visit_status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{est.customer_name} · {est.reference}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 ml-4 shrink-0">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(est.total)}
                  </span>
                </Link>
              ))}

              {/* Appointments */}
             {/* Appointments */}
              {docType === 'appointments' && (pagedDocs as Appointment[]).map((appt) => {
                const dateStr = appt.scheduled_date
                  ? new Date(appt.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : appt.start_date
                  ? `${appt.start_date}${appt.end_date && appt.end_date !== appt.start_date ? ` – ${appt.end_date}` : ''}`
                  : '—';
                const href = appt.deal ? `/admin/crm/deals/${appt.deal}` : '/admin/crm/calendar';
                
                return (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                    {/* Make the main info the clickable link */}
                    <Link href={href} className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-900 truncate">{appt.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${apptTypeClass[appt.appointment_type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {appt.appointment_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{dateStr}</p>
                    </Link>

                    {/* Actions / Status wrapper on the right */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${appt.status === 'completed' ? 'bg-green-100 text-green-700' : appt.status === 'cancelled' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                        {appt.status}
                      </span>
                      
                      <button
                        onClick={(e) => handleDeleteAppointment(e, appt.id)}
                        disabled={deletingApptId === appt.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete appointment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })} 

              <Pagination page={docPage} total={filteredDocs.length} onPage={setDocPage} />
            </div>
          )}
        </div>
      </div>

      {/* Create Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">New Deal</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
                <select
                  value={form.customer_id}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : '';
                    const cust = customers.find((c) => c.id === id);
                    setForm((f) => ({ ...f, customer_id: id, address: cust?.address ?? '' }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Address <span className="text-red-500">*</span></label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123 Main St, Jacksonville, FL" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type <span className="text-red-500">*</span></label>
                <select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select job type...</option>
                  {jobTypes.map((jt) => <option key={jt.id} value={jt.slug}>{jt.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Sq Ft</label>
                <input type="number" value={form.estimated_sqft} onChange={(e) => setForm({ ...form, estimated_sqft: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 150" min="0" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                <select value={form.lead_source} onChange={(e) => setForm({ ...form, lead_source: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select source...</option>
                  {leadSources.map((ls) => <option key={ls.id} value={ls.slug}>{ls.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value ($)</label>
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 5000" min="0" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stage</label>
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {(Object.entries(stageLabels) as [DealStage, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isSaving ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CrmLayout>
  );
}

export default function DealsPage() {
  return (
    <Suspense>
      <DealsContent />
    </Suspense>
  );
}
