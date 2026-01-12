'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Star, Zap, Shield, Award, Clock, CheckCircle, Users, Sparkles, MapPin } from 'lucide-react';
import { sampleImages } from '@/data/gallery';

interface GoogleReview {
  authorName: string;
  profilePhotoUrl: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  publishTime: string;
}

interface GoogleReviewsData {
  displayName: string;
  rating: number;
  userRatingCount: number;
  reviews: GoogleReview[];
}

interface LocationContent {
  location: 'florida' | 'st-augustine' | 'jacksonville';
  locationName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  featuresDescription: string;
  advantageDescription: string;
  locationHeading: string;
  locationDescription: string;
  serviceAreas: string[];
  servicesBasePath: string;
}

const floridaContent: LocationContent = {
  location: 'florida',
  locationName: 'Florida',
  heroTitle: 'Transform Your Space with Premium Tiles',
  heroSubtitle: 'Professional Installation • Quality Materials • Lifetime Warranty',
  heroDescription: 'Expert tile installation for kitchens, bathrooms, patios, and more. Creating beautiful spaces that last a lifetime across Northeast Florida.',
  featuresDescription: 'We bring years of experience and unmatched expertise to every tile installation project, ensuring exceptional results that stand the test of time.',
  advantageDescription: "When you choose us, you're partnering with professionals who are committed to transforming your vision into reality with precision and care.",
  locationHeading: 'Where We Are Established',
  locationDescription: 'Proudly serving Jacksonville, Saint Augustine, and the greater Northeast Florida area',
  serviceAreas: ['Saint Augustine', 'Jacksonville', 'Ponte Vedra Beach', 'Palm Coast', 'St. Johns County', 'Flagler County'],
  servicesBasePath: '/services',
};

const stAugustineContent: LocationContent = {
  location: 'st-augustine',
  locationName: 'St Augustine',
  heroTitle: 'Transform Your St Augustine Home with Premium Tiles',
  heroSubtitle: 'Professional Installation • Quality Materials • Lifetime Warranty',
  heroDescription: 'Expert tile installation for St Augustine homes. From stunning kitchen backsplashes to luxurious bathroom renovations in the Ancient City.',
  featuresDescription: 'We bring years of experience and unmatched expertise to every tile installation project in St Augustine, ensuring exceptional results that stand the test of time.',
  advantageDescription: "When you choose us for your St Augustine project, you're partnering with professionals who understand the unique needs of homes in the Ancient City.",
  locationHeading: 'Where We Are Established',
  locationDescription: 'Proudly serving St Augustine, St Johns County, and the surrounding Northeast Florida communities',
  serviceAreas: ['Downtown St Augustine', 'St Augustine Beach', 'Vilano Beach', 'Anastasia Island', 'Ponte Vedra', 'Palm Coast'],
  servicesBasePath: '/services',
};

const jacksonvilleContent: LocationContent = {
  location: 'jacksonville',
  locationName: 'Jacksonville',
  heroTitle: 'Transform Your Jacksonville Home with Premium Tiles',
  heroSubtitle: 'Professional Installation • Quality Materials • Lifetime Warranty',
  heroDescription: 'Expert tile installation for Jacksonville and Jax area homes. From stunning kitchen backsplashes to luxurious bathroom renovations in the River City.',
  featuresDescription: 'We bring years of experience and unmatched expertise to every tile installation project in Jacksonville, ensuring exceptional results that stand the test of time.',
  advantageDescription: "When you choose us for your Jacksonville project, you're partnering with professionals who understand the unique needs of homes in the River City.",
  locationHeading: 'Where We Are Established',
  locationDescription: 'Proudly serving Jacksonville, Jax Beach, and the surrounding Duval County communities',
  serviceAreas: ['Downtown Jacksonville', 'Jacksonville Beach', 'Neptune Beach', 'Atlantic Beach', 'Orange Park', 'Mandarin'],
  servicesBasePath: '/services',
};

interface HomePageProps {
  location?: 'florida' | 'st-augustine' | 'jacksonville';
}

const HomePage = ({ location = 'florida' }: HomePageProps) => {
  const content = location === 'st-augustine' ? stAugustineContent : location === 'jacksonville' ? jacksonvilleContent : floridaContent;

  return (
    <>
      <HeroSlider content={content} />
      <GoogleReviewsSection />
      <FeaturesSection content={content} />
      <ServiceAreasSection currentLocation={location} />
      <WhyChooseUsSection content={content} />
      <SampleWorkPreview />
      <LocationSection content={content} />
    </>
  );
};

const GOOGLE_BUSINESS_URL = 'https://maps.app.goo.gl/YwPC3vTSgi4eRTvK7';

const ReviewCard = ({ review }: { review: GoogleReview }) => (
  <article className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full mx-2 md:mx-3">
    {/* Quote Icon */}
    <div className="text-blue-100 mb-4">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
    </div>

    {/* Review Text */}
    {review.text && (
      <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 line-clamp-4 min-h-[80px]">
        {review.text}
      </p>
    )}

    {/* Rating Stars */}
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>

    {/* Author Info */}
    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
      {review.profilePhotoUrl ? (
        <Image
          src={review.profilePhotoUrl}
          alt={review.authorName}
          width={44}
          height={44}
          className="rounded-full ring-2 ring-gray-100"
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-gray-100">
          <span className="text-white font-semibold text-lg">
            {review.authorName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{review.authorName}</h4>
        <p className="text-xs text-gray-400">{review.relativeTimeDescription}</p>
      </div>
    </div>
  </article>
);

const GoogleReviewsSection = () => {
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tolatiles.com/api';
        const response = await fetch(`${apiUrl}/google-reviews/`);
        if (response.ok) {
          const data = await response.json();
          setReviewsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch Google reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const reviews = reviewsData?.reviews || [];
  const totalReviews = reviews.length;

  // Auto-play carousel
  useEffect(() => {
    if (!reviewsData || totalReviews === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [reviewsData, totalReviews]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading || !reviewsData || totalReviews === 0) {
    return null;
  }

  // Create infinite loop by tripling the reviews array
  const infiniteReviews = [...reviews, ...reviews, ...reviews];
  const offsetIndex = currentIndex + totalReviews; // Start from middle set

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden" aria-labelledby="reviews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <a
            href={GOOGLE_BUSINESS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <Image
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
              alt="Google"
              width={92}
              height={30}
              className="h-7 md:h-8 w-auto"
            />
            <h2 id="reviews-heading" className="text-xl md:text-2xl font-semibold text-gray-900">Reviews</h2>
          </a>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              {reviewsData.rating.toFixed(1)}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 md:h-7 md:w-7 ${i < Math.round(reviewsData.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-500 text-sm md:text-base">Based on {reviewsData.userRatingCount} reviews</p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-300 border border-gray-100"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={handleNext}
            className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-300 border border-gray-100"
            aria-label="Next review"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Reviews Carousel - Mobile (single card) */}
          <div
            className="md:hidden overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${offsetIndex * 100}%)`,
              }}
            >
              {infiniteReviews.map((review, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Carousel - Desktop (3 cards visible) */}
          <div className="hidden md:block overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${offsetIndex * (100 / 3)}%)`,
              }}
            >
              {infiniteReviews.map((review, index) => (
                <div key={index} className="w-1/3 flex-shrink-0">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex % totalReviews
                    ? 'w-8 h-2 bg-blue-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-8">
          <a
            href={GOOGLE_BUSINESS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300 border border-gray-200"
          >
            <Image
              src="https://www.google.com/favicon.ico"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5"
            />
            See all reviews on Google
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

const HeroSlider = ({ content }: { content: LocationContent }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isManualChange, setIsManualChange] = useState(false);
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLElement>(null);

  // Fetch Google reviews for hero badge
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tolatiles.com/api';
        const response = await fetch(`${apiUrl}/google-reviews/`);
        if (response.ok) {
          const data = await response.json();
          setReviewsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch Google reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  const locationText = content.location === 'st-augustine' ? 'St Augustine' : content.location === 'jacksonville' ? 'Jacksonville' : 'Jacksonville and Saint Augustine';
  const locationSuffix = content.location === 'florida' ? '' : ` in ${content.locationName}`;

  const slides = [
    {
      id: 1,
      title: content.heroTitle,
      subtitle: content.heroSubtitle,
      description: content.heroDescription,
      image: '/images/fireplace/1.webp',
      cta: 'View Our Work',
      alt: `Beautiful fireplace tile installation by Tola Tiles in ${content.locationName}`,
    },
    {
      id: 2,
      title: content.location === 'florida' ? 'Luxury Bathroom Transformations' : `Luxury Bathroom Transformations in ${content.locationName}`,
      subtitle: 'Custom Designs • Expert Craftsmanship • Modern Solutions',
      description: `From elegant marble to contemporary ceramics, we create stunning bathroom spaces tailored to your vision${locationSuffix}.`,
      image: '/images/shower/2.webp',
      cta: 'See Gallery',
      alt: `Luxury bathroom shower tile installation in ${content.locationName}`,
    },
    {
      id: 3,
      title: content.location === 'florida' ? 'Beautiful Kitchen Backsplashes' : `Beautiful Kitchen Backsplashes for ${content.locationName} Homes`,
      subtitle: 'Stylish Designs • Perfect Installation • Lasting Beauty',
      description: `Enhance your kitchen with our expertly installed backsplashes using the finest materials and innovative designs${locationSuffix}.`,
      image: '/images/backsplash/1.webp',
      cta: 'See Gallery',
      alt: `Modern kitchen backsplash tile installation in ${content.locationName}`,
    },
  ];

  useEffect(() => {
    if (!isManualChange) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);

      return () => clearInterval(timer);
    } else {
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
      <h1 className="sr-only">Tola Tiles - Tile Installation Services in {locationText} Florida</h1>

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'transform translate-x-0' : index < currentSlide ? 'transform -translate-x-full' : 'transform translate-x-full'
          }`}
          aria-hidden={index !== currentSlide}
        >
          <div className="absolute inset-0">
            <Image src={slide.image} alt={slide.alt} fill sizes="100vw" className="object-cover" loading={index === 0 ? 'eager' : 'lazy'} priority={index === 0} quality={80} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
          </div>

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                <div className="overflow-hidden">
                  <h2
                    className={`text-5xl md:text-7xl font-bold text-white mb-6 transform transition-transform duration-1000 delay-300 ${
                      index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    {slide.title}
                  </h2>
                </div>

                <div className="overflow-hidden">
                  <p
                    className={`text-xl md:text-2xl text-blue-300 mb-6 font-medium transform transition-transform duration-1000 delay-500 ${
                      index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <p
                    className={`text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed transform transition-transform duration-1000 delay-700 ${
                      index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    {slide.description}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <div
                    className={`flex flex-col sm:flex-row gap-4 transform transition-transform duration-1000 delay-1000 ${
                      index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    <Link
                      href="/gallery"
                      className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group transform hover:scale-105"
                      aria-label={`${slide.cta} - View our tile installation gallery`}
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/contact"
                      className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 text-center"
                    >
                      Get Free Quote
                    </Link>
                  </div>
                </div>

                {/* Google Reviews Badge */}
                {reviewsData && (
                  <div className="overflow-hidden mt-8">
                    <a
                      href={GOOGLE_BUSINESS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transform transition-all duration-1000 delay-1200 hover:bg-white/20 ${
                        index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                      }`}
                    >
                      <img
                        src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
                        alt="Google"
                        className="h-5 w-auto"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-semibold">{reviewsData.rating.toFixed(1)}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.round(reviewsData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                            />
                          ))}
                        </div>
                        <span className="text-white/80 text-sm">({reviewsData.userRatingCount} reviews)</span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

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

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

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

const FeaturesSection = ({ content }: { content: LocationContent }) => {
  const features = [
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Only the finest materials and expert craftsmanship for lasting results that exceed expectations',
    },
    {
      icon: Zap,
      title: 'Expert Installation',
      description: 'Efficient project completion by certified professionals without compromising on quality',
    },
    {
      icon: Shield,
      title: '2-Year Warranty',
      description: 'Comprehensive warranty coverage for your complete peace of mind and protection',
    },
  ];

  return (
    <section className="py-20 bg-gray-50" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 id="features-heading" className="text-4xl font-bold text-gray-900 mb-6">
            Why Choose Tola Tiles{content.location === 'st-augustine' ? ' in St Augustine' : ''}?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.featuresDescription}
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

const ServiceAreasSection = ({ currentLocation }: { currentLocation: 'florida' | 'st-augustine' | 'jacksonville' }) => {
  // Define service areas with their details
  const areas = [
    {
      id: 'jacksonville',
      name: 'Jacksonville',
      shortName: 'Jax',
      href: '/jacksonville',
      description: 'Expert tile installation in Jacksonville, Jax Beach, and Duval County. Kitchen backsplashes, bathroom tiles, flooring, and more.',
      serviceAreas: ['Downtown Jax', 'Jax Beach', 'Neptune Beach', 'Atlantic Beach', 'Orange Park', 'Mandarin'],
      services: [
        { name: 'Kitchen Backsplash', href: '/services/kitchen-backsplash-jacksonville' },
        { name: 'Bathroom Tile', href: '/services/bathroom-tile-jacksonville' },
        { name: 'Floor Tile', href: '/services/floor-tile-jacksonville' },
      ],
    },
    {
      id: 'st-augustine',
      name: 'St Augustine',
      shortName: 'St Aug',
      href: '/st-augustine',
      description: 'Professional tile services in St Augustine, St Johns County, and the Ancient City. Specializing in coastal homes.',
      serviceAreas: ['Downtown St Aug', 'St Aug Beach', 'Vilano Beach', 'Anastasia Island', 'Ponte Vedra', 'Palm Coast'],
      services: [
        { name: 'Kitchen Backsplash', href: '/services/kitchen-backsplash-st-augustine' },
        { name: 'Bathroom Tile', href: '/services/bathroom-tile-st-augustine' },
        { name: 'Floor Tile', href: '/services/floor-tile-st-augustine' },
      ],
    },
  ];

  // Filter out current location and add cross-linking
  const otherAreas = areas.filter(area => area.id !== currentLocation);

  // If on a specific location page, show link to main and other locations
  if (currentLocation !== 'florida') {
    const currentArea = areas.find(area => area.id === currentLocation);
    return (
      <section className="py-16 bg-blue-50" aria-labelledby="service-areas-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 id="service-areas-heading" className="text-3xl font-bold text-gray-900 mb-4">
              Also Serving Northeast Florida
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              In addition to {currentArea?.name}, we provide professional tile installation services throughout Northeast Florida
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Link to main Florida page */}
            <Link
              href="/"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">All Florida Services</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View our complete tile installation services across Northeast Florida
              </p>
              <span className="text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                View All Services
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            {/* Link to other location */}
            {otherAreas.map(area => (
              <Link
                key={area.id}
                href={area.href}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{area.name} Services</h3>
                </div>
                <p className="text-gray-600 mb-4">{area.description}</p>
                <span className="text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                  View {area.shortName} Services
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Main Florida page - show all location links
  return (
    <section className="py-20 bg-blue-50" aria-labelledby="service-areas-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 id="service-areas-heading" className="text-4xl font-bold text-gray-900 mb-6">
            Tile Installation Across Northeast Florida
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional tile installation services in Jacksonville, St Augustine, and surrounding communities. Find expert tile installers near you.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {areas.map(area => (
            <article
              key={area.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      <Link href={area.href} className="hover:text-blue-600 transition-colors">
                        Tile Installer {area.name} FL
                      </Link>
                    </h3>
                    <p className="text-gray-500 text-sm">Professional tile installation services</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{area.description}</p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Popular Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {area.services.map(service => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Areas Served:</h4>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    {area.serviceAreas.map((subArea, idx) => (
                      <span key={subArea}>
                        {subArea}{idx < area.serviceAreas.length - 1 && <span className="mx-1">•</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={area.href}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 group-hover:gap-3"
                >
                  View {area.name} Services
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* All Services Link */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors text-lg"
          >
            View All Tile Installation Services
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const WhyChooseUsSection = ({ content }: { content: LocationContent }) => {
  const benefits = [
    {
      icon: Award,
      title: '15+ Years Experience',
      description: `Proven track record with over 1,500 successful installations${content.location === 'st-augustine' ? ' in St Augustine area' : ''}`,
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Certified professionals with ongoing training and expertise',
    },
    {
      icon: Clock,
      title: 'On-Time Delivery',
      description: 'Reliable timelines and project completion as scheduled',
    },
    {
      icon: CheckCircle,
      title: '100% Satisfaction',
      description: 'Dedicated to exceeding your expectations on every project',
    },
  ];

  return (
    <section className="py-20 bg-white" aria-labelledby="advantages-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 id="advantages-heading" className="text-4xl font-bold text-gray-900 mb-6">
            The Tola Tiles Advantage{content.location === 'st-augustine' ? ' in St Augustine' : ''}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.advantageDescription}
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

const SampleWorkPreview = () => {
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
                <Image
                  src={image.src}
                  alt={`${image.title} - ${image.description}`}
                  width={400}
                  height={320}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  quality={75}
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
            href="/gallery"
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

const LocationSection = ({ content }: { content: LocationContent }) => {
  return (
    <section className="py-20 bg-white" aria-labelledby="location-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h2 id="location-heading" className="text-4xl font-bold text-gray-900 mb-6">
            {content.locationHeading}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.locationDescription}
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Map */}
          <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://maps.google.com/maps?q=445+Hutchinson+Ln,+Saint+Augustine,+FL+32084&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Tola Tiles Location - Saint Augustine, FL"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tola Tiles</h3>
              <address className="not-italic space-y-3 text-gray-600">
                <p className="flex items-start gap-3">
                  <span className="text-blue-600 font-medium">Address:</span>
                  <span>445 Hutchinson Ln<br />Saint Augustine, FL 32084</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-blue-600 font-medium">Phone:</span>
                  <a href="tel:+1-904-866-1738" className="hover:text-blue-600 transition-colors">+1 (904) 866-1738</a>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-blue-600 font-medium">Email:</span>
                  <a href="mailto:menitola@tolatiles.com" className="hover:text-blue-600 transition-colors">menitola@tolatiles.com</a>
                </p>
              </address>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Service Areas</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                {content.serviceAreas.map((area) => (
                  <span key={area}>{area}</span>
                ))}
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/YwPC3vTSgi4eRTvK7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Get Directions
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
