'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { categoryNameMap } from '@/types/api';
import type { GalleryImage, Category } from '@/types/api';
import { sampleImages } from '@/data/gallery';
import type { TileImage, SampleImages } from '@/data/gallery';

interface GalleryPageProps {
  category?: string;
}

// Category descriptions for SEO and user information
const categoryDescriptions: Record<string, { title: string; description: string; serviceLink: string }> = {
  all: {
    title: 'Our Complete Tile Installation Portfolio',
    description: 'Browse our comprehensive gallery showcasing tile installations across Northeast Florida. From elegant kitchen backsplashes in Jacksonville to stunning bathroom renovations in St. Augustine, each project demonstrates our commitment to quality craftsmanship and attention to detail. We take pride in transforming spaces throughout Duval and St. Johns counties with premium tile work.',
    serviceLink: '/services',
  },
  backsplashes: {
    title: 'Kitchen Backsplash Installations',
    description: 'Explore our kitchen backsplash projects featuring subway tiles, glass mosaics, and natural stone installations. Each backsplash is custom-designed to complement the unique style of homes in Jacksonville, St. Augustine, and surrounding areas. Our precise installations protect walls while adding character to kitchens across Northeast Florida.',
    serviceLink: '/services/kitchen-backsplash',
  },
  showers: {
    title: 'Custom Shower Tile Work',
    description: 'View our portfolio of custom shower installations with complete waterproofing systems designed for Florida\'s humid climate. From luxurious walk-in showers in Ponte Vedra homes to practical renovations in St. Augustine vacation rentals, we create beautiful, water-tight enclosures with built-in niches, benches, and stunning tile patterns.',
    serviceLink: '/services/shower-tile',
  },
  flooring: {
    title: 'Floor Tile Installations',
    description: 'See examples of our floor tile installations including large format porcelain, natural stone, and durable ceramic tiles. Our flooring projects span open-concept living spaces, commercial lobbies, and cozy Florida rooms throughout Jacksonville and St. Augustine. Each installation features proper leveling and moisture protection for lasting results.',
    serviceLink: '/services/floor-tile',
  },
  patios: {
    title: 'Outdoor Patio & Pool Deck Tile',
    description: 'Discover our outdoor tile installations including pool decks, courtyard patios, and covered lanais designed for year-round Florida living. Using slip-resistant, UV-stable materials, we create beautiful outdoor spaces that withstand intense sun, summer storms, and coastal conditions while requiring minimal maintenance.',
    serviceLink: '/services/patio-tile',
  },
  fireplaces: {
    title: 'Fireplace Surround Installations',
    description: 'Browse our fireplace tile projects featuring marble surrounds, stacked stone, and contemporary designs that create stunning focal points. Whether updating an original fireplace in a historic Riverside home or framing a new gas unit in Nocatee, our installations combine safety with style.',
    serviceLink: '/services/fireplace-tile',
  },
};

// Convert API image to component format
interface DisplayImage {
  id: number;
  src: string;
  title: string;
  description: string;
}

const GalleryPage = ({ category }: GalleryPageProps) => {
  const selectedCategory = category || 'all';
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState<DisplayImage[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imagesPerPage = 12;

  // Fetch images from API or fall back to static data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch categories
        const categoryData = await api.getCategories();
        const allCount = categoryData.reduce((sum, cat) => sum + cat.image_count, 0);

        const formattedCategories = [
          { id: 'all', label: 'All Projects', count: allCount },
          ...categoryData.map((cat) => ({
            id: cat.name === 'backsplash' ? 'backsplashes' :
                cat.name === 'patio' ? 'patios' :
                cat.name === 'shower' ? 'showers' :
                cat.name === 'fireplace' ? 'fireplaces' :
                cat.name,
            label: cat.label,
            count: cat.image_count,
          })),
        ];
        setCategories(formattedCategories);

        // Fetch images
        const apiCategory = categoryNameMap[selectedCategory];
        const imageData = apiCategory
          ? await api.getGalleryImages(apiCategory)
          : await api.getAllGalleryImages();

        const formattedImages = imageData.map((img) => ({
          id: img.id,
          src: img.image_url || img.image,
          title: img.title,
          description: img.description,
        }));

        setImages(formattedImages);
      } catch (err) {
        console.warn('API fetch failed, using static data:', err);
        setError('Using offline data');

        // Fall back to static data
        const staticCategories = [
          { id: 'all', label: 'All Projects', count: Object.values(sampleImages).flat().length },
          { id: 'backsplashes', label: 'Backsplashes', count: sampleImages.backsplashes.length },
          { id: 'patios', label: 'Patios', count: sampleImages.patios.length },
          { id: 'showers', label: 'Showers', count: sampleImages.showers.length },
          { id: 'flooring', label: 'Flooring', count: sampleImages.flooring.length },
          { id: 'fireplaces', label: 'Fireplaces', count: sampleImages.fireplaces.length },
        ];
        setCategories(staticCategories);

        const staticImages: TileImage[] = selectedCategory === 'all'
          ? Object.values(sampleImages).flat()
          : sampleImages[selectedCategory as keyof SampleImages] || [];

        setImages(staticImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setCurrentPage(1); // Reset page when category changes
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
    <div className="pt-20">
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="text-center mb-12 animate-fadeIn">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {selectedCategory === 'all' ? 'Project Gallery' : `${categoryLabel} Gallery`}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              {categoryInfo.description}
            </p>
            {selectedCategory !== 'all' && (
              <Link
                href={categoryInfo.serviceLink}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
                href={cat.id === 'all' ? '/gallery' : `/gallery/${cat.id}`}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
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
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                <ImageCard key={`${selectedCategory}-${image.id}-${currentPage}`} image={image} index={index} category={categoryLabel} />
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
                          page === currentPage ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
              Love What You See?
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Let us transform your space with our expert tile installation services. Every project is backed by our quality guarantee and
              professional craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Your Free Quote
              </Link>
              <Link
                href="/contact"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Schedule Consultation
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

interface ImageCardProps {
  image: DisplayImage;
  index: number;
  category: string;
}

const ImageCard = ({ image, index, category }: ImageCardProps) => {
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

export default GalleryPage;
