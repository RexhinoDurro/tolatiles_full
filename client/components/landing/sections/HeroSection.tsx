'use client';

import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { displayPhoneNumber } from '@/lib/phoneUtils';
import GoogleRatingBadge from '../GoogleRatingBadge';
import LeadCaptureForm from '../LeadCaptureForm';

interface HeroLeadFormConfig {
  heading?: string;
  button_label?: string;
  success_message?: string;
  project_type?: string;
}

interface HeroConfig {
  headline?: string;
  subheadline?: string;
  media_type?: 'image' | 'video';
  image?: string;
  images?: string[];
  video_url?: string;
  show_google_rating?: boolean;
  show_lead_form?: boolean;
  lead_form?: HeroLeadFormConfig;
}

interface HeroSectionProps {
  config: HeroConfig;
  phoneNumber: string;
  landingPageId: number;
}

const SLIDE_INTERVAL_MS = 5000;

export default function HeroSection({ config, phoneNumber, landingPageId }: HeroSectionProps) {
  const {
    headline, subheadline, media_type, image, images, video_url,
    show_google_rating, show_lead_form, lead_form,
  } = config;

  const slides = images && images.length > 0 ? images : image ? [image] : [];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900 py-14">
      {media_type === 'video' && video_url ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={video_url}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        slides.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              i === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))
      )}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center text-white">
        {headline && (
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">{headline}</h1>
        )}
        {subheadline && (
          <p className="text-xl sm:text-2xl text-white/90 mb-6">{subheadline}</p>
        )}

        {show_google_rating && (
          <div className="flex justify-center mb-6">
            <GoogleRatingBadge />
          </div>
        )}

        {show_lead_form && landingPageId && (
          <div className="mb-6">
            <LeadCaptureForm config={lead_form || {}} landingPageId={landingPageId} id="lead-form" />
          </div>
        )}

        {phoneNumber && (
          <div>
            {show_lead_form && (
              <p className="text-white/80 mb-2 text-sm sm:text-base">Prefer to talk? Call us now:</p>
            )}
            <a
              href={`tel:${phoneNumber}`}
              className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white text-xl sm:text-2xl font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-105"
            >
              <Phone className="w-6 h-6 sm:w-7 sm:h-7" />
              Call {displayPhoneNumber(phoneNumber)}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
