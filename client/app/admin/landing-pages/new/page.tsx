'use client';

import LandingPageEditor from '@/components/admin/landing-pages/LandingPageEditor';
import AdminLayout from '@/components/admin/AdminLayout';

export default function NewLandingPagePage() {
  return (
    <AdminLayout hideDefaultPadding>
      <LandingPageEditor />
    </AdminLayout>
  );
}
