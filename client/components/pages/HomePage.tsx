'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  Play,
  X,
  Phone,
  MapPin,
  Award,
  Clock,
  CheckCircle,
  Users,
  Calendar,
  ChefHat,
  Bath,
  Home,
  Hammer,
  Palette,
  Wrench,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ProjectListItem, BlogPostListItem, ProjectLocation } from '@/types/api';
import GoogleReviewsSlider, { type GoogleReviewsData } from '@/components/GoogleReviewsSlider';

// ─── Location content ─────────────────────────────────────────────────────────

interface LocationContent {
  location: 'florida' | 'st-augustine' | 'jacksonville';
  locationName: string;
  locationNameFull: string;
  countyName: string;
  heroH1: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  locationHeading: string;
  locationDescription: string;
  serviceAreas: string[];
  neighborhoods: string[];
  localLandmarks: string[];
  basePath: string;
}

const floridaContent: LocationContent = {
  location: 'florida',
  locationName: 'Florida',
  locationNameFull: 'Northeast Florida',
  countyName: 'Northeast Florida',
  heroH1: 'Tile Installer Jacksonville & St. Augustine, FL — Expert Installation',
  heroTitle: 'Transform Your Space with Premium Tiles',
  heroSubtitle: 'Professional Installation • Quality Materials • Lifetime Warranty',
  heroDescription:
    'Expert tile installation for kitchens, bathrooms, patios, and more. Creating beautiful spaces that last a lifetime across Northeast Florida.',
  locationHeading: 'Serving Northeast Florida',
  locationDescription:
    'Proudly serving Jacksonville, St Augustine, and the greater Northeast Florida area',
  serviceAreas: ['Jacksonville', 'St Augustine', 'Ponte Vedra Beach', 'Palm Coast', 'St. Johns County', 'Duval County'],
  neighborhoods: [],
  localLandmarks: [],
  basePath: '',
};

const stAugustineContent: LocationContent = {
  location: 'st-augustine',
  locationName: 'St Augustine',
  locationNameFull: 'St Augustine, Florida',
  countyName: 'St Johns County',
  heroH1: 'Tile Installer St Augustine FL - Expert Tile Installation Services',
  heroTitle: "St Augustine's Trusted Tile Installation Experts",
  heroSubtitle: 'Serving the Ancient City Since 2008 • Licensed & Insured',
  heroDescription:
    "From historic downtown renovations to beachfront condos, we specialize in tile installation that withstands St Augustine's coastal climate.",
  locationHeading: 'Proudly Serving St Augustine & St Johns County',
  locationDescription:
    'Based in St Augustine, we serve homeowners throughout St Johns County and surrounding communities',
  serviceAreas: ['Downtown St Augustine', 'St Augustine Beach', 'Vilano Beach', 'Anastasia Island', 'Ponte Vedra Beach', 'Nocatee', 'World Golf Village', 'Palencia'],
  neighborhoods: ['Historic District', 'Davis Shores', 'Lighthouse Park', 'St Augustine Shores', 'Hastings', 'Elkton'],
  localLandmarks: ['near Flagler College', 'by the St Augustine Lighthouse', 'close to the Castillo de San Marcos'],
  basePath: '/st-augustine',
};

const jacksonvilleContent: LocationContent = {
  location: 'jacksonville',
  locationName: 'Jacksonville',
  locationNameFull: 'Jacksonville, Florida',
  countyName: 'Duval County',
  heroH1: 'Tile Installer Jacksonville FL - Professional Tile Installation Services',
  heroTitle: "Jacksonville's Premier Tile Installation Company",
  heroSubtitle: 'Serving Jax & the Beaches Since 2008 • Licensed & Insured',
  heroDescription:
    'From Riverside bungalows to San Marco condos and Ponte Vedra beach homes, we deliver expert tile installation across Jacksonville.',
  locationHeading: 'Serving Jacksonville & Duval County',
  locationDescription:
    'Based in Northeast Florida, we serve homeowners throughout Jacksonville, the Beaches, and surrounding Duval County communities',
  serviceAreas: ['Downtown Jacksonville', 'Jacksonville Beach', 'Neptune Beach', 'Atlantic Beach', 'Ponte Vedra', 'Orange Park', 'Mandarin', 'San Marco', 'Riverside', 'Avondale'],
  neighborhoods: ['Ortega', 'Murray Hill', 'Springfield', 'Southside', 'Baymeadows', 'Intracoastal West', 'Deerwood', 'Town Center'],
  localLandmarks: ['near the Jacksonville Landing', 'by TIAA Bank Field', 'close to the St. Johns River'],
  basePath: '/jacksonville',
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const GOOGLE_BUSINESS_URL = 'https://maps.app.goo.gl/YwPC3vTSgi4eRTvK7';
const PHONE_NUMBER = '(904) 866-1738';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tolatiles.com/api';

// ─── Root Component ─────────────────────────────────────────────────────────────

interface HomePageProps {
  location?: 'florida' | 'st-augustine' | 'jacksonville';
}

const HomePage = ({ location = 'florida' }: HomePageProps) => {
  const content =
    location === 'st-augustine'
      ? stAugustineContent
      : location === 'jacksonville'
      ? jacksonvilleContent
      : floridaContent;

  return (
    <>
      <HeroSection content={content} />
      <GoogleReviewsSlider location={location} />
      <ProjectsStripSection location={location} />
      <WhyChooseUsSection />
      {location !== 'florida' && <LocalServicesSection content={content} />}
      {location === 'florida' ? (
        <GeoSplitterSection />
      ) : (
        <CrossCitySection content={content} />
      )}
      <BlogCarouselSection basePath={content.basePath} />
      <LocationSection content={content} />
      <FinalCTASection content={content} />
    </>
  );
};

// ─── Hero Section ──────────────────────────────────────────────────────────────

const HeroSection = ({ content }: { content: LocationContent }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isManualChange, setIsManualChange] = useState(false);
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const sliderRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE}/google-reviews/`);
        if (response.ok) setReviewsData(await response.json());
      } catch {}
    };
    fetchReviews();
  }, []);

  const slides = [
    {
      id: 1,
      title: content.heroH1,
      subtitle: content.heroSubtitle,
      description: content.heroDescription,
      image: '/images/fireplace/1.webp',
      cta: 'View Our Work',
      alt: `Professional tile installation by Tola Tiles in ${content.locationName}`,
    },
    {
      id: 2,
      title: `Luxury Bathroom Tile Installation in ${content.locationName}`,
      subtitle: 'Custom Designs • Expert Craftsmanship • Built for Florida Climate',
      description: `From elegant marble to contemporary ceramics, we create stunning bathroom spaces for ${content.locationName} homeowners.`,
      image: '/images/shower/2.webp',
      cta: 'See Gallery',
      alt: `Luxury bathroom shower tile installation in ${content.locationName}`,
    },
    {
      id: 3,
      title: `Kitchen Backsplash Installation ${content.locationName}`,
      subtitle: 'Stylish Designs • Perfect Installation • Lasting Beauty',
      description: `Enhance your ${content.locationName} kitchen with our expertly installed backsplashes using the finest materials.`,
      image: '/images/backsplash/1.webp',
      cta: 'See Gallery',
      alt: `Modern kitchen backsplash tile installation in ${content.locationName}`,
    },
  ];

  useEffect(() => {
    if (!isManualChange) {
      const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 6000);
      return () => clearInterval(timer);
    } else {
      const timer = setTimeout(() => setIsManualChange(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [slides.length, isManualChange]);

  const nextSlide = () => { setIsManualChange(true); setCurrentSlide((p) => (p + 1) % slides.length); };
  const prevSlide = () => { setIsManualChange(true); setCurrentSlide((p) => (p - 1 + slides.length) % slides.length); };
  const goToSlide = (i: number) => { setIsManualChange(true); setCurrentSlide(i); };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const d = touchStartX.current - touchEndX.current;
    if (d > 50) nextSlide();
    else if (d < -50) prevSlide();
    touchStartX.current = 0; touchEndX.current = 0;
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
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
          aria-hidden={index !== currentSlide}
        >
          <div className="absolute inset-0">
            <Image src={slide.image} alt={slide.alt} fill sizes="100vw" className="object-cover" loading={index === 0 ? 'eager' : 'lazy'} priority={index === 0} quality={80} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          </div>
          <div className="relative z-10 h-full flex items-center pt-20 md:pt-24 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                <div className="overflow-hidden">
                  {index === 0 ? (
                    <h1 className={`text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-6 transform transition-transform duration-1000 delay-300 ${index === currentSlide ? 'translate-y-0' : 'translate-y-full'}`}>
                      {slide.title}
                    </h1>
                  ) : (
                    <h2 className={`text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-6 transform transition-transform duration-1000 delay-300 ${index === currentSlide ? 'translate-y-0' : 'translate-y-full'}`}>
                      {slide.title}
                    </h2>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className={`text-xl md:text-2xl text-blue-300 mb-6 font-medium transform transition-transform duration-1000 delay-500 ${index === currentSlide ? 'translate-y-0' : 'translate-y-full'}`}>
                    {slide.subtitle}
                  </p>
                </div>
                <div className="overflow-hidden">
                  <p className={`text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed transform transition-transform duration-1000 delay-700 ${index === currentSlide ? 'translate-y-0' : 'translate-y-full'}`}>
                    {slide.description}
                  </p>
                </div>
                <div className="overflow-hidden">
                  <div className={`flex flex-col sm:flex-row gap-4 transform transition-transform duration-1000 delay-1000 ${index === currentSlide ? 'translate-y-0' : 'translate-y-full'}`}>
                    <Link href={`${content.basePath}/gallery`} className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group transform hover:scale-105" aria-label={`${slide.cta} - View our ${content.locationName} tile installation gallery`}>
                      {slide.cta}
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href={`${content.basePath}/contact`} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 text-center">
                      Get Free Quote
                    </Link>
                  </div>
                </div>
                {reviewsData && (
                  <div className="mt-8">
                    <a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transform transition-all duration-1000 delay-1200 hover:bg-white/20 max-w-full ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                      <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-4 w-auto flex-shrink-0" />
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-white font-semibold flex-shrink-0">{reviewsData.rating.toFixed(1)}</span>
                        <div className="flex flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(reviewsData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                          ))}
                        </div>
                        <span className="text-white/80 text-xs hidden sm:inline flex-shrink-0">({reviewsData.userRatingCount} reviews)</span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button onClick={prevSlide} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all z-20 group hidden md:block" aria-label="Previous slide">
        <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all z-20 group hidden md:block" aria-label="Next slide">
        <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button key={index} onClick={() => goToSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}`} aria-label={`Go to slide ${index + 1}`} />
        ))}
      </div>

      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-sm md:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-0.5 bg-white/40 rounded" />
          <span>Swipe to navigate</span>
          <div className="w-6 h-0.5 bg-white/40 rounded" />
        </div>
      </div>
    </section>
  );
};

// ─── Projects Strip Section ────────────────────────────────────────────────────

const PLACEHOLDER_PROJECTS: ProjectListItem[] = [
  { id: -1,  title: 'Kitchen Backsplash — Jacksonville',   cover_image: '/images/backsplash/1.webp', cover_media_type: 'image', job_types: ['kitchen-backsplash'], is_featured: true },
  { id: -2,  title: 'Shower Tile Renovation',              cover_image: '/images/shower/2.webp',     cover_media_type: 'image', job_types: ['shower-tile'],        is_featured: false },
  { id: -3,  title: 'Fireplace Tile Surround',             cover_image: '/images/fireplace/3.webp',  cover_media_type: 'image', job_types: ['fireplace-tile'],     is_featured: false },
  { id: -4,  title: 'Floor Tile — Modern Living Room',     cover_image: '/images/flooring/2.webp',   cover_media_type: 'image', job_types: ['floor-tile'],         is_featured: false },
  { id: -5,  title: 'Outdoor Patio Tile',                  cover_image: '/images/patio/3.webp',      cover_media_type: 'image', job_types: ['patio-tile'],         is_featured: false },
  { id: -6,  title: 'Bathroom Tile — St. Augustine',       cover_image: '/images/shower/5.webp',     cover_media_type: 'image', job_types: ['bathroom-tile'],      is_featured: false },
  { id: -7,  title: 'Herringbone Backsplash',              cover_image: '/images/backsplash/4.webp', cover_media_type: 'image', job_types: ['kitchen-backsplash'], is_featured: false },
  { id: -8,  title: 'Stone Fireplace Makeover',            cover_image: '/images/fireplace/6.webp',  cover_media_type: 'image', job_types: ['fireplace-tile'],     is_featured: false },
] as unknown as ProjectListItem[];

const ProjectsStripSection = ({ location }: { location: ProjectLocation }) => {
  const [projects, setProjects] = useState<ProjectListItem[]>(PLACEHOLDER_PROJECTS);
  const [selected, setSelected] = useState<ProjectListItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const slots = await api.getPublicHomepage(location);
        const slotProjects = slots.map((s) => s.project).filter((p): p is ProjectListItem => !!p && !!p.cover_image);
        const serviceProjects = await api.getPublicServiceProjects(location, 'kitchen-backsplash');
        const all = [...slotProjects, ...serviceProjects.filter((p) => p.cover_image)];
        const seen = new Set<number>();
        const deduped = all.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
        if (deduped.length > 0) setProjects(deduped);
      } catch {}
    };
    load();
  }, [location]);

  // Duplicate for seamless loop
  const looped = [...projects, ...projects, ...projects];
  const cardW = 320;
  const gap = 24;
  const totalW = projects.length * (cardW + gap);

  return (
    <section className="py-16 bg-gray-950 overflow-hidden" aria-labelledby="projects-strip-heading">
      <style>{`
        @keyframes strip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${totalW}px); }
        }
        .projects-strip { animation: strip-scroll ${projects.length * 6}s linear infinite; }
        .projects-strip:hover { animation-play-state: paused; }
      `}</style>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors" aria-label="Close">
              <X className="h-8 w-8" />
            </button>
            {selected.cover_media_type === 'video' ? (
              <video src={selected.cover_image!} controls autoPlay className="w-full rounded-xl max-h-[80vh] object-contain" />
            ) : (
              <Image src={selected.cover_image!} alt={selected.title} width={1200} height={800} className="w-full rounded-xl object-contain max-h-[80vh]" />
            )}
            <p className="text-white text-center mt-4 text-lg font-semibold">{selected.title}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 id="projects-strip-heading" className="text-3xl md:text-4xl font-bold text-white mb-2">
          Our Recent Work
        </h2>
        <p className="text-gray-400 text-lg">Real projects from real customers across Northeast Florida</p>
      </div>

      <div className="relative overflow-hidden">
        <div className="projects-strip flex gap-6" style={{ width: 'max-content' }}>
          {looped.map((project, i) => (
            <button
              key={`${project.id}-${i}`}
              onClick={() => setSelected(project)}
              className="group relative rounded-2xl overflow-hidden flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ width: cardW, height: 420 }}
              aria-label={`View project: ${project.title}`}
            >
              {project.cover_media_type === 'video' ? (
                <video
                  src={project.cover_image!}
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                />
              ) : (
                <Image
                  src={project.cover_image!}
                  alt={project.title}
                  fill
                  sizes="320px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-left">
                <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <Play className="h-5 w-5 text-white fill-white" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">
                    {project.cover_media_type === 'video' ? 'Watch video' : 'View project'}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg leading-snug">{project.title}</h3>
                {project.job_types?.length > 0 && (
                  <p className="text-blue-300 text-sm mt-1 capitalize">{project.job_types[0].replace(/-/g, ' ')}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-950 to-transparent" />
      </div>
    </section>
  );
};

// ─── Why Choose Us Section ─────────────────────────────────────────────────────

const teamMembers = [
  { name: 'Gazmend Tola', role: 'Founder & Lead Installer', photo: '/images/team/meni.JPG' },
  { name: 'Albert Tola', role: 'Senior Tile Installer', photo: '/images/team/albert.jpg' },
  { name: 'Our Team', role: 'Expert Installation Crew', photo: '/images/work.jpg' },
  { name: 'Quality Work', role: 'Every Project, Every Time', photo: '/images/backsplash/3.webp' },
];

const stats = [
  { icon: Award, value: '15+', label: 'Years Experience' },
  { icon: CheckCircle, value: '1,500+', label: 'Projects Completed' },
  { icon: Users, value: '4-Person', label: 'Expert Crew' },
  { icon: Clock, value: '2-Year', label: 'Workmanship Warranty' },
];

const WhyChooseUsSection = () => (
  <section className="py-20 bg-white" aria-labelledby="why-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Text side */}
        <div>
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Why Tola Tiles</p>
          <h2 id="why-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            A Family Business Built on Craftsmanship
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Since 2008, Gazmend Tola and his team have been transforming Northeast Florida homes with meticulous tile work. We're not a franchise — every job is handled by our own crew, with the same care we'd put into our own homes.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-gray-500 text-sm">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Meet the Team
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Photos grid */}
        <div className="grid grid-cols-2 gap-3">
          {teamMembers.map((member, i) => (
            <div key={i} className={`relative rounded-2xl overflow-hidden ${i === 0 ? 'row-span-2' : ''}`} style={{ height: i === 0 ? 440 : 210 }}>
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold text-sm">{member.name}</p>
                <p className="text-blue-300 text-xs">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── Geo Splitter (Florida only) ───────────────────────────────────────────────

const GeoSplitterSection = () => {
  const cities = [
    {
      name: 'Jacksonville',
      county: 'Duval County',
      href: '/jacksonville',
      image: '/images/flooring/1.webp',
      description: 'Expert tile installation in Jax, the Beaches, and all of Duval County.',
      services: [
        { label: 'Kitchen Backsplash', href: '/jacksonville/services/kitchen-backsplash' },
        { label: 'Bathroom Tile', href: '/jacksonville/services/bathroom-tile' },
        { label: 'Floor Tile', href: '/jacksonville/services/floor-tile' },
        { label: 'Shower Tile', href: '/jacksonville/services/shower-tile' },
      ],
    },
    {
      name: 'St. Augustine',
      county: 'St Johns County',
      href: '/st-augustine',
      image: '/images/patio/2.webp',
      description: 'Tile specialists for the Ancient City, coastal homes, and historic properties.',
      services: [
        { label: 'Kitchen Backsplash', href: '/st-augustine/services/kitchen-backsplash' },
        { label: 'Bathroom Tile', href: '/st-augustine/services/bathroom-tile' },
        { label: 'Floor Tile', href: '/st-augustine/services/floor-tile' },
        { label: 'Shower Tile', href: '/st-augustine/services/shower-tile' },
      ],
    },
  ];

  return (
    <section className="py-20 bg-gray-50" aria-labelledby="geo-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="geo-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See What We Do In Your Area
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Locally focused tile installation across Northeast Florida's two biggest markets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {cities.map((city) => (
            <article key={city.name} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={city.image}
                  alt={`Tile installation in ${city.name}, FL`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-5 left-6">
                  <h3 className="text-white text-2xl font-bold">{city.name}, FL</h3>
                  <p className="text-blue-300 text-sm">Serving {city.county}</p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <p className="text-gray-600 mb-5">{city.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {city.services.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg border border-gray-100 hover:border-blue-200 transition-all flex items-center gap-1.5"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                      {s.label}
                    </Link>
                  ))}
                </div>

                <Link
                  href={city.href}
                  className="mt-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 group-hover:gap-3"
                >
                  <MapPin className="h-5 w-5" />
                  Explore Tile Installation in {city.name}, FL
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Cross-City (city pages) ───────────────────────────────────────────────────

const CrossCitySection = ({ content }: { content: LocationContent }) => {
  const other =
    content.location === 'st-augustine'
      ? { name: 'Jacksonville', href: '/jacksonville', county: 'Duval County' }
      : { name: 'St Augustine', href: '/st-augustine', county: 'St Johns County' };

  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Also Serving {other.name} & {other.county}</h2>
        <p className="text-gray-600 mb-6">Looking for tile installation in {other.name}? We provide the same expert service throughout {other.county}.</p>
        <Link href={other.href} className="inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all">
          <MapPin className="h-5 w-5" />
          Explore Tile Installation in {other.name}, FL
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
};

// ─── Local Services Section (city pages only) ──────────────────────────────────

const cityServiceCards = [
  {
    slug: 'kitchen-backsplash',
    label: 'Kitchen Backsplash Installation',
    description: 'Custom subway, mosaic, and large-format backsplashes — precision-set with waterproof grout for lasting beauty.',
    icon: ChefHat,
    anchor: 'kitchen backsplash installation',
  },
  {
    slug: 'bathroom-tile',
    label: 'Bathroom Tile Installation',
    description: 'Full bathroom tile transformations — walls, floors, and shower surrounds — from elegant marble to modern porcelain.',
    icon: Bath,
    anchor: 'bathroom tile installation',
  },
  {
    slug: 'floor-tile',
    label: 'Floor Tile Installation',
    description: 'Durable, level floor tile for every room using porcelain, ceramic, and natural stone options.',
    icon: Home,
    anchor: 'floor tile installation',
  },
  {
    slug: 'shower-tile',
    label: 'Shower Tile Installation',
    description: "Fully waterproofed shower systems using Schluter or mud-bed methods — built for Florida's humid climate.",
    icon: Wrench,
    anchor: 'shower tile installation',
  },
  {
    slug: 'patio-tile',
    label: 'Patio Tile Installation',
    description: "Slip-resistant outdoor porcelain and stone tile rated for Florida's heat, UV exposure, and heavy rainfall.",
    icon: Hammer,
    anchor: 'patio tile installation',
  },
  {
    slug: 'fireplace-tile',
    label: 'Fireplace Tile Surround',
    description: 'Heat-rated stone, porcelain, or mosaic tile surrounds that make your fireplace the focal point of any room.',
    icon: Palette,
    anchor: 'fireplace tile installation',
  },
];

const LocalServicesSection = ({ content }: { content: LocationContent }) => {
  const neighborhoodCopy =
    content.location === 'jacksonville'
      ? 'from Riverside bungalows and San Marco condos to Ponte Vedra beach homes and Southside new builds'
      : 'from historic Downtown restoration projects and Anastasia Island condos to Nocatee new builds and Ponte Vedra Beach estates';

  return (
    <section className="py-20 bg-gray-50" aria-labelledby="local-services-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Local Expertise
          </p>
          <h2 id="local-services-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Tile Installation Services in {content.locationNameFull}
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We specialize in tile installation across {content.countyName} —{' '}
            {neighborhoodCopy}. Our licensed crew handles{' '}
            {cityServiceCards.map((s, i) => (
              <span key={s.slug}>
                <Link
                  href={`${content.basePath}/services/${s.slug}`}
                  className="text-blue-600 font-medium hover:text-blue-700 underline underline-offset-2"
                >
                  {i === 0 ? `${s.anchor} in ${content.locationName}` : s.anchor}
                </Link>
                {i < cityServiceCards.length - 2 ? ', ' : i === cityServiceCards.length - 2 ? ', and ' : ''}
              </span>
            ))}
            {' '}— with free estimates and a 2-year workmanship warranty on every project.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cityServiceCards.map(({ slug, label, description, icon: Icon }) => (
            <Link
              key={slug}
              href={`${content.basePath}/services/${slug}`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100 hover:border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {label} in {content.locationName}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                  <span className="inline-flex items-center gap-1 text-blue-600 text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
                    View service
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Blog Carousel Section ─────────────────────────────────────────────────────

const PLACEHOLDER_POSTS: BlogPostListItem[] = [
  {
    id: -1, title: 'How to Choose the Right Tile for Your Kitchen Backsplash',
    slug: '#', excerpt: 'From subway tiles to mosaic glass, we break down the best backsplash options for Florida kitchens — and what to avoid.',
    featured_image: '/images/backsplash/2.webp', featured_image_alt: 'Kitchen backsplash tile options',
    categories: [{ id: 1, name: 'Kitchen', slug: 'kitchen' }],
    location: 'florida', publish_date: '2025-03-15', reading_time: 5,
  },
  {
    id: -2, title: '5 Bathroom Tile Trends Taking Over Northeast Florida Homes',
    slug: '#', excerpt: 'Large-format tiles, bold patterns, and wet-room showers — here are the looks our customers love most this year.',
    featured_image: '/images/shower/3.webp', featured_image_alt: 'Modern bathroom tile trends',
    categories: [{ id: 2, name: 'Bathroom', slug: 'bathroom' }],
    location: 'florida', publish_date: '2025-02-28', reading_time: 4,
  },
  {
    id: -3, title: 'Outdoor Tile vs. Pavers: Which Is Right for Your Florida Patio?',
    slug: '#', excerpt: 'Both have pros and cons in our humid climate. We compare slip resistance, maintenance, cost, and curb appeal side by side.',
    featured_image: '/images/patio/1.webp', featured_image_alt: 'Outdoor patio tile installation',
    categories: [{ id: 3, name: 'Outdoor', slug: 'outdoor' }],
    location: 'florida', publish_date: '2025-01-20', reading_time: 6,
  },
  {
    id: -4, title: 'The Complete Guide to Fireplace Tile Surrounds',
    slug: '#', excerpt: 'Transform a plain fireplace into a focal point. We cover materials, heat ratings, grout choices, and installation tips.',
    featured_image: '/images/fireplace/4.webp', featured_image_alt: 'Fireplace tile surround',
    categories: [{ id: 4, name: 'Fireplace', slug: 'fireplace' }],
    location: 'florida', publish_date: '2024-12-10', reading_time: 7,
  },
  {
    id: -5, title: 'How Long Does Tile Installation Take? A Room-by-Room Breakdown',
    slug: '#', excerpt: 'Wondering how long your project will take? We give realistic timelines for kitchens, bathrooms, floors, and patios.',
    featured_image: '/images/flooring/3.webp', featured_image_alt: 'Floor tile installation timeline',
    categories: [{ id: 5, name: 'Tips', slug: 'tips' }],
    location: 'florida', publish_date: '2024-11-05', reading_time: 4,
  },
  {
    id: -6, title: 'Porcelain vs. Ceramic Tile: What\'s the Difference?',
    slug: '#', excerpt: 'The two most popular tile types explained — density, water absorption, durability, and which one to pick for each room.',
    featured_image: '/images/backsplash/6.webp', featured_image_alt: 'Porcelain vs ceramic tile comparison',
    categories: [{ id: 5, name: 'Tips', slug: 'tips' }],
    location: 'florida', publish_date: '2024-10-22', reading_time: 5,
  },
] as unknown as BlogPostListItem[];

const BlogCarouselSection = ({ basePath }: { basePath: string }) => {
  const [posts, setPosts] = useState<BlogPostListItem[]>(PLACEHOLDER_POSTS);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/blog/posts/?status=published&ordering=-publish_date&page_size=6`);
        if (!res.ok) return;
        const data = await res.json();
        const fetched: BlogPostListItem[] = Array.isArray(data) ? data : data.results || [];
        if (fetched.length > 0) setPosts(fetched);
      } catch {}
    };
    load();
  }, []);

  const visible = 3;
  const max = Math.max(0, posts.length - visible);
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(max, i + 1));

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  return (
    <section className="py-20 bg-white" aria-labelledby="blog-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">Tile Tips & Insights</p>
            <h2 id="blog-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
              From Our Blog
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous posts"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              disabled={idx >= max}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next posts"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
            <Link href={`${basePath}/blog`} className="ml-2 text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${idx * (100 / visible)}%)` }}
          >
            {posts.map((post) => {
              const postHref = post.id < 0 ? `${basePath}/blog` : `${basePath}/blog/${post.slug}`;
              return (
              <article
                key={post.id}
                className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <Link href={postHref} className="block relative h-52 overflow-hidden bg-gray-100">
                  {post.featured_image ? (
                    <Image
                      src={post.featured_image}
                      alt={post.featured_image_alt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-blue-400 text-4xl font-bold opacity-30">TT</span>
                    </div>
                  )}
                </Link>

                <div className="p-5 flex-1 flex flex-col">
                  {post.categories?.length > 0 && (
                    <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">
                      {post.categories[0].name}
                    </span>
                  )}
                  <Link href={postHref}>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.publish_date)}
                    </div>
                    <Link
                      href={postHref}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1 group/link"
                    >
                      Read more
                      <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        {posts.length > visible && (
          <div className="flex justify-center gap-1.5 mt-8">
            {Array.from({ length: max + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-blue-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                aria-label={`Go to post group ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Location Section (unchanged) ─────────────────────────────────────────────

const LocationSection = ({ content }: { content: LocationContent }) => (
  <section className="py-20 bg-gray-50" aria-labelledby="location-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 id="location-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          {content.locationHeading}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">{content.locationDescription}</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
          <iframe
            src="https://maps.google.com/maps?q=445+Hutchinson+Ln,+Saint+Augustine,+FL+32084&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Tola Tiles Location - Serving ${content.locationName}`}
          />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tola Tiles — {content.locationName}</h3>
            <address className="not-italic space-y-3 text-gray-600">
              <p className="flex items-start gap-3">
                <span className="text-blue-600 font-medium">Address:</span>
                <span>445 Hutchinson Ln<br />St Augustine, FL 32084</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-blue-600 font-medium">Phone:</span>
                <a href="tel:+1-904-866-1738" className="hover:text-blue-600 transition-colors">{PHONE_NUMBER}</a>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-blue-600 font-medium">Email:</span>
                <a href="mailto:menitola@tolatiles.com" className="hover:text-blue-600 transition-colors">menitola@tolatiles.com</a>
              </p>
            </address>
          </div>
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">{content.locationName} Service Areas</h4>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              {content.serviceAreas.slice(0, 6).map((area) => (
                <span key={area}>• {area}</span>
              ))}
            </div>
          </div>
          {content.neighborhoods.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">
                Neighborhoods We Serve in {content.locationName}
              </h4>
              <div className="flex flex-wrap gap-2">
                {content.neighborhoods.map((neighborhood) => (
                  <span
                    key={neighborhood}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full"
                  >
                    {neighborhood}
                  </span>
                ))}
              </div>
            </div>
          )}
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

// ─── Final CTA Section (unchanged) ────────────────────────────────────────────

const FinalCTASection = ({ content }: { content: LocationContent }) => (
  <section className="py-16 bg-blue-900 text-white">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Ready to Start Your {content.locationName} Tile Project?
      </h2>
      <p className="text-xl text-blue-100 mb-8">
        Get a free, no-obligation estimate for your tile installation.
        {content.location !== 'florida' && ` Serving ${content.serviceAreas.slice(0, 3).join(', ')}, and more.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, '')}`}
          className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all"
        >
          <Phone className="h-5 w-5" />
          Call {PHONE_NUMBER}
        </a>
        <Link
          href={`${content.basePath}/contact`}
          className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-all"
        >
          Get Free Estimate
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  </section>
);

export default HomePage;
