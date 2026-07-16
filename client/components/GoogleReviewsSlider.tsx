'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';

const GOOGLE_BUSINESS_URL = 'https://maps.app.goo.gl/YwPC3vTSgi4eRTvK7';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tolatiles.com/api';

export interface GoogleReview {
  authorName: string;
  profilePhotoUrl: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  publishTime: string;
}

export interface GoogleReviewsData {
  displayName: string;
  rating: number;
  userRatingCount: number;
  reviews: GoogleReview[];
}

const DEMO_REVIEWS_DATA: GoogleReviewsData = {
  displayName: "Tola Tiles",
  rating: 4.9,
  userRatingCount: 127,
  reviews: [
    {
      authorName: "Sarah Jenkins",
      profilePhotoUrl: "",
      rating: 5,
      text: "Meni and his crew did an absolutely outstanding job on our kitchen backsplash. Their precision and attention to detail are unmatched. They cleaned up every day and completed the project on time. Highly recommended!",
      relativeTimeDescription: "2 weeks ago",
      publishTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      authorName: "David Miller",
      profilePhotoUrl: "",
      rating: 5,
      text: "We hired Tola Tiles for a complete master bathroom tile renovation. The craftsmanship is top-tier. Meni helped us choose the right pattern layout and the finished product looks like a luxury spa. Extremely satisfied!",
      relativeTimeDescription: "1 month ago",
      publishTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      authorName: "Emily Rodriguez",
      profilePhotoUrl: "",
      rating: 5,
      text: "Professional, honest, and hardworking. They tiled our outdoor patio and it looks beautiful. Very responsive communication throughout the entire project. Will definitely use them again for future tile work.",
      relativeTimeDescription: "3 weeks ago",
      publishTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]
};

const ReviewCard = ({ review }: { review: GoogleReview }) => (
  <article className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full mx-2 md:mx-3">
    <div className="text-blue-100 mb-4">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
    </div>
    {review.text && (
      <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 line-clamp-4 min-h-[80px]">
        {review.text}
      </p>
    )}
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
      {review.profilePhotoUrl ? (
        <Image src={review.profilePhotoUrl} alt={review.authorName} width={44} height={44} className="rounded-full ring-2 ring-gray-100" />
      ) : (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-[#00a8e8] flex items-center justify-center ring-2 ring-gray-100">
          <span className="text-white font-semibold text-lg">{review.authorName.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div>
        <p className="font-semibold text-gray-900 text-sm">{review.authorName}</p>
        <p className="text-xs text-gray-500">{review.relativeTimeDescription}</p>
      </div>
    </div>
  </article>
);

interface GoogleReviewsSliderProps {
  location?: string;
}

/** The homepage's Google review slider (rating header, auto-advancing cards, swipe on mobile, arrows on desktop). */
export default function GoogleReviewsSlider({ location = 'florida' }: GoogleReviewsSliderProps) {
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const fetchReviews = async () => {
      let fetched = false;
      try {
        const response = await fetch(`${API_BASE}/google-reviews/`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.reviews && data.reviews.length > 0) {
            setReviewsData(data);
            fetched = true;
          }
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        if (!fetched && process.env.NODE_ENV === 'development') {
          console.log('Using demo reviews in development mode.');
          setReviewsData(DEMO_REVIEWS_DATA);
        }
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const reviews = reviewsData?.reviews || [];
  const totalReviews = reviews.length;

  useEffect(() => {
    if (!totalReviews) return;
    const interval = setInterval(() => setCurrentIndex((p) => (p + 1) % totalReviews), 5000);
    return () => clearInterval(interval);
  }, [totalReviews]);

  if (isLoading || !reviewsData || totalReviews === 0) return null;

  const infiniteReviews = [...reviews, ...reviews, ...reviews];
  const offsetIndex = currentIndex + totalReviews;

  const locationText = location === 'st-augustine' ? 'St Augustine' : location === 'jacksonville' ? 'Jacksonville' : 'Northeast Florida';

  return (
    <section className="relative pt-20 pb-12 md:pt-24 md:pb-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden" aria-labelledby="reviews-heading">
      {/* Wavy top transition from Projects strip */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
        <svg viewBox="0 0 1440 320" className="relative block w-full h-[40px] md:h-[80px] rotate-180" preserveAspectRatio="none">
          <path className="fill-gray-950" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,160C672,160,768,192,864,213.3C960,235,1056,245,1152,229.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            <Image src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" width={92} height={30} className="h-7 md:h-8 w-auto" />
            <h2 id="reviews-heading" className="text-xl md:text-2xl font-semibold text-gray-900">Reviews from {locationText} Customers</h2>
          </a>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              {reviewsData.rating.toFixed(1)}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-6 w-6 md:h-7 md:w-7 ${i < Math.round(reviewsData.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
          <p className="text-gray-500 text-sm md:text-base">Based on {reviewsData.userRatingCount} reviews</p>
        </div>

        <div className="relative">
          <button onClick={() => setCurrentIndex((p) => (p - 1 + totalReviews) % totalReviews)} className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-300 border border-gray-100" aria-label="Previous review">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button onClick={() => setCurrentIndex((p) => (p + 1) % totalReviews)} className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-300 border border-gray-100" aria-label="Next review">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          <div className="md:hidden overflow-hidden" onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }} onTouchMove={(e) => { touchEndX.current = e.touches[0].clientX; }} onTouchEnd={() => { const d = touchStartX.current - touchEndX.current; if (d > 50) setCurrentIndex((p) => (p + 1) % totalReviews); else if (d < -50) setCurrentIndex((p) => (p - 1 + totalReviews) % totalReviews); touchStartX.current = 0; touchEndX.current = 0; }}>
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${offsetIndex * 100}%)` }}>
              {infiniteReviews.map((review, index) => (
                <div key={index} className="w-full flex-shrink-0"><ReviewCard review={review} /></div>
              ))}
            </div>
          </div>

          <div className="hidden md:block overflow-hidden">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${offsetIndex * (100 / 3)}%)` }}>
              {infiniteReviews.map((review, index) => (
                <div key={index} className="w-1/3 flex-shrink-0"><ReviewCard review={review} /></div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {reviews.map((_, index) => (
              <button key={index} onClick={() => setCurrentIndex(index)} className="group p-2 -m-2" aria-label={`Go to review ${index + 1}`}>
                <span className={`block transition-all duration-300 rounded-full ${index === currentIndex % totalReviews ? 'w-8 h-2 bg-[#00a8e8]' : 'w-2 h-2 bg-gray-300 group-hover:bg-gray-400'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300 border border-gray-200">
            <Image src="https://www.google.com/favicon.ico" alt="" width={20} height={20} className="w-5 h-5" />
            See all reviews on Google
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
