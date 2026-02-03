'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import type { CalendarBlogPost, BlogPostStatus } from '@/types/api';
import { statusColors } from './BlogCalendarEvent';

interface InlineCalendarPickerProps {
  value: string;
  onChange: (value: string) => void;
  excludePostSlug?: string;
}

export default function InlineCalendarPicker({
  value,
  onChange,
  excludePostSlug,
}: InlineCalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    value ? new Date(value) : new Date()
  );
  const [posts, setPosts] = useState<CalendarBlogPost[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedDate = value ? new Date(value) : null;

  // Extract time from value or default to 09:00
  const selectedTime = useMemo(() => {
    if (!value) return '09:00';
    const date = new Date(value);
    return format(date, 'HH:mm');
  }, [value]);

  // Load posts for current month
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        const data = await api.getBlogPostsCalendar(start, end);
        // Filter out the current post being edited
        const filtered = excludePostSlug
          ? data.filter((p) => p.slug !== excludePostSlug)
          : data;
        setPosts(filtered);
      } catch (error) {
        console.error('Failed to load calendar posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentMonth, excludePostSlug]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get posts for a specific date
  const getPostsForDate = (date: Date): CalendarBlogPost[] => {
    return posts.filter((post) => {
      const postDate = new Date(post.display_date);
      return isSameDay(postDate, date);
    });
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    const newDate = new Date(date);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
  };

  // Handle time change
  const handleTimeChange = (time: string) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      const [hours, minutes] = time.split(':').map(Number);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const today = isToday(date);
            const datePosts = getPostsForDate(date);
            const isHovered = hoveredDate && isSameDay(date, hoveredDate);

            return (
              <div key={index} className="relative">
                <button
                  type="button"
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`
                    w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative
                    transition-colors
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                    ${isSelected ? 'bg-blue-600 text-white' : ''}
                    ${today && !isSelected ? 'bg-blue-50 text-blue-700 font-medium' : ''}
                    ${!isSelected && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                  `}
                >
                  <span>{format(date, 'd')}</span>
                  {/* Post indicators */}
                  {datePosts.length > 0 && isCurrentMonth && (
                    <div className="flex gap-0.5 mt-0.5">
                      {datePosts.slice(0, 3).map((post, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.7)'
                              : statusColors[post.status].dot,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>

                {/* Tooltip on hover */}
                {isHovered && datePosts.length > 0 && isCurrentMonth && (
                  <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg">
                    <p className="font-medium mb-1">
                      {format(date, 'MMM d')} - {datePosts.length} post
                      {datePosts.length !== 1 ? 's' : ''}
                    </p>
                    {datePosts.slice(0, 3).map((post, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 truncate text-gray-300"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: statusColors[post.status].dot }}
                        />
                        <span className="truncate">{post.title}</span>
                      </div>
                    ))}
                    {datePosts.length > 3 && (
                      <p className="text-gray-400 mt-1">
                        +{datePosts.length - 3} more
                      </p>
                    )}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                      <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Picker */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">Time:</span>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors.draft.dot }}
          />
          Draft
        </div>
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors.scheduled.dot }}
          />
          Scheduled
        </div>
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors.published.dot }}
          />
          Published
        </div>
      </div>
    </div>
  );
}
