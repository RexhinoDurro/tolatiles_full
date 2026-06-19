'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, LayoutGrid, PlusSquare, Home, Bookmark, X } from 'lucide-react';

interface ProjectsSidebarProps {
  onClose?: () => void;
}

const navItems = [
  { name: 'All Projects', href: '/admin/projects/all', icon: LayoutGrid },
  { name: 'Add New', href: '/admin/projects/new', icon: PlusSquare },
  { name: 'Homepage Layout', href: '/admin/projects/homepage', icon: Home },
  { name: 'Service Pins', href: '/admin/projects/services', icon: Bookmark },
];

export default function ProjectsSidebar({ onClose }: ProjectsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        <div>
          <h1 className="font-bold text-lg text-white">Projects</h1>
          <p className="text-xs text-gray-400">Visual Portfolio</p>
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

      {/* Back to Dashboard */}
      <div className="px-4 pt-4">
        <Link
          href="/admin/dashboard"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          Modules
        </p>
        <ul className="space-y-1">
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
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
