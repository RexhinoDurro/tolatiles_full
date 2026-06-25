'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import PortalBottomNav from './PortalBottomNav';

export default function PortalProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = usePortalAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/quotes-portal/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {children}
      <PortalBottomNav />
    </>
  );
}
