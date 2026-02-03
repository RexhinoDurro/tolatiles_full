'use client';

import type { BlogPostStatus } from '@/types/api';
import type { EventProps } from 'react-big-calendar';

interface CalendarEvent {
  title: string;
  status: BlogPostStatus;
  categories: { id: number; name: string; slug: string }[];
}

const statusColors = {
  draft: { bg: '#f3f4f6', border: '#9ca3af', text: '#374151', dot: '#9ca3af' },
  scheduled: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8', dot: '#3b82f6' },
  published: { bg: '#dcfce7', border: '#22c55e', text: '#15803d', dot: '#22c55e' },
};

export default function BlogCalendarEvent({ event }: EventProps<object>) {
  const calendarEvent = event as CalendarEvent;
  const colors = statusColors[calendarEvent.status];

  return (
    <div
      className="px-1.5 py-0.5 rounded text-xs font-medium overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        backgroundColor: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.dot }}
        />
        <span className="truncate">{calendarEvent.title}</span>
      </div>
      {calendarEvent.categories.length > 0 && (
        <div className="text-[10px] opacity-75 truncate mt-0.5">
          {calendarEvent.categories[0].name}
          {calendarEvent.categories.length > 1 && ` +${calendarEvent.categories.length - 1}`}
        </div>
      )}
    </div>
  );
}

export { statusColors };
