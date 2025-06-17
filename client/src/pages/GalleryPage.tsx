// src/pages/GalleryPage.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import { sampleImages } from '../data/gallery';
import type { TileImage, SampleImages } from '../data/gallery';

interface ImageCardProps {
  image: TileImage;
  index: number;
  category: string;
}

// Memoized image card component for better performance
const ImageCard: React.FC<ImageCardProps> = React.memo(({ image, index, category }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for lazy loading
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
          {/* Placeholder while loading */}
          {!isInView && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          
          {/* Actual image - only load when in view */}
          {isInView && (
            <img 
              src={image.src} 
              alt={`${image.title} - ${image.description} | Tola Tiles ${category} installation`}
              className={`w-full h-64 object-cover group-hover:scale-110 transition-all duration-700 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
              width="400"
              height="256"
            />
          )}
          
          {/* Overlay content */}
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

const GalleryPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const selectedCategory = category || 'all';
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12;

  const galleryCategories = [
    { id: 'all', label: 'All Projects', count: Object.values(sampleImages).flat().length },
    { id: 'backsplashes', label: 'Backsplashes', count: sampleImages.backsplashes.length },
    { id: 'patios', label: 'Patios', count: sampleImages.patios.length },
    { id: 'showers', label: 'Showers', count: sampleImages.showers.length },
    { id: 'flooring', label: 'Flooring', count: sampleImages.flooring.length },
    { id: 'fireplaces', label: 'Fireplaces', count: sampleImages.fireplaces.length }
  ];

  // Memoize filtered images to prevent unnecessary recalculations
  const allFilteredImages = useMemo((): TileImage[] => {
    if (selectedCategory === 'all') {
      return Object.values(sampleImages).flat();
    }
    return sampleImages[selectedCategory as keyof SampleImages] || [];
  }, [selectedCategory]);

  // Reset page when category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(allFilteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = allFilteredImages.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate SEO data based on category
  const getSEOData = () => {
    const categoryData = galleryCategories.find(cat => cat.id === selectedCategory);
    const categoryLabel = categoryData?.label || 'All Projects';
    
    const baseTitle = "Tile Installation Gallery";
    const title = selectedCategory === 'all' 
      ? `${baseTitle} - Premium Tile Work by Tola Tiles`
      : `${categoryLabel} Gallery - ${baseTitle} | Tola Tiles`;
    
    const description = selectedCategory === 'all'
      ? "Browse our complete gallery of tile installation projects including kitchen backsplashes, bathroom renovations, patio installations, and flooring work by Tola Tiles."
      : `View our ${categoryLabel.toLowerCase()} tile installation projects. Professional ${categoryLabel.toLowerCase()} installation with premium materials and expert craftsmanship by Tola Tiles.`;
    
    const keywords = selectedCategory === 'all'
      ? "tile gallery, tile installation examples, kitchen backsplash gallery, bathroom tile gallery, patio tile gallery, flooring gallery"
      : `${selectedCategory} tile gallery, ${selectedCategory} installation, ${selectedCategory} renovation, ${selectedCategory} tile examples`;
    
    const url = selectedCategory === 'all'
      ? "https://tolatiles.com/gallery"
      : `https://tolatiles.com/gallery/${selectedCategory}`;

    return { title, description, keywords, url, categoryLabel };
  };

  const { title, description, keywords, url, categoryLabel } = getSEOData();

  // Generate breadcrumb data
  const breadcrumbItems = [
    { name: "Home", url: "https://tolatiles.com" },
    { name: "Gallery", url: "https://tolatiles.com/gallery" }
  ];

  if (selectedCategory !== 'all') {
    breadcrumbItems.push({
      name: categoryLabel,
      url: `https://tolatiles.com/gallery/${selectedCategory}`
    });
  }

  // Generate gallery schema
  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `Tola Tiles ${categoryLabel} Gallery`,
    "description": description,
    "url": url,
    "author": {
      "@type": "Organization",
      "name": "Tola Tiles"
    },
    "image": currentImages.slice(0, 10).map(image => ({
      "@type": "ImageObject",
      "url": image.src,
      "name": image.title,
      "description": image.description
    }))
  };

  return (
    <>
      <SEO 
        title={title}
        description={description}
        keywords={keywords}
        url={url}
        schemaData={gallerySchema}
      />
      
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="pt-20">
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <header className="text-center mb-12 animate-fadeIn">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                {selectedCategory === 'all' ? 'Project Gallery' : `${categoryLabel} Gallery`}
              </h1>
              <p className="text-xl text-gray-600">
                {selectedCategory === 'all' 
                  ? 'Explore our completed tile installations' 
                  : `Professional ${categoryLabel.toLowerCase()} tile installation projects`
                }
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, allFilteredImages.length)} of {allFilteredImages.length} projects
                {selectedCategory !== 'all' && ` in ${categoryLabel}`}
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </div>
            </header>
            
            {/* Category Filter */}
            <nav className="flex flex-wrap justify-center gap-4 mb-16 animate-slideInUp" aria-label="Gallery categories">
              {galleryCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.id === 'all' ? '/gallery' : `/gallery/${cat.id}`}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                  }`}
                  aria-current={selectedCategory === cat.id ? 'page' : undefined}
                >
                  {cat.label}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedCategory === cat.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {cat.count}
                  </span>
                </Link>
              ))}
            </nav>
            
            {/* Loading State */}
            {allFilteredImages.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-500 text-lg">No projects found in this category.</div>
              </div>
            )}
            
            {/* Image Grid */}
            {currentImages.length > 0 && (
              <div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
                key={`${selectedCategory}-${currentPage}`} // Force re-render when category or page changes
              >
                {currentImages.map((image: TileImage, index) => (
                  <ImageCard 
                    key={`${selectedCategory}-${image.id}-${currentPage}`} // Unique key per category and page
                    image={image} 
                    index={index}
                    category={categoryLabel}
                  />
                ))}
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

                {/* Page Numbers */}
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
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

            {/* CTA Section */}
            <section className="mt-20 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12 animate-slideInUp" aria-labelledby="cta-heading">
              <h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Love What You See?
              </h2>
              <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                Let us transform your space with our expert tile installation services. 
                Every project is backed by our quality guarantee and professional craftsmanship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/contact"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Your Free Quote
                </Link>
                <Link 
                  to="/contact"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  Schedule Consultation
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryPage;