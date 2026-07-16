'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Award, Users, Clock, Shield, Star, Heart, Target, Lightbulb } from 'lucide-react';
import { teamMembers } from '@/data/team';

interface AboutLocationContent {
  heroH1: string;
  heroSubtitle: string;
  localStoryParagraph: string;
  whyChooseHeading: string;
}

const locationContent: Record<string, AboutLocationContent> = {
  jacksonville: {
    heroH1: "About Tola Tiles - Jacksonville's Premier Tile Installation Company",
    heroSubtitle:
      "Transforming homes across Duval County with exceptional craftsmanship since 2008. From Riverside lofts to Mandarin family homes, we're the River City's most trusted tile artisans.",
    localStoryParagraph:
      "Over the years, we've completed hundreds of projects across Jacksonville and Duval County — from elegant kitchen backsplashes in San Marco bungalows to expansive floor installations in Ortega estates. Our deep familiarity with Jacksonville's diverse architectural styles, from historic Riverside homes to modern Southside condos, allows us to recommend the perfect materials and techniques for every project. We understand the River City's humidity and climate demands, ensuring every installation is built to last in Northeast Florida conditions.",
    whyChooseHeading: "Why Jacksonville Homeowners Choose Tola Tiles",
  },
  'st-augustine': {
    heroH1: "About Tola Tiles - St Augustine's Trusted Tile Installation Experts",
    heroSubtitle:
      "Bringing masterful tile craftsmanship to the Ancient City and St. Johns County since 2008. We specialize in both historic renovations and modern coastal installations.",
    localStoryParagraph:
      "Based right here in St. Augustine, we've earned the trust of homeowners throughout St. Johns County — from meticulous restorations in the Historic District to contemporary builds in Nocatee and World Golf Village. Our team understands the unique challenges of coastal construction, including salt air exposure, humidity management, and preserving the character of older homes on Anastasia Island and in Lincolnville. Living and working in the Ancient City gives us first-hand knowledge of what materials and methods perform best in our coastal climate.",
    whyChooseHeading: "Why St. Augustine Homeowners Choose Tola Tiles",
  },
  florida: {
    heroH1: "About Tola Tiles - Northeast Florida's Trusted Tile Installers",
    heroSubtitle:
      "Transforming spaces across Northeast Florida with exceptional craftsmanship since 2008. We're not just tile installers — we're artisans who bring your vision to life with precision, passion, and an unwavering commitment to quality.",
    localStoryParagraph:
      "From our home base in St. Augustine, we serve homeowners and businesses throughout the greater Northeast Florida region — including Jacksonville, Ponte Vedra, Palm Coast, and surrounding communities. Our broad regional experience means we've worked with every style of home in the area, from historic properties along the coast to brand-new construction in master-planned communities. With over 1,500 completed projects across Duval, St. Johns, and Flagler counties, we bring unmatched local expertise to every tile installation.",
    whyChooseHeading: "Why Northeast Florida Chooses Tola Tiles",
  },
};

interface AboutPageProps {
  location?: string;
}

const AboutPage = ({ location = 'florida' }: AboutPageProps) => {
  const content = locationContent[location] || locationContent.florida;

  return (
    <div className="pt-[var(--navbar-height)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16">
            <header className="text-center md:text-left md:w-[58%]">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fadeIn">{content.heroH1}</h1>
              <p className="text-lg md:text-2xl text-gray-600 leading-relaxed animate-slideInUp">
                {content.heroSubtitle}
              </p>
            </header>
            <div className="w-full md:w-[42%] flex justify-center md:justify-end">
              <div className="relative w-full max-w-md h-64 md:h-80">
                <Image
                  src="/images/tolatiles-installation-team-group-photo.webp"
                  alt="The Tola Tiles team — expert tile installers in Jacksonville and St. Augustine FL"
                  fill
                  sizes="(max-width: 768px) 80vw, 40vw"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 animate-slideInUp">
            <div className="text-center bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-4xl font-bold text-brand-ink mb-2">1,500+</div>
              <div className="text-gray-600 font-medium">Projects Completed</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-4xl font-bold text-brand-ink mb-2">15+</div>
              <div className="text-gray-600 font-medium">Years of Excellence</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-4xl font-bold text-brand-ink mb-2">98%</div>
              <div className="text-gray-600 font-medium">Customer Satisfaction</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 border border-gray-100">
              <div className="text-4xl font-bold text-brand-ink mb-2">2-Year</div>
              <div className="text-gray-600 font-medium">Quality Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20" aria-labelledby="story-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slideInLeft">
              <h2 id="story-heading" className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  What started as a small family business in 2008 has grown into the region&apos;s most trusted tile installation company. Founded by{' '}
                  <span>Gazmend Tola</span> with just a vision for exceptional craftsmanship, we&apos;ve built our reputation one perfectly placed tile
                  at a time.
                </p>
                <p>
                  {content.localStoryParagraph}
                </p>
                <p>
                  Today, our team of certified craftsmen and design experts continues to push the boundaries of what&apos;s possible in tile
                  installation, combining traditional techniques with innovative approaches to create spaces that are both beautiful and built to last.
                </p>
              </div>

              <div className="mt-8 flex items-center space-x-6">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-[#00a8e8] mr-2" aria-hidden="true" />
                  <span className="text-gray-700 font-medium">Licensed & Insured</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-[#00a8e8] mr-2" aria-hidden="true" />
                  <span className="text-gray-700 font-medium">Bonded & Certified</span>
                </div>
              </div>
            </div>

            <div className="animate-slideInRight">
              <TeamSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 id="values-heading" className="text-4xl font-bold text-gray-900 mb-6">
              What Drives Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values guide every decision we make and every tile we place. These principles have shaped our company culture and earned the
              trust of our clients.
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: 'Precision First',
                description:
                  'Every measurement, every cut, every placement is executed with meticulous precision. We believe that excellence lies in the details.',
              },
              {
                icon: Heart,
                title: 'Customer Devotion',
                description:
                  "Your satisfaction isn't just our goal—it's our passion. We listen, communicate, and go above and beyond to exceed your expectations.",
              },
              {
                icon: Shield,
                title: 'Uncompromising Quality',
                description:
                  "We use only premium materials and proven techniques. Quality isn't negotiable—it's the foundation of everything we do.",
              },
              {
                icon: Lightbulb,
                title: 'Innovative Solutions',
                description:
                  'We stay ahead of industry trends and continuously innovate our techniques to provide cutting-edge solutions for every challenge.',
              },
            ].map((value, index) => {
              const IconComponent = value.icon;
              return (
                <article
                  key={index}
                  className="text-center p-8 bg-white rounded-xl border border-gray-100"
                >
                  <div className="bg-[#e6f6fd] p-4 rounded-full w-20 h-20 mx-auto mb-6">
                    <IconComponent className="h-12 w-12 text-[#00a8e8] mx-auto" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="relative py-20" aria-labelledby="mission-heading">
        {/* Wavy top transition from Values section */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg viewBox="0 0 1440 320" className="relative block w-full h-[40px] md:h-[80px] rotate-180" preserveAspectRatio="none">
            <path className="fill-gray-50" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="mission-heading" className="text-4xl font-bold text-gray-900 mb-8">
            Our Mission
          </h2>
          <blockquote className="text-2xl text-gray-700 leading-relaxed italic font-light">
            &quot;To transform ordinary spaces into extraordinary experiences through masterful tile installation, innovative design, and unwavering
            commitment to craftsmanship. We believe that every room has the potential to become a work of art, and we&apos;re honored to be the
            artisans who bring that vision to life.&quot;
          </blockquote>
          <footer className="mt-8 text-gray-600 font-medium">- Gazmend Tola, Founder</footer>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-20 bg-gradient-to-r from-[#00a8e8] to-[#0097d2]" aria-labelledby="why-choose-heading">
        {/* Wavy top transition from Mission section */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg viewBox="0 0 1440 320" className="relative block w-full h-[40px] md:h-[80px] rotate-180" preserveAspectRatio="none">
            <path className="fill-white" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,197.3C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 id="why-choose-heading" className="text-4xl font-bold text-white mb-6">
              {content.whyChooseHeading}
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              When you choose us, you&apos;re not just hiring contractors—you&apos;re partnering with passionate craftsmen who care about your project
              as much as you do.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Expert Team',
                description:
                  'Our certified professionals bring decades of combined experience and ongoing training to ensure the highest standards of installation.',
              },
              {
                icon: Clock,
                title: 'Reliable Timeline',
                description:
                  'We respect your time and schedule. Our detailed project planning ensures we complete your installation on time, every time.',
              },
              {
                icon: Star,
                title: 'Lifetime Partnership',
                description:
                  "Our relationship doesn't end when the project is complete. We provide ongoing support, maintenance advice, and are always here when you need us.",
              },
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center text-white">
                  <IconComponent className="h-16 w-16 mx-auto mb-6 text-blue-200" aria-hidden="true" />
                  <h3 className="text-2xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-blue-100 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

// Team Slider Component
const TeamSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamMembers.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % teamMembers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentMember = teamMembers[currentSlide];

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Team Member Card */}
      <div className="p-8">
        <div className="text-center mb-6">
          <div className="relative mx-auto mb-6">
            <Image
              src={currentMember.image}
              alt={`${currentMember.name} - ${currentMember.position} at Tola Tiles`}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-100"
            />
            <div className="absolute -bottom-2 -right-2 bg-brand-ink text-white text-xs px-2 py-1 rounded-full">{currentMember.experience}</div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-1">{currentMember.name}</h3>
          <p className="text-brand-ink font-semibold mb-4">{currentMember.position}</p>

          <blockquote className="text-gray-600 italic mb-6 text-sm leading-relaxed">&quot;{currentMember.quote}&quot;</blockquote>
        </div>

        <div className="text-left">
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{currentMember.bio}</p>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Specialties:</h4>
            <div className="flex flex-wrap gap-2">
              {currentMember.specialties.map((specialty, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Previous team member"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Next team member"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {teamMembers.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#00a8e8] scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
            aria-label={`Go to team member ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
