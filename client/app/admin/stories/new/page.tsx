'use client';

import BlogEditor from '@/components/admin/blog/BlogEditor';
import AdminLayout from '@/components/admin/AdminLayout';

export default function NewStoryPage() {
  return (
    <AdminLayout hideDefaultPadding>
      <BlogEditor isNew contentType="story" />
    </AdminLayout>
  );
}
