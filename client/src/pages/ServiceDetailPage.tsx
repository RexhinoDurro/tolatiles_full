// src/pages/ServiceDetailPage.tsx
import React, { useState, useCallback } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Mail, Phone, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import { sampleImages } from '../data/gallery';
import { services } from '../data/services';
import type { TileImage } from '../data/gallery';

interface ImageCardProps {
  image: TileImage;
  index: number;
  category: string;
}

const ImageCard: React.FC<ImageCardProps> = React.memo(({ image, index, category }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { rootMargin: '100px' }
      );
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <article 
      className="gallery-item group cursor-pointer opacity-0"
      style={{ 
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'forwards'
      }}
    >
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      >
        <div className="relative w-full h-64 bg-gray-200">
          {!isInView && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          
          {isInView && (
            <img 
              src={image.src} 
              alt={`${image.title} - ${image.description} | Tola Tiles Jacksonville ${category}`}
              className={`w-full h-64 object-cover group-hover:scale-110 transition-all duration-700 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
              width="400"
              height="256"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
            <div className="text-white p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-semibold text-lg mb-2">{image.title}</h3>
              <p className="text-sm text-gray-200">{image.description}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

ImageCard.displayName = 'ImageCard';

// Mapping URLs to service data and gallery categories
const serviceMapping: Record<string, { serviceKey: string; galleryKey: string; displayName: string }> = {
  '/services/kitchen-backsplash-jacksonville': { 
    serviceKey: 'kitchen-backsplash', 
    galleryKey: 'backsplashes',
    displayName: 'Kitchen Backsplash Installation'
  },
  '/services/bathroom-tile-jacksonville': { 
    serviceKey: 'bathroom', 
    galleryKey: 'showers',
    displayName: 'Bathroom Tile Installation'
  },
  '/services/floor-tiling-jacksonville': { 
    serviceKey: 'flooring', 
    galleryKey: 'flooring',
    displayName: 'Floor Tiling'
  },
  '/services/patio-tile-jacksonville': { 
    serviceKey: 'patio', 
    galleryKey: 'patios',
    displayName: 'Patio & Outdoor Tile'
  },
  '/services/fireplace-tile-jacksonville': { 
    serviceKey: 'fireplace', 
    galleryKey: 'fireplaces',
    displayName: 'Fireplace Tile'
  },
  '/services/shower-tile-jacksonville': { 
    serviceKey: 'shower', 
    galleryKey: 'showers',
    displayName: 'Shower Tile Installation'
  }
};

const ServiceDetailPage: React.FC = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;

  // Get service and gallery data based on URL
  const serviceInfo = serviceMapping[location.pathname];
  const service = services.find(s => s.id === serviceInfo?.serviceKey);
  const galleryImages = serviceInfo ? sampleImages[serviceInfo.galleryKey as keyof typeof sampleImages] || [] : [];

  // Redirect if invalid URL
  if (!serviceInfo || !service) {
    return <Navigate to="/404" replace />;
  }

  const totalPages = Math.ceil(galleryImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = galleryImages.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [location.pathname]);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const createQuoteEmailLink = (serviceName: string) => {
    const subject = encodeURIComponent(`Quote Request - ${serviceName} in Jacksonville`);
    const body = encodeURIComponent(`
Hello Tola Tiles,

I would like to request a quote for ${serviceName} in Jacksonville.

Project Details:
- Service: ${serviceName}
- Location: Jacksonville, FL
- Timeline: 
- Budget Range: 
- Additional Notes: 

Please contact me to discuss this project further.

Thank you,
    `.trim());
    
    return `mailto:menitola@tolatiles.com?subject=${subject}&body=${body}`;
  };

  // Generate SEO data
  const seoTitle = `${serviceInfo.displayName} Jacksonville FL | Expert Tile Installation | Tola Tiles`;
  const seoDescription = `Professional ${serviceInfo.displayName.toLowerCase()} services in Jacksonville, FL. ${service.description} Licensed, insured, and backed by a 2-year warranty. Free estimates available.`;
  const seoKeywords = `${serviceInfo.displayName.toLowerCase()} jacksonville, tile installation jacksonville fl, ${service.id} jacksonville, professional tile contractor jacksonville`;

  const breadcrumbItems = [
    { name: "Home", url: "https://tolatiles.com" },
    { name: "Services", url: "https://tolatiles.com/services" },
    { name: serviceInfo.displayName, url: `https://tolatiles.com${location.pathname}` }
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${serviceInfo.displayName} in Jacksonville`,
    "description": seoDescription,
    "url": `https://tolatiles.com${location.pathname}`,
    "areaServed": {
      "@type": "City",
      "name": "Jacksonville",
      "addressRegion": "FL",
      "addressCountry": "US"
    },
    "provider": {
      "@type": "LocalBusiness",
      "name": "Tola Tiles",
      "telephone": "+1-904-210-3094",
      "email": "menitola@tolatiles.com"
    }
  };

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`https://tolatiles.com${location.pathname}`}
        schemaData={serviceSchema}
      />
      
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="pt-20">
        {/* Service Information Section */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fadeIn">
                {serviceInfo.displayName} in Jacksonville
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slideInUp">
                {service.description}
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Left Column - Service Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Overview</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {service.detailedDescription}
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included:</h3>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">{service.timeline}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - CTA */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border-2 border-blue-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Your Free Quote</h2>
                  <p className="text-gray-600 mb-6">
                    Ready to transform your space? Contact us today for a free consultation and detailed quote for your {serviceInfo.displayName.toLowerCase()} project in Jacksonville.
                  </p>

                  <div className="space-y-3 mb-6">
                    <Link
                      to="/contact"
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Schedule Free Consultation
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                    
                    <a
                      href="tel:+1-904-210-3094"
                      className="flex items-center justify-center gap-2 w-full border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
                    >
                      <Phone className="h-5 w-5" />
                      Call (904) 210-3094
                    </a>

                    <a
                      href={createQuoteEmailLink(serviceInfo.displayName)}
                      className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
                    >
                      <Mail className="h-5 w-5" />
                      Email for Quote
                    </a>
                  </div>

                  <div className="text-center pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Licensed & Insured</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>2-Year Warranty on All Work</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our {serviceInfo.displayName} Portfolio
              </h2>
              <p className="text-xl text-gray-600">
                View our completed projects in Jacksonville
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, galleryImages.length)} of {galleryImages.length} projects
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </div>
            </header>
            
            {currentImages.length > 0 && (
              <div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
                key={`${location.pathname}-${currentPage}`}
              >
                {currentImages.map((image: TileImage, index) => (
                  <ImageCard 
                    key={`${location.pathname}-${image.id}-${currentPage}`}
                    image={image} 
                    index={index}
                    category={serviceInfo.displayName}
                  />
                ))}
              </div>
            )}

            {galleryImages.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Gallery images coming soon!</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mb-16">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Previous
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          aria-label={`Go to page ${page}`}
                          aria-current={page === currentPage ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12 text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Your Project?
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                Let us bring your vision to life with our expert {serviceInfo.displayName.toLowerCase()} services in Jacksonville.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/contact"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Your Free Quote
                </Link>
                <Link 
                  to="/services"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  View All Services
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServiceDetailPage;