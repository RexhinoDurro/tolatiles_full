'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';

interface GalleryPageProps {
  category?: string;
  location?: string;
  /** Server-fetched (see lib/galleryServer.ts) so the grid is present in the initial HTML for crawlers. */
  initialImages: DisplayImage[];
  initialCategories: { id: string; label: string; count: number }[];
}

// Per-location category description overrides
interface GalleryLocationContent {
  ctaHeading: string;
  ctaDescription: string;
  categoryDescriptions: Record<string, { title: string; description: string; serviceLink: string }>;
}

const locationContentMap: Record<string, GalleryLocationContent> = {
  jacksonville: {
    ctaHeading: 'Transform Your Jacksonville Home',
    ctaDescription:
      'Let our Duval County tile experts bring your vision to life. From Riverside renovations to Jax Beach patio upgrades, every project is backed by our quality guarantee and 15+ years of local experience.',
    categoryDescriptions: {
      all: {
        title: 'Tile Installation Portfolio - Jacksonville FL',
        description: 'Browse our gallery of tile installations completed across Jacksonville and Duval County. From elegant kitchen backsplashes in Riverside to stunning bathroom renovations in San Marco, each project showcases the precision craftsmanship that River City homeowners trust.',
        serviceLink: '/services',
      },
      backsplashes: {
        title: 'Kitchen Backsplash Installations - Jacksonville',
        description: 'Explore our Jacksonville kitchen backsplash projects featuring subway tiles, glass mosaics, and natural stone. Each backsplash is custom-designed for homes in Riverside, Ortega, Mandarin, and neighborhoods throughout Duval County.',
        serviceLink: '/services/kitchen-backsplash-installation',
      },
      showers: {
        title: 'Custom Shower Tile Work - Jacksonville',
        description: 'View our portfolio of custom shower installations across Jacksonville. From luxurious walk-in showers in San Marco to practical renovations in Mandarin, we create beautiful, water-tight enclosures designed for Duval County\'s humid climate.',
        serviceLink: '/services/shower-tile-installation',
      },
      flooring: {
        title: 'Floor Tile Installations - Jacksonville',
        description: 'See examples of our floor tile installations throughout Jacksonville — including large format porcelain in Southside condos, natural stone in Ortega estates, and durable ceramic in Jax Beach homes. Each installation features proper leveling and moisture protection.',
        serviceLink: '/services/floor-tile-installation',
      },
      patios: {
        title: 'Outdoor Patio & Pool Deck Tile - Jacksonville',
        description: 'Discover our outdoor tile installations across Jacksonville, from pool decks in Ponte Vedra to courtyard patios in Riverside. Using slip-resistant, UV-stable materials built for year-round Florida living and Duval County weather.',
        serviceLink: '/services/patio-tile-installation',
      },
      fireplaces: {
        title: 'Fireplace Surround Installations - Jacksonville',
        description: 'Browse our Jacksonville fireplace tile projects featuring marble surrounds, stacked stone, and contemporary designs. From updating original fireplaces in historic Riverside homes to framing new gas units in Southside builds.',
        serviceLink: '/services/fireplace-tile-installation',
      },
    },
  },
  'st-augustine': {
    ctaHeading: 'Transform Your St. Augustine Home',
    ctaDescription:
      'Let our St. Johns County tile experts bring your vision to life. From historic downtown renovations to modern Nocatee builds, every project is backed by our quality guarantee and deep local expertise.',
    categoryDescriptions: {
      all: {
        title: 'Tile Installation Portfolio - St Augustine FL',
        description: 'Browse our gallery of tile installations completed throughout St. Augustine and St. Johns County. From careful restorations in the Historic District to contemporary builds in Nocatee, each project reflects our commitment to quality craftsmanship in the Ancient City.',
        serviceLink: '/services',
      },
      backsplashes: {
        title: 'Kitchen Backsplash Installations - St Augustine',
        description: 'Explore our St. Augustine kitchen backsplash projects featuring custom designs for historic homes in Lincolnville, beachside condos on Anastasia Island, and modern kitchens in World Golf Village and Nocatee.',
        serviceLink: '/services/kitchen-backsplash-installation',
      },
      showers: {
        title: 'Custom Shower Tile Work - St Augustine',
        description: 'View our portfolio of custom shower installations across St. Johns County. From spa-inspired walk-in showers in Vilano Beach vacation homes to practical renovations in Palencia, we build water-tight enclosures for the coastal climate.',
        serviceLink: '/services/shower-tile-installation',
      },
      flooring: {
        title: 'Floor Tile Installations - St Augustine',
        description: 'See examples of our floor tile work throughout St. Augustine — including natural stone in historic downtown homes, large format porcelain in Nocatee new builds, and durable ceramic in St. Augustine Beach cottages.',
        serviceLink: '/services/floor-tile-installation',
      },
      patios: {
        title: 'Outdoor Patio & Pool Deck Tile - St Augustine',
        description: 'Discover our outdoor tile installations across St. Johns County, from pool decks in Nocatee to courtyard patios in the Historic District. Using slip-resistant, UV-stable materials built for coastal conditions and salt air exposure.',
        serviceLink: '/services/patio-tile-installation',
      },
      fireplaces: {
        title: 'Fireplace Surround Installations - St Augustine',
        description: 'Browse our St. Augustine fireplace tile projects. Whether restoring a period-appropriate surround in a historic downtown home or designing a modern focal point in a Nocatee living room, our installations combine safety with style.',
        serviceLink: '/services/fireplace-tile-installation',
      },
    },
  },
  florida: {
    ctaHeading: 'Love What You See?',
    ctaDescription:
      'Let us transform your space with our expert tile installation services. Every project across Northeast Florida is backed by our quality guarantee and professional craftsmanship.',
    categoryDescriptions: {
      all: {
        title: 'Our Complete Tile Installation Portfolio',
        description: 'Browse our comprehensive gallery showcasing tile installations across Northeast Florida. From elegant kitchen backsplashes in Jacksonville to stunning bathroom renovations in St. Augustine, each project demonstrates our commitment to quality craftsmanship and attention to detail. We take pride in transforming spaces throughout Duval and St. Johns counties with premium tile work.',
        serviceLink: '/services',
      },
      backsplashes: {
        title: 'Kitchen Backsplash Installations',
        description: 'Explore our kitchen backsplash projects featuring subway tiles, glass mosaics, and natural stone installations. Each backsplash is custom-designed to complement the unique style of homes in Jacksonville, St. Augustine, and surrounding areas. Our precise installations protect walls while adding character to kitchens across Northeast Florida.',
        serviceLink: '/services/kitchen-backsplash-installation',
      },
      showers: {
        title: 'Custom Shower Tile Work',
        description: 'View our portfolio of custom shower installations with complete waterproofing systems designed for Florida\'s humid climate. From luxurious walk-in showers in Ponte Vedra homes to practical renovations in St. Augustine vacation rentals, we create beautiful, water-tight enclosures with built-in niches, benches, and stunning tile patterns.',
        serviceLink: '/services/shower-tile-installation',
      },
      flooring: {
        title: 'Floor Tile Installations',
        description: 'See examples of our floor tile installations including large format porcelain, natural stone, and durable ceramic tiles. Our flooring projects span open-concept living spaces, commercial lobbies, and cozy Florida rooms throughout Jacksonville and St. Augustine. Each installation features proper leveling and moisture protection for lasting results.',
        serviceLink: '/services/floor-tile-installation',
      },
      patios: {
        title: 'Outdoor Patio & Pool Deck Tile',
        description: 'Discover our outdoor tile installations including pool decks, courtyard patios, and covered lanais designed for year-round Florida living. Using slip-resistant, UV-stable materials, we create beautiful outdoor spaces that withstand intense sun, summer storms, and coastal conditions while requiring minimal maintenance.',
        serviceLink: '/services/patio-tile-installation',
      },
      fireplaces: {
        title: 'Fireplace Surround Installations',
        description: 'Browse our fireplace tile projects featuring marble surrounds, stacked stone, and contemporary designs that create stunning focal points. Whether updating an original fireplace in a historic Riverside home or framing a new gas unit in Nocatee, our installations combine safety with style.',
        serviceLink: '/services/fireplace-tile-installation',
      },
    },
  },
};

// Convert API image to component format
interface DisplayImage {
  id: number;
  src: string;
  title: string;
  description: string;
}

const GalleryPage = ({ category, location = 'florida', initialImages, initialCategories }: GalleryPageProps) => {
  const selectedCategory = category || 'all';
  const [currentPage, setCurrentPage] = useState(1);
  // Seeded directly from server-fetched props so the grid is present in the
  // initial HTML for crawlers — each category is its own route (a <Link>
  // navigation below, not a client-side toggle), so no client refetch is
  // needed; a fresh server render already happens on navigation.
  const [images] = useState<DisplayImage[]>(initialImages);
  const [categories] = useState<{ id: string; label: string; count: number }[]>(initialCategories);
  const isLoading = false;
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const imagesPerPage = 12;

  const openModal = (index: number) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);
  const goModalPrev = () => setModalIndex(i => (i !== null && i > 0 ? i - 1 : i));
  const goModalNext = () => setModalIndex(i => (i !== null && i < currentImages.length - 1 ? i + 1 : i));

  const locationData = locationContentMap[location] || locationContentMap.florida;
  const categoryDescriptions = locationData.categoryDescriptions;

  useEffect(() => {
    setCurrentPage(1); // Reset page when category changes (route navigation remounts with new props)
  }, [selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = images.slice(startIndex, endIndex);

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

  const categoryLabel = categories.find((cat) => cat.id === selectedCategory)?.label || 'All Projects';
  const categoryInfo = categoryDescriptions[selectedCategory] || categoryDescriptions.all;

  return (
    <div className="pt-[var(--navbar-height)]">
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="text-center mb-12 animate-fadeIn">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {selectedCategory === 'all' ? categoryInfo.title : `${categoryLabel} Gallery`}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {categoryInfo.description}
            </p>
            {selectedCategory !== 'all' && (
              <Link
                href={`/${location}${categoryInfo.serviceLink}`}
                className="inline-flex items-center text-[#00a8e8] hover:text-[#0097d2] font-medium transition-colors"
              >
                Learn more about our {categoryLabel.toLowerCase()} services →
              </Link>
            )}
            {!isLoading && images.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, images.length)} of {images.length} projects
                {selectedCategory !== 'all' && ` in ${categoryLabel}`}
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </div>
            )}
          </header>

          {/* Category Filter */}
          <nav className="flex flex-wrap justify-center gap-4 mb-16 animate-slideInUp" aria-label="Gallery categories">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.id === 'all' ? `/${location}/gallery` : `/${location}/gallery/${cat.id}`}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  selectedCategory === cat.id ? 'bg-[#00a8e8] text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
                aria-current={selectedCategory === cat.id ? 'page' : undefined}
              >
                {cat.label}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${selectedCategory === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                >
                  {cat.count}
                </span>
              </Link>
            ))}
          </nav>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#00a8e8]" />
              <span className="ml-3 text-gray-600">Loading gallery...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && images.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">No projects found in this category.</div>
            </div>
          )}

          {/* Image Grid */}
          {!isLoading && currentImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12" key={`${selectedCategory}-${currentPage}`}>
              {currentImages.map((image, index) => (
                <ImageCard key={`${selectedCategory}-${image.id}-${currentPage}`} image={image} index={index} category={categoryLabel} onOpen={() => openModal(index)} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
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
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          page === currentPage ? 'bg-[#00a8e8] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    );
                  } else if ((page === currentPage - 2 && currentPage > 3) || (page === currentPage + 2 && currentPage < totalPages - 2)) {
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
          <section
            className="mt-20 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12 animate-slideInUp"
            aria-labelledby="cta-heading"
          >
            <h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-4">
              {locationData.ctaHeading}
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              {locationData.ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${location}/contact`}
                className="bg-[#00a8e8] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0097d2] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Your Free Quote
              </Link>
              <Link
                href={`/${location}/contact`}
                className="border-2 border-[#00a8e8] text-[#00a8e8] px-8 py-4 rounded-lg font-semibold hover:bg-[#00a8e8] hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Schedule Consultation
              </Link>
            </div>
          </section>
        </div>
      </div>

      {modalIndex !== null && (
        <ImageModal
          images={currentImages}
          index={modalIndex}
          category={categoryLabel}
          onClose={closeModal}
          onPrev={goModalPrev}
          onNext={goModalNext}
        />
      )}
    </div>
  );
};

interface ImageCardProps {
  image: DisplayImage;
  index: number;
  category: string;
  onOpen: () => void;
}

const ImageCard = ({ image, index, category, onOpen }: ImageCardProps) => {
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
        animationFillMode: 'forwards',
      }}
      onClick={onOpen}
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
            <Image
              src={image.src}
              alt={`${image.title} - ${image.description} | Tola Tiles ${category} installation`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className={`object-cover group-hover:scale-110 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
              quality={75}
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
};

interface ImageModalProps {
  images: DisplayImage[];
  index: number;
  category: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const ImageModal = ({ images, index, category, onClose, onPrev, onNext }: ImageModalProps) => {
  const image = images[index];
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Reset loading state when navigating to a different image
  useEffect(() => {
    setIsImageLoaded(false);
  }, [index]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={image.title}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative w-full flex-1 min-h-0" style={{ aspectRatio: '4/3' }}>
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-white/70" />
            </div>
          )}
          <Image
            src={image.src}
            alt={`${image.title} - ${image.description} | Tola Tiles ${category} installation`}
            fill
            className={`object-contain transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 768px) 100vw, 80vw"
            unoptimized
            priority
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>

        <div className="bg-black/70 text-white px-4 py-3 rounded-b-lg">
          <h3 className="font-semibold text-base">{image.title}</h3>
          {image.description && (
            <p className="text-sm text-gray-300 mt-1">{image.description}</p>
          )}
        </div>

        {index > 0 && (
          <button
            onClick={e => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {index < images.length - 1 && (
          <button
            onClick={e => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
