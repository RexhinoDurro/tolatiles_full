'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Image as ImageIcon, Users, FileText, Receipt, UserCircle, BarChart3, Settings, PenSquare } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ProtectedRoute from './ProtectedRoute';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  hideDefaultPadding?: boolean;
}

const bottomNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
  { name: 'Leads', href: '/admin/leads', icon: Users },
  { name: 'Blog', href: '/admin/blog', icon: PenSquare },
  { name: 'Quotes', href: '/admin/quotes', icon: FileText },
  { name: 'Invoices', href: '/admin/invoices', icon: Receipt },
  { name: 'Customers', href: '/admin/customers', icon: UserCircle },
  { name: 'Stats', href: '/admin/stats', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children, title, hideDefaultPadding }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="h-screen h-[100dvh] overflow-hidden bg-gray-100 flex">
        {/* Sidebar - Only visible on desktop (lg+) */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 h-screen">
          <AdminSidebar />
        </aside>

        {/* Main content area - offset by sidebar width on desktop */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 h-screen h-[100dvh]">
          {/* Header - Fixed at top with safe area for notch */}
          <div className="flex-shrink-0 pt-[env(safe-area-inset-top)]">
            <AdminHeader title={title} />
          </div>

          {/* Scrollable content area */}
          <main className={`flex-1 overflow-y-auto pb-20 lg:pb-6 overscroll-contain ${hideDefaultPadding ? '' : 'p-4 sm:p-6'}`}>
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="admin-bottom-nav lg:hidden">
          {bottomNavItems.map((item) => {
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
