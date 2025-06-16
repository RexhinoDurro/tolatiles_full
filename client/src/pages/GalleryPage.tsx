import React from 'react';
import { sampleImages } from '../data/gallery';
import type { TileImage, SampleImages } from '../data/gallery';

interface GalleryPageProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ selectedCategory, setSelectedCategory }) => {
  const galleryCategories = [
    { id: 'all', label: 'All Projects' },
    { id: 'backsplashes', label: 'Backsplashes' },
    { id: 'patios', label: 'Patios' },
    { id: 'showers', label: 'Showers' },
    { id: 'flooring', label: 'Flooring' },
    { id: 'fireplaces', label: 'Fireplaces' }
  ];

  const getFilteredImages = (): TileImage[] => {
    if (selectedCategory === 'all') {
      return Object.values(sampleImages).flat();
    }
    return sampleImages[selectedCategory as keyof SampleImages] || [];
  };

  return (
    <div className="pt-20">
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Project Gallery</h2>
            <p className="text-xl text-gray-600">Explore our completed tile installations</p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          {/* Image Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {getFilteredImages().map((image: TileImage, index) => (
              <div 
                key={image.id} 
                className="group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <img 
                    src={image.src} 
                    alt={image.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                    <div className="text-white p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="font-semibold text-lg mb-2">{image.title}</h4>
                      <p className="text-sm text-gray-200">{image.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;