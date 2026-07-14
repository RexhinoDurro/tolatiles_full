'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { BlogPost } from '@/types/api';
import BlogEditor from '@/components/admin/blog/BlogEditor';
import AdminLayout from '@/components/admin/AdminLayout';

export default function EditStoryPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [params.id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      // The ID in the URL is actually the post ID, but we need the slug for the API
      const posts = await api.getBlogPosts({ content_type: 'story' });
      const postData = posts.find((p) => p.id === Number(params.id));

      if (!postData) {
        setError('Post not found');
        return;
      }

      const fullPost = await api.getBlogPost(postData.slug);
      setPost(fullPost);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !post) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
          <a href="/admin/stories" className="text-blue-600 hover:underline">
            ← Back to stories list
          </a>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout hideDefaultPadding>
      <BlogEditor post={post} contentType="story" />
    </AdminLayout>
  );
}
