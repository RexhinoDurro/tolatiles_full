'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tolatiles.com/api';
const GOOGLE_BUSINESS_URL = 'https://maps.app.goo.gl/YwPC3vTSgi4eRTvK7';

interface GoogleReviewsData {
  rating: number;
  userRatingCount: number;
}

/** Compact "sticker" showing the Google star rating + review count, for overlaying on a hero image. */
export default function GoogleRatingBadge() {
  const [data, setData] = useState<GoogleReviewsData | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/google-reviews/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => json && setData(json))
      .catch(() => {});
  }, []);

  if (!data || !data.userRatingCount) return null;

  return (
    <a
      href={GOOGLE_BUSINESS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 sm:gap-3 bg-white rounded-xl shadow-lg px-4 py-2.5 sm:px-5 sm:py-3 hover:shadow-xl transition-shadow"
    >
      <Image
        src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
        alt="Google"
        width={92}
        height={30}
        className="h-4 sm:h-5 w-auto"
      />
      <span className="text-xl sm:text-2xl font-bold text-gray-900">{data.rating.toFixed(1)}</span>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 sm:h-5 sm:w-5 ${i < Math.round(data.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <span className="text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
        {data.userRatingCount} Reviews
      </span>
    </a>
  );
}
