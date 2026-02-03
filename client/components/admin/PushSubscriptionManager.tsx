'use client';

import { useState } from 'react';
import { Bell, BellOff, Smartphone, AlertCircle, Check } from 'lucide-react';
import { useNotificationContext } from '@/contexts/NotificationContext';

export default function PushSubscriptionManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    isPushSupported,
    isPushSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
  } = useNotificationContext();

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await subscribeToPush();
      setSuccess('Push notifications enabled! You will receive alerts even when the app is closed.');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('permission')) {
          setError('Please allow notifications in your browser settings.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to enable push notifications.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await unsubscribeFromPush();
      setSuccess('Push notifications disabled.');
    } catch (err) {
      setError('Failed to disable push notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPushSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Push Notifications Not Supported
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn&apos;t support push notifications. Try using Chrome, Firefox, or Edge on
              desktop, or install this app as a PWA on mobile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg ${
            isPushSubscribed ? 'bg-green-100' : 'bg-gray-100'
          }`}
        >
          {isPushSubscribed ? (
            <Bell className="w-6 h-6 text-green-600" />
          ) : (
            <BellOff className="w-6 h-6 text-gray-500" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Push Notifications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isPushSubscribed
              ? 'You will receive notifications even when the app is closed.'
              : 'Enable push notifications to receive alerts even when the app is closed.'}
          </p>

          <div className="mt-3 flex items-center gap-3">
            {isPushSubscribed ? (
              <button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
                Disable Push
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Enable Push
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* PWA Installation Hint */}
      {!isPushSubscribed && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Pro tip:</strong> Install this app to your home screen for the best notification
              experience. On mobile, tap the share button and select &quot;Add to Home Screen&quot;.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
