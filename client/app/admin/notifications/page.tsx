import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import NotificationsContent from '@/components/admin/notifications/NotificationsContent';

// Force dynamic rendering - this page requires auth context
export const dynamic = 'force-dynamic';

function NotificationsLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsLoading />}>
      <NotificationsContent />
    </Suspense>
  );
}
