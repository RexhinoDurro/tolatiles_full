'use client';

import Link from 'next/link';
import { Hammer, ChefHat, Bath, Home, Palette, Wrench, Clock, CheckCircle, ArrowRight, Star, Mail, Phone } from 'lucide-react';
import { services } from '@/data/services';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Hammer,
  ChefHat,
  Bath,
  Home,
  Palette,
  Wrench,
};

const serviceUrlMap: Record<string, string> = {
  'kitchen-backsplash': '/services/kitchen-backsplash-installation-jacksonville',
  bathroom: '/services/bathroom-tile-installation-jacksonville',
  flooring: '/services/floor-tile-installation-jacksonville',
  patio: '/services/patio-tile-installation-jacksonville',
  fireplace: '/services/fireplace-tile-installation-jacksonville',
  shower: '/services/shower-tile-installation-jacksonville',
};

const ServicesPage = () => {
  const createQuoteEmailLink = (serviceName: string) => {
    const subject = encodeURIComponent(`Quote Request - ${serviceName} in Jacksonville`);
    const body = encodeURIComponent(`
Hello Tola Tiles,

I would like to request a quote for ${serviceName} in Jacksonville.

Project Details:
- Service: ${serviceName}
- Location: Jacksonville, FL
- Timeline:
- Budget Range:
- Additional Notes:

Please contact me to discuss this project further.

Thank you,
    `.trim());

    return `mailto:menitola@tolatiles.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <header>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fadeIn">Professional Tile Installation Services in Jacksonville</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-slideInUp">
              Comprehensive tile solutions for residential and commercial properties in Jacksonville, FL. From design consultation to installation and
              maintenance, we&apos;re your trusted tile experts.
            </p>
          </header>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 animate-slideInUp">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" aria-hidden="true" />
              <span>15+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" aria-hidden="true" />
              <span>2-Year Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16" aria-labelledby="services-grid-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="services-grid-heading" className="sr-only">
            Our Tile Installation Services
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon];
              const serviceUrl = serviceUrlMap[service.id];

              return (
                <article
                  key={index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                >
                  {/* Header */}
                  <div className="p-8 pb-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                        {IconComponent && <IconComponent className="h-8 w-8 text-blue-600" aria-hidden="true" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                      </div>
                    </div>

                    {/* Detailed Description */}
                    <p className="text-gray-700 leading-relaxed mb-6">{service.detailedDescription}</p>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s Included:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        <span>{service.timeline}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={serviceUrl}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                        aria-label={`View details and gallery for ${service.title}`}
                      >
                        View Details & Gallery
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <a
                        href={createQuoteEmailLink(service.title)}
                        className="px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center"
                        aria-label={`Email quote request for ${service.title}`}
                        title="Send email quote request"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Process Section */}
          <section className="bg-white rounded-2xl shadow-lg p-12 mb-16" aria-labelledby="process-heading">
            <header className="text-center mb-12">
              <h2 id="process-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Our Process
              </h2>
              <p className="text-xl text-gray-600">How we ensure perfect results every time</p>
            </header>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Consultation', description: 'Free in-home consultation and design planning in Jacksonville' },
                { step: '02', title: 'Material Selection', description: 'Choose from our extensive tile and material library' },
                { step: '03', title: 'Professional Installation', description: 'Expert installation by certified craftsmen' },
                { step: '04', title: 'Quality Inspection', description: 'Thorough quality check and customer walkthrough' },
              ].map((process, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    {process.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{process.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{process.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Service Areas */}
          <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12 mb-16" aria-labelledby="service-areas-heading">
            <header className="text-center mb-8">
              <h2 id="service-areas-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Serving Jacksonville & Surrounding Areas
              </h2>
              <p className="text-xl text-gray-600">Professional tile installation throughout Northeast Florida</p>
            </header>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Jacksonville</h3>
                <p className="text-gray-600 text-sm">All neighborhoods and districts</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">St. Augustine</h3>
                <p className="text-gray-600 text-sm">Historic and modern areas</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Surrounding Areas</h3>
                <p className="text-gray-600 text-sm">Contact us for availability</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white" aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="text-3xl font-bold mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              Get a free consultation and detailed quote for your tile installation needs in Jacksonville. Our experts are ready to help bring your vision
              to life with professional craftsmanship and premium materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Schedule Free Consultation
              </Link>
              <a
                href="tel:+1-904-210-3094"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call (904) 210-3094
              </a>
            </div>

            {/* Guarantees */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-blue-500">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-200" aria-hidden="true" />
                <div className="font-semibold mb-1">Quality Guarantee</div>
                <div className="text-sm text-blue-200">2-year warranty on all work</div>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-200" aria-hidden="true" />
                <div className="font-semibold mb-1">On-Time Completion</div>
                <div className="text-sm text-blue-200">Projects finished as scheduled</div>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-blue-200" aria-hidden="true" />
                <div className="font-semibold mb-1">Satisfaction Promise</div>
                <div className="text-sm text-blue-200">100% customer satisfaction</div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
