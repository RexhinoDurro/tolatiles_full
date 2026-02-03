'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Settings, Wifi, WifiOff } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useNotificationContext } from '@/contexts/NotificationContext';
import PushSubscriptionManager from '@/components/admin/PushSubscriptionManager';
import type { Notification, NotificationType } from '@/types/api';
import Link from 'next/link';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'new_lead':
      return '🎯';
    case 'lead_status':
      return '📋';
    case 'quote_status':
      return '📝';
    case 'invoice_paid':
      return '💰';
    case 'system':
      return '⚙️';
    default:
      return '🔔';
  }
}

function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'new_lead':
      return 'New Lead';
    case 'lead_status':
      return 'Lead Update';
    case 'quote_status':
      return 'Quote Update';
    case 'invoice_paid':
      return 'Payment';
    case 'system':
      return 'System';
    default:
      return 'Notification';
  }
}

function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
}) {
  const url = notification.data?.url as string | undefined;

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
  };

  const content = (
    <div
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        !notification.is_read
          ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                notification.priority === 'high'
                  ? 'bg-red-100 text-red-700'
                  : notification.priority === 'normal'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getNotificationTypeLabel(notification.type)}
            </span>
            {!notification.is_read && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
          <h3 className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
            {notification.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(notification.created_at)}</p>
        </div>
        {url && (
          <Link
            href={url}
            className="flex-shrink-0 text-blue-600 hover:text-blue-800 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            View →
          </Link>
        )}
      </div>
    </div>
  );

  return content;
}

export default function NotificationsContent() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const {
    isConnected,
    unreadCount,
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    preferences,
    updatePreferences,
  } = useNotificationContext();

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <AdminLayout title="Notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                isConnected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  Live updates active
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  Connecting...
                </>
              )}
            </div>
            {unreadCount > 0 && (
              <span className="text-sm text-gray-500">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'unread'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread
              </button>
            </div>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="font-semibold text-gray-900">Notification Settings</h2>

            {/* Push Notifications */}
            <PushSubscriptionManager />

            {/* Notification Preferences */}
            {preferences && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Notification Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'new_lead_enabled', label: 'New Leads', icon: '🎯' },
                    { key: 'lead_status_enabled', label: 'Lead Updates', icon: '📋' },
                    { key: 'quote_status_enabled', label: 'Quote Updates', icon: '📝' },
                    { key: 'invoice_paid_enabled', label: 'Payments', icon: '💰' },
                    { key: 'system_enabled', label: 'System Alerts', icon: '⚙️' },
                  ].map((pref) => (
                    <label
                      key={pref.key}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={preferences[pref.key as keyof typeof preferences] as boolean}
                        onChange={(e) =>
                          updatePreferences({ [pref.key]: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-lg">{pref.icon}</span>
                      <span className="text-sm text-gray-700">{pref.label}</span>
                    </label>
                  ))}
                </div>

                {/* Sound Toggle */}
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.sound_enabled}
                    onChange={(e) =>
                      updatePreferences({ sound_enabled: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-lg">🔔</span>
                  <span className="text-sm text-gray-700">Play notification sound</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h3>
              <p className="text-sm text-gray-500">
                {filter === 'unread'
                  ? 'You have no unread notifications.'
                  : 'Notifications will appear here when you receive them.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
