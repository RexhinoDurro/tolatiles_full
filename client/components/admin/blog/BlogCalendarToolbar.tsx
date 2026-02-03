'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ToolbarProps, View } from 'react-big-calendar';

interface BlogCalendarToolbarProps extends ToolbarProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export default function BlogCalendarToolbar({
  label,
  onNavigate,
  onView,
  view,
  statusFilter,
  onStatusFilterChange,
}: BlogCalendarToolbarProps) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Top row - Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
          >
            Today
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <span className="text-base sm:text-lg font-semibold text-gray-900">{label}</span>
      </div>

      {/* Bottom row - Filters and views */}
      <div className="flex items-center justify-between gap-2">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="flex-1 sm:flex-none px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white touch-manipulation"
        >
          <option value="">All Posts</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>

        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => onView('month')}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors touch-manipulation ${
              view === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onView('week')}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors touch-manipulation ${
              view === 'week'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Week
          </button>
        </div>
      </div>
    </div>
  );
}
