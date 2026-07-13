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
import type { ProjectListItem, BlogPostListItem } from '@/types/api';
import GoogleReviewsSlider, { type GoogleReviewsData } from '@/components/GoogleReviewsSlider';
import WhatWeDoSection from '@/components/WhatWeDoSection';

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
      <HeroSection />
      <ProjectsStripSection />
      <GoogleReviewsSlider location={location} />

      {location !== 'florida' && <LocalServicesSection content={content} />}
      {location === 'florida' ? (
        <WhatWeDoSection />
      ) : (
        <CrossCitySection content={content} />
      )}
      <BlogCarouselSection basePath={content.basePath} />
      <LocationSection content={content} />
      <FinalCTASection content={content} />
    </>
  );
};

// ─── Projects Strip Section ────────────────────────────────────────────────────

const PLACEHOLDER_PROJECTS: ProjectListItem[] = [
  { id: -1, title: 'Kitchen Backsplash — Jacksonville', cover_image: '/images/backsplash/1.webp', cover_media_type: 'image', job_types: ['kitchen-backsplash'], is_featured: true },
  { id: -2, title: 'Shower Tile Renovation', cover_image: '/images/shower/2.webp', cover_media_type: 'image', job_types: ['shower-tile'], is_featured: false },
  { id: -3, title: 'Fireplace Tile Surround', cover_image: '/images/fireplace/3.webp', cover_media_type: 'image', job_types: ['fireplace-tile'], is_featured: false },
  { id: -4, title: 'Floor Tile — Modern Living Room', cover_image: '/images/flooring/2.webp', cover_media_type: 'image', job_types: ['floor-tile'], is_featured: false },
  { id: -5, title: 'Outdoor Patio Tile', cover_image: '/images/patio/3.webp', cover_media_type: 'image', job_types: ['patio-tile'], is_featured: false },
  { id: -6, title: 'Bathroom Tile — St. Augustine', cover_image: '/images/shower/5.webp', cover_media_type: 'image', job_types: ['bathroom-tile'], is_featured: false },
  { id: -7, title: 'Herringbone Backsplash', cover_image: '/images/backsplash/4.webp', cover_media_type: 'image', job_types: ['kitchen-backsplash'], is_featured: false },
  { id: -8, title: 'Stone Fireplace Makeover', cover_image: '/images/fireplace/6.webp', cover_media_type: 'image', job_types: ['fireplace-tile'], is_featured: false },
] as unknown as ProjectListItem[];

const ProjectsStripSection = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>(PLACEHOLDER_PROJECTS);

  useEffect(() => {
    const load = async () => {
      try {
        const featured = await api.getPublicFeaturedProjects();
        const withCovers = featured.filter((p) => p.cover_image);
        if (withCovers.length > 0) setProjects(withCovers);
      } catch { }
    };
    load();
  }, []);

  // Duplicate for seamless loop
  const looped = [...projects, ...projects, ...projects];
  const cardW = 320;
  const gap = 24;
  const totalW = projects.length * (cardW + gap);

  return (
    <section className="relative pt-24 pb-16 bg-gray-950 overflow-hidden" aria-labelledby="projects-strip-heading">
      {/* Wavy top transition from Hero section */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
        <svg viewBox="0 0 1440 320" className="relative block w-full h-[40px] md:h-[80px] rotate-180" preserveAspectRatio="none">
          <path className="fill-gray-900" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <style>{`
        @keyframes strip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${totalW}px); }
        }
        .projects-strip { animation: strip-scroll ${projects.length * 6}s linear infinite; }
        .projects-strip:hover { animation-play-state: paused; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 id="projects-strip-heading" className="text-3xl md:text-4xl font-bold text-white mb-2">
          Our Recent Work
        </h2>
        <p className="text-gray-400 text-lg">Real projects from real customers across Northeast Florida</p>
      </div>

      <div className="relative overflow-hidden">
        <div className="projects-strip flex gap-6" style={{ width: 'max-content' }}>
          {looped.map((project, i) => (
            <Link
              key={`${project.id}-${i}`}
              href={project.id > 0 ? `/projects/${project.id}` : '/projects'}
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
            </Link>
          ))}
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-950 to-transparent z-10" />
      </div>
    </section>
  );
};

// ─── Hero Section ──────────────────────────────────────────────────────────────

const HeroSection = () => (
  <>
    {/* Reserves space for the fixed navbar so the hero image below starts right where the navbar ends, instead of the image being covered up by it */}
    <div style={{ height: 'var(--navbar-height)' }} aria-hidden="true" />
    <section
      className="relative w-full flex overflow-hidden bg-gray-900"
      aria-labelledby="hero-heading"
      style={{ height: 'calc(100vh - var(--navbar-height))' }}
    >
      {/* Background Layer — stretches to fill */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/team_background.jpg"
          alt="Beautiful tile installation background"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-90"
          priority
        />
      </div>

      {/* People Layer — pinned to bottom right, scales proportionally */}
      <div className="absolute bottom-0 right-0 w-[95%] sm:w-[85%] md:w-[65%] lg:w-[60%] xl:w-[50%] h-[60%] sm:h-[75%] md:h-[90%] pointer-events-none z-20">
        <Image
          src="/images/team_people.png"
          alt="Tola Tiles team — expert tile installers in Jacksonville FL"
          fill
          sizes="(max-width: 768px) 95vw, 60vw"
          className="object-contain object-bottom md:object-right-bottom drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
          priority
        />
      </div>

      {/* Top-left gradient scrim — keeps text readable without covering the team on the right */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/40 md:to-transparent z-10 pointer-events-none" />

      {/* Text Overlay — pinned to top-left */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 flex items-start pt-8 md:pt-12">
        <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col items-start text-left">
          <h1
            id="hero-heading"
            className="leading-[1.05] tracking-tight text-white"
            style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.2rem, 4.5vw, 4rem)',
              marginBottom: 'clamp(0.75rem, 2vh, 1.25rem)',
            }}
          >
            Professional Tile Installers<br />
            <span className="text-[#00a8e8]">in Jacksonville FL</span>
          </h1>

          <ul className="flex flex-col" style={{ gap: 'clamp(0.4rem, 1vh, 0.75rem)' }}>
            {[' Bathrooms, Kitchens, Floors & Backsplashes', 'Honest Pricing With No Surprises', 'Craftsmanship You Can Count On'].map((item) => (
              <li key={item} className="flex items-center justify-start gap-2.5">
                <CheckCircle
                  className="text-green-400 flex-shrink-0"
                  style={{ width: 'clamp(1.1rem, 1.5vw, 1.5rem)', height: 'clamp(1.1rem, 1.5vw, 1.5rem)' }}
                />
                <span
                  className="text-white/90 font-semibold uppercase"
                  style={{
                    fontFamily: 'var(--font-outfit), sans-serif',
                    fontSize: 'clamp(0.8rem, 1.3vw, 1rem)',
                    letterSpacing: '0.12em',
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#00a8e8] text-white px-6 py-3.5 rounded-lg font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
            >
              Get a Free Estimate
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href={GOOGLE_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
            >
              <img
                src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
                alt="Google"
                className="h-5 w-auto flex-shrink-0"
              />
              <div className="flex items-center gap-1.5 min-w-0 border-l border-white/20 pl-3 ml-1">
                <span className="text-white font-bold flex-shrink-0">5.0</span>
                <div className="flex flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  </>
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
      } catch { }
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

const FinalCTASection = ({ content }: { content: LocationContent }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 overflow-hidden bg-blue-950"
      aria-labelledby="final-cta-heading"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/team_background.jpg"
          alt="Tola Tiles team background"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Dark Blue Gradient Overlay (with transparency so image shows through) */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-900/40 z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left Side: Text and Buttons (Slides in from Left) */}
          <div
            className={`w-full md:w-1/2 text-center md:text-left transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16'
              }`}
          >
            <h2 id="final-cta-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Start Your {content.locationName} Tile Project?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto md:mx-0">
              Get a free, no-obligation estimate for your tile installation.
              {content.location !== 'florida' && ` Serving ${content.serviceAreas.slice(0, 3).join(', ')}, and more.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Phone className="h-6 w-6" />
                Call {PHONE_NUMBER}
              </a>
              <Link
                href={`${content.basePath}/contact`}
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Free Estimate
                <ArrowRight className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Right Side: Truck Image (Slides in from Right) */}
          <div
            className={`w-full md:w-1/2 flex justify-center md:justify-end transition-all duration-1000 delay-200 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
              }`}
          >
            <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96" style={{ minHeight: '300px' }}>
              <Image
                src="/images/truck_photo.png"
                alt="Tola Tiles Work Truck"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-right"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomePage;
