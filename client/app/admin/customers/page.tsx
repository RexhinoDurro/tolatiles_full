'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, RefreshCw, User, Phone, Mail, FileText, Receipt, Trash2, Edit, X, UserPlus, ChevronDown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/lib/api';
import type { Customer, CustomerCreate, ContactLead } from '@/types/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);
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
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await api.getLeads();
      // Filter to show only leads that aren't converted
      const availableLeads = data.filter((lead) => lead.status !== 'converted');
      setLeads(availableLeads);
    } catch (err) {
      console.error('Failed to load leads:', err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSaving(true);
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
      } else {
        await api.createCustomer(formData);
        // If created from a lead, mark the lead as converted
        if (selectedLead) {
          try {
            await api.updateLead(selectedLead.id, { status: 'converted' });
            fetchLeads(); // Refresh leads list
          } catch (err) {
            console.error('Failed to update lead status:', err);
          }
        }
      }
      setShowModal(false);
      setSelectedLead(null);
      fetchCustomers();
    } catch (err) {
      setError('Failed to save customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.deleteCustomer(id);
      fetchCustomers();
    } catch (err) {
      setError('Failed to delete customer. They may have associated quotes or invoices.');
    }
  };

  return (
    <AdminLayout title="Customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-gray-600">Manage your customer contacts</p>
          <div className="flex items-center gap-3">
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

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first customer.</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Customer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(customer)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {customer.email}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>{customer.quote_count} quotes</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Receipt className="w-4 h-4" />
                    <span>{customer.invoice_count} invoices</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingCustomer ? 'Edit Customer' : 'New Customer'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Lead Selection - only show when creating new customer */}
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
                          <div className="text-xs text-gray-500">
                            {lead.email} • {lead.project_type}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedLead && (
                    <p className="text-xs text-green-600 mt-1">
                      Lead info has been pre-filled below. The lead will be marked as converted.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Internal notes..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
