'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ProtectedRoute from './ProtectedRoute';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden bg-gray-100 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Fixed */}
        <aside
          className={`fixed lg:fixed inset-y-0 left-0 z-50 h-screen transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <AdminSidebar />
        </aside>

        {/* Main content area - offset by sidebar width */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 h-screen">
          {/* Header - Fixed at top */}
          <div className="flex-shrink-0">
            <AdminHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
          </div>

          {/* Scrollable content area */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
