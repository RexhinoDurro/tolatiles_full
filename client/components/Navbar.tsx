'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, Mail, Phone } from 'lucide-react';

type LocationType = 'florida' | 'jacksonville' | 'st-augustine';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  // Determine current location based on pathname (location is now the first segment)
  const currentLocation: LocationType = useMemo(() => {
    const firstSegment = pathname.split('/')[1];
    if (firstSegment === 'st-augustine') return 'st-augustine';
    if (firstSegment === 'jacksonville') return 'jacksonville';
    return 'florida';
  }, [pathname]);

  const homeLink = currentLocation === 'florida' ? '/' : `/${currentLocation}`;

  const serviceCategories = useMemo(() => {
    const prefix = currentLocation === 'florida' ? '' : `/${currentLocation}`;
    return [
      { id: 'kitchen-backsplash', label: 'Kitchen Backsplash', href: `${prefix}/services/kitchen-backsplash-installation` },
      { id: 'bathroom', label: 'Bathroom Tile', href: `${prefix}/services/bathroom-tile-installation` },
      { id: 'flooring', label: 'Floor Tiling', href: `${prefix}/services/floor-tile-installation` },
      { id: 'patio', label: 'Patio & Outdoor', href: `${prefix}/services/patio-tile-installation` },
      { id: 'fireplace', label: 'Fireplace Tile', href: `${prefix}/services/fireplace-tile-installation` },
      { id: 'shower', label: 'Shower Installation', href: `${prefix}/services/shower-tile-installation` },
    ];
  }, [currentLocation]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileServicesOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileServicesOpen]);

  useEffect(() => {
    setIsMobileServicesOpen(false);
    setIsServicesDropdownOpen(false);
    setIsLocationDropdownOpen(false);
  }, [pathname]);

  // Publish the navbar's real rendered height as a CSS variable so pages can
  // reserve exactly enough top space, instead of guessing a static pixel value.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty('--navbar-height', `${header.offsetHeight}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const navPrefix = currentLocation === 'florida' ? '' : `/${currentLocation}`;

  const navigationItems = [
    { id: 'home', label: 'Home', href: homeLink },
    { id: 'services', label: 'Services', href: `${navPrefix}/services`, hasDropdown: true },
    { id: 'gallery', label: 'Gallery', href: `${navPrefix}/gallery` },
    { id: 'projects', label: 'Projects', href: '/projects' },
    { id: 'contact', label: 'Contact Us', href: `${navPrefix}/contact` },
  ];

  // Secondary link row — content engine sections + About, lives in the white
  // utility bar (desktop bottom row / mobile 3rd row + hamburger drawer).
  // Blog/Guides/Design Ideas/Stories are flat root-level routes; About stays
  // location-prefixed since it's a per-city page.
  const secondaryLinkItems = [
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
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg border-b border-gray-200/50' : ''
          }`}
      >
        {/* TOP UTILITY BAR (Desktop) — fixed 80px total, split into 2 rows */}
        <div className="hidden md:flex flex-col border-b border-gray-200/60 text-gray-600 h-20 w-full bg-white">
          {/* Row 1 (Grey Bar): contact info + phone + location dropdown */}
          <div className="h-7 w-full bg-gray-100 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[10px] lg:text-[11px] font-medium">
              {/* Spacer for the hanging logo */}
              <div className="w-32 lg:w-64 xl:w-96 flex-shrink-0" />

              {/* Contact Info */}
              <div className="flex items-center space-x-4 lg:space-x-6">
                <a href="mailto:menitola@tolatiles.com" className="flex items-center gap-1.5 hover:text-[#00a8e8] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#00a8e8]" />
                  <span>menitola@tolatiles.com</span>
                </a>
              </div>

              {/* Phone & Location Selection */}
              <div className="flex items-center space-x-3 lg:space-x-4">
                <a href="tel:+1-904-866-1738" className="flex items-center gap-1.5 font-bold text-gray-800 hover:text-[#00a8e8] transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[#00a8e8]" />
                  <span>(904) 866-1738</span>
                </a>

                {/* Location Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                    className="bg-brand-ink text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-[#0097d2] transition-all duration-200 flex items-center gap-1"
                    aria-expanded={isLocationDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>
                      {currentLocation === 'st-augustine' ? 'St. Augustine' : currentLocation === 'jacksonville' ? 'Jacksonville' : 'Florida'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {isLocationDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1 text-xs">
                      <Link
                        href="/"
                        className={`block w-full text-left px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 hover:text-[#00a8e8] ${currentLocation === 'florida' ? 'text-brand-ink bg-gray-50' : ''}`}
                        onClick={() => setIsLocationDropdownOpen(false)}
                      >
                        Florida (All Areas)
                      </Link>
                      <Link
                        href="/jacksonville"
                        className={`block w-full text-left px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 hover:text-[#00a8e8] ${currentLocation === 'jacksonville' ? 'text-brand-ink bg-gray-50' : ''}`}
                        onClick={() => setIsLocationDropdownOpen(false)}
                      >
                        Jacksonville
                      </Link>
                      <Link
                        href="/st-augustine"
                        className={`block w-full text-left px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 hover:text-[#00a8e8] ${currentLocation === 'st-augustine' ? 'text-brand-ink bg-gray-50' : ''}`}
                        onClick={() => setIsLocationDropdownOpen(false)}
                      >
                        St. Augustine
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 (White Bar): secondary content links */}
          <div className="w-full flex-1 bg-white flex items-end border-t border-gray-100 pb-1.5">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-end gap-4 lg:gap-6">
              {secondaryLinkItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`text-[10px] lg:text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    isActiveRoute(item.href) ? 'text-brand-ink' : 'text-gray-800 hover:text-[#00a8e8]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>



        {/* MAIN HEADER BAR (Solid Blue) */}
        <div className="bg-brand-ink relative h-16 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">

            {/* OVERLAPPING LOGO CONTAINER (Desktop) - Overlays both white and cyan lines */}
            <div className="hidden md:block absolute -top-20 left-4 lg:left-12 xl:left-32 z-50">
              <Link href={homeLink} className="block group" aria-label="Tola Tiles - Go to homepage">
                <Image
                  src="/images/tolatiles-logo.png"
                  alt="Tola Tiles Logo"
                  width={700}
                  height={191}
                  className="w-[12vw] max-w-[140px] h-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                  style={{ height: 'auto' }}
                  priority
                />
              </Link>
            </div>

            {/* MOBILE LOGO (Centered inside blue bar) */}
            <div className="md:hidden flex-1 flex justify-center">
              <Link href={homeLink} aria-label="Tola Tiles - Go to homepage">
                <Image
                  src="/images/tolatiles-logo.png"
                  alt="Tola Tiles Logo"
                  width={700}
                  height={191}
                  className="h-8 sm:h-10 w-auto transition-all"
                  priority
                />
              </Link>
            </div>

            {/* Spacer for desktop layout (pushes menu to the right and clears the logo) */}
            <div className="hidden md:block w-32 lg:w-64 xl:w-96 flex-shrink-0" />

            {/* DESKTOP NAVIGATION LINKS */}
            <nav className="hidden md:flex items-center space-x-3 lg:space-x-8 h-full" role="navigation" aria-label="Main navigation">
              {navigationItems.map((item) => (
                <div key={item.id} className="relative flex items-center h-full group">
                  {item.hasDropdown ? (
                    <div className="relative flex items-center h-full">
                      <button
                        onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                        className={`flex items-center font-bold text-white hover:text-white/80 transition-all duration-200 uppercase tracking-wider text-xs lg:text-sm`}
                        aria-expanded={isServicesDropdownOpen}
                        aria-haspopup="true"
                      >
                        {item.label}
                        <ChevronDown
                          className={`ml-1 h-4 w-4 transition-transform duration-300 ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isServicesDropdownOpen && (
                        <div className="absolute top-full left-0 mt-0.5 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 opacity-0 animate-fadeIn py-1">
                          {serviceCategories.map((category) => (
                            <Link
                              key={category.id}
                              href={category.href}
                              className="block w-full text-left px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setIsServicesDropdownOpen(false)}
                            >
                              {category.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : item.id === 'contact' ? (
                    /* CONTACT US button styled as a Red button */
                    <Link
                      href={item.href}
                      className="bg-[#e01025] text-white hover:bg-[#b00c1d] px-4 py-2 rounded-md font-bold uppercase tracking-wider text-xs lg:text-sm transition-all duration-200 shadow-md shadow-black/10 hover:shadow-lg hover:scale-105 transform"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Link
                      href={item.href}
                      className={`font-bold text-white hover:text-white/80 transition-all duration-200 uppercase tracking-wider text-xs lg:text-sm relative py-2`}
                    >
                      {item.label}
                      <span
                        className={`absolute bottom-2 left-0 right-0 h-0.5 bg-white transition-all duration-300 ${isActiveRoute(item.href) ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                          }`}
                      ></span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* MOBILE INTERACTIVE BUTTONS */}
            <div className="md:hidden flex items-center justify-between w-full absolute left-0 px-4 h-full pointer-events-none">

              {/* Services Button on Left */}
              <button
                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-white/5 hover:bg-white/20 backdrop-blur-md px-2 sm:px-3 py-1.5 rounded-full text-white font-bold uppercase text-[10px] sm:text-xs tracking-wider border border-white/20 transition-all shadow-sm"
                aria-label={isMobileServicesOpen ? 'Close services' : 'Open services'}
                aria-expanded={isMobileServicesOpen}
              >
                Services
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Phone Button on Right */}
              <a
                href="tel:+1-904-866-1738"
                className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-white/5 hover:bg-white/20 backdrop-blur-md px-2 sm:px-3 py-1.5 rounded-full text-white font-bold text-[10px] sm:text-xs tracking-wider border border-white/20 transition-all shadow-sm"
                aria-label="Call Us"
              >
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>904-866-1738</span>
              </a>
            </div>

          </div>
        </div>
      </header>

      {isMobileServicesOpen && (
        <>
          {/* Floating Dropdown Modal */}
          <div 
            className="md:hidden fixed left-4 right-4 z-40 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 animate-fadeIn overflow-y-auto max-h-[80vh]"
            style={{ top: 'calc(var(--navbar-height) + 8px)' }}
          >
            <nav className="flex flex-col p-3 space-y-1" role="navigation" aria-label="Mobile services navigation">
              {serviceCategories.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className="flex items-center justify-between w-full p-3.5 text-[15px] font-bold text-gray-800 bg-transparent rounded-xl hover:bg-blue-50 hover:text-[#00a8e8] active:bg-blue-50 transition-colors"
                  onClick={() => setIsMobileServicesOpen(false)}
                >
                  {category.label}
                  <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                </Link>
              ))}
              
              {/* Contact CTA in modal */}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <Link
                  href={`${navPrefix}/contact`}
                  onClick={() => setIsMobileServicesOpen(false)}
                  className="w-full bg-brand-ink text-white py-3 rounded-xl font-bold text-base text-center shadow-md block active:bg-[#0097d2] transition-colors"
                >
                  Get a Free Estimate
                </Link>
              </div>
            </nav>
          </div>
          
          {/* Backdrop to close the modal when clicking outside */}
          <div 
            className="md:hidden fixed inset-0 bg-black/10 z-30" 
            style={{ top: 'var(--navbar-height)' }}
            onClick={() => setIsMobileServicesOpen(false)} 
            aria-hidden="true"
          />
        </>
      )}
    </>
  );
};

export default Navbar;
