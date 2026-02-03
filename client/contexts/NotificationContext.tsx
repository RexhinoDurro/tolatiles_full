'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification, NotificationPreferences } from '@/types/api';
import { api } from '@/lib/api';

interface NotificationContextType {
  isConnected: boolean;
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (data: Partial<NotificationPreferences>) => Promise<void>;
  isPushSupported: boolean;
  isPushSubscribed: boolean;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [showToast, setShowToast] = useState<Notification | null>(null);

  // Check if push notifications are supported
  const isPushSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  // Handle new notification callback
  const handleNewNotification = useCallback((notification: Notification) => {
    setShowToast(notification);
    setTimeout(() => setShowToast(null), 5000);
  }, []);

  const {
    isConnected,
    unreadCount,
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications({
    onNewNotification: handleNewNotification,
    playSound: preferences?.sound_enabled ?? true,
  });

  // Fetch preferences on mount
  React.useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefs = await api.getNotificationPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
      }
    };

    if (api.isAuthenticated()) {
      fetchPreferences();
    }
  }, []);

  // Check push subscription status on mount
  React.useEffect(() => {
    const checkPushSubscription = async () => {
      if (!isPushSupported) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsPushSubscribed(!!subscription);
      } catch (error) {
        console.error('Failed to check push subscription:', error);
      }
    };

    checkPushSubscription();
  }, [isPushSupported]);

  const updatePreferences = useCallback(
    async (data: Partial<NotificationPreferences>) => {
      try {
        const updated = await api.updateNotificationPreferences(data);
        setPreferences(updated);
      } catch (error) {
        console.error('Failed to update preferences:', error);
        throw error;
      }
    },
    []
  );

  const subscribeToPush = useCallback(async () => {
    if (!isPushSupported) {
      throw new Error('Push notifications not supported');
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get VAPID public key
      const { public_key: vapidPublicKey } = await api.getVapidPublicKey();

      // Convert VAPID key to Uint8Array
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Get subscription keys
      const subscriptionJson = subscription.toJSON();
      const keys = subscriptionJson.keys || {};

      // Send subscription to server
      await api.subscribeToPush({
        endpoint: subscription.endpoint,
        p256dh_key: keys.p256dh || '',
        auth_key: keys.auth || '',
        device_name: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        user_agent: navigator.userAgent,
      });

      setIsPushSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      throw error;
    }
  }, [isPushSupported]);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await api.unsubscribeFromPush(subscription.endpoint);
      }

      setIsPushSubscribed(false);
    } catch (error) {
      console.error('Failed to unsubscribe from push:', error);
      throw error;
    }
  }, []);

  const value: NotificationContextType = {
    isConnected,
    unreadCount,
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
    preferences,
    updatePreferences,
    isPushSupported,
    isPushSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              if (showToast.data?.url) {
                window.location.href = showToast.data.url as string;
              }
              setShowToast(null);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{showToast.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{showToast.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowToast(null);
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

// Client-side wrapper for use in server component layouts
export function NotificationProviderWrapper({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
