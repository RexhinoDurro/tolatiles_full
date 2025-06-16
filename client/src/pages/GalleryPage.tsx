import React, { useMemo, useState, useCallback } from 'react';
import { sampleImages } from '../data/gallery';
import type { TileImage, SampleImages } from '../data/gallery';

interface GalleryPageProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

interface ImageCardProps {
  image: TileImage;
  index: number;
}

// Memoized image card component for better performance
const ImageCard: React.FC<ImageCardProps> = React.memo(({ image, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for lazy loading - observe the container, not the img
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
    <div 
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
              alt={image.title}
              className={`w-full h-64 object-cover group-hover:scale-110 transition-all duration-700 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
            />
          )}
          
          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
            <div className="text-white p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <h4 className="font-semibold text-lg mb-2">{image.title}</h4>
              <p className="text-sm text-gray-200">{image.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ImageCard.displayName = 'ImageCard';

const GalleryPage: React.FC<GalleryPageProps> = ({ selectedCategory, setSelectedCategory }) => {
  const galleryCategories = [
    { id: 'all', label: 'All Projects', count: Object.values(sampleImages).flat().length },
    { id: 'backsplashes', label: 'Backsplashes', count: sampleImages.backsplashes.length },
    { id: 'patios', label: 'Patios', count: sampleImages.patios.length },
    { id: 'showers', label: 'Showers', count: sampleImages.showers.length },
    { id: 'flooring', label: 'Flooring', count: sampleImages.flooring.length },
    { id: 'fireplaces', label: 'Fireplaces', count: sampleImages.fireplaces.length }
  ];

  // Memoize filtered images to prevent unnecessary recalculations
  const filteredImages = useMemo((): TileImage[] => {
    if (selectedCategory === 'all') {
      return Object.values(sampleImages).flat();
    }
    return sampleImages[selectedCategory as keyof SampleImages] || [];
  }, [selectedCategory]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, [setSelectedCategory]);

  return (
    <div className="pt-20">
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Project Gallery</h2>
            <p className="text-xl text-gray-600">Explore our completed tile installations</p>
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredImages.length} projects
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-16 animate-slideInUp">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
                aria-pressed={selectedCategory === category.id}
              >
                {category.label}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === category.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
          
          {/* Loading State */}
          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">No projects found in this category.</div>
            </div>
          )}
          
          {/* Image Grid */}
          {filteredImages.length > 0 && (
            <div 
              className="grid md:grid-cols-3 lg:grid-cols-4 gap-6"
              key={selectedCategory} // Force re-render when category changes
            >
              {filteredImages.map((image: TileImage, index) => (
                <ImageCard 
                  key={`${selectedCategory}-${image.id}`} // Unique key per category
                  image={image} 
                  index={index}
                />
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12 animate-slideInUp">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Love What You See?</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Let us transform your space with our expert tile installation services. 
              Every project is backed by our quality guarantee and professional craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Your Free Quote
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;