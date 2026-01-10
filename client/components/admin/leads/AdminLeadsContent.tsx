'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { RefreshCw, Loader2, Filter } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import LeadsTable from '@/components/admin/leads/LeadsTable';
import LeadDetailModal from '@/components/admin/leads/LeadDetailModal';
import DeleteConfirmModal from '@/components/admin/gallery/DeleteConfirmModal';
import { api } from '@/lib/api';
import type { ContactLead, LeadStatus } from '@/types/api';

const statusFilters: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Leads' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminLeadsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') as LeadStatus | null;

  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<ContactLead[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>(initialStatus || 'all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactLead | null>(null);

  const fetchLeads = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setError('Failed to load leads. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter leads when status filter or leads change
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredLeads(leads);
    } else {
      setFilteredLeads(leads.filter((lead) => lead.status === statusFilter));
    }
  }, [leads, statusFilter]);

  // Handle lead update
  const handleLeadUpdate = async (id: number, data: { status?: LeadStatus; notes?: string }) => {
    await api.updateLead(id, data);

    // Update local state
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, ...data } : lead
      )
    );

    // Update selected lead if it's the one being updated
    if (selectedLead?.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  // Handle lead delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.deleteLead(deleteTarget.id);
    setLeads((prev) => prev.filter((lead) => lead.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // Get counts for each status
  const getStatusCount = (status: LeadStatus | 'all') => {
    if (status === 'all') return leads.length;
    return leads.filter((lead) => lead.status === status).length;
  };

  return (
    <AdminLayout title="Leads Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">
              Manage contact form submissions and track lead status
            </p>
          </div>
          <button
            onClick={() => fetchLeads(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                statusFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === filter.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {getStatusCount(filter.value)}
              </span>
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={() => fetchLeads()}
              className="ml-2 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          /* Leads Table */
          <LeadsTable
            leads={filteredLeads}
            onView={setSelectedLead}
            onDelete={setDeleteTarget}
          />
        )}

        {/* Lead count */}
        {!isLoading && filteredLeads.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Showing {filteredLeads.length} of {leads.length} lead{leads.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleLeadUpdate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Lead"
        message={`Are you sure you want to delete the lead from "${deleteTarget?.full_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
