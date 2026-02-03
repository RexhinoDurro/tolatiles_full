'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import type { CalendarBlogPost, BlogPostStatus } from '@/types/api';
import { api } from '@/lib/api';
import BlogCalendarToolbar from './BlogCalendarToolbar';
import BlogCalendarEvent, { statusColors } from './BlogCalendarEvent';
import QuickDraftModal from './QuickDraftModal';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: BlogPostStatus;
  slug: string;
  categories: { id: number; name: string; slug: string }[];
  allDay: boolean;
}

interface BlogCalendarProps {
  posts: CalendarBlogPost[];
  onDateRangeChange: (start: Date, end: Date) => void;
  onPostsUpdate: () => void;
  compact?: boolean;
}

export default function BlogCalendar({
  posts,
  onDateRangeChange,
  onPostsUpdate,
  compact = false,
}: BlogCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickDraftModal, setQuickDraftModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  // Convert posts to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return posts
      .filter((post) => !statusFilter || post.status === statusFilter)
      .map((post) => {
        const displayDate = new Date(post.display_date);
        return {
          id: post.id,
          title: post.title,
          start: displayDate,
          end: displayDate,
          status: post.status,
          slug: post.slug,
          categories: post.categories,
          allDay: true,
        };
      });
  }, [posts, statusFilter]);

  // Handle navigation
  const handleNavigate = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      onDateRangeChange(start, end);
    },
    [onDateRangeChange]
  );

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Handle event click - navigate to editor
  const handleSelectEvent = useCallback(
    (event: object) => {
      const calendarEvent = event as CalendarEvent;
      router.push(`/admin/blog/${calendarEvent.id}`);
    },
    [router]
  );

  // Handle slot selection - open quick draft modal
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedDate(slotInfo.start);
    setQuickDraftModal(true);
  }, []);

  // Handle event drop (drag and drop rescheduling)
  const handleEventDrop = useCallback(
    async (args: EventInteractionArgs<object>) => {
      const event = args.event as CalendarEvent;
      const start = args.start;

      // Cannot reschedule published posts
      if (event.status === 'published') {
        return;
      }

      try {
        const newDate = new Date(start);
        // Keep the original time if scheduled, otherwise default to 9am
        if (event.status === 'scheduled') {
          const originalDate = new Date(event.start);
          newDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
        } else {
          newDate.setHours(9, 0, 0, 0);
        }

        await api.rescheduleBlogPost(event.slug, newDate.toISOString());
        onPostsUpdate();
      } catch (error) {
        console.error('Failed to reschedule post:', error);
      }
    },
    [onPostsUpdate]
  );

  // Custom event styling
  const eventStyleGetter = useCallback((event: object) => {
    const calendarEvent = event as CalendarEvent;
    const colors = statusColors[calendarEvent.status];
    return {
      style: {
        backgroundColor: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        color: colors.text,
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '12px',
        fontWeight: 500,
        cursor: calendarEvent.status === 'published' ? 'pointer' : 'grab',
      },
    };
  }, []);

  // Day styling for current day and weekends
  const dayPropGetter = useCallback((date: Date) => {
    const isToday =
      date.toDateString() === new Date().toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return {
      style: {
        backgroundColor: isToday ? '#eff6ff' : isWeekend ? '#fafafa' : undefined,
      },
    };
  }, []);

  // Draggable accessor - published posts cannot be dragged
  const draggableAccessor = useCallback((event: object) => {
    const calendarEvent = event as CalendarEvent;
    return calendarEvent.status !== 'published';
  }, []);

  // Custom toolbar component
  const CustomToolbar = useCallback(
    (props: any) => (
      <BlogCalendarToolbar
        {...props}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    ),
    [statusFilter]
  );

  return (
    <div className={compact ? 'h-[500px]' : 'h-[calc(100vh-200px)] min-h-[600px]'}>
      <DnDCalendar
        localizer={localizer}
        events={events}
        view={view}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        draggableAccessor={draggableAccessor}
        selectable
        resizable={false}
        popup
        components={{
          toolbar: CustomToolbar,
          event: BlogCalendarEvent,
        }}
        formats={{
          monthHeaderFormat: 'MMMM yyyy',
          weekdayFormat: 'EEE',
          dayFormat: 'd',
          dayHeaderFormat: 'EEEE, MMMM d',
        }}
        messages={{
          today: 'Today',
          previous: 'Back',
          next: 'Next',
          month: 'Month',
          week: 'Week',
          showMore: (total) => `+${total} more`,
        }}
      />

      <QuickDraftModal
        isOpen={quickDraftModal}
        onClose={() => setQuickDraftModal(false)}
        selectedDate={selectedDate}
        onDraftCreated={onPostsUpdate}
      />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: statusColors.draft.bg, border: `1px solid ${statusColors.draft.border}` }}
          />
          <span className="text-gray-600">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: statusColors.scheduled.bg, border: `1px solid ${statusColors.scheduled.border}` }}
          />
          <span className="text-gray-600">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: statusColors.published.bg, border: `1px solid ${statusColors.published.border}` }}
          />
          <span className="text-gray-600">Published</span>
        </div>
      </div>
    </div>
  );
}
