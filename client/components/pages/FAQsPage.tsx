'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronDown, Search, HelpCircle, Hammer, DollarSign, Palette, Shield,
  Phone, Mail, MessageCircle, ArrowRight,
} from 'lucide-react';
import { faqCategories } from '@/data/faqs';
import type { SiteFAQ } from '@/types/api';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  HelpCircle,
  Hammer,
  DollarSign,
  Palette,
  Shield,
};

interface FAQsLocationContent {
  heroH1: string;
  heroSubtitle: string;
  ctaDescription: string;
}

const locationContent: Record<string, FAQsLocationContent> = {
  jacksonville: {
    heroH1: 'Tile Installation FAQs — Jacksonville FL',
    heroSubtitle:
      "Answers to common questions about tile installation in Jacksonville and Duval County. From project timelines to material selection — answered by local experts.",
    ctaDescription:
      'Our Jacksonville team is ready to answer any questions about your tile installation project. Get personalized advice for your Duval County home or business.',
  },
  'st-augustine': {
    heroH1: 'Tile Installation FAQs — St Augustine FL',
    heroSubtitle:
      "Answers to common questions about tile installation in St. Augustine and St. Johns County. Whether you're renovating a historic home or building new in Nocatee, we have the expertise you need.",
    ctaDescription:
      'Our St. Augustine team is ready to answer any questions about your tile installation project. Get expert advice on materials suited to our coastal climate.',
  },
  florida: {
    heroH1: 'Tile Installation FAQs — Northeast Florida',
    heroSubtitle:
      "Answers to common questions about our tile installation services across Northeast Florida. Can't find what you're looking for? We're here to help!",
    ctaDescription:
      'Our experienced team is ready to answer any questions about your tile installation project. Get personalized advice anywhere in Northeast Florida.',
  },
};

const serviceLinks = [
  { label: 'Kitchen Backsplash FAQs', slug: 'kitchen-backsplash-installation', category: 'services' },
  { label: 'Bathroom Tile FAQs', slug: 'bathroom-tile-installation', category: 'services' },
  { label: 'Floor Tile FAQs', slug: 'floor-tile-installation', category: 'services' },
  { label: 'Shower Tile FAQs', slug: 'shower-tile-installation', category: 'services' },
  { label: 'Patio Tile FAQs', slug: 'patio-tile-installation', category: 'services' },
  { label: 'Fireplace Tile FAQs', slug: 'fireplace-tile-installation', category: 'services' },
];

interface FAQsPageProps {
  location?: string;
  initialFAQs: SiteFAQ[];
}

const FAQsPage = ({ location = 'florida', initialFAQs }: FAQsPageProps) => {
  const content = locationContent[location] || locationContent.florida;
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const locPrefix = location === 'florida' ? '' : `/${location}`;

  const filteredFAQs = useMemo(() => {
    let filtered = initialFAQs;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (faq) => faq.question.toLowerCase().includes(search) || faq.answer.toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [initialFAQs, selectedCategory, searchTerm]);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="pt-[var(--navbar-height)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav className="flex justify-center mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li><Link href={locPrefix || '/'} className="hover:text-[#00a8e8]">Home</Link></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">FAQs</li>
            </ol>
          </nav>
          <header>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fadeIn">{content.heroH1}</h1>
            <p className="text-xl text-gray-600 mb-8 animate-slideInUp">{content.heroSubtitle}</p>
          </header>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto animate-slideInUp">
            <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
            <input
              id="faq-search"
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <nav className="flex flex-wrap justify-center gap-4 mb-12 animate-slideInUp" aria-label="FAQ categories">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                selectedCategory === 'all' ? 'bg-brand-ink text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
              }`}
              aria-pressed={selectedCategory === 'all'}
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              All Questions
              <span className={`text-xs px-2 py-1 rounded-full ${selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {initialFAQs.length}
              </span>
            </button>

            {faqCategories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap];
              const count = initialFAQs.filter((faq) => faq.category === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-brand-ink text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                  }`}
                  aria-pressed={selectedCategory === category.id}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" aria-hidden="true" />}
                  {category.name}
                  <span className={`text-xs px-2 py-1 rounded-full ${selectedCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Results Count */}
          {(selectedCategory !== 'all' || searchTerm) && (
            <div className="text-center mb-8">
              <p className="text-gray-600">
                Showing {filteredFAQs.length} of {initialFAQs.length} questions
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>
          )}

          {/* FAQ Items */}
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4 mb-16">
              {filteredFAQs.map((faq, index) => (
                <article
                  key={faq.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-slideInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                  itemScope
                  itemType="https://schema.org/Question"
                >
                  <h2>
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                      aria-expanded={openFAQ === index}
                      aria-controls={`faq-answer-${faq.id}`}
                    >
                      <span className="font-semibold text-gray-900 text-lg pr-4 leading-relaxed" itemProp="name">{faq.question}</span>
                      <ChevronDown
                        className={`h-6 w-6 text-[#00a8e8] transition-transform duration-300 flex-shrink-0 ${openFAQ === index ? 'transform rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                  </h2>
                  <div
                    id={`faq-answer-${faq.id}`}
                    className={`transition-all duration-300 ease-in-out ${openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
                    aria-hidden={openFAQ !== index}
                    itemScope
                    itemType="https://schema.org/Answer"
                    itemProp="acceptedAnswer"
                  >
                    <div className="px-8 pb-6 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed pt-4" itemProp="text">{faq.answer}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h2>
              <p className="text-gray-600 mb-6">
                {searchTerm ? `No FAQs match "${searchTerm}". Try different keywords or browse by category.` : 'No questions in this category yet.'}
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="text-brand-ink hover:text-[#0097d2] font-medium"
              >
                View all questions
              </button>
            </div>
          )}

          {/* Service-Specific FAQ Links */}
          <section className="mb-16 bg-gray-50 rounded-2xl p-8" aria-labelledby="service-faq-heading">
            <h2 id="service-faq-heading" className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Browse by Service
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Looking for questions about a specific tile service? Visit our service pages for detailed information.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {serviceLinks.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`${locPrefix}/services/${svc.slug}`}
                  className="flex items-center justify-between bg-white rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:text-[#00a8e8] transition-all duration-200 group font-medium text-gray-700"
                >
                  <span>{svc.label}</span>
                  <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-gradient-to-r from-[#00a8e8] to-[#0097d2] rounded-2xl p-12 text-center text-white" aria-labelledby="contact-cta-heading">
            <h2 id="contact-cta-heading" className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">{content.ctaDescription}</p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <Phone className="h-8 w-8 mx-auto mb-3 text-blue-200" aria-hidden="true" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-blue-100 text-sm mb-3">Speak directly with our experts</p>
                <a href="tel:+1-904-866-1738" className="text-white hover:text-blue-200 font-medium" aria-label="Call Tola Tiles at (904) 866-1738">
                  (904) 866-1738
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <Mail className="h-8 w-8 mx-auto mb-3 text-blue-200" aria-hidden="true" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-blue-100 text-sm mb-3">Get detailed answers via email</p>
                <a href="mailto:menitola@tolatiles.com" className="text-white hover:text-blue-200 font-medium">
                  menitola@tolatiles.com
                </a>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <MessageCircle className="h-8 w-8 mx-auto mb-3 text-blue-200" aria-hidden="true" />
                <h3 className="font-semibold mb-2">Free Consultation</h3>
                <p className="text-blue-100 text-sm mb-3">Schedule an in-home visit</p>
                <Link
                  href={`${locPrefix}/contact`}
                  className="bg-white text-brand-ink px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;
