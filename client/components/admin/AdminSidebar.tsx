'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, Users, LogOut, ExternalLink, FileText, Receipt, UserCircle, Settings, X, BarChart3, PenSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  onClose?: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Gallery',
    href: '/admin/gallery',
    icon: ImageIcon,
  },
  {
    name: 'Leads',
    href: '/admin/leads',
    icon: Users,
  },
  {
    name: 'Quotes',
    href: '/admin/quotes',
    icon: FileText,
  },
  {
    name: 'Invoices',
    href: '/admin/invoices',
    icon: Receipt,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: UserCircle,
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: PenSquare,
  },
  {
    name: 'Stats',
    href: '/admin/stats',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.webp"
            alt="Tola Tiles"
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <h1 className="font-bold text-lg">Tola Tiles</h1>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 min-h-[48px] ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="font-medium">View Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all duration-200 mt-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
