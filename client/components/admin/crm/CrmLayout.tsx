'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Briefcase,
  Kanban,
  Calendar,
} from 'lucide-react';
import CrmSidebar from './CrmSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ProtectedRoute from '@/components/admin/ProtectedRoute';

interface CrmLayoutProps {
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  backLabel?: string;
}

const mobileNavItems = [
  { name: 'Overview', href: '/admin/crm', icon: LayoutDashboard, exact: true },
  { name: 'Leads', href: '/admin/crm/leads', icon: Users },
  { name: 'Customers', href: '/admin/crm/customers', icon: UserCircle },
  { name: 'Deals', href: '/admin/crm/deals', icon: Briefcase },
  { name: 'Pipeline', href: '/admin/crm/pipeline', icon: Kanban },
  { name: 'Calendar', href: '/admin/crm/calendar', icon: Calendar },
];

export default function CrmLayout({ children, title, backHref = '/admin/dashboard', backLabel = 'Dashboard' }: CrmLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="h-screen h-[100dvh] overflow-hidden bg-gray-100 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 h-screen">
          <CrmSidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <CrmSidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 h-screen h-[100dvh]">
          <div className="flex-shrink-0 pt-[env(safe-area-inset-top)]">
            <AdminHeader title={title} backHref={backHref} backLabel={backLabel} />
          </div>

          <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 overscroll-contain p-4 sm:p-6">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="admin-bottom-nav lg:hidden">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
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
