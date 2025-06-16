import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import logolong from '../assets/images/logoLong.png'
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
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-gray-200/50' 
        : 'bg-gradient-to-b from-black/30 via-black/20 to-transparent backdrop-blur-sm shadow-lg border-white/10'
    } border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentPage('home')}
          >
            <img src={logolong}></img>
            
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
                      } ${currentPage === item.id ? (isScrolled ? 'text-blue-600 bg-blue-50' : 'text-blue-300 bg-white/10') : ''}`}
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
                    className={`font-medium transition-all duration-300 transform hover:scale-105 relative px-3 py-2 rounded-lg ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                        : 'text-white hover:text-blue-300 hover:bg-white/10 drop-shadow-md'
                    } ${currentPage === item.id ? (isScrolled ? 'text-blue-600 bg-blue-50' : 'text-blue-300 bg-white/10') : ''}`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 transition-all duration-300 ${
                      currentPage === item.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                    }`}></span>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden transition-all duration-300 p-2 rounded-lg ${
              isScrolled 
                ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                : 'text-white hover:text-blue-300 hover:bg-white/10 drop-shadow-md'
            }`}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-md z-40 overflow-y-auto shadow-xl">
          <nav className="px-4 py-6 space-y-4">
            {navigationItems.map((item) => (
              <div key={item.id}>
                {item.hasDropdown ? (
                  <div>
                    <div className="text-gray-700 font-medium py-3 border-b border-gray-200/50">
                      {item.label}
                    </div>
                    <div className="ml-4 mt-2 space-y-2">
                      {galleryCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleGalleryNavigation(category.id)}
                          className="block w-full text-left py-2 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg"
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
                    className={`block w-full text-left py-3 px-3 font-medium transition-all duration-200 rounded-lg ${
                      currentPage === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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