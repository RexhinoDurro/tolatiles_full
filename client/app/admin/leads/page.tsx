import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLeadsContent from '@/components/admin/leads/AdminLeadsContent';

function LeadsLoading() {
  return (
    <AdminLayout title="Leads Management">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    </AdminLayout>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<LeadsLoading />}>
      <AdminLeadsContent />
    </Suspense>
  );
}
