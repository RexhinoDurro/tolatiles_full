import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h3 className="text-2xl font-bold">Tola Tiles</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Premium tile installation services for residential and commercial properties. 
              Creating beautiful, lasting spaces since 2008.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">in</span>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                <span className="text-sm font-bold">ig</span>
              </div>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Tile Installation</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Kitchen Backsplashes</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Bathroom Remodeling</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Floor Tiling</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Outdoor Patios</a></li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <button 
                  onClick={() => setCurrentPage('about')} 
                  className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('gallery')} 
                  className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('faqs')} 
                  className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('contact')} 
                  className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                >
                  Contact
                </button>
              </li>
              <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">Privacy Policy</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center group">
                <Phone className="h-4 w-4 mr-3 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center group">
                <Mail className="h-4 w-4 mr-3 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span>info@tolatiles.com</span>
              </div>
              <div className="flex items-start group">
                <MapPin className="h-4 w-4 mr-3 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0" />
                <span>123 Tile Street<br />City, State 12345</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Tola Tiles. All rights reserved. | Designed with excellence in mind.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer