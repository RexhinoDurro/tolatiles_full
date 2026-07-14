'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Image as ImageIcon, FolderKanban, Phone, Plus, X, ChevronRight } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('florida');

  // Same logic as Navbar to determine location
  useEffect(() => {
    if (pathname?.startsWith('/jacksonville')) {
      setCurrentLocation('jacksonville');
    } else if (pathname?.startsWith('/st-augustine')) {
      setCurrentLocation('st-augustine');
    } else {
      setCurrentLocation('florida');
    }
  }, [pathname]);

  const navPrefix = currentLocation === 'florida' ? '' : `/${currentLocation}`;
  const homeLink = currentLocation === 'florida' ? '/' : `/${currentLocation}`;

  // Primary tabs for the bottom nav
  const primaryTabs = [
    { id: 'home', label: 'Home', href: homeLink, Icon: Home },
    { id: 'gallery', label: 'Gallery', href: `${navPrefix}/gallery`, Icon: ImageIcon },
    { id: 'projects', label: 'Projects', href: '/projects', Icon: FolderKanban },
    { id: 'contact', label: 'Contact Us', href: `${navPrefix}/contact`, Icon: Phone },
  ];

  // Secondary links for the "More" modal
  const secondaryLinks = [
    { id: 'blog', label: 'Blog', href: '/blog' },
    { id: 'guides', label: 'Guides', href: '/guides' },
    { id: 'design-ideas', label: 'Design Ideas', href: '/design-ideas' },
    { id: 'about', label: 'About Us', href: `${navPrefix}/about` },
    { id: 'stories', label: 'Stories', href: '/stories' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === homeLink) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isMoreModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMoreModalOpen]);

  return (
    <>
      {/* Spacer so content doesn't hide behind the bottom nav */}
      <div className="md:hidden h-[90px] safe-area-bottom w-full" aria-hidden="true" />

      {/* The Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-brand-light border-t-2 border-[#00a8e8] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-[90px] px-2 pb-2">
          {primaryTabs.map((tab) => {
            const isActive = isActiveRoute(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-[#003d5c]' : 'text-white/90 hover:text-white'
                }`}
                onClick={() => setIsMoreModalOpen(false)}
              >
                <tab.Icon className={`w-7 h-7 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className={`text-xs font-semibold ${isActive ? 'font-bold' : ''}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreModalOpen(!isMoreModalOpen)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isMoreModalOpen ? 'text-[#003d5c]' : 'text-white/90 hover:text-white'
            }`}
          >
            <Plus className={`w-7 h-7 ${isMoreModalOpen ? 'stroke-[2.5px] rotate-45' : 'stroke-2'} transition-transform duration-300`} />
            <span className={`text-xs font-semibold ${isMoreModalOpen ? 'font-bold' : ''}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* The "More" Modal (Bottom Sheet) */}
      {isMoreModalOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMoreModalOpen(false)}
            aria-hidden="true"
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl animate-slideInUp pb-[env(safe-area-inset-bottom,20px)] w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">More Options</h2>
              <button
                onClick={() => setIsMoreModalOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 mb-16 space-y-6">
              {/* Location Selector */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Location</h3>
                <div className="bg-gray-50 rounded-xl p-1 border border-gray-100 flex flex-col">
                  <Link
                    href="/"
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${currentLocation === 'florida' ? 'bg-white text-[#00a8e8] shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setIsMoreModalOpen(false)}
                  >
                    Florida (All Areas)
                  </Link>
                  <Link
                    href="/jacksonville"
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${currentLocation === 'jacksonville' ? 'bg-white text-[#00a8e8] shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setIsMoreModalOpen(false)}
                  >
                    Jacksonville
                  </Link>
                  <Link
                    href="/st-augustine"
                    className={`px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${currentLocation === 'st-augustine' ? 'bg-white text-[#00a8e8] shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setIsMoreModalOpen(false)}
                  >
                    St. Augustine
                  </Link>
                </div>
              </div>

              {/* Secondary Links */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Menu</h3>
                <div className="space-y-2">
                  {secondaryLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={() => setIsMoreModalOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-xl font-bold text-sm tracking-wide transition-colors ${
                        isActiveRoute(link.href)
                          ? 'bg-blue-50 text-[#00a8e8]'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100 shadow-sm'
                      }`}
                    >
                      {link.label}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
