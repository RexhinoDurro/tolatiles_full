import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import AdminLeadsContent from '@/components/admin/leads/AdminLeadsContent';

function LeadsLoading() {
  return (
    <CrmLayout title="Leads">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    </CrmLayout>
  );
}

export default function CrmLeadsPage() {
  return (
    <Suspense fallback={<LeadsLoading />}>
      <AdminLeadsContent crmMode />
    </Suspense>
  );
}
