'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Save, X, HelpCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/lib/api';
import type { SiteFAQ, SiteFAQCreate, FAQCategorySlug } from '@/types/api';

const CATEGORIES: { id: FAQCategorySlug; label: string }[] = [
  { id: 'general', label: 'General Questions' },
  { id: 'services', label: 'Services & Installation' },
  { id: 'pricing', label: 'Pricing & Timeline' },
  { id: 'materials', label: 'Materials & Design' },
  { id: 'maintenance', label: 'Care & Maintenance' },
];

const categoryColors: Record<FAQCategorySlug, string> = {
  general: 'bg-blue-100 text-blue-700',
  services: 'bg-green-100 text-green-700',
  pricing: 'bg-yellow-100 text-yellow-700',
  materials: 'bg-purple-100 text-purple-700',
  maintenance: 'bg-orange-100 text-orange-700',
};

const emptyForm: SiteFAQCreate = {
  question: '',
  answer: '',
  category: 'general',
  order: 0,
  is_active: true,
};

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<SiteFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SiteFAQCreate>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<FAQCategorySlug | 'all'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadFAQs();
  }, []);

  async function loadFAQs() {
    setLoading(true);
    try {
      const data = await api.getAllFAQsAdmin();
      setFaqs(data);
    } catch (err) {
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function openEdit(faq: SiteFAQ) {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      is_active: faq.is_active,
    });
    setShowForm(true);
    setError(null);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Question and answer are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId !== null) {
        const updated = await api.updateFAQ(editingId, form);
        setFaqs((prev) => prev.map((f) => (f.id === editingId ? updated : f)));
        setSuccess('FAQ updated successfully.');
      } else {
        const created = await api.createFAQ(form);
        setFaqs((prev) => [...prev, created]);
        setSuccess('FAQ created successfully.');
      }
      cancelForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save FAQ.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(faq: SiteFAQ) {
    try {
      const updated = await api.updateFAQ(faq.id, { is_active: !faq.is_active });
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
    } catch {
      setError('Failed to update FAQ status.');
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteFAQ(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      setDeleteConfirm(null);
      setSuccess('FAQ deleted.');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to delete FAQ.');
    }
  }

  const filtered = filterCategory === 'all' ? faqs : faqs.filter((f) => f.category === filterCategory);
  const activeCt = faqs.filter((f) => f.is_active).length;

  return (
    <AdminLayout title="FAQ Management">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">FAQ Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {faqs.length} total · {activeCt} active · shown on website with FAQ schema for SEO
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>

        {/* Notifications */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            {success}
            <button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
          </div>
        )}
        {error && !showForm && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Create / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId !== null ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FAQCategorySlug }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. How long does tile installation take?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  placeholder="Provide a clear, detailed answer..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This answer will appear in Google search results via FAQ schema.</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active (visible on website and in FAQ schema)
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId !== null ? 'Save Changes' : 'Create FAQ'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({faqs.length})
          </button>
          {CATEGORIES.map((cat) => {
            const ct = faqs.filter((f) => f.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label} ({ct})
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No FAQs in this category. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((faq) => (
              <div
                key={faq.id}
                className={`bg-white rounded-xl shadow-sm border transition-all ${
                  faq.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="px-4 sm:px-6 py-4 flex items-start gap-3">
                  {/* Order badge */}
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center mt-0.5">
                    {faq.order}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[faq.category]}`}>
                        {CATEGORIES.find((c) => c.id === faq.category)?.label}
                      </span>
                      {!faq.is_active && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 text-sm leading-snug">{faq.question}</p>

                    {expandedId === faq.id && (
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed">{faq.answer}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title={expandedId === faq.id ? 'Collapse' : 'Preview answer'}
                    >
                      {expandedId === faq.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleToggleActive(faq)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title={faq.is_active ? 'Hide from website' : 'Show on website'}
                    >
                      {faq.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(faq)}
                      className="p-2 text-blue-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {deleteConfirm === faq.id ? (
                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                        <span className="text-xs text-red-700">Delete?</span>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-800 px-1"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-1"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(faq.id)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEO Info Box */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <h3 className="font-semibold text-indigo-900 mb-2">SEO Impact</h3>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• Active FAQs appear as <strong>FAQPage structured data</strong> in Google search results</li>
            <li>• Well-written answers can appear as <strong>rich results</strong> directly in Google (expanded Q&A boxes)</li>
            <li>• FAQs index long-tail keywords like "how long does tile installation take in Jacksonville"</li>
            <li>• Keep answers concise (50–300 words) for best rich result eligibility</li>
          </ul>
          <a
            href="https://tolatiles.com/faqs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-700 font-medium text-sm mt-3 hover:text-indigo-900"
          >
            View FAQ page on website →
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
