'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, Save, Download, Edit2, X, Check } from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import { api } from '@/lib/api';
import type { CustomJobType, CustomLeadSource, Deal, DealStage } from '@/types/api';

type TabId = 'job_types' | 'lead_sources' | 'notes';

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

const NOTES_STAGES: DealStage[] = ['job_scheduled', 'job_completed', 'job_lost'];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ==================== JOB TYPE ROW ====================

interface TypeRowProps {
  item: CustomJobType | CustomLeadSource;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function TypeRow({ item, onUpdate, onDelete }: TypeRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onUpdate(item.id, name.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 group">
      {editing ? (
        <>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(false); setName(item.name); } }}
          />
          <button onClick={handleSave} disabled={saving} className="p-1 text-green-600 hover:text-green-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
          <button onClick={() => { setEditing(false); setName(item.name); }} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-gray-800">{item.name}</span>
          <span className="text-xs text-gray-400 font-mono">{item.slug}</span>
          <button onClick={() => setEditing(true)} className="p-1 text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </>
      )}
    </div>
  );
}

// ==================== NOTES TAB ====================

interface NotesTabProps {
  jobTypes: CustomJobType[];
  leadSources: CustomLeadSource[];
}

function NotesTab({ jobTypes, leadSources }: NotesTabProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editForm, setEditForm] = useState({ reason: '', notes: '', job_type: '', lead_source: '' });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const all = await api.getDeals();
        setDeals(all.filter((d) => NOTES_STAGES.includes(d.stage)));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const selectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditForm({
      reason: deal.reason || '',
      notes: deal.notes || '',
      job_type: deal.job_type || '',
      lead_source: deal.lead_source || '',
    });
  };

  const handleSave = async () => {
    if (!selectedDeal) return;
    setSaving(true);
    try {
      const updated = await api.updateDeal(selectedDeal.id, {
        reason: editForm.reason,
        notes: editForm.notes,
        job_type: editForm.job_type || undefined,
        lead_source: editForm.lead_source || undefined,
      });
      setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDeal(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { utils, writeFile } = await import('xlsx');
      const rows = deals.map((d) => ({
        Customer: d.customer_name,
        Stage: stageLabels[d.stage],
        'Job Type': d.job_type ? (jobTypes.find((jt) => jt.slug === d.job_type)?.name ?? d.job_type) : '',
        'Lead Source': d.lead_source ? (leadSources.find((ls) => ls.slug === d.lead_source)?.name ?? d.lead_source) : '',
        Value: d.value ?? '',
        Address: d.address,
        'Sq Ft': d.estimated_sqft ?? '',
        Reason: d.reason,
        Notes: d.notes,
        'Created Date': new Date(d.created_at).toLocaleDateString('en-US'),
      }));
      const ws = utils.json_to_sheet(rows);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Deals');
      writeFile(wb, 'crm_deals_notes.xlsx');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      const { utils, writeFile } = await import('xlsx');
      const allDeals = await api.getDeals();
      const rows = allDeals.map((d) => ({
        Customer: d.customer_name,
        Stage: stageLabels[d.stage] ?? d.stage,
        'Job Type': d.job_type ? (jobTypes.find((jt) => jt.slug === d.job_type)?.name ?? d.job_type) : '',
        'Lead Source': d.lead_source ? (leadSources.find((ls) => ls.slug === d.lead_source)?.name ?? d.lead_source) : '',
        Value: d.value ?? '',
        Address: d.address,
        'Sq Ft': d.estimated_sqft ?? '',
        Reason: d.reason,
        Notes: d.notes,
        'Created Date': new Date(d.created_at).toLocaleDateString('en-US'),
      }));
      const ws = utils.json_to_sheet(rows);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'All Deals');
      writeFile(wb, `crm_all_deals_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="space-y-4">
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4">
      <div>
        <p className="font-semibold text-gray-900 text-sm">Export All Deals</p>
        <p className="text-xs text-gray-500 mt-0.5">Download every deal across all pipeline stages as an Excel file</p>
      </div>
      <button
        onClick={handleExportAll}
        disabled={exportingAll}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {exportingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {exportingAll ? 'Exporting...' : 'Export All Deals'}
      </button>
    </div>
    <div className="flex gap-0 h-[calc(100vh-290px)] border border-gray-200 rounded-xl overflow-hidden">
      {/* Left panel: deal list */}
      <div className="w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deals</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : deals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No deals in these stages.</p>
        ) : (
          <ul>
            {deals.map((deal) => (
              <li key={deal.id}>
                <button
                  onClick={() => selectDeal(deal)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${selectedDeal?.id === deal.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
                >
                  <p className="font-medium text-sm text-gray-900 truncate">{deal.customer_name}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${stageBadgeClass[deal.stage]}`}>
                    {stageLabels[deal.stage]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right panel: deal detail */}
      <div className="flex-1 overflow-y-auto bg-white">
        {!selectedDeal ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">Select a deal to edit its details</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{selectedDeal.customer_name}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${stageBadgeClass[selectedDeal.stage]}`}>
                  {stageLabels[selectedDeal.stage]}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Export to Excel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Job Type</label>
                <select
                  value={editForm.job_type}
                  onChange={(e) => setEditForm({ ...editForm, job_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {jobTypes.map((jt) => <option key={jt.id} value={jt.slug}>{jt.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Lead Source</label>
                <select
                  value={editForm.lead_source}
                  onChange={(e) => setEditForm({ ...editForm, lead_source: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {leadSources.map((ls) => <option key={ls.id} value={ls.slug}>{ls.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Reason (why won/lost)</label>
              <textarea
                value={editForm.reason}
                onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Why was this deal won or lost?"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Internal notes..."
              />
            </div>

            {selectedDeal.address && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                <p className="text-sm text-gray-700">{selectedDeal.address}</p>
              </div>
            )}
            {selectedDeal.value && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Deal Value</label>
                <p className="text-sm text-gray-700">${Number(selectedDeal.value).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

// ==================== MAIN SETTINGS PAGE ====================

export default function CrmSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('job_types');
  const [jobTypes, setJobTypes] = useState<CustomJobType[]>([]);
  const [leadSources, setLeadSources] = useState<CustomLeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New item form state
  const [newJobTypeName, setNewJobTypeName] = useState('');
  const [addingJobType, setAddingJobType] = useState(false);
  const [newLeadSourceName, setNewLeadSourceName] = useState('');
  const [addingLeadSource, setAddingLeadSource] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [jts, lss] = await Promise.all([api.getJobTypes(), api.getLeadSources()]);
      setJobTypes(jts);
      setLeadSources(lss);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddJobType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTypeName.trim()) return;
    setAddingJobType(true);
    try {
      const slug = slugify(newJobTypeName);
      const jt = await api.createJobType({ name: newJobTypeName.trim(), slug, order: jobTypes.length });
      setJobTypes((prev) => [...prev, jt]);
      setNewJobTypeName('');
    } finally {
      setAddingJobType(false);
    }
  };

  const handleUpdateJobType = async (id: number, name: string) => {
    const updated = await api.updateJobType(id, { name, slug: slugify(name) });
    setJobTypes((prev) => prev.map((jt) => (jt.id === id ? updated : jt)));
  };

  const handleDeleteJobType = async (id: number) => {
    await api.deleteJobType(id);
    setJobTypes((prev) => prev.filter((jt) => jt.id !== id));
  };

  const handleAddLeadSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadSourceName.trim()) return;
    setAddingLeadSource(true);
    try {
      const slug = slugify(newLeadSourceName);
      const ls = await api.createLeadSource({ name: newLeadSourceName.trim(), slug, order: leadSources.length });
      setLeadSources((prev) => [...prev, ls]);
      setNewLeadSourceName('');
    } finally {
      setAddingLeadSource(false);
    }
  };

  const handleUpdateLeadSource = async (id: number, name: string) => {
    const updated = await api.updateLeadSource(id, { name, slug: slugify(name) });
    setLeadSources((prev) => prev.map((ls) => (ls.id === id ? updated : ls)));
  };

  const handleDeleteLeadSource = async (id: number) => {
    await api.deleteLeadSource(id);
    setLeadSources((prev) => prev.filter((ls) => ls.id !== id));
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'job_types', label: 'Job Types' },
    { id: 'lead_sources', label: 'Lead Sources' },
    { id: 'notes', label: 'Notes & Export' },
  ];

  return (
    <CrmLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CRM Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage job types, lead sources, and deal notes</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && activeTab !== 'notes' ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Job Types Tab */}
            {activeTab === 'job_types' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Job Types</h2>
                  <p className="text-xs text-gray-500 mt-0.5">These appear in deal dropdowns across the CRM</p>
                </div>
                <div className="p-4 space-y-1">
                  {jobTypes.length === 0 && (
                    <p className="text-sm text-gray-400 py-2 text-center">No job types yet.</p>
                  )}
                  {jobTypes.map((jt) => (
                    <TypeRow key={jt.id} item={jt} onUpdate={handleUpdateJobType} onDelete={handleDeleteJobType} />
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <form onSubmit={handleAddJobType} className="flex gap-2">
                    <input
                      type="text"
                      value={newJobTypeName}
                      onChange={(e) => setNewJobTypeName(e.target.value)}
                      placeholder="New job type name..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={addingJobType || !newJobTypeName.trim()}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
                    >
                      {addingJobType ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Lead Sources Tab */}
            {activeTab === 'lead_sources' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Lead Sources</h2>
                  <p className="text-xs text-gray-500 mt-0.5">These appear in deal dropdowns across the CRM</p>
                </div>
                <div className="p-4 space-y-1">
                  {leadSources.length === 0 && (
                    <p className="text-sm text-gray-400 py-2 text-center">No lead sources yet.</p>
                  )}
                  {leadSources.map((ls) => (
                    <TypeRow key={ls.id} item={ls} onUpdate={handleUpdateLeadSource} onDelete={handleDeleteLeadSource} />
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <form onSubmit={handleAddLeadSource} className="flex gap-2">
                    <input
                      type="text"
                      value={newLeadSourceName}
                      onChange={(e) => setNewLeadSourceName(e.target.value)}
                      placeholder="New lead source name..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={addingLeadSource || !newLeadSourceName.trim()}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
                    >
                      {addingLeadSource ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <NotesTab jobTypes={jobTypes} leadSources={leadSources} />
            )}
          </>
        )}
      </div>
    </CrmLayout>
  );
}
