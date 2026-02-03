'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, ChevronDown, Check, CheckCheck, ExternalLink, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationContext } from '@/contexts/NotificationContext';
import type { Notification } from '@/types/api';
import Link from 'next/link';

interface AdminHeaderProps {
  title?: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
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

function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onNavigate: () => void;
}) {
  const url = notification.data?.url as string | undefined;

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
    onNavigate();
  };

  const content = (
    <div
      className={`flex items-start gap-3 p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
      onClick={handleClick}
    >
      <span className="text-xl sm:text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5" />
      )}
    </div>
  );

  if (url) {
    return <Link href={url}>{content}</Link>;
  }

  return content;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationContext();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when notification panel is open on mobile
  useEffect(() => {
    if (showNotifications) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showNotifications]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {title && <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {/* Connection status indicator */}
              <span
                className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-gray-400'
                }`}
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
              {/* Unread count badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications panel - Mobile: Full screen overlay, Desktop: Dropdown */}
            {showNotifications && (
              <>
                {/* Mobile overlay background */}
                <div
                  className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                  onClick={() => setShowNotifications(false)}
                />

                {/* Panel */}
                <div className="fixed inset-x-0 bottom-0 top-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-full sm:w-96 bg-white sm:rounded-lg shadow-lg border-t sm:border border-gray-200 z-50 flex flex-col max-h-[85vh] sm:max-h-[500px] rounded-t-2xl sm:rounded-t-lg">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                    <h3 className="font-semibold text-gray-900 text-lg sm:text-base">Notifications</h3>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">Mark all read</span>
                        </button>
                      )}
                      {/* Close button - more visible on mobile */}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1.5 -mr-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full sm:hidden"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-100 overscroll-contain">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkRead={markAsRead}
                          onNavigate={() => setShowNotifications(false)}
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-base sm:text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <Link
                    href="/admin/notifications"
                    className="flex items-center justify-center gap-2 px-4 py-4 sm:py-3 text-base sm:text-sm font-medium text-blue-600 hover:bg-gray-50 active:bg-gray-100 border-t border-gray-100 transition-colors flex-shrink-0"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
                    <ExternalLink className="w-4 h-4 sm:w-3 sm:h-3" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name || user?.username || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
