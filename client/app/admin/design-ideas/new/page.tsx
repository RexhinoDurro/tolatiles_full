'use client';

import BlogEditor from '@/components/admin/blog/BlogEditor';
import AdminLayout from '@/components/admin/AdminLayout';

export default function NewDesignIdeaPage() {
  return (
    <AdminLayout hideDefaultPadding>
      <BlogEditor isNew contentType="design_idea" />
    </AdminLayout>
  );
}
