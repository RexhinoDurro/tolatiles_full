'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import type { CalendarBlogPost, BlogPostStatus } from '@/types/api';
import { statusColors } from './BlogCalendarEvent';

interface MobileCalendarProps {
  posts: CalendarBlogPost[];
  onDateRangeChange: (start: Date, end: Date) => void;
  onSelectDate: (date: Date) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export default function MobileCalendar({
  posts,
  onDateRangeChange,
  onSelectDate,
  statusFilter,
  onStatusFilterChange,
}: MobileCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Filter posts by status
  const filteredPosts = useMemo(() => {
    if (!statusFilter) return posts;
    return posts.filter((post) => post.status === statusFilter);
  }, [posts, statusFilter]);

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
    return filteredPosts.filter((post) => {
      const postDate = new Date(post.display_date);
      return isSameDay(postDate, date);
    });
  };

  // Navigate months
  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onDateRangeChange(startOfMonth(newMonth), endOfMonth(newMonth));
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onDateRangeChange(startOfMonth(newMonth), endOfMonth(newMonth));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateRangeChange(startOfMonth(today), endOfMonth(today));
  };

  // Handle day tap
  const handleDayTap = (date: Date) => {
    if (isSameDay(date, selectedDay || new Date(0))) {
      // Second tap - open quick draft
      onSelectDate(date);
    } else {
      setSelectedDay(date);
    }
  };

  // Handle post tap - navigate to editor
  const handlePostTap = (postId: number) => {
    router.push(`/admin/blog/${postId}`);
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get posts for selected day
  const selectedDayPosts = selectedDay ? getPostsForDate(selectedDay) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <span className="text-base font-semibold text-gray-900">
          {format(currentMonth, 'MMM yyyy')}
        </span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Calendar Grid */}
      <div className="flex-shrink-0 p-2">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-semibold text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isSelected = selectedDay && isSameDay(date, selectedDay);
            const today = isToday(date);
            const datePosts = getPostsForDate(date);
            const hasMultipleTypes = new Set(datePosts.map((p) => p.status)).size > 1;

            return (
              <button
                key={index}
                onClick={() => handleDayTap(date)}
                className={`
                  relative aspect-square flex flex-col items-center justify-center rounded-xl
                  transition-all duration-150 active:scale-95
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${isSelected ? 'bg-blue-600 text-white shadow-lg' : ''}
                  ${today && !isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : ''}
                  ${!isSelected && isCurrentMonth ? 'active:bg-gray-100' : ''}
                `}
              >
                <span className="text-sm">{format(date, 'd')}</span>
                {/* Post indicators */}
                {datePosts.length > 0 && isCurrentMonth && (
                  <div className="flex gap-0.5 mt-0.5">
                    {hasMultipleTypes ? (
                      // Show multiple colors if different types
                      datePosts.slice(0, 3).map((post, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.8)'
                              : statusColors[post.status].dot,
                          }}
                        />
                      ))
                    ) : (
                      // Single color with count
                      <>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.8)'
                              : statusColors[datePosts[0].status].dot,
                          }}
                        />
                        {datePosts.length > 1 && (
                          <span
                            className={`text-[9px] font-medium ${
                              isSelected ? 'text-white/80' : 'text-gray-500'
                            }`}
                          >
                            +{datePosts.length - 1}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-2 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors.draft.dot }}
          />
          <span className="text-gray-500">Draft</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors.scheduled.dot }}
          />
          <span className="text-gray-500">Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors.published.dot }}
          />
          <span className="text-gray-500">Published</span>
        </div>
      </div>

      {/* Selected Day Posts */}
      <div className="flex-1 overflow-y-auto border-t border-gray-200">
        {selectedDay ? (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {format(selectedDay, 'EEEE, MMM d')}
              </h3>
              <button
                onClick={() => onSelectDate(selectedDay)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg active:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {selectedDayPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No posts on this day</p>
                <p className="text-xs mt-1">Tap &quot;Add&quot; to create a draft</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handlePostTap(post.id)}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 active:bg-gray-50 transition-colors"
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: statusColors[post.status].border,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-flex px-2 py-0.5 text-xs font-medium rounded"
                            style={{
                              backgroundColor: statusColors[post.status].bg,
                              color: statusColors[post.status].text,
                            }}
                          >
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                          {post.categories.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {post.categories[0].name}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center p-4">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a day to view posts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
