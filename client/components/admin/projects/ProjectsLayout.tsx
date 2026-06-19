'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid, PlusSquare, Home, Bookmark } from 'lucide-react';
import ProjectsSidebar from './ProjectsSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ProtectedRoute from '@/components/admin/ProtectedRoute';

interface ProjectsLayoutProps {
  children: React.ReactNode;
  title?: string;
  hideDefaultPadding?: boolean;
}

const mobileNavItems = [
  { name: 'All', href: '/admin/projects/all', icon: LayoutGrid },
  { name: 'Add New', href: '/admin/projects/new', icon: PlusSquare },
  { name: 'Homepage', href: '/admin/projects/homepage', icon: Home },
  { name: 'Services', href: '/admin/projects/services', icon: Bookmark },
];

export default function ProjectsLayout({ children, title, hideDefaultPadding }: ProjectsLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="h-screen h-[100dvh] overflow-hidden bg-gray-100 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 h-screen">
          <ProjectsSidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <ProjectsSidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 h-screen h-[100dvh]">
          <div className="flex-shrink-0 pt-[env(safe-area-inset-top)]">
            <AdminHeader title={title} backHref="/admin/dashboard" backLabel="Dashboard" />
          </div>

          <main className={`flex-1 overflow-y-auto pb-20 lg:pb-6 overscroll-contain ${hideDefaultPadding ? '' : 'p-4 sm:p-6'}`}>
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="admin-bottom-nav lg:hidden">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`admin-bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ProtectedRoute>
  );
}
