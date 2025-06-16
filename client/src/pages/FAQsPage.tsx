import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Search, 
  HelpCircle, 
  Hammer, 
  DollarSign, 
  Palette, 
  Shield,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { faqs, faqCategories } from '../data/faqs';
import type { FAQ } from '../data/faqs';

const iconMap = {
  HelpCircle,
  Hammer,
  DollarSign,
  Palette,
  Shield
};

const FAQsPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter FAQs based on category and search term
  const filteredFAQs = useMemo(() => {
    let filtered = faqs;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(search) ||
        faq.answer.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [selectedCategory, searchTerm]);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fadeIn">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-slideInUp">
            Find answers to common questions about our tile installation services, 
            processes, and expertise. Can't find what you're looking for? We're here to help!
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto animate-slideInUp">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slideInUp">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              All Questions
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedCategory === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {faqs.length}
              </span>
            </button>
            
            {faqCategories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap];
              const count = faqs.filter(faq => faq.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedCategory === category.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Count */}
          {(selectedCategory !== 'all' || searchTerm) && (
            <div className="text-center mb-8">
              <p className="text-gray-600">
                Showing {filteredFAQs.length} of {faqs.length} questions
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
          )}
          
          {/* FAQ Items */}
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4 mb-16">
              {filteredFAQs.map((faq, index) => (
                <div 
                  key={`${faq.category}-${index}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-slideInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="font-semibold text-gray-900 text-lg pr-4 leading-relaxed">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`h-6 w-6 text-blue-600 transition-transform duration-300 flex-shrink-0 ${
                        openFAQ === index ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${
                    openFAQ === index 
                      ? 'max-h-96 opacity-100' 
                      : 'max-h-0 opacity-0'
                  } overflow-hidden`}>
                    <div className="px-8 pb-6 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `No FAQs match "${searchTerm}". Try different keywords or browse by category.`
                  : 'No questions in this category yet.'
                }
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View all questions
              </button>
            </div>
          )}

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              Our experienced team is ready to answer any questions about your tile installation project. 
              Get personalized advice and detailed information about our services.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <Phone className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <h4 className="font-semibold mb-2">Call Us</h4>
                <p className="text-blue-100 text-sm mb-3">Speak directly with our experts</p>
                <button className="text-white hover:text-blue-200 font-medium">
                  (555) 123-4567
                </button>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <Mail className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <h4 className="font-semibold mb-2">Email Us</h4>
                <p className="text-blue-100 text-sm mb-3">Get detailed answers via email</p>
                <button className="text-white hover:text-blue-200 font-medium">
                  info@tolatiles.com
                </button>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <MessageCircle className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <h4 className="font-semibold mb-2">Free Consultation</h4>
                <p className="text-blue-100 text-sm mb-3">Schedule an in-home visit</p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;