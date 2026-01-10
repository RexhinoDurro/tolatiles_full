import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Clock, CheckCircle, ArrowRight, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tile Installer St Augustine FL | Professional Tile Installation | Tola Tiles',
  description:
    'Expert tile installation services in St Augustine FL. Kitchen backsplashes, bathroom tiles, flooring, patios & more. Licensed & insured. Free estimates. Call (904) 210-3094.',
  keywords:
    'tile installer St Augustine FL, tile installation St Augustine, bathroom tile St Augustine FL, kitchen backsplash St Augustine, flooring St Augustine FL, tile contractor St Augustine Florida',
  alternates: {
    canonical: 'https://tolatiles.com/st-augustine',
  },
  openGraph: {
    title: 'Tile Installer St Augustine FL | Tola Tiles',
    description:
      'Professional tile installation services in St Augustine FL. Kitchen backsplashes, bathroom tiles, flooring & more. Free estimates!',
    url: 'https://tolatiles.com/st-augustine',
  },
};

const stAugustineSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://tolatiles.com/st-augustine#business',
  name: 'Tola Tiles - St Augustine',
  description:
    'Professional tile installation services in St Augustine FL. Specializing in kitchen backsplashes, bathroom tiles, flooring, patios, and fireplace surrounds.',
  url: 'https://tolatiles.com/st-augustine',
  telephone: '+1-904-210-3094',
  email: 'menitola@tolatiles.com',
  priceRange: '$8-25 per sq ft',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'St Augustine',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '29.8946',
    longitude: '-81.3145',
  },
  areaServed: [
    { '@type': 'City', name: 'St Augustine', addressRegion: 'FL' },
    { '@type': 'City', name: 'St Augustine Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Vilano Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Palm Coast', addressRegion: 'FL' },
    { '@type': 'City', name: 'Ponte Vedra', addressRegion: 'FL' },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '89',
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
    description: 'Custom backsplash designs for St Augustine homes',
    href: '/services/kitchen-backsplash-st-augustine',
  },
  {
    title: 'Bathroom Tile Installation',
    description: 'Complete bathroom renovations and shower surrounds',
    href: '/services/bathroom-tiles-st-augustine',
  },
  {
    title: 'Floor Tiling',
    description: 'Durable flooring solutions for any room',
    href: '/services/flooring-st-augustine',
  },
  {
    title: 'Patio & Outdoor Tiles',
    description: 'Weather-resistant outdoor tile installations',
    href: '/services/patio-tiles-st-augustine',
  },
  {
    title: 'Fireplace Surrounds',
    description: 'Beautiful fireplace tile designs',
    href: '/services/fireplace-tiles-st-augustine',
  },
  {
    title: 'Shower Installation',
    description: 'Custom showers with waterproofing',
    href: '/services/shower-tiles-st-augustine',
  },
];

const stAugustineAreas = [
  'Downtown St Augustine',
  'St Augustine Beach',
  'Vilano Beach',
  'Anastasia Island',
  'Crescent Beach',
  'Butler Beach',
  'Palm Coast',
  'Ponte Vedra',
  'World Golf Village',
  'Nocatee',
  'Hastings',
  'Elkton',
];

export default function StAugustinePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stAugustineSchema) }}
      />

      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5" />
                  <span className="text-emerald-200">Serving St Augustine, FL & St Johns County</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Expert Tile Installer in St Augustine, FL
                </h1>
                <p className="text-xl text-emerald-100 mb-8">
                  Transform your St Augustine home with expert tile installation. From stunning
                  kitchen backsplashes to luxurious bathroom renovations, Tola Tiles delivers
                  exceptional craftsmanship and lasting results in the Ancient City.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 text-center"
                  >
                    Get Free Estimate
                  </Link>
                  <a
                    href="tel:+1-904-210-3094"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-all duration-300 flex items-center justify-center gap-2"
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
                  <span className="text-emerald-100">4.9/5 from 89+ reviews</span>
                </div>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/shower/1.webp"
                  alt="Tile installation St Augustine FL - Bathroom shower example"
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
                Tile Installation Services in St Augustine
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We offer comprehensive tile installation services for residential and commercial
                properties throughout St Augustine and St Johns County.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link
                  key={service.title}
                  href={service.href}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-emerald-50 hover:shadow-lg transition-all duration-300 group"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-emerald-600">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <span className="text-emerald-600 font-medium flex items-center gap-2">
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
                Why St Augustine Homeowners Choose Tola Tiles
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: '15+ Years Experience',
                  description: 'Trusted by St Augustine homeowners for expert craftsmanship',
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
                  <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Local Content Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  St Augustine&apos;s Trusted Tile Installation Experts
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  As St Augustine&apos;s premier tile installation company, Tola Tiles understands
                  the unique needs of homes in the Ancient City. From historic downtown properties
                  to modern beachfront condos, we bring expertise and attention to detail to every
                  project.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Our team specializes in tile installations that complement St Augustine&apos;s
                  coastal climate and architectural heritage. Whether you&apos;re renovating a
                  Spanish Colonial home or updating a contemporary beach house, we deliver
                  beautiful, lasting results.
                </p>
                <ul className="space-y-3">
                  {[
                    'Coastal-resistant tile options for beach homes',
                    'Historic home renovation specialists',
                    'Moisture-resistant bathroom solutions',
                    'Indoor-outdoor living space designs',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/flooring/1.webp"
                  alt="Professional tile flooring installation in St Augustine FL"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                St Augustine Areas We Serve
              </h2>
              <p className="text-xl text-gray-600">
                Professional tile installation throughout St Johns County and surrounding communities
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stAugustineAreas.map((area) => (
                <div
                  key={area}
                  className="bg-white rounded-lg p-4 text-center hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  <span className="text-gray-700 font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your St Augustine Tile Project?
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Contact us today for a free estimate. We serve all of St Augustine and St Johns
              County.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                Schedule Free Consultation
              </Link>
              <a
                href="tel:+1-904-210-3094"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-all duration-300 flex items-center justify-center gap-2"
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
                <Phone className="h-6 w-6 text-emerald-400" />
                <div>
                  <div className="text-sm text-gray-400">Call Us</div>
                  <a href="tel:+1-904-210-3094" className="text-lg font-semibold hover:text-emerald-400">
                    (904) 210-3094
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Clock className="h-6 w-6 text-emerald-400" />
                <div>
                  <div className="text-sm text-gray-400">Hours</div>
                  <div className="text-lg font-semibold">Mon-Fri 8am-6pm, Sat 9am-4pm</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MapPin className="h-6 w-6 text-emerald-400" />
                <div>
                  <div className="text-sm text-gray-400">Service Area</div>
                  <div className="text-lg font-semibold">St Augustine & St Johns County</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
