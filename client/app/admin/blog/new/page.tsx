'use client';

import BlogEditor from '@/components/admin/blog/BlogEditor';
import AdminLayout from '@/components/admin/AdminLayout';

export default function NewBlogPostPage() {
  return (
    <AdminLayout hideDefaultPadding>
      <BlogEditor isNew />
    </AdminLayout>
  );
}
