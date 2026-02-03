'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, List } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { api } from '@/lib/api';
import type { CalendarBlogPost } from '@/types/api';
import AdminLayout from '@/components/admin/AdminLayout';
import BlogCalendar from '@/components/admin/blog/BlogCalendar';
import MobileCalendar from '@/components/admin/blog/MobileCalendar';
import QuickDraftModal from '@/components/admin/blog/QuickDraftModal';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export default function BlogCalendarPage() {
  const isMobile = useIsMobile();
  const [posts, setPosts] = useState<CalendarBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [quickDraftModal, setQuickDraftModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
  });

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const startStr = format(dateRange.start, 'yyyy-MM-dd');
      const endStr = format(dateRange.end, 'yyyy-MM-dd');
      const data = await api.getBlogPostsCalendar(startStr, endStr);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load calendar posts:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setQuickDraftModal(true);
  }, []);

  return (
    <AdminLayout>
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/blog"
                className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Calendar</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/blog"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <List className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/blog/new"
                className="p-2 bg-blue-600 text-white rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile Calendar */}
          <div className="flex-1 bg-white overflow-hidden">
            {loading && posts.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              </div>
            ) : (
              <MobileCalendar
                posts={posts}
                onDateRangeChange={handleDateRangeChange}
                onSelectDate={handleSelectDate}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/blog"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Blog Calendar
                </h1>
                <p className="text-sm text-gray-600 mt-0.5 hidden sm:block">
                  Visualize and schedule your blog posts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/blog"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <List className="w-4 h-4" />
                List View
              </Link>
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Post
              </Link>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            {loading && posts.length === 0 ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500">Loading calendar...</span>
                </div>
              </div>
            ) : (
              <BlogCalendar
                posts={posts}
                onDateRangeChange={handleDateRangeChange}
                onPostsUpdate={loadPosts}
              />
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>Click a date</strong> to create a quick draft
              </li>
              <li>
                <strong>Click a post</strong> to open the editor
              </li>
              <li>
                <strong>Drag a draft or scheduled post</strong> to reschedule it
              </li>
              <li>
                Published posts cannot be rescheduled (they&apos;re already live!)
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Quick Draft Modal */}
      <QuickDraftModal
        isOpen={quickDraftModal}
        onClose={() => setQuickDraftModal(false)}
        selectedDate={selectedDate}
        onDraftCreated={loadPosts}
      />
    </AdminLayout>
  );
}
