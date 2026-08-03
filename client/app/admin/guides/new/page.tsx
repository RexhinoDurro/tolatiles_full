'use client';

import BlogEditor from '@/components/admin/blog/BlogEditor';
import AdminLayout from '@/components/admin/AdminLayout';

export default function NewGuidePage() {
  return (
    <AdminLayout hideDefaultPadding>
      <BlogEditor isNew contentType="guide" />
    </AdminLayout>
  );
}
