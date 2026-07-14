'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { serviceToCategoryMap } from '@/types/api';
import { sampleImages } from '@/data/gallery';
import type { Service } from '@/data/services';
import { serviceDetailsMap } from '@/data/serviceDetails';
import ServiceProjectsSection from '@/components/projects/ServiceProjectsSection';
import { renderRichText } from '@/lib/richText';

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

const serviceHeroImageMap: Record<string, string> = {
  'kitchen-backsplash': '/images/services/service_hero/kitchen_services_hero.jpg',
  bathroom: '/images/services/service_hero/shower_services_hero.jpg',
  flooring: '/images/services/service_hero/floor_services_hero.jpg',
  patio: '/images/services/service_hero/patio_services_hero.jpg',
  fireplace: '/images/services/service_hero/fireplace_services_hero.jpg',
  shower: '/images/services/service_hero/shower_services_hero.jpg',
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

  const details = serviceDetailsMap[service.id];
  const locationContent = service.locations[location];
  const galleryKey = serviceToGalleryPath[service.id] || 'backsplashes';
  const apiCategory = serviceToCategoryMap[service.id] || 'backsplash';

  // H1: keyword base + specific city for local SEO
  const h1Text = details
    ? `${details.keywordBase}`
    : `${service.title}`;

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

  const processSteps = details?.processSteps ?? [
    { step: '01', title: 'Consultation', description: 'Free in-home assessment and design planning' },
    { step: '02', title: 'Preparation', description: 'Surface preparation and material delivery' },
    { step: '03', title: 'Installation', description: 'Expert installation by certified craftsmen' },
    { step: '04', title: 'Completion', description: 'Quality inspection and customer walkthrough' },
  ];

  return (
    <div>
      {/* Reserves space for the fixed navbar so the hero image below starts right where the navbar ends */}
      <div style={{ height: 'var(--navbar-height)' }} aria-hidden="true" />
      {/* ── Hero Section (Light Theme for JPG Cutouts) ─────────────────────────────── */}
      <section
        className="relative w-full flex overflow-hidden bg-white"
        style={{ height: 'calc(100vh - var(--navbar-height))' }}
      >
        {/* Background Layer — soft blue to white gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-50 to-white" />

        {/* Service Photo Layer — pinned to right side. White background of JPG blends into the white side of the gradient */}
        <div className="absolute bottom-0 right-0 w-[95%] sm:w-[85%] md:w-[65%] lg:w-[60%] xl:w-[50%] h-[60%] sm:h-[75%] md:h-[90%] pointer-events-none z-20">
          <Image
            src={serviceHeroImageMap[service.id] || '/images/services/service_hero/shower_services_hero.jpg'}
            alt={`${service.title} Installation`}
            fill
            sizes="(max-width: 768px) 95vw, 60vw"
            className="object-contain object-bottom md:object-right-bottom"
            style={{ mixBlendMode: 'darken' }}
            priority
          />
        </div>

        {/* Text Overlay — pinned to top-left */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 flex items-start pt-6 md:pt-10">
          <div className="w-full md:w-[55%] lg:w-[50%] flex flex-col items-start text-left">
            <h1
              className="leading-[1.05] tracking-tight text-gray-900"
              style={{
                fontFamily: 'var(--font-outfit), sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(2rem, 4vw, 4rem)',
                marginBottom: 'clamp(0.5rem, 1.5vh, 1rem)',
              }}
            >
              {h1Text}<br />
              <span className="text-[#00a8e8]">in {locationName} FL</span>
            </h1>

            <p className="text-gray-700 text-base md:text-lg mb-4 md:mb-6 leading-relaxed max-w-xl">
              {renderRichText(locationContent.localDescription)}
            </p>

            <ul className="flex flex-col" style={{ gap: 'clamp(0.25rem, 0.8vh, 0.5rem)' }}>
              {service.features.slice(0, 3).map((item) => (
                <li key={item} className="flex items-center justify-start gap-2">
                  <span
                    className="text-[#00a8e8] font-bold uppercase"
                    style={{
                      fontFamily: 'var(--font-outfit), sans-serif',
                      fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    ✓ {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link
                href={`${locationPath}/contact`}
                className="inline-flex items-center justify-center gap-2 bg-[#00a8e8] text-white px-6 py-3 rounded-none font-bold hover:bg-blue-500 transition-all w-full sm:w-auto text-sm md:text-base"
              >
                Get a Free Estimate
              </Link>
              <a
                href="tel:+1-904-866-1738"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-none font-bold hover:bg-gray-100 transition-all w-full sm:w-auto"
              >
                (904) 866-1738
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              {details?.whyHeading
                ? `${details.whyHeading} in ${locationName}`
                : `Why Choose Tola Tiles in ${locationName}`}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {renderRichText(details?.whySubtitle ?? 'Local expertise for exceptional results')}
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-12">
            {locationContent.sellingPoints.map((point, index) => (
              <div key={index} className="flex flex-col text-left">
                <h3 className="text-2xl font-bold text-[#00a8e8] mb-4" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>0{index + 1}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's Included (Features) ─────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              What&apos;s Included with Every {service.title} Project in {locationName}
            </h2>
            <p className="text-xl text-gray-600">Comprehensive service for exceptional results</p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
            {locationContent.localFeatures.map((feature, index) => (
              <div key={`local-${index}`} className="flex flex-col">
                <p className="text-gray-900 font-bold mb-1 text-lg">{feature}</p>
                <span className="text-sm text-[#00a8e8] font-bold uppercase tracking-wider">{locationName} Specialty</span>
              </div>
            ))}
            {service.features.map((feature, index) => (
              <div key={`base-${index}`} className="flex flex-col justify-center">
                <p className="text-gray-700 font-medium leading-relaxed text-lg">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Materials & Styles ─────────────────────────────────────────────── */}
      {details?.materials && details.materials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                {service.title} Tile Materials &amp; Styles in {locationName}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Helping {locationName} homeowners choose the right tile for their space and Florida climate
              </p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {details.materials.map((material, index) => (
                <div key={index} className="flex flex-col text-left">
                  <h3 className="text-2xl font-bold text-[#00a8e8] mb-4" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>{material.name}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{material.description}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-500 mt-16 text-base">
              Not sure which material is right for your {locationName} home?{' '}
              <Link href={`${locationPath}/contact`} className="text-[#00a8e8] font-bold hover:underline transition-all">
                Schedule a free consultation →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ── Service Areas ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              {service.title} Service Areas in {locationName}
            </h2>
            <p className="text-xl text-gray-600">
              Neighborhoods and communities we serve throughout {locationName}
            </p>
          </header>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {locationContent.areasServed.map((area, index) => (
              <div key={index} className="text-gray-800 font-bold text-lg">
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Project Portfolio ──────────────────────────────────────────────── */}
      {serviceIdToProjectSlug[service.id] && (
        <ServiceProjectsSection
          location={location as any}
          serviceSlug={serviceIdToProjectSlug[service.id]}
          serviceName={service.title}
        />
      )}

      {/* ── Gallery ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                {service.title} Projects in {locationName}
              </h2>
              <p className="text-xl text-gray-600">
                Real work completed for {locationName} homeowners
              </p>
            </div>
            <Link
              href={`/${location}/gallery/${galleryKey}`}
              className="text-[#00a8e8] font-bold hover:underline transition-colors whitespace-nowrap text-lg"
            >
              View Full Portfolio
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-gray-400">
              Loading projects...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {galleryImages.map((image) => (
                <article key={image.id} className="group relative overflow-hidden bg-gray-200 aspect-[4/3]">
                  <Image
                    src={image.src}
                    alt={`${image.title} — ${service.title} Installation`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                    <h3 className="text-white font-bold text-xl mb-2">{image.title}</h3>
                    <p className="text-gray-300 text-base line-clamp-2">{image.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Installation Process ───────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Our {service.title} Process in {locationName}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A proven four-step approach delivering lasting results across {locationName}.
            </p>
          </header>

          <div className="grid md:grid-cols-4 gap-12">
            {processSteps.map((process, index) => (
              <div key={index} className="text-left">
                <div className="text-5xl font-extrabold text-gray-200 mb-4 tracking-tighter" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  {process.step}
                </div>
                <h3 className="text-2xl font-bold text-[#00a8e8] mb-4" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>{process.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{renderRichText(process.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      {details?.faqs && details.faqs.length > 0 && (
        <section className="py-24 bg-white" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                {service.title} FAQs for {locationName} Homeowners
              </h2>
              <p className="text-xl text-gray-600">
                Common questions from {locationName} residents about our tile installation services
              </p>
            </header>

            <div className="space-y-2">
              {details.faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between px-8 py-6 text-left"
                    aria-expanded={openFaqIndex === index}
                  >
                    <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                    <span className="text-[#00a8e8] font-bold text-xl">{openFaqIndex === index ? '−' : '+'}</span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      openFaqIndex === index ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-8 text-gray-600 text-lg leading-relaxed">
                      {renderRichText(faq.answer)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-center text-gray-500 mt-10 text-base">
              Still have questions about {locationName} tile installation?{' '}
              <Link href={`${locationPath}/contact`} className="text-[#00a8e8] font-bold hover:underline transition-all">
                Contact our local team →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ── Cross-Location Links ────────────────────────────────────────────── */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-6 font-bold text-lg">This service is also available in:</p>
            <div className="flex justify-center gap-8 flex-wrap">
              <Link
                href={`/${otherLocation}/services/${serviceIdToSlug[service.id]}`}
                className="text-[#00a8e8] font-bold text-lg hover:underline"
              >
                {otherLocationName}
              </Link>
              <Link
                href={`/services/${serviceIdToSlug[service.id]}`}
                className="text-[#00a8e8] font-bold text-lg hover:underline"
              >
                All Northeast Florida
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Services ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              More Tile Services in {locationName}
            </h2>
            <p className="text-xl text-gray-600">
              Explore our full range of professional tile installation services in {locationName}
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-12">
            {relatedServices.map((relatedService, index) => (
              <div key={index} className="flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>{relatedService.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">{relatedService.description}</p>
                <Link
                  href={`/${location}/services/${serviceIdToSlug[relatedService.id]}`}
                  className="text-[#00a8e8] font-bold text-lg hover:underline"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#00a8e8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
            Ready to Start Your {service.title} Project in {locationName}?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get a free in-home consultation and detailed quote for your {locationName} project.
            Licensed, insured, and backed by our 2-year installation warranty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${location}/contact`}
              className="bg-white text-gray-900 px-8 py-4 rounded-none font-bold hover:bg-gray-100 transition-all text-lg"
            >
              Schedule Free {locationName} Consultation
            </Link>
            <a
              href="tel:+1-904-866-1738"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-none font-bold hover:bg-white hover:text-gray-900 transition-all text-lg"
            >
              Call (904) 866-1738
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPageLocation;
