import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Clock, CheckCircle, ArrowRight, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tile Installation Jacksonville FL | Professional Tile Installers | Tola Tiles',
  description:
    'Expert tile installation services in Jacksonville FL. Kitchen backsplashes, bathroom tiles, flooring, patios & more. Licensed & insured. Free estimates. Call (904) 210-3094.',
  keywords:
    'tile installation Jacksonville FL, tile installer Jacksonville, bathroom tile Jacksonville FL, kitchen backsplash Jacksonville, flooring Jacksonville FL, tile contractor Jacksonville Florida',
  alternates: {
    canonical: 'https://tolatiles.com/jacksonville',
  },
  openGraph: {
    title: 'Tile Installation Jacksonville FL | Tola Tiles',
    description:
      'Professional tile installation services in Jacksonville FL. Kitchen backsplashes, bathroom tiles, flooring & more. Free estimates!',
    url: 'https://tolatiles.com/jacksonville',
  },
};

const jacksonvilleSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://tolatiles.com/jacksonville#business',
  name: 'Tola Tiles - Jacksonville',
  description:
    'Professional tile installation services in Jacksonville FL. Specializing in kitchen backsplashes, bathroom tiles, flooring, patios, and fireplace surrounds.',
  url: 'https://tolatiles.com/jacksonville',
  telephone: '+1-904-210-3094',
  email: 'menitola@tolatiles.com',
  priceRange: '$8-25 per sq ft',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jacksonville',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '30.3322',
    longitude: '-81.6557',
  },
  areaServed: [
    { '@type': 'City', name: 'Jacksonville', addressRegion: 'FL' },
    { '@type': 'City', name: 'Jacksonville Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Atlantic Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Neptune Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Orange Park', addressRegion: 'FL' },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '16:00',
    },
  ],
};

const services = [
  {
    title: 'Kitchen Backsplash Installation',
    description: 'Custom backsplash designs for Jacksonville homes',
    href: '/services/kitchen-backsplash-jacksonville',
  },
  {
    title: 'Bathroom Tile Installation',
    description: 'Complete bathroom renovations and shower surrounds',
    href: '/services/bathroom-tiles-jacksonville',
  },
  {
    title: 'Floor Tiling',
    description: 'Durable flooring solutions for any room',
    href: '/services/flooring-jacksonville',
  },
  {
    title: 'Patio & Outdoor Tiles',
    description: 'Weather-resistant outdoor tile installations',
    href: '/services/patio-tiles-jacksonville',
  },
  {
    title: 'Fireplace Surrounds',
    description: 'Beautiful fireplace tile designs',
    href: '/services/fireplace-tiles-jacksonville',
  },
  {
    title: 'Shower Installation',
    description: 'Custom showers with waterproofing',
    href: '/services/shower-tiles-jacksonville',
  },
];

const jacksonvilleAreas = [
  'Downtown Jacksonville',
  'Jacksonville Beach',
  'Atlantic Beach',
  'Neptune Beach',
  'Ponte Vedra Beach',
  'Orange Park',
  'Mandarin',
  'San Marco',
  'Riverside',
  'Avondale',
  'Southside',
  'Arlington',
];

export default function JacksonvillePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jacksonvilleSchema) }}
      />

      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5" />
                  <span className="text-blue-200">Serving Jacksonville, FL & Surrounding Areas</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Professional Tile Installation in Jacksonville, FL
                </h1>
                <p className="text-xl text-blue-100 mb-8">
                  Transform your Jacksonville home with expert tile installation. From stunning
                  kitchen backsplashes to luxurious bathroom renovations, Tola Tiles delivers
                  exceptional craftsmanship and lasting results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 text-center"
                  >
                    Get Free Estimate
                  </Link>
                  <a
                    href="tel:+1-904-210-3094"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    (904) 210-3094
                  </a>
                </div>
                <div className="flex items-center gap-4 mt-8">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-blue-100">4.9/5 from 127+ reviews</span>
                </div>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/backsplash/1.webp"
                  alt="Tile installation Jacksonville FL - Kitchen backsplash example"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tile Installation Services in Jacksonville
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We offer comprehensive tile installation services for residential and commercial
                properties throughout Jacksonville and Duval County.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link
                  key={service.title}
                  href={service.href}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-blue-50 hover:shadow-lg transition-all duration-300 group"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <span className="text-blue-600 font-medium flex items-center gap-2">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Jacksonville Homeowners Choose Tola Tiles
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: '15+ Years Experience',
                  description: 'Serving Jacksonville since 2008 with expert craftsmanship',
                },
                {
                  title: 'Licensed & Insured',
                  description: 'Fully licensed, bonded, and insured for your protection',
                },
                {
                  title: 'Free Estimates',
                  description: 'No-obligation quotes with transparent, upfront pricing',
                },
                {
                  title: '2-Year Warranty',
                  description: 'Comprehensive warranty on all installation work',
                },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Jacksonville Areas We Serve
              </h2>
              <p className="text-xl text-gray-600">
                Professional tile installation throughout Jacksonville and surrounding communities
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {jacksonvilleAreas.map((area) => (
                <div
                  key={area}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:bg-blue-50 transition-colors"
                >
                  <span className="text-gray-700 font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Jacksonville Tile Project?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Contact us today for a free estimate. We serve all of Jacksonville and surrounding
              areas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                Schedule Free Consultation
              </Link>
              <a
                href="tel:+1-904-210-3094"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call (904) 210-3094
              </a>
            </div>
          </div>
        </section>

        {/* Business Info */}
        <section className="py-12 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center gap-3">
                <Phone className="h-6 w-6 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">Call Us</div>
                  <a href="tel:+1-904-210-3094" className="text-lg font-semibold hover:text-blue-400">
                    (904) 210-3094
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Clock className="h-6 w-6 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">Hours</div>
                  <div className="text-lg font-semibold">Mon-Fri 8am-6pm, Sat 9am-4pm</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MapPin className="h-6 w-6 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">Service Area</div>
                  <div className="text-lg font-semibold">Jacksonville & Surrounding Areas</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
