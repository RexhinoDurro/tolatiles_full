'use client';

import { useState, useCallback } from 'react';
import { eachDayOfInterval, parseISO, format } from 'date-fns';
import { RefreshCw, Plus, X, CalendarDays } from 'lucide-react';
import PortalProtectedRoute from '@/components/quotes-portal/PortalProtectedRoute';
import PortalScheduleFeed from '@/components/quotes-portal/PortalScheduleFeed';
import { portalApi as api } from '@/lib/portalApi';
import type { AppointmentType, Deal } from '@/types/api';

const apptTypeLabels: Record<AppointmentType, string> = {
  consultation: 'Consultation',
  follow_up: 'Follow-up',
  measurement: 'Measurement',
  other: 'Other',
};

interface DayHours {
  date: string;
  start_time: string;
  end_time: string;
}

interface ApptForm {
  title: string;
  deal_id: number | '';
  appointment_type: AppointmentType;
  start_date: string;
  end_date: string;
  notes: string;
  day_hours: DayHours[];
}

function buildDayHours(start: string, end: string, existing: DayHours[]): DayHours[] {
  if (!start || !end) return [];
  try {
    const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
    return days.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const prev = existing.find((x) => x.date === dateStr);
      return { date: dateStr, start_time: prev?.start_time ?? '09:00', end_time: prev?.end_time ?? '17:00' };
    });
  } catch {
    return [];
  }
}

function AppointmentCreateModal({
  deals,
  onClose,
  onCreated,
}: {
  deals: Deal[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<ApptForm>({
    title: '',
    deal_id: '',
    appointment_type: 'consultation',
    start_date: '',
    end_date: '',
    notes: '',
    day_hours: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDates = (start: string, end: string) => {
    const effectiveEnd = end || start;
    setForm((f) => ({
      ...f,
      start_date: start,
      end_date: effectiveEnd,
      day_hours: buildDayHours(start, effectiveEnd, f.day_hours),
    }));
  };

  const handleStartDate = (v: string) => updateDates(v, form.end_date < v ? v : form.end_date);
  const handleEndDate = (v: string) => updateDates(form.start_date, v);

  const handleDayHour = (idx: number, field: 'start_time' | 'end_time', value: string) => {
    setForm((f) => {
      const dh = [...f.day_hours];
      dh[idx] = { ...dh[idx], [field]: value };
      return { ...f, day_hours: dh };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.start_date) return;
    setIsSaving(true);
    setError(null);
    try {
      await api.createAppointmentDirect({
        deal: form.deal_id ? (form.deal_id as number) : null,
        title: form.title,
        appointment_type: form.appointment_type,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date,
        notes: form.notes,
        days: form.day_hours.map((d) => ({
          date: d.date,
          start_time: d.start_time || null,
          end_time: d.end_time || null,
        })),
      });
      onCreated();
      onClose();
    } catch {
      setError('Failed to create appointment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">New Appointment</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Appointment title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal (optional)</label>
            <select
              value={form.deal_id}
              onChange={(e) => setForm((f) => ({ ...f, deal_id: e.target.value ? Number(e.target.value) : '' }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No deal</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.customer_name} — {d.job_type || 'other'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.appointment_type}
              onChange={(e) => setForm((f) => ({ ...f, appointment_type: e.target.value as AppointmentType }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.entries(apptTypeLabels) as [AppointmentType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => handleStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.end_date}
                min={form.start_date}
                onChange={(e) => handleEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {form.day_hours.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours per day</label>
              <div className="space-y-2">
                {form.day_hours.map((dh, idx) => (
                  <div key={dh.date} className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600">{dh.date}</span>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={dh.start_time}
                        onChange={(e) => handleDayHour(idx, 'start_time', e.target.value)}
                        className="flex-1 px-2 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400 self-center">–</span>
                      <input
                        type="time"
                        value={dh.end_time}
                        onChange={(e) => handleDayHour(idx, 'end_time', e.target.value)}
                        className="flex-1 px-2 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PortalSchedulePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedKey, setFeedKey] = useState(0);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setDeals(await api.getDeals());
    } catch {
      setError('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    fetchDeals();
    setFeedKey((k) => k + 1);
  };

  return (
    <PortalProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">TolaTiles Quotes Portal</h1>
            </div>
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => {
                  if (deals.length === 0) fetchDeals();
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New Appointment
              </button>
            </div>
          </div>

          {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

          {/* Schedule Feed */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900">Schedule</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <CalendarDays className="w-5 h-5 text-gray-300" />
            </div>
            <PortalScheduleFeed key={feedKey} />
          </div>

          {showCreateModal && (
            <AppointmentCreateModal
              deals={deals}
              onClose={() => setShowCreateModal(false)}
              onCreated={handleRefresh}
            />
          )}
        </div>
      </div>
    </PortalProtectedRoute>
  );
}

