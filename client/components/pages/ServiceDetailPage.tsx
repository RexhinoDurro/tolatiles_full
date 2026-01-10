'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Hammer, ChefHat, Bath, Home, Palette, Wrench, Clock, CheckCircle, ArrowRight, ChevronRight, Phone, Mail, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { serviceToCategoryMap } from '@/types/api';
import { sampleImages } from '@/data/gallery';
import type { Service } from '@/data/services';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Hammer,
  ChefHat,
  Bath,
  Home,
  Palette,
  Wrench,
};

// Map for gallery URL path
const serviceToGalleryPath: Record<string, string> = {
  'kitchen-backsplash': 'backsplashes',
  bathroom: 'showers',
  flooring: 'flooring',
  patio: 'patios',
  fireplace: 'fireplaces',
  shower: 'showers',
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
}

const ServiceDetailPage = ({ service, relatedServices, serviceIdToSlug }: ServiceDetailPageProps) => {
  const [galleryImages, setGalleryImages] = useState<DisplayImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const IconComponent = iconMap[service.icon];
  const galleryKey = serviceToGalleryPath[service.id] || 'backsplashes';
  const apiCategory = serviceToCategoryMap[service.id] || 'backsplash';

  // Fetch gallery images from API with fallback
  useEffect(() => {
    const fetchGalleryImages = async () => {
      setIsLoading(true);
      try {
        const images = await api.getGalleryImages(apiCategory);
        const formattedImages = images.slice(0, 6).map((img) => ({
          id: img.id,
          src: img.image_url || img.image,
          title: img.title,
          description: img.description,
        }));
        setGalleryImages(formattedImages);
      } catch (err) {
        console.warn('API fetch failed, using static data:', err);
        // Fall back to static data
        const staticKey = service.id === 'kitchen-backsplash' ? 'backsplashes' :
                          service.id === 'bathroom' ? 'showers' :
                          service.id === 'patio' ? 'patios' :
                          service.id === 'fireplace' ? 'fireplaces' :
                          service.id === 'shower' ? 'showers' :
                          'flooring';
        const staticImages = (sampleImages[staticKey as keyof typeof sampleImages] || []).slice(0, 6);
        setGalleryImages(staticImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryImages();
  }, [service.id, apiCategory]);

  const createQuoteEmailLink = () => {
    const subject = encodeURIComponent(`Quote Request - ${service.title} in Jacksonville`);
    const body = encodeURIComponent(`
Hello Tola Tiles,

I would like to request a quote for ${service.title} in Jacksonville.

Project Details:
- Service: ${service.title}
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
      {/* Breadcrumb */}
      <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </li>
            <li>
              <Link href="/services" className="text-gray-500 hover:text-blue-600">
                Services
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </li>
            <li>
              <span className="text-gray-900 font-medium" aria-current="page">
                {service.title}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-600 p-3 rounded-xl">
                  {IconComponent && <IconComponent className="h-8 w-8 text-white" aria-hidden="true" />}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>Typical timeline: {service.timeline}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{service.title} in Jacksonville</h1>

              <p className="text-xl text-gray-700 mb-8 leading-relaxed">{service.detailedDescription}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Get Free Quote
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="tel:+1-904-210-3094"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
              </div>
            </div>

            <div className="relative">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {galleryImages.slice(0, 4).map((image, index) => (
                    <div key={image.id} className={`rounded-xl overflow-hidden shadow-lg ${index === 0 ? 'col-span-2' : ''}`}>
                      <Image
                        src={image.src}
                        alt={`${service.title} example - ${image.title}`}
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

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What&apos;s Included</h2>
            <p className="text-xl text-gray-600">Comprehensive service for exceptional results</p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-blue-50 transition-colors duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                  </div>
                  <p className="text-gray-700 font-medium">{feature}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Gallery</h2>
            <p className="text-xl text-gray-600">See examples of our {service.title.toLowerCase()} work</p>
          </header>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {galleryImages.map((image) => (
                <article key={image.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src={image.src}
                      alt={`${image.title} - ${image.description}`}
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
              href={`/gallery/${galleryKey}`}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              View Full Gallery
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Installation Process</h2>
            <p className="text-xl text-gray-600">How we ensure exceptional results</p>
          </header>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Consultation', description: 'Free in-home assessment and design planning' },
              { step: '02', title: 'Preparation', description: 'Surface preparation and material delivery' },
              { step: '03', title: 'Installation', description: 'Expert installation by certified craftsmen' },
              { step: '04', title: 'Completion', description: 'Quality inspection and customer walkthrough' },
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
        </div>
      </section>

      {/* Related Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Related Services</h2>
            <p className="text-xl text-gray-600">Explore our other tile installation services</p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedServices.map((relatedService, index) => {
              const RelatedIcon = iconMap[relatedService.icon];
              return (
                <Link
                  key={index}
                  href={`/services/${serviceIdToSlug[relatedService.id]}`}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                      {RelatedIcon && <RelatedIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{relatedService.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{relatedService.description}</p>
                  <span className="text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Space?</h2>
          <p className="text-xl text-blue-100 mb-8">Get a free consultation and quote for your {service.title.toLowerCase()} project in Jacksonville.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              Schedule Free Consultation
            </Link>
            <a
              href={createQuoteEmailLink()}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
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

export default ServiceDetailPage;
