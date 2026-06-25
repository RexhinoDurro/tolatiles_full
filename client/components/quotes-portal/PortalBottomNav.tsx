'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, FileText } from 'lucide-react';

export default function PortalBottomNav() {
  const pathname = usePathname();
  const isSchedule = pathname.includes('/schedule');

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/70 backdrop-blur-md border border-white/40 shadow-lg rounded-full p-2 flex items-center gap-2 relative overflow-hidden">
        {/* Animated Background Circle */}
        <div
          className="absolute left-2 top-2 w-12 h-12 bg-blue-600 rounded-full transition-transform duration-300 ease-out shadow-sm"
          style={{
            transform: `translateX(${isSchedule ? '0px' : '56px'})`,
          }}
        />

        {/* Schedule Button */}
        <Link
          href="/quotes-portal/schedule"
          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 ${
            isSchedule ? 'text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CalendarDays size={22} />
        </Link>

        {/* Quotes Button */}
        <Link
          href="/quotes-portal/quotes"
          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 ${
            !isSchedule ? 'text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText size={22} />
        </Link>
      </div>
    </div>
  );
}
