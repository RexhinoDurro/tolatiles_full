// src/pages/HomePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Star, 
  Zap, 
  Shield, 
  Award,
  Clock,
  CheckCircle,
  Users,
  Sparkles
} from 'lucide-react';
import SEO from '../components/SEO';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import { sampleImages } from '../data/gallery';
import cover2 from '../assets/images/shower/2.webp';
import cover1 from '../assets/images/fireplace/1.webp';
import cover3 from '../assets/images/backsplash/1.webp';

const HomePage: React.FC = () => {
  const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tola Tiles",
    "url": "https://tolatiles.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tolatiles.com/gallery?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const heroSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Tola Tiles - Tile Installers in Jacksonville and Saint Augustine, Florida",
    "description": "Expert tile installers in Jacksonville and Saint Augustine Florida, for kitchens, bathrooms, patios, and more. 15+ years experience, licensed & insured.",
    "url": "https://tolatiles.com",
    "telephone": "+1-904-210-3094",
    "priceRange": "$8-25 per sq ft",
    "serviceType": "Tile Installation",
    "areaServed": "Greater Metropolitan Area"
  };

  return (
    <>
      <SEO 
        title="Tola Tiles - Tile Installers in Jacksonville and Saint Augustine, Florida"
        description="Expert tile installers in Jacksonville and Saint Augustine Florida, for kitchens, bathrooms, patios, and more. 15+ years experience, licensed & insured."
        keywords="tile installers jacksonville FL, tile installers Saint Augustine FL, backsplash jacksonville fl, backsplash saint augustine fl, bathroom tiles jacksonville fl, patio tiles, flooring installer, ceramic tiles, porcelain tiles, natural stone, tile contractor, tile installer jacksonville fl, tile installer saint augustine fl, home renovation"
        url="https://tolatiles.com"
        schemaData={[homePageSchema, heroSchema]}
      />
      
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://tolatiles.com" }
      ]} />

      <div>
        <HeroSlider />
        <FeaturesSection />
        <WhyChooseUsSection />
        <SampleWorkPreview />
        <TestimonialSection />
      </div>
    </>
  );
};

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isManualChange, setIsManualChange] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLElement>(null);

  const slides = [
    {
      id: 1,
      title: "Transform Your Space with Premium Tiles",
      subtitle: "Professional Installation • Quality Materials • Lifetime Warranty",
      description: "Expert tile installation for kitchens, bathrooms, patios, and more. Creating beautiful spaces that last a lifetime.",
      image: cover1,
      cta: "View Our Work",
      alt: "Beautiful fireplace tile installation by Tola Tiles"
    },
    {
      id: 2,
      title: "Luxury Bathroom Transformations",
      subtitle: "Custom Designs • Expert Craftsmanship • Modern Solutions",
      description: "From elegant marble to contemporary ceramics, we create stunning bathroom spaces tailored to your vision.",
      image: cover2,
      cta: "See Gallery",
      alt: "Luxury bathroom shower tile installation"
    },
    {
      id: 3,
      title: "Beautiful Kitchen Backsplashes",
      subtitle: "Stylish Designs • Perfect Installation • Lasting Beauty",
      description: "Enhance your kitchen with our expertly installed backsplashes using the finest materials and innovative designs.",
      image: cover3,
      cta: "See Gallery",
      alt: "Modern kitchen backsplash tile installation"
    }
  ];

  useEffect(() => {
    if (!isManualChange) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);

      return () => clearInterval(timer);
    } else {
      // Reset auto-advance after 10 seconds of manual interaction
      const timer = setTimeout(() => {
        setIsManualChange(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [slides.length, isManualChange]);

  const nextSlide = () => {
    setIsManualChange(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsManualChange(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setIsManualChange(true);
    setCurrentSlide(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section 
      ref={sliderRef}
      className="relative h-screen w-full overflow-hidden" 
      role="banner"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <h1 className="sr-only">Tola Tiles - Premium Tile Installation Services in Jacksonville</h1>
      
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'transform translate-x-0' : 
            index < currentSlide ? 'transform -translate-x-full' : 'transform translate-x-full'
          }`}
          aria-hidden={index !== currentSlide}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                <div className="overflow-hidden">
                  <h2 className={`text-5xl md:text-7xl font-bold text-white mb-6 transform transition-transform duration-1000 delay-300 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}>
                    {slide.title}
                  </h2>
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
                    <Link 
                      to="/gallery"
                      className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group transform hover:scale-105"
                      aria-label={`${slide.cta} - View our tile installation gallery`}
                    >
                      {slide.cta} 
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      to="/contact"
                      className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 text-center"
                    >
                      Get Free Quote
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows - Hidden on Mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20 group hidden md:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 z-20 group hidden md:block"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Swipe Indicator for Mobile */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/60 text-sm md:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-0.5 bg-white/40 rounded"></div>
          <span>Swipe to navigate</span>
          <div className="w-6 h-0.5 bg-white/40 rounded"></div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Star,
      title: "Premium Quality",
      description: "Only the finest materials and expert craftsmanship for lasting results that exceed expectations"
    },
    {
      icon: Zap,
      title: "Expert Installation", 
      description: "Efficient project completion by certified professionals without compromising on quality"
    },
    {
      icon: Shield,
      title: "2-Year Warranty",
      description: "Comprehensive warranty coverage for your complete peace of mind and protection"
    }
  ];

  return (
    <section className="py-20 bg-gray-50" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 id="features-heading" className="text-4xl font-bold text-gray-900 mb-6">
            Why Choose Tola Tiles?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We bring years of experience and unmatched expertise to every tile installation project, 
            ensuring exceptional results that stand the test of time.
          </p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <article 
                key={index} 
                className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                  <IconComponent className="h-12 w-12 text-blue-600 mx-auto" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const WhyChooseUsSection: React.FC = () => {
  const benefits = [
    {
      icon: Award,
      title: "15+ Years Experience",
      description: "Proven track record with over 1,500 successful installations"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Certified professionals with ongoing training and expertise"
    },
    {
      icon: Clock,
      title: "On-Time Delivery",
      description: "Reliable timelines and project completion as scheduled"
    },
    {
      icon: CheckCircle,
      title: "100% Satisfaction",
      description: "Dedicated to exceeding your expectations on every project"
    }
  ];

  return (
    <section className="py-20 bg-white" aria-labelledby="advantages-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 id="advantages-heading" className="text-4xl font-bold text-gray-900 mb-6">
            The Tola Tiles Advantage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            When you choose us, you're partnering with professionals who are committed to 
            transforming your vision into reality with precision and care.
          </p>
        </header>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <article 
                key={index} 
                className="text-center p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="bg-blue-50 p-3 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-blue-100 transition-colors duration-300">
                  <IconComponent className="h-10 w-10 text-blue-600 mx-auto" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const SampleWorkPreview: React.FC = () => {
  const previewImages = Object.values(sampleImages).flat().slice(0, 6);

  return (
    <section className="py-20 bg-gray-50" aria-labelledby="projects-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 id="projects-heading" className="text-4xl font-bold text-gray-900 mb-6">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600">Take a look at some of our recent tile installations</p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {previewImages.map((image) => (
            <article key={image.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img 
                  src={image.src} 
                  alt={`${image.title} - ${image.description}`}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  width="400"
                  height="320"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                  <div className="text-white p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-lg mb-2">{image.title}</h3>
                    <p className="text-sm text-gray-200">{image.description}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center">
          <Link 
            to="/gallery"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto w-fit"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            View Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
};

const TestimonialSection: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      project: "Kitchen Backsplash",
      quote: "Tola Tiles transformed our kitchen beyond our expectations. The attention to detail and craftsmanship is exceptional.",
      rating: 5
    },
    {
      name: "Mike Chen",
      project: "Bathroom Renovation",
      quote: "Professional, reliable, and the quality is outstanding. Our bathroom looks like a luxury spa now!",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      project: "Patio Installation",
      quote: "From design to completion, the team was fantastic. They delivered exactly what they promised.",
      rating: 5
    }
  ];

  const testimonialSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tola Tiles",
    "review": testimonials.map(testimonial => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": testimonial.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": "5"
      },
      "reviewBody": testimonial.quote
    }))
  };

  return (
    <section className="py-20 bg-blue-600" aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 id="testimonials-heading" className="text-4xl font-bold text-white mb-6">
            What Our Clients Say
          </h2>
          <p className="text-xl text-blue-100">
            Don't just take our word for it—hear from satisfied customers who trusted us with their projects
          </p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <article 
              key={index} 
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <footer>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.project}</div>
              </footer>
            </article>
          ))}
        </div>
      </div>
      
      <script type="application/ld+json">
        {JSON.stringify(testimonialSchema)}
      </script>
    </section>
  );
};

export default HomePage;