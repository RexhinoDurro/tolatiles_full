import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { sampleImages } from '../data/sampleData';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  return (
    <div>
      <HeroSlider setCurrentPage={setCurrentPage} />
      <FeaturesSection />
      <SampleWorkPreview setCurrentPage={setCurrentPage} />
    </div>
  );
};

const HeroSlider: React.FC<{ setCurrentPage: (page: string) => void }> = ({ setCurrentPage }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Transform Your Space with Premium Tiles",
      subtitle: "Professional Installation • Quality Materials • Lifetime Warranty",
      description: "Expert tile installation for kitchens, bathrooms, patios, and more. Creating beautiful spaces that last a lifetime.",
      image: "/api/placeholder/1920/1080",
      cta: "View Our Work"
    },
    {
      id: 2,
      title: "Luxury Bathroom Transformations",
      subtitle: "Custom Designs • Expert Craftsmanship • Modern Solutions",
      description: "From elegant marble to contemporary ceramics, we create stunning bathroom spaces tailored to your vision.",
      image: "/api/placeholder/1920/1080",
      cta: "See Gallery"
    },
    {
      id: 3,
      title: "Beautiful Kitchen Backsplashes",
      subtitle: "Stylish Designs • Perfect Installation • Lasting Beauty",
      description: "Enhance your kitchen with our expertly installed backsplashes using the finest materials and innovative designs.",
      image: "/api/placeholder/1920/1080",
      cta: "Get Quote"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'transform translate-x-0' : 
            index < currentSlide ? 'transform -translate-x-full' : 'transform translate-x-full'
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                <div className="overflow-hidden">
                  <h1 className={`text-5xl md:text-7xl font-bold text-white mb-6 transform transition-transform duration-1000 delay-300 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}>
                    {slide.title}
                  </h1>
                </div>
                
                <div className="overflow-hidden">
                  <p className={`text-xl md:text-2xl text-blue-300 mb-6 font-medium transform transition-transform duration-1000 delay-500 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}>
                    {slide.subtitle}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <p className={`text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed transform transition-transform duration-1000 delay-700 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}>
                    {slide.description}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <div className={`flex flex-col sm:flex-row gap-4 transform transition-transform duration-1000 delay-1000 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}>
                    <button 
                      onClick={() => setCurrentPage('gallery')}
                      className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group transform hover:scale-105"
                    >
                      {slide.cta} 
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setCurrentPage('contact')}
                      className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                    >
                      Get Free Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20 group"
      >
        <ChevronLeft className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20 group"
      >
        <ChevronRight className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: "⭐",
      title: "Premium Quality",
      description: "Only the finest materials and expert craftsmanship for lasting results"
    },
    {
      icon: "🚀",
      title: "Fast Installation",
      description: "Efficient project completion without compromising on quality"
    },
    {
      icon: "💎",
      title: "Lifetime Warranty",
      description: "Comprehensive warranty coverage for your peace of mind"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Tola Tiles?</h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We bring years of experience and unmatched expertise to every tile installation project
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-900">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SampleWorkPreview: React.FC<{ setCurrentPage: (page: string) => void }> = ({ setCurrentPage }) => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-6">Featured Projects</h3>
          <p className="text-xl text-gray-600">Take a look at some of our recent tile installations</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {Object.values(sampleImages).flat().slice(0, 6).map((image) => (
            <div key={image.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img 
                  src={image.src} 
                  alt={image.title}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                  <div className="text-white p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="font-semibold text-lg mb-2">{image.title}</h4>
                    <p className="text-sm text-gray-200">{image.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => setCurrentPage('gallery')}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View Full Gallery
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomePage;