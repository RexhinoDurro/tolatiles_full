'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Loader2, RefreshCw, User, Edit, X, UserPlus, ChevronDown, Archive } from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import { api } from '@/lib/api';
import type { Customer, CustomerCreate, ContactLead } from '@/types/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CrmCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<CustomerCreate>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch {
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await api.getLeads();
      setLeads(data.filter((lead) => lead.status !== 'converted'));
    } catch {
      console.error('Failed to load leads');
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchLeads();
  }, [fetchCustomers, fetchLeads]);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setSelectedLead(null);
    setShowLeadDropdown(false);
    setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    setShowModal(true);
  };

  const selectLead = (lead: ContactLead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.full_name,
      phone: lead.phone || '',
      email: lead.email || '',
      address: '',
      notes: `Converted from lead. Project: ${lead.project_type}\nOriginal message: ${lead.message}`,
    });
    setShowLeadDropdown(false);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setShowModal(true);
  };

  const handleArchiveCustomer = async (id: number) => {
    if (!window.confirm('Archive this customer? They can be restored later from the archived customers page.')) return;
    setDeletingId(id);
    try {
      await api.archiveCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Failed to archive customer');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsSaving(true);
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
      } else {
        await api.createCustomer(formData);
        if (selectedLead) {
          try {
            await api.updateLead(selectedLead.id, { status: 'converted' });
            fetchLeads();
          } catch {
            console.error('Failed to update lead status');
          }
        }
      }
      setShowModal(false);
      setSelectedLead(null);
      fetchCustomers();
    } catch {
      setError('Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = search
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      )
    : customers;

  return (
    <CrmLayout title="Customers">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-gray-600">Manage your customer contacts</p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/crm/customers/archive"
              className="flex items-center gap-2 px-4 py-2 text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100"
            >
              <Archive className="w-4 h-4" />
              View Archived
            </Link>
            <button
              onClick={fetchCustomers}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              New Customer
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {customers.length === 0 ? 'No customers yet' : 'No results found'}
            </h3>
            {customers.length === 0 && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Customer
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deals</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/crm/customers/${customer.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {customer.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{customer.address || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <Link href={`/admin/crm/customers/${customer.id}`} className="hover:underline">
                          {customer.quote_count + customer.invoice_count}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(customer.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchiveCustomer(customer.id)}
                            disabled={deletingId === customer.id}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Archive customer"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden space-y-2">
              {filtered.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/admin/crm/customers/${customer.id}`}
                  className="block bg-white rounded-lg shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.preventDefault(); openEditModal(customer); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); handleArchiveCustomer(customer.id); }}
                        disabled={deletingId === customer.id}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Archive customer"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold">
                {editingCustomer ? 'Edit Customer' : 'New Customer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {!editingCustomer && leads.length > 0 && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <UserPlus className="w-4 h-4 inline mr-1" />
                    Create from Lead
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLeadDropdown(!showLeadDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 text-left"
                  >
                    <span className={selectedLead ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedLead ? selectedLead.full_name : 'Select a lead (optional)'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showLeadDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showLeadDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLead(null);
                          setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
                          setShowLeadDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-gray-500 hover:bg-gray-50 border-b"
                      >
                        None (create manually)
                      </button>
                      {leads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => selectLead(lead)}
                          className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{lead.full_name}</div>
                          <div className="text-xs text-gray-500">{lead.email} • {lead.project_type}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Internal notes..." />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isSaving ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CrmLayout>
  );
}
