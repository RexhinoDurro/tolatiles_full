// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import logolong from '../assets/images/logoLong.png';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGalleryDropdownOpen, setIsGalleryDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsGalleryDropdownOpen(false);
  }, [location]);

  const navigationItems = [
    { id: '/', label: 'Home', href: '/' },
    { id: '/services', label: 'Services', href: '/services' },
    { id: '/gallery', label: 'Gallery', href: '/gallery', hasDropdown: true },
    { id: '/about', label: 'About', href: '/about' },
    { id: '/faqs', label: 'FAQs', href: '/faqs' },
    { id: '/contact', label: 'Contact Us', href: '/contact' }
  ];

  const galleryCategories = [
    { id: 'all', label: 'All Projects', href: '/gallery' },
    { id: 'backsplashes', label: 'Backsplashes', href: '/gallery/backsplashes' },
    { id: 'patios', label: 'Patios', href: '/gallery/patios' },
    { id: 'showers', label: 'Showers', href: '/gallery/showers' },
    { id: 'flooring', label: 'Flooring', href: '/gallery/flooring' },
    { id: 'fireplaces', label: 'Fireplaces', href: '/gallery/fireplaces' }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-gray-200/50' 
        : 'bg-gradient-to-b from-black/30 via-black/20 to-transparent backdrop-blur-sm shadow-lg border-white/10'
    } border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            aria-label="Tola Tiles - Go to homepage"
          >
            <img 
              src={logolong} 
              alt="Tola Tiles Logo" 
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              width="160"
              height="32"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <div key={item.id} className="relative group">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsGalleryDropdownOpen(!isGalleryDropdownOpen)}
                      className={`flex items-center font-medium transition-all duration-300 transform hover:scale-105 px-3 py-2 rounded-lg ${
                        isScrolled 
                          ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                          : 'text-white hover:text-blue-300 hover:bg-white/10 drop-shadow-md'
                      } ${isActiveRoute(item.href) ? (isScrolled ? 'text-blue-600 bg-blue-50' : 'text-blue-300 bg-white/10') : ''}`}
                      aria-expanded={isGalleryDropdownOpen}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                        isGalleryDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {isGalleryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 opacity-0 animate-fadeIn">
                        {galleryCategories.map((category) => (
                          <Link
                            key={category.id}
                            to={category.href}
                            className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            onClick={() => setIsGalleryDropdownOpen(false)}
                          >
                            {category.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`font-medium transition-all duration-300 transform hover:scale-105 relative px-3 py-2 rounded-lg ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                        : 'text-white hover:text-blue-300 hover:bg-white/10 drop-shadow-md'
                    } ${isActiveRoute(item.href) ? (isScrolled ? 'text-blue-600 bg-blue-50' : 'text-blue-300 bg-white/10') : ''}`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 transition-all duration-300 ${
                      isActiveRoute(item.href) ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                    }`}></span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden transition-all duration-300 p-2 rounded-lg relative z-50 ${
              isScrolled 
                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                : 'text-white hover:text-blue-300 hover:bg-white/10 drop-shadow-md'
            }`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <div className="relative w-6 h-6">
              <span className={`absolute top-1 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 top-3' : ''
              }`}></span>
              <span className={`absolute top-3 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`absolute top-5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 top-3' : ''
              }`}></span>
            </div>
          </button>
        </div>
      </div>


    </header>

    {/* Mobile Menu - Compact dropdown below navbar */}
    {isMobileMenuOpen && (
      <div className="md:hidden fixed top-20 right-4 z-40 w-[40%] max-w-xs">
        {/* Menu Content */}
        <div className="bg-white/70 backdrop-blur-md shadow-xl border border-gray-200/30 rounded-xl max-h-[50vh] overflow-y-auto">
          <nav className="px-4 py-3 space-y-1" role="navigation" aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <div key={item.id}>
                {item.hasDropdown ? (
                  <div className="space-y-1">
                    <div className="text-gray-700 font-medium py-1.5 px-2 text-xs border-b border-gray-200/40">
                      {item.label}
                    </div>
                    <div className="ml-2 space-y-0.5">
                      {galleryCategories.map((category) => (
                        <Link
                          key={category.id}
                          to={category.href}
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
                    to={item.href}
                    className={`block w-full text-left py-2 px-2 font-medium transition-all duration-200 rounded-md text-xs ${
                      isActiveRoute(item.href) ? 'text-blue-600 bg-blue-50/60' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/60'
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
        
        {/* Subtle background overlay */}
        <div 
          className="fixed inset-0 bg-black/10 -z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      </div>
    )}
    </>
  );
};

export default Navbar;