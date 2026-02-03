'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Notification } from '@/types/api';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

interface WebSocketMessage {
  type: 'connection_established' | 'new_notification' | 'unread_count_update' | 'pong';
  notification?: Notification;
  unread_count?: number;
}

interface UseNotificationsOptions {
  onNewNotification?: (notification: Notification) => void;
  playSound?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isConnectingRef = useRef(false);

  // Store options in ref to avoid dependency issues
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Initialize audio for notification sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.wav');
      audioRef.current.volume = 0.5;
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (optionsRef.current.playSound !== false && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore errors from autoplay restrictions
      });
    }
  }, []);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send message via WebSocket
  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }
    isConnectingRef.current = false;
    setIsConnected(false);
  }, []);

  // Connect to WebSocket - stable function with no external dependencies
  const connect = useCallback(() => {
    const token = api.getAccessToken();
    if (!token) {
      console.log('No auth token, skipping WebSocket connection');
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = true;
    const wsUrl = `${WS_BASE}/ws/notifications/?token=${token}`;
    console.log('Connecting to WebSocket...');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          switch (data.type) {
            case 'connection_established':
              if (data.unread_count !== undefined) {
                setUnreadCount(data.unread_count);
              }
              break;

            case 'new_notification':
              if (data.notification) {
                setNotifications(prev => [data.notification!, ...prev]);
                setUnreadCount(prev => prev + 1);
                playNotificationSound();
                optionsRef.current.onNewNotification?.(data.notification);
              }
              break;

            case 'unread_count_update':
              if (data.unread_count !== undefined) {
                setUnreadCount(data.unread_count);
              }
              break;

            case 'pong':
              // Heartbeat response
              break;
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code);
        setIsConnected(false);
        wsRef.current = null;
        isConnectingRef.current = false;

        // Reconnect with exponential backoff (max 30 seconds)
        // Don't reconnect on normal closure (1000) or auth failure (4001)
        if (event.code !== 1000 && event.code !== 4001) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting in ${delay}ms...`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      isConnectingRef.current = false;
    }
  }, [playNotificationSound]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      sendMessage({ type: 'mark_read', notification_id: id });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [sendMessage]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      sendMessage({ type: 'mark_all_read' });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [sendMessage]);

  // Initialize on mount only
  useEffect(() => {
    fetchNotifications();
    connect();

    // Heartbeat every 30 seconds to keep connection alive
    const heartbeat = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000);

    // Subscribe to token refresh events to reconnect with fresh token
    const unsubscribe = api.onTokenRefresh(() => {
      console.log('Token refreshed, reconnecting WebSocket...');
      disconnect();
      // Small delay to ensure token is saved
      setTimeout(() => {
        reconnectAttemptsRef.current = 0;
        connect();
      }, 100);
    });

    return () => {
      clearInterval(heartbeat);
      unsubscribe();
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount/unmount

  return {
    isConnected,
    unreadCount,
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
