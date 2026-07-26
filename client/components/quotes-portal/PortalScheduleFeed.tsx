'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Loader2, CalendarDays, X, User, Phone, Mail, MapPin, StickyNote } from 'lucide-react';
import { portalApi as api } from '@/lib/portalApi';
import type { EstimateVisit, Appointment, Deal, Customer } from '@/types/api';

interface ScheduleEvent {
  id: number;
  title: string;
  start: Date;
  type: 'visit' | 'appointment';
  dealId: number | null;
  status: string;
  subtype?: string;
}

interface ClientInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDayHeader(date: Date, today: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const visitStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-700 bg-blue-50 ring-blue-200', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-yellow-700 bg-yellow-50 ring-yellow-200', icon: Clock },
  completed: { label: 'Completed', color: 'text-green-700 bg-green-50 ring-green-200', icon: CheckCircle2 },
};

const apptTypeConfig: Record<string, { label: string; color: string }> = {
  consultation: { label: 'Consultation', color: 'text-purple-700 bg-purple-50' },
  follow_up: { label: 'Follow-up', color: 'text-pink-700 bg-pink-50' },
  measurement: { label: 'Measurement', color: 'text-violet-700 bg-violet-50' },
  other: { label: 'Other', color: 'text-indigo-700 bg-indigo-50' },
};

const apptStatusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-purple-700 bg-purple-50 ring-purple-200' },
  completed: { label: 'Completed', color: 'text-green-700 bg-green-50 ring-green-200' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500 bg-gray-50 ring-gray-200' },
};

function ClientInfoModal({ client, onClose }: { client: ClientInfo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">{client.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {client.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${client.phone}`} className="text-gray-700 hover:text-blue-600">{client.phone}</a>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${client.email}`} className="text-gray-700 hover:text-blue-600 break-all">{client.email}</a>
            </div>
          )}
          {client.address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{client.address}</span>
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-3 text-sm pt-2 border-t">
              <StickyNote className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 whitespace-pre-wrap">{client.notes}</span>
            </div>
          )}
          {!client.phone && !client.email && !client.address && !client.notes && (
            <p className="text-sm text-gray-400">No additional contact info on file.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, isOverdue, onSelect }: { event: ScheduleEvent; isOverdue: boolean; onSelect?: () => void }) {
  const isVisit = event.type === 'visit';
  const accentColor = isOverdue
    ? 'border-l-red-400'
    : isVisit
    ? 'border-l-blue-400'
    : 'border-l-purple-400';

  const statusCfg = isVisit
    ? visitStatusConfig[event.status] ?? visitStatusConfig.scheduled
    : apptStatusConfig[event.status] ?? apptStatusConfig.scheduled;

  const StatusIcon = isVisit ? (visitStatusConfig[event.status]?.icon ?? Clock) : Clock;
  const clickable = !!onSelect;

  return (
    <div
      onClick={onSelect}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter') onSelect?.(); } : undefined}
      className={`flex items-start gap-4 bg-white rounded-xl shadow-sm border-l-4 ${accentColor} px-4 py-3.5 ${
        clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      {/* Time */}
      <div className="flex-shrink-0 w-16 text-center pt-0.5">
        <span className="text-sm font-bold text-gray-800 leading-none block">{formatTime(event.start)}</span>
      </div>

      {/* Divider */}
      <div className={`w-px self-stretch ${isOverdue ? 'bg-red-200' : isVisit ? 'bg-blue-100' : 'bg-purple-100'}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 text-sm leading-snug truncate">
            {event.title}
          </p>
          {isOverdue && (
            <span className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200">
              <AlertTriangle className="w-3 h-3" />
              Overdue
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {/* Type chip */}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isVisit ? 'bg-blue-50 text-blue-700' : (apptTypeConfig[event.subtype ?? '']?.color ?? 'bg-purple-50 text-purple-700')}`}>
            {isVisit ? 'Estimate Visit' : (apptTypeConfig[event.subtype ?? '']?.label ?? 'Appointment')}
          </span>
          {/* Status */}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${statusCfg.color}`}>
            <StatusIcon className="inline w-3 h-3 mr-0.5 -mt-0.5" />
            {statusCfg.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function DaySection({
  label,
  events,
  today,
  onSelectEvent,
}: {
  label: string;
  events: ScheduleEvent[];
  today: Date;
  onSelectEvent: (event: ScheduleEvent) => void;
}) {
  const isToday = label === 'Today';
  const overdue = isToday ? [] : events.filter(
    (e) => e.start < today && e.status !== 'completed' && e.status !== 'cancelled'
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isToday ? 'bg-amber-100 text-amber-700' : 'text-gray-400'}`}>
          {label}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>
      {events.map((ev) => (
        <EventCard
          key={`${ev.type}-${ev.id}`}
          event={ev}
          isOverdue={overdue.includes(ev)}
          onSelect={ev.dealId ? () => onSelectEvent(ev) : undefined}
        />
      ))}
    </div>
  );
}

export default function PortalScheduleFeed() {
  const [visits, setVisits] = useState<EstimateVisit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientInfo | null>(null);

  useEffect(() => {
    Promise.all([
      api.getAllEstimateVisits(),
      api.getAllAppointments(),
      api.getDeals(),
      api.getCustomers(),
    ])
      .then(([v, a, d, c]) => { setVisits(v); setAppointments(a); setDeals(d); setCustomers(c); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const dealsById = useMemo(() => new Map(deals.map((d) => [d.id, d])), [deals]);
  const customersById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const handleSelectEvent = (event: ScheduleEvent) => {
    if (!event.dealId) return;
    const deal = dealsById.get(event.dealId);
    if (!deal) return;
    const customer = customersById.get(deal.customer);
    setSelectedClient({
      name: customer?.name ?? deal.customer_name,
      phone: customer?.phone ?? deal.customer_phone,
      email: customer?.email,
      address: customer?.address ?? deal.address,
      notes: customer?.notes,
    });
  };

  const today = useMemo(() => new Date(), []);

  const { todayEvents, upcomingGroups, overdueEvents } = useMemo(() => {
    const allEvents: ScheduleEvent[] = [
      ...visits
        .filter((v) => v.scheduled_date)
        .map((v) => ({
          id: v.id,
          title: v.title,
          start: new Date(v.scheduled_date),
          type: 'visit' as const,
          dealId: v.deal,
          status: v.status,
        })),
      ...appointments.flatMap((a) => {
        if (a.days && a.days.length > 0) {
          return a.days.map((day) => ({
            id: a.id,
            title: a.title,
            start: day.start_time
              ? new Date(`${day.date}T${day.start_time}`)
              : new Date(day.date),
            type: 'appointment' as const,
            dealId: a.deal,
            status: a.status,
            subtype: a.appointment_type,
          }));
        }
        const dateStr = a.scheduled_date ?? (a.start_date ? `${a.start_date}T09:00:00` : null);
        if (!dateStr) return [];
        return [{
          id: a.id,
          title: a.title,
          start: new Date(dateStr),
          type: 'appointment' as const,
          dealId: a.deal,
          status: a.status,
          subtype: a.appointment_type,
        }];
      }),
    ].sort((a, b) => a.start.getTime() - b.start.getTime());

    const todayEvents = allEvents.filter((e) => isSameDay(e.start, today));

    const overdueCutoff = new Date(today);
    overdueCutoff.setHours(0, 0, 0, 0);
    const overdueEvents = allEvents.filter(
      (e) => e.start < overdueCutoff && !isSameDay(e.start, today) &&
        e.status !== 'completed' && e.status !== 'cancelled'
    );

    // Next 7 days (excluding today)
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + 7);
    const upcoming = allEvents.filter(
      (e) => !isSameDay(e.start, today) && e.start > overdueCutoff && e.start <= windowEnd
    );

    // Group by day
    const groups: Map<string, ScheduleEvent[]> = new Map();
    for (const ev of upcoming) {
      const key = ev.start.toDateString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(ev);
    }

    const upcomingGroups = Array.from(groups.entries()).map(([key, evs]) => ({
      label: formatDayHeader(new Date(key), today),
      events: evs,
    }));

    return { todayEvents, upcomingGroups, overdueEvents };
  }, [visits, appointments, today]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const hasAnything = todayEvents.length > 0 || upcomingGroups.length > 0 || overdueEvents.length > 0;

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <CalendarDays className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600">No upcoming events</p>
        <p className="text-xs text-gray-400 mt-1">Estimate visits and appointments will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Overdue */}
      {overdueEvents.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-600">
              Overdue
            </span>
            <div className="flex-1 h-px bg-red-100" />
            <span className="text-xs text-red-400">{overdueEvents.length} not completed</span>
          </div>
          {overdueEvents.map((ev) => (
            <EventCard
              key={`${ev.type}-${ev.id}`}
              event={ev}
              isOverdue
              onSelect={ev.dealId ? () => handleSelectEvent(ev) : undefined}
            />
          ))}
        </div>
      )}

      {/* Today */}
      {todayEvents.length > 0 ? (
        <DaySection label="Today" events={todayEvents} today={today} onSelectEvent={handleSelectEvent} />
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-400">Nothing scheduled for today</span>
        </div>
      )}

      {/* Upcoming */}
      {upcomingGroups.map(({ label, events }) => (
        <DaySection key={label} label={label} events={events} today={today} onSelectEvent={handleSelectEvent} />
      ))}

      {selectedClient && (
        <ClientInfoModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
}
