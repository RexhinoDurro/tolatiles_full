'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, Mail, Clock, Phone } from 'lucide-react';

type LocationType = 'florida' | 'jacksonville' | 'st-augustine';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      { id: 'all', label: 'All Services', href: `${prefix}/services` },
      { id: 'kitchen-backsplash', label: 'Kitchen Backsplash', href: `${prefix}/services/kitchen-backsplash` },
      { id: 'bathroom', label: 'Bathroom Tile', href: `${prefix}/services/bathroom-tile` },
      { id: 'flooring', label: 'Floor Tiling', href: `${prefix}/services/floor-tile` },
      { id: 'patio', label: 'Patio & Outdoor', href: `${prefix}/services/patio-tile` },
      { id: 'fireplace', label: 'Fireplace Tile', href: `${prefix}/services/fireplace-tile` },
      { id: 'shower', label: 'Shower Installation', href: `${prefix}/services/shower-tile` },
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
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
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
    { id: 'about', label: 'About', href: `${navPrefix}/about` },
    { id: 'blog', label: 'Blog', href: `${navPrefix}/blog` },
    { id: 'contact', label: 'Contact Us', href: `${navPrefix}/contact` },
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
        {/* TOP UTILITY BAR (Desktop) */}
        <div className="hidden md:block bg-white border-b border-gray-200/60 text-gray-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center text-xs lg:text-sm font-medium">
            {/* Spacer for the hanging logo */}
            <div className="hidden md:block w-32 lg:w-64 xl:w-96 flex-shrink-0" />

            {/* Contact & Hours Info */}
            <div className="flex items-center space-x-6">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#00a8e8]" />
                <span>Mon-Fri: 8:00 AM - 6:00 PM</span>
              </span>
              <a href="mailto:menitola@tolatiles.com" className="flex items-center gap-1.5 hover:text-[#00a8e8] transition-colors">
                <Mail className="w-4 h-4 text-[#00a8e8]" />
                <span>menitola@tolatiles.com</span>
              </a>
            </div>

            {/* Phone & Location Selection */}
            <div className="flex items-center space-x-4">
              <a href="tel:+1-904-866-1738" className="flex items-center gap-1.5 font-bold text-gray-800 hover:text-[#00a8e8] transition-colors">
                <Phone className="w-4 h-4 text-[#00a8e8]" />
                <span>(904) 866-1738</span>
              </a>

              {/* Location Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="bg-[#00a8e8] text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#0097d2] transition-all duration-200 flex items-center gap-1"
                  aria-expanded={isLocationDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>
                    {currentLocation === 'st-augustine' ? 'St. Augustine' : currentLocation === 'jacksonville' ? 'Jacksonville' : 'Florida'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                    <Link
                      href="/"
                      className={`block w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-[#00a8e8] ${currentLocation === 'florida' ? 'text-[#00a8e8] bg-gray-50' : ''}`}
                      onClick={() => setIsLocationDropdownOpen(false)}
                    >
                      Florida (All Areas)
                    </Link>
                    <Link
                      href="/jacksonville"
                      className={`block w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-[#00a8e8] ${currentLocation === 'jacksonville' ? 'text-[#00a8e8] bg-gray-50' : ''}`}
                      onClick={() => setIsLocationDropdownOpen(false)}
                    >
                      Jacksonville
                    </Link>
                    <Link
                      href="/st-augustine"
                      className={`block w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-[#00a8e8] ${currentLocation === 'st-augustine' ? 'text-[#00a8e8] bg-gray-50' : ''}`}
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

        {/* MOBILE TOP UTILITY BAR (Mobile/Tablet) */}
        <div className={`md:hidden bg-white border-b border-gray-200/60 text-gray-600 text-[10px] sm:text-xs transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0 border-transparent' : 'max-h-32 opacity-100'
          }`}>
          {/* Row 1: Phone & Location Selection */}
          <div className="px-4 py-2 flex justify-between items-center border-b border-gray-100/50">
            <a href="tel:+1-904-866-1738" className="flex items-center gap-1 font-bold text-gray-800">
              <Phone className="w-3.5 h-3.5 text-[#00a8e8]" />
              <span>(904) 866-1738</span>
            </a>

            <div className="relative">
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="bg-[#00a8e8] text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <span>
                  {currentLocation === 'st-augustine' ? 'St. Augustine' : currentLocation === 'jacksonville' ? 'Jacksonville' : 'Florida'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded shadow-lg border border-gray-200 z-50 py-1">
                  <Link
                    href="/"
                    className="block w-full text-left px-3 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsLocationDropdownOpen(false)}
                  >
                    Florida (All Areas)
                  </Link>
                  <Link
                    href="/jacksonville"
                    className="block w-full text-left px-3 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsLocationDropdownOpen(false)}
                  >
                    Jacksonville
                  </Link>
                  <Link
                    href="/st-augustine"
                    className="block w-full text-left px-3 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsLocationDropdownOpen(false)}
                  >
                    St. Augustine
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Hours & Email Info */}
          <div className="px-4 py-1.5 flex flex-wrap justify-between gap-x-2 gap-y-0.5 text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#00a8e8]" />
              <span>Mon-Fri: 8:00 AM - 6:00 PM</span>
            </span>
            <a href="mailto:menitola@tolatiles.com" className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#00a8e8]" />
              <span>menitola@tolatiles.com</span>
            </a>
          </div>
        </div>

        {/* MAIN HEADER BAR (Solid Blue) */}
        <div className="bg-[#00a8e8] relative h-16 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">

            {/* OVERLAPPING LOGO CONTAINER (Desktop) - Overlays both white and cyan lines */}
            <div className="hidden md:block absolute -top-20 left-4 lg:left-12 xl:left-32 z-50">
              <Link href={homeLink} className="block group" aria-label="Tola Tiles - Go to homepage">
                <Image
                  src="/images/whitelogo.svg"
                  alt="Tola Tiles Logo"
                  width={140}
                  height={53}
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
                  src="/images/whitelogo.svg"
                  alt="Tola Tiles Logo"
                  width={180}
                  height={36}
                  className="h-9 w-auto"
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

              {/* Hamburger Button on Left */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="pointer-events-auto p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <span
                    className={`absolute top-1 left-0 w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-3' : ''}`}
                  ></span>
                  <span
                    className={`absolute top-3 left-0 w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
                  ></span>
                  <span
                    className={`absolute top-5 left-0 w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-3' : ''}`}
                  ></span>
                </div>
              </button>

              {/* Phone Icon on Right */}
              <a
                href="tel:+1-904-866-1738"
                className="pointer-events-auto p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label="Call Us"
              >
                <Phone className="w-6 h-6" />
              </a>
            </div>

          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-32 right-4 z-40 w-[50%] max-w-xs">
          <div className="bg-white/95 backdrop-blur-md shadow-xl border border-gray-200/30 rounded-xl max-h-[60vh] overflow-y-auto">
            <nav className="px-4 py-3 space-y-1" role="navigation" aria-label="Mobile navigation">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  {item.hasDropdown ? (
                    <div className="space-y-1">
                      <div className="text-gray-800 font-bold uppercase py-1.5 px-2 text-xs border-b border-gray-200/40">{item.label}</div>
                      <div className="ml-2 space-y-0.5">
                        {serviceCategories.map((category) => (
                          <Link
                            key={category.id}
                            href={category.href}
                            className="block w-full text-left py-1.5 px-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-200 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {category.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block w-full text-left py-2 px-2 font-bold uppercase transition-all duration-200 rounded-md text-xs ${isActiveRoute(item.href) ? 'text-[#00a8e8] bg-blue-50/60' : 'text-gray-700 hover:text-[#00a8e8] hover:bg-blue-50/60'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
          <div className="fixed inset-0 bg-black/10 -z-10" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}
    </>
  );
};

export default Navbar;
