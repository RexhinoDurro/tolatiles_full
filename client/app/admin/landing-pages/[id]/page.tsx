'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { LandingPage } from '@/types/api';
import LandingPageEditor from '@/components/admin/landing-pages/LandingPageEditor';
import AdminLayout from '@/components/admin/AdminLayout';

export default function EditLandingPagePage() {
  const params = useParams();
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLandingPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadLandingPage = async () => {
    try {
      setLoading(true);
      setLandingPage(await api.getLandingPage(Number(params.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load landing page');
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

  if (error || !landingPage) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-red-600 mb-4">{error || 'Landing page not found'}</p>
          <a href="/admin/landing-pages" className="text-blue-600 hover:underline">
            ← Back to landing pages
          </a>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout hideDefaultPadding>
      <LandingPageEditor landingPage={landingPage} />
    </AdminLayout>
  );
}
