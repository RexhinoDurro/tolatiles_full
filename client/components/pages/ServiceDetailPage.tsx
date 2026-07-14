'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { CheckCircle, Phone, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { serviceToCategoryMap } from '@/types/api';
import { sampleImages } from '@/data/gallery';
import type { Service } from '@/data/services';
import { serviceDetailsMap } from '@/data/serviceDetails';
import ServiceProjectsSection from '@/components/projects/ServiceProjectsSection';
import { renderRichText } from '@/lib/richText';

const serviceToGalleryPath: Record<string, string> = {
  'kitchen-backsplash': 'backsplashes',
  bathroom: 'showers',
  flooring: 'flooring',
  patio: 'patios',
  fireplace: 'fireplaces',
  shower: 'showers',
};

const serviceIdToProjectSlug: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash',
  bathroom: 'bathroom-tile',
  flooring: 'floor-tile',
  patio: 'patio-tile',
  fireplace: 'fireplace-tile',
  shower: 'shower-tile',
};

const serviceHeroImageMap: Record<string, string> = {
  'kitchen-backsplash': '/images/services/service_hero/tolatiles-kitchen-backsplash-tile-installation-hero.webp',
  bathroom: '/images/services/service_hero/tolatiles-shower-tile-installation-hero.webp',
  flooring: '/images/services/service_hero/tolatiles-floor-tile-installation-hero.webp',
  patio: '/images/services/service_hero/tolatiles-patio-tile-installation-hero.webp',
  fireplace: '/images/services/service_hero/tolatiles-fireplace-tile-installation-hero.webp',
  shower: '/images/services/service_hero/tolatiles-shower-tile-installation-hero.webp',
};

interface DisplayImage {
  id: number;
  src: string;
  title: string;
  description: string;
}

interface ServiceDetailPageProps {
  service: Service;
  relatedServices: Service[];
  serviceIdToSlug: Record<string, string>;
  location?: string;
}

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const ServiceDetailPage = ({
  service,
  relatedServices,
  serviceIdToSlug,
  location = 'florida',
}: ServiceDetailPageProps) => {
  const [galleryImages, setGalleryImages] = useState<DisplayImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const locPrefix = location === 'florida' ? '' : `/${location}`;
  const details = serviceDetailsMap[service.id];
  const locationContent = service.locations.florida;
  const galleryKey = serviceToGalleryPath[service.id] || 'backsplashes';
  const apiCategory = serviceToCategoryMap[service.id] || 'backsplash';

  useEffect(() => {
    const fetchGalleryImages = async () => {
      setIsLoading(true);
      try {
        const images = await api.getGalleryImages(apiCategory);
        if (images.length > 0) {
          setGalleryImages(
            images.slice(0, 6).map((img) => ({
              id: img.id,
              src: img.image_url || img.image,
              title: img.title,
              description: img.description,
            }))
          );
        } else {
          throw new Error("No images found via API");
        }
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
    <div className="overflow-hidden">
      {/* Reserves space for the fixed navbar */}
      <div style={{ height: 'var(--navbar-height)' }} aria-hidden="true" className="bg-white" />
      
      {/* ── Hero Section ─────────────────────────────── */}
      <section
        className="relative w-full flex flex-col bg-white"
        style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}
      >
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50/50 via-white to-gray-50/80" />
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

        {/* Hero Content Container */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col pt-8 md:pt-16 pb-8">
          
          {/* H1 Title - Takes full width on both mobile and desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full flex flex-col items-start text-left mb-6 md:mb-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              {service.title}<br />
              <span className="text-[#00a8e8]">in Northeast FL</span>
            </h1>
          </motion.div>

          {/* Container for Image & Text */}
          <div className="w-full flex flex-col md:flex-row gap-6 md:gap-0 mt-2 md:mt-0">
            
            {/* Image Container: Order 1 on mobile, Order 2 on desktop */}
            <div className="w-full md:w-[40%] flex items-center justify-center md:justify-end order-1 md:order-2 px-4 md:px-0 mb-2 md:mb-0">
              <Image
                src={serviceHeroImageMap[service.id] || '/images/services/service_hero/tolatiles-shower-tile-installation-hero.webp'}
                alt={`${service.title} Installation`}
                width={600}
                height={800}
                className="w-[70%] sm:w-[60%] md:w-full max-h-[220px] sm:max-h-[300px] md:max-h-[500px] object-contain object-center md:object-right drop-shadow-2xl"
                priority
              />
            </div>

            {/* Text & CTAs Container: Order 2 on mobile, Order 1 on desktop */}
            <div className="w-full md:w-[60%] flex flex-col order-2 md:order-1 z-30 pb-6 md:pb-12 md:pr-8">
              
              {/* Description & Checkmarks Container */}
              <div className="flex flex-col items-start w-full mb-6 md:mb-10">
                
                {/* Description (Hidden on mobile, Top on desktop) */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="hidden md:block w-full text-gray-600 text-xl mb-8 leading-relaxed max-w-lg font-medium"
                >
                  {renderRichText(locationContent.localDescription)}
                </motion.p>

                {/* Checkmarks */}
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="w-full flex flex-col gap-3 md:gap-4"
                >
                  {service.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="text-[#00a8e8] w-5 h-5 md:w-6 md:h-6 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800 font-bold text-sm sm:text-base md:text-lg leading-tight">{feature}</span>
                    </li>
                  ))}
                </motion.ul>
              </div>

              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 w-full"
              >
                <Link
                  href="/contact"
                  className="group flex w-full md:flex-1 items-center justify-center gap-2 bg-[#00a8e8] text-white px-4 md:px-8 py-3.5 md:py-4 rounded-none font-bold hover:bg-blue-500 transition-all text-sm sm:text-base shadow-lg shadow-blue-500/20 text-center"
                >
                  Get a Free Estimate
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="tel:+1-904-866-1738"
                  className="flex w-full md:flex-1 items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-900 px-4 md:px-8 py-3.5 md:py-4 rounded-none font-bold hover:bg-gray-50 hover:border-gray-200 transition-all text-sm sm:text-base shadow-sm text-center"
                >
                  <Phone className="w-4 h-4 text-[#00a8e8]" />
                  (904) 866-1738
                </a>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── Serving Jacksonville & St. Augustine ────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.header
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Serving Jacksonville &amp; St. Augustine
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {service.title} backed by local expertise in both of our core service areas.
            </p>
          </motion.header>

          <div className="grid md:grid-cols-2 gap-8">
            {(['jacksonville', 'st-augustine'] as const).map((loc) => {
              const locData = service.locations[loc];
              const locName = loc === 'jacksonville' ? 'Jacksonville' : 'St. Augustine';
              const href = `/${loc}/services/${serviceIdToSlug[service.id]}`;
              return (
                <motion.div
                  key={loc}
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    <Link href={href} className="hover:text-[#00a8e8] transition-colors">
                      {details?.keywordBase ?? service.title} in {locName}, FL
                    </Link>
                  </h3>
                  <ul className="space-y-3 mb-6">
                    {locData.sellingPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-gray-600">
                        <CheckCircle className="text-[#00a8e8] w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1.5 font-bold text-[#00a8e8] hover:text-blue-600 transition-colors"
                  >
                    {service.title} in {locName}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Installation Expertise (Zig-Zag Layout) ────────────────────────────────────────────── */}
      {details?.expertise && details.expertise.length > 0 && (
        <section className="py-24 bg-white relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.header 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
              className="text-center mb-16 md:mb-24"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Our Installation Expertise
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {details?.whySubtitle ?? "We don't just sell tiles—we install the tiles you love with uncompromising precision."}
              </p>
            </motion.header>

            <div className="space-y-16 md:space-y-24">
              {details.expertise.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div 
                    key={index} 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
                    className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${!isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Image Column */}
                    <div className="w-full md:w-1/2 relative">
                      <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                    
                    {/* Text Column */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center text-left">
                      <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                        {item.name}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-lg md:text-xl">
                        {renderRichText(item.description)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Project Portfolio ──────────────────────────────────────────────── */}
      {serviceIdToProjectSlug[service.id] && (
        <ServiceProjectsSection
          location={location as any}
          serviceSlug={serviceIdToProjectSlug[service.id]}
          serviceName={service.title}
        />
      )}

      {/* ── Gallery (Restored Original Layout) ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-white" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                {service.title} Gallery
              </h2>
              <p className="text-lg md:text-xl text-gray-400">
                Flawless execution by our expert installers.
              </p>
            </div>
            <Link
              href={`${locPrefix}/gallery/${galleryKey}`}
              className="group flex items-center gap-2 text-[#00a8e8] font-bold hover:text-blue-400 transition-colors whitespace-nowrap text-lg"
            >
              View Full Portfolio
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-gray-500">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#00a8e8]"></div>
                <div className="w-4 h-4 rounded-full bg-[#00a8e8] animation-delay-200"></div>
                <div className="w-4 h-4 rounded-full bg-[#00a8e8] animation-delay-400"></div>
              </div>
            </div>
          ) : (
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {galleryImages.map((image) => (
                <motion.article 
                  key={image.id} 
                  variants={fadeUpVariant}
                  className="group relative h-[300px] overflow-hidden rounded-xl bg-gray-800"
                >
                  <Image
                    src={image.src}
                    alt={`${image.title} — ${service.title} Installation`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl mb-1">{image.title}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2">{image.description}</p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Installation Process ───────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.header 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Our Installation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional execution from the first phone call to the final walkthrough.
            </p>
          </motion.header>

          <div className="grid md:grid-cols-4 gap-8 md:gap-12">
            {processSteps.map((process, index) => {
              const staticKey = serviceToGalleryPath[service.id] || 'backsplashes';
              const processImgSrc = (sampleImages[staticKey as keyof typeof sampleImages] || sampleImages['backsplashes'])[index]?.src || serviceHeroImageMap[service.id];

              return (
                <motion.div 
                  key={index} 
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} custom={index}
                  className="text-left flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0"
                >
                  {/* Left Side (Text) */}
                  <div className="flex-1">
                    <div className="text-4xl md:text-5xl font-extrabold text-gray-100 mb-2 md:mb-4 tracking-tighter" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                      {process.step}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#00a8e8] mb-2 md:mb-4" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                      {process.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed pr-2 md:pr-0">
                      {renderRichText(process.description)}
                    </p>
                  </div>

                  {/* Right Side (Image - Mobile Only) */}
                  <div className="md:hidden flex-none w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow-lg bg-gray-100 relative">
                    <Image
                      src={processImgSrc}
                      alt={process.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ (Restored Original Style) ───────────────────────────────────────────────────────────── */}
      {details?.faqs && details.faqs.length > 0 && (
        <section className="py-24 bg-gray-50" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.header 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
              className="text-center mb-16"
            >
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                Frequently Asked Questions
              </h2>
            </motion.header>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="space-y-2"
            >
              {details.faqs.map((faq, index) => (
                <motion.div key={index} variants={fadeUpVariant} className="bg-white">
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#00a8e8] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight" 
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            Ready for a Stunning New {service.title}?
          </motion.h2>
          <motion.p 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-xl md:text-2xl text-blue-50 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Purchase the tile you love. We'll provide the expert installation to make it look perfect.
          </motion.p>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={`${locPrefix}/contact`}
              className="bg-white text-gray-900 px-8 py-4 md:py-5 rounded-none font-bold hover:bg-gray-100 hover:scale-105 transition-all text-lg shadow-xl"
            >
              Get a Free Estimate
            </Link>
            <a
              href="tel:+1-904-866-1738"
              className="bg-transparent border-2 border-white text-white px-8 py-4 md:py-5 rounded-none font-bold hover:bg-white hover:text-[#00a8e8] transition-all text-lg"
            >
              Call (904) 866-1738
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPage;
