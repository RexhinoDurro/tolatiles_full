import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (category: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, setSelectedCategory }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGalleryDropdownOpen, setIsGalleryDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'gallery', label: 'Gallery', hasDropdown: true },
    { id: 'about', label: 'About' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const galleryCategories = [
    { id: 'all', label: 'All Projects' },
    { id: 'backsplashes', label: 'Backsplashes' },
    { id: 'patios', label: 'Patios' },
    { id: 'showers', label: 'Showers' },
    { id: 'flooring', label: 'Flooring' },
    { id: 'fireplaces', label: 'Fireplaces' }
  ];

  const handleGalleryNavigation = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage('gallery');
    setIsGalleryDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    } border-b ${isScrolled ? 'border-gray-200' : 'border-white/20'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h1 className={`text-2xl font-bold transition-all duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            } group-hover:text-blue-600`}>
              Tola Tiles
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div key={item.id} className="relative group">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsGalleryDropdownOpen(!isGalleryDropdownOpen)}
                      className={`flex items-center font-medium transition-all duration-300 transform hover:scale-105 ${
                        isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'
                      } ${currentPage === item.id ? (isScrolled ? 'text-blue-600' : 'text-blue-300') : ''}`}
                    >
                      {item.label}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                        isGalleryDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {isGalleryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 opacity-0 animate-fadeIn">
                        {galleryCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleGalleryNavigation(category.id)}
                            className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`font-medium transition-all duration-300 transform hover:scale-105 relative ${
                      isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'
                    } ${currentPage === item.id ? (isScrolled ? 'text-blue-600' : 'text-blue-300') : ''}`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                      currentPage === item.id ? 'w-full' : 'group-hover:w-full'
                    }`}></span>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden transition-colors duration-300 ${
              isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'
            }`}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-md z-40 overflow-y-auto">
          <nav className="px-4 py-6 space-y-4">
            {navigationItems.map((item) => (
              <div key={item.id}>
                {item.hasDropdown ? (
                  <div>
                    <div className="text-gray-700 font-medium py-3 border-b border-gray-200">
                      {item.label}
                    </div>
                    <div className="ml-4 mt-2 space-y-2">
                      {galleryCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleGalleryNavigation(category.id)}
                          className="block w-full text-left py-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left py-3 font-medium transition-colors ${
                      currentPage === item.id ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;