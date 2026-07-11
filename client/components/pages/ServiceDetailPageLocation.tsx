'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Hammer, ChefHat, Bath, Home, Palette, Wrench,
  Clock, CheckCircle, ArrowRight, ChevronRight, ChevronDown,
  Phone, Mail, Loader2, MapPin, Star, Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { serviceToCategoryMap } from '@/types/api';
import { sampleImages } from '@/data/gallery';
import type { Service } from '@/data/services';
import { serviceDetailsMap } from '@/data/serviceDetails';
import ServiceProjectsSection from '@/components/projects/ServiceProjectsSection';

// ─── Icon map ────────────────────────────────────────────────────────────────
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Hammer, ChefHat, Bath, Home, Palette, Wrench,
};

// ─── Gallery path map ─────────────────────────────────────────────────────────
const serviceToGalleryPath: Record<string, string> = {
  'kitchen-backsplash': 'backsplashes',
  bathroom: 'showers',
  flooring: 'flooring',
  patio: 'patios',
  fireplace: 'fireplaces',
  shower: 'showers',
};

// ─── Project slug map ─────────────────────────────────────────────────────────
const serviceIdToProjectSlug: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash',
  bathroom: 'bathroom-tile',
  flooring: 'floor-tile',
  patio: 'patio-tile',
  fireplace: 'fireplace-tile',
  shower: 'shower-tile',
};

// ─── Visual theme system ──────────────────────────────────────────────────────
interface ServiceTheme {
  heroBg: string;
  accentBg: string;
  accentBgHover: string;
  accentText: string;
  accentBorder: string;
  accentLight: string;
  accentLightHover: string;
  accentLightMed: string;
  accentLightMedHover: string;
  accentLightBorder: string;
  featureHover: string;
  ctaBg: string;
  ctaSubtitle: string;
}

const serviceThemes: Record<string, ServiceTheme> = {
  'kitchen-backsplash': {
    heroBg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100',
    accentBg: 'bg-amber-600',
    accentBgHover: 'hover:bg-amber-700',
    accentText: 'text-amber-600',
    accentBorder: 'border-amber-600',
    accentLight: 'bg-amber-50',
    accentLightHover: 'hover:bg-amber-100',
    accentLightMed: 'bg-amber-100',
    accentLightMedHover: 'group-hover:bg-amber-200',
    accentLightBorder: 'border-amber-200',
    featureHover: 'hover:bg-amber-50',
    ctaBg: 'bg-gradient-to-r from-amber-600 to-orange-600',
    ctaSubtitle: 'text-amber-100',
  },
  bathroom: {
    heroBg: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100',
    accentBg: 'bg-teal-600',
    accentBgHover: 'hover:bg-teal-700',
    accentText: 'text-teal-600',
    accentBorder: 'border-teal-600',
    accentLight: 'bg-teal-50',
    accentLightHover: 'hover:bg-teal-100',
    accentLightMed: 'bg-teal-100',
    accentLightMedHover: 'group-hover:bg-teal-200',
    accentLightBorder: 'border-teal-200',
    featureHover: 'hover:bg-teal-50',
    ctaBg: 'bg-gradient-to-r from-teal-600 to-cyan-700',
    ctaSubtitle: 'text-teal-100',
  },
  flooring: {
    heroBg: 'bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100',
    accentBg: 'bg-stone-700',
    accentBgHover: 'hover:bg-stone-800',
    accentText: 'text-stone-700',
    accentBorder: 'border-stone-700',
    accentLight: 'bg-stone-50',
    accentLightHover: 'hover:bg-stone-100',
    accentLightMed: 'bg-stone-100',
    accentLightMedHover: 'group-hover:bg-stone-200',
    accentLightBorder: 'border-stone-200',
    featureHover: 'hover:bg-stone-50',
    ctaBg: 'bg-gradient-to-r from-stone-700 to-slate-700',
    ctaSubtitle: 'text-stone-200',
  },
  patio: {
    heroBg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
    accentBg: 'bg-green-600',
    accentBgHover: 'hover:bg-green-700',
    accentText: 'text-green-600',
    accentBorder: 'border-green-600',
    accentLight: 'bg-green-50',
    accentLightHover: 'hover:bg-green-100',
    accentLightMed: 'bg-green-100',
    accentLightMedHover: 'group-hover:bg-green-200',
    accentLightBorder: 'border-green-200',
    featureHover: 'hover:bg-green-50',
    ctaBg: 'bg-gradient-to-r from-green-600 to-emerald-700',
    ctaSubtitle: 'text-green-100',
  },
  fireplace: {
    heroBg: 'bg-gradient-to-br from-red-50 via-rose-50 to-orange-50',
    accentBg: 'bg-red-600',
    accentBgHover: 'hover:bg-red-700',
    accentText: 'text-red-600',
    accentBorder: 'border-red-600',
    accentLight: 'bg-red-50',
    accentLightHover: 'hover:bg-red-100',
    accentLightMed: 'bg-red-100',
    accentLightMedHover: 'group-hover:bg-red-200',
    accentLightBorder: 'border-red-200',
    featureHover: 'hover:bg-red-50',
    ctaBg: 'bg-gradient-to-r from-red-600 to-rose-700',
    ctaSubtitle: 'text-red-100',
  },
  shower: {
    heroBg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50',
    accentBg: 'bg-sky-600',
    accentBgHover: 'hover:bg-sky-700',
    accentText: 'text-sky-600',
    accentBorder: 'border-sky-600',
    accentLight: 'bg-sky-50',
    accentLightHover: 'hover:bg-sky-100',
    accentLightMed: 'bg-sky-100',
    accentLightMedHover: 'group-hover:bg-sky-200',
    accentLightBorder: 'border-sky-200',
    featureHover: 'hover:bg-sky-50',
    ctaBg: 'bg-gradient-to-r from-sky-600 to-blue-700',
    ctaSubtitle: 'text-sky-100',
  },
};

const defaultTheme: ServiceTheme = {
  heroBg: 'bg-gradient-to-r from-blue-50 to-blue-100',
  accentBg: 'bg-blue-600',
  accentBgHover: 'hover:bg-blue-700',
  accentText: 'text-blue-600',
  accentBorder: 'border-blue-600',
  accentLight: 'bg-blue-50',
  accentLightHover: 'hover:bg-blue-100',
  accentLightMed: 'bg-blue-100',
  accentLightMedHover: 'group-hover:bg-blue-200',
  accentLightBorder: 'border-blue-200',
  featureHover: 'hover:bg-blue-50',
  ctaBg: 'bg-gradient-to-r from-blue-600 to-blue-700',
  ctaSubtitle: 'text-blue-100',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface DisplayImage {
  id: number;
  src: string;
  title: string;
  description: string;
}

interface ServiceDetailPageLocationProps {
  service: Service;
  relatedServices: Service[];
  serviceIdToSlug: Record<string, string>;
  location: 'jacksonville' | 'st-augustine';
}

// ─── Main component ───────────────────────────────────────────────────────────
const ServiceDetailPageLocation = ({
  service,
  relatedServices,
  serviceIdToSlug,
  location,
}: ServiceDetailPageLocationProps) => {
  const [galleryImages, setGalleryImages] = useState<DisplayImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const locationName = location === 'st-augustine' ? 'St. Augustine' : 'Jacksonville';
  const locationPath = location === 'st-augustine' ? '/st-augustine' : '/jacksonville';
  const otherLocation = location === 'st-augustine' ? 'jacksonville' : 'st-augustine';
  const otherLocationName = location === 'st-augustine' ? 'Jacksonville' : 'St. Augustine';

  const theme = serviceThemes[service.id] ?? defaultTheme;
  const details = serviceDetailsMap[service.id];

  const locationContent = service.locations[location];
  const IconComponent = iconMap[service.icon];
  const galleryKey = serviceToGalleryPath[service.id] || 'backsplashes';
  const apiCategory = serviceToCategoryMap[service.id] || 'backsplash';

  // H1: keyword base + specific city for local SEO
  const h1Text = details
    ? `${details.keywordBase} in ${locationName}`
    : `${service.title} in ${locationName}`;

  useEffect(() => {
    const fetchGalleryImages = async () => {
      setIsLoading(true);
      try {
        const images = await api.getGalleryImages(apiCategory);
        setGalleryImages(
          images.slice(0, 6).map((img) => ({
            id: img.id,
            src: img.image_url || img.image,
            title: img.title,
            description: img.description,
          }))
        );
      } catch {
        const staticKey =
          service.id === 'kitchen-backsplash' ? 'backsplashes' :
          service.id === 'bathroom' ? 'showers' :
          service.id === 'patio' ? 'patios' :
          service.id === 'fireplace' ? 'fireplaces' :
          service.id === 'shower' ? 'showers' : 'flooring';
        setGalleryImages(
          (sampleImages[staticKey as keyof typeof sampleImages] || []).slice(0, 6)
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchGalleryImages();
  }, [service.id, apiCategory]);

  const createQuoteEmailLink = () => {
    const subject = encodeURIComponent(`Quote Request - ${service.title} in ${locationName}`);
    const body = encodeURIComponent(
      `Hello Tola Tiles,\n\nI would like to request a quote for ${service.title} in ${locationName}.\n\nProject Details:\n- Service: ${service.title}\n- Location: ${locationName}, FL\n- Timeline:\n- Budget Range:\n- Additional Notes:\n\nThank you,`.trim()
    );
    return `mailto:menitola@tolatiles.com?subject=${subject}&body=${body}`;
  };

  const processSteps = details?.processSteps ?? [
    { step: '01', title: 'Consultation', description: 'Free in-home assessment and design planning' },
    { step: '02', title: 'Preparation', description: 'Surface preparation and material delivery' },
    { step: '03', title: 'Installation', description: 'Expert installation by certified craftsmen' },
    { step: '04', title: 'Completion', description: 'Quality inspection and customer walkthrough' },
  ];

  return (
    <div className="pt-[var(--navbar-height)]">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm flex-wrap gap-y-1">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-800 transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" /></li>
            <li>
              <Link href={locationPath} className="text-gray-500 hover:text-gray-800 transition-colors">{locationName}</Link>
            </li>
            <li><ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" /></li>
            <li>
              <Link href={`${locationPath}/services`} className="text-gray-500 hover:text-gray-800 transition-colors">Services</Link>
            </li>
            <li><ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" /></li>
            <li>
              <span className="text-gray-900 font-medium" aria-current="page">{service.title}</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className={`${theme.heroBg} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`${theme.accentBg} p-3 rounded-xl`}>
                  {IconComponent && <IconComponent className="h-8 w-8 text-white" aria-hidden="true" />}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>Typical timeline: {service.timeline}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {h1Text}
              </h1>

              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {locationContent.localDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`${locationPath}/contact`}
                  className={`${theme.accentBg} ${theme.accentBgHover} text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2`}
                >
                  Get Free Quote in {locationName}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="tel:+1-904-866-1738"
                  className={`border-2 ${theme.accentBorder} ${theme.accentText} px-8 py-4 rounded-lg font-semibold ${theme.accentBgHover} hover:text-white transition-all duration-300 flex items-center justify-center gap-2`}
                >
                  <Phone className="h-5 w-5" />
                  (904) 866-1738
                </a>
              </div>
            </div>

            <div className="relative">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {galleryImages.slice(0, 4).map((image, index) => (
                    <div
                      key={image.id}
                      className={`rounded-xl overflow-hidden shadow-lg ${index === 0 ? 'col-span-2' : ''}`}
                    >
                      <Image
                        src={image.src}
                        alt={`${service.title} project in ${locationName}, FL — ${image.title}`}
                        width={index === 0 ? 600 : 280}
                        height={index === 0 ? 300 : 200}
                        className={`w-full object-cover ${index === 0 ? 'h-64' : 'h-48'}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {details?.whyHeading
                ? `${details.whyHeading} in ${locationName}`
                : `Why Choose Tola Tiles in ${locationName}`}
            </h2>
            <p className="text-xl text-gray-600">
              {details?.whySubtitle ?? 'Local expertise for exceptional results'}
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            {locationContent.sellingPoints.map((point, index) => (
              <div
                key={index}
                className={`${theme.accentLight} rounded-xl p-6 text-center ${theme.accentLightHover} transition-colors duration-300`}
              >
                <div className={`${theme.accentBg} p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4`}>
                  <Star className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="text-gray-800 font-medium text-lg">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included (Features) ─────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What&apos;s Included with Every {service.title} Project in {locationName}
            </h2>
            <p className="text-xl text-gray-600">Comprehensive service for exceptional results</p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationContent.localFeatures.map((feature, index) => (
              <div
                key={`local-${index}`}
                className={`${theme.accentLight} rounded-xl p-6 ${theme.accentLightHover} transition-colors duration-300 border-2 ${theme.accentLightBorder}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${theme.accentBg} p-2 rounded-lg flex-shrink-0`}>
                    <MapPin className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">{feature}</p>
                    <span className={`text-xs ${theme.accentText} font-semibold`}>{locationName} Specialty</span>
                  </div>
                </div>
              </div>
            ))}
            {service.features.map((feature, index) => (
              <div
                key={`base-${index}`}
                className={`bg-white rounded-xl p-6 ${theme.featureHover} transition-colors duration-300`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                  </div>
                  <p className="text-gray-700 font-medium">{feature}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Materials & Styles ─────────────────────────────────────────────── */}
      {details?.materials && details.materials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {service.title} Tile Materials &amp; Styles in {locationName}
              </h2>
              <p className="text-xl text-gray-600">
                Helping {locationName} homeowners choose the right tile for their space and Florida climate
              </p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {details.materials.map((material, index) => (
                <div
                  key={index}
                  className={`rounded-xl border border-gray-200 p-6 ${theme.featureHover} transition-colors duration-300`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`${theme.accentBg} p-2 rounded-lg flex-shrink-0`}>
                      <Layers className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{material.description}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-500 mt-8 text-sm">
              Not sure which material is right for your {locationName} home?{' '}
              <Link href={`${locationPath}/contact`} className={`${theme.accentText} font-medium hover:underline`}>
                Schedule a free consultation →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ── Service Areas ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {service.title} Service Areas in {locationName}
            </h2>
            <p className="text-xl text-gray-600">
              Neighborhoods and communities we serve throughout {locationName}
            </p>
          </header>

          <div className="flex flex-wrap justify-center gap-4">
            {locationContent.areasServed.map((area, index) => (
              <div
                key={index}
                className="bg-white px-6 py-3 rounded-full text-gray-700 font-medium border border-gray-200 hover:border-gray-400 transition-colors duration-300 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Project Gallery ────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {service.title} Projects in {locationName}
            </h2>
            <p className="text-xl text-gray-600">
              Real work completed for {locationName} homeowners
            </p>
          </header>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {galleryImages.map((image) => (
                <article key={image.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src={image.src}
                      alt={`${image.title} — ${service.title} by Tola Tiles in ${locationName}, FL`}
                      width={400}
                      height={256}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                      <div className="text-white p-6">
                        <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                        <p className="text-sm text-gray-200">{image.description}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href={`/${location}/gallery/${galleryKey}`}
              className={`inline-flex items-center gap-2 ${theme.accentText} font-semibold hover:underline transition-colors`}
            >
              View Full {locationName} Gallery
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Installation Process ───────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our {service.title} Process in {locationName}
            </h2>
            <p className="text-xl text-gray-600">
              A proven four-step approach delivering lasting results across {locationName}
            </p>
          </header>

          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((process, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`${theme.accentLightMed} ${theme.accentText} rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto mb-4 ${theme.accentLightMedHover} transition-colors`}
                >
                  {process.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{process.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Accordion ─────────────────────────────────────────────────── */}
      {details?.faqs && details.faqs.length > 0 && (
        <section className="py-16 bg-white" aria-labelledby="faq-heading-loc">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 id="faq-heading-loc" className="text-3xl font-bold text-gray-900 mb-4">
                {service.title} FAQs for {locationName} Homeowners
              </h2>
              <p className="text-xl text-gray-600">
                Common questions from {locationName} residents about our tile installation services
              </p>
            </header>

            <div className="space-y-3">
              {details.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className={`w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-gray-900 ${theme.featureHover} transition-colors duration-200`}
                    aria-expanded={openFaqIndex === index}
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 ${theme.accentText} transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className={`px-6 pb-5 ${theme.accentLight} border-t border-gray-100`}>
                      <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-gray-500 mt-8 text-sm">
              Still have questions about {locationName} tile installation?{' '}
              <Link href={`${locationPath}/contact`} className={`${theme.accentText} font-medium hover:underline`}>
                Contact our local team →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ── Cross-Location Links ────────────────────────────────────────────── */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2 font-medium">This service is also available in:</p>
            <div className="flex justify-center gap-4 flex-wrap mt-4">
              <Link
                href={`/${otherLocation}/services/${serviceIdToSlug[service.id]}`}
                className={`inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${theme.accentText} font-medium`}
              >
                <MapPin className="h-4 w-4" />
                {otherLocationName}
              </Link>
              <Link
                href={`/services/${serviceIdToSlug[service.id]}`}
                className={`inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${theme.accentText} font-medium`}
              >
                <MapPin className="h-4 w-4" />
                All Northeast Florida
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Project Portfolio ──────────────────────────────────────────────── */}
      {serviceIdToProjectSlug[service.id] && (
        <ServiceProjectsSection
          location={location}
          serviceSlug={serviceIdToProjectSlug[service.id]}
          serviceName={service.title}
        />
      )}

      {/* ── Related Services ───────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              More Tile Services in {locationName}
            </h2>
            <p className="text-xl text-gray-600">
              Explore our full range of professional tile installation services in {locationName}
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedServices.map((relatedService, index) => {
              const RelatedIcon = iconMap[relatedService.icon];
              return (
                <Link
                  key={index}
                  href={`/${location}/services/${serviceIdToSlug[relatedService.id]}`}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`${theme.accentLightMed} p-3 rounded-xl ${theme.accentLightMedHover} transition-colors`}>
                      {RelatedIcon && <RelatedIcon className={`h-6 w-6 ${theme.accentText}`} aria-hidden="true" />}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{relatedService.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{relatedService.description}</p>
                  <span className={`${theme.accentText} font-medium flex items-center gap-2 group-hover:gap-3 transition-all`}>
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className={`py-16 ${theme.ctaBg}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your {service.title} Project in {locationName}?
          </h2>
          <p className={`text-xl ${theme.ctaSubtitle} mb-8`}>
            Get a free in-home consultation and detailed quote for your {locationName} project.
            Licensed, insured, and backed by our 2-year installation warranty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${location}/contact`}
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              Schedule Free {locationName} Consultation
            </Link>
            <a
              href={createQuoteEmailLink()}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Mail className="h-5 w-5" />
              Email Quote Request
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPageLocation;
