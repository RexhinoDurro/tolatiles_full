'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, CheckCircle, Send, AlertCircle, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { extractPhoneDigits, formatPhoneNumber } from '@/lib/phoneUtils';
import type { ContactFormData } from '@/types/api';

interface ContactLocationContent {
  heroH1: string;
  heroSubtitle: string;
  serviceAreasDescription: string;
  serviceAreasList: string[];
  mapHeading: string;
}

const locationContent: Record<string, ContactLocationContent> = {
  jacksonville: {
    heroH1: 'Contact Tola Tiles Jacksonville - Free Tile Installation Estimates',
    heroSubtitle: 'Get in touch to discuss your tile installation project anywhere in Duval County',
    serviceAreasDescription: 'We proudly serve Jacksonville and all of Duval County, from the urban core to the beaches.',
    serviceAreasList: ['Riverside', 'San Marco', 'Mandarin', 'Southside', 'Jacksonville Beach', 'Neptune Beach', 'Ortega', 'Avondale'],
    mapHeading: 'Serving All of Jacksonville & Duval County',
  },
  'st-augustine': {
    heroH1: 'Contact Tola Tiles St Augustine - Free Tile Installation Estimates',
    heroSubtitle: 'Get in touch to discuss your tile installation project in the Ancient City and St. Johns County',
    serviceAreasDescription: 'Located in St. Augustine, we serve the entire St. Johns County area and surrounding coastal communities.',
    serviceAreasList: ['Historic District', 'Vilano Beach', 'Anastasia Island', 'Nocatee', 'World Golf Village', 'Palencia', 'St. Augustine Beach', 'Davis Shores'],
    mapHeading: 'Located in St. Augustine - Serving St. Johns County',
  },
  florida: {
    heroH1: 'Contact Tola Tiles - Northeast Florida Tile Installation',
    heroSubtitle: 'Get in touch to discuss your tile installation project anywhere in Northeast Florida',
    serviceAreasDescription: 'Based in St. Augustine, we serve the greater Northeast Florida region within a 50-mile radius.',
    serviceAreasList: ['St. Augustine', 'Jacksonville', 'Ponte Vedra Beach', 'Palm Coast', 'St. Johns County', 'Duval County', 'Flagler County', 'Green Cove Springs'],
    mapHeading: 'Where We Are Established',
  },
};

interface ContactPageProps {
  location?: string;
}

const ContactPage = ({ location = 'florida' }: ContactPageProps) => {
  const content = locationContent[location] || locationContent.florida;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
  });

  const [honeypot, setHoneypot] = useState('');
  const mountTimeRef = useRef<number>(Date.now());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = extractPhoneDigits(e.target.value);
    setFormData((prev) => ({ ...prev, phone: digits }));
  };

  // Map display values to API values
  const projectTypeMap: Record<string, string> = {
    'Kitchen Backsplash': 'kitchen-backsplash',
    'Bathroom Tiles': 'bathroom',
    'Flooring': 'flooring',
    'Patio/Outdoor': 'patio',
    'Fireplace': 'fireplace',
    'Commercial': 'commercial',
    'Other': 'other',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Prepare data for API
      const fillTime = Math.floor((Date.now() - mountTimeRef.current) / 1000);
      const apiData: ContactFormData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone ? `+1${formData.phone}` : undefined,
        project_type: projectTypeMap[formData.projectType] || formData.projectType,
        message: formData.message,
        honeypot: honeypot,
        form_fill_time: fillTime,
      };

      // Submit to API
      await api.submitContactForm(apiData);

      // Success
      setSubmitStatus('success');
      setHoneypot('');
      mountTimeRef.current = Date.now();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        projectType: '',
        message: '',
      });
    } catch (err) {
      console.error('Form submission failed:', err);
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-[var(--navbar-height)]">
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
          
          <header className="text-center md:text-left mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{content.heroH1}</h1>
            <a href="tel:+1-904-866-1738" className="inline-flex items-center justify-center md:justify-start gap-3 text-2xl md:text-3xl font-bold text-brand-ink hover:text-[#00a8e8] transition-colors">
              <Phone className="h-7 w-7 md:h-8 md:w-8" />
              (904) 866-1738
            </a>
          </header>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left Column on Desktop / Bottom on Mobile */}
            <div className="order-2 lg:order-1 flex flex-col gap-12">
              <div className="relative w-full max-w-lg mx-auto lg:mx-0 h-56 md:h-72 lg:-mt-6">
                <Image
                  src="/images/tolatiles-service-truck-jacksonville-st-augustine.webp"
                  alt="Tola Tiles work truck — free estimates, (904) 866-1738"
                  fill
                  sizes="(max-width: 768px) 90vw, 50vw"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">Get in Touch</h2>

              <div className="space-y-6 mb-12">
                <div className="flex items-center group">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <Phone className="h-6 w-6 text-[#00a8e8]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <a href="tel:+1-904-866-1738" className="text-lg text-gray-700 hover:text-[#00a8e8] transition-colors">
                      +1 (904) 866-1738
                    </a>
                  </div>
                </div>

                <div className="flex items-center group">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <Mail className="h-6 w-6 text-[#00a8e8]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <a href="mailto:menitola@tolatiles.com" className="text-lg text-gray-700 hover:text-[#00a8e8] transition-colors">
                      menitola@tolatiles.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center group">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <MapPin className="h-6 w-6 text-[#00a8e8]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Address</div>
                    <address className="text-lg text-gray-700 not-italic">
                      445 Hutchinson Ln
                      <br />
                      Saint Augustine, FL 32095
                    </address>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-[#00a8e8] mr-3" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                </div>
                <p className="text-gray-600">
                  Call{' '}
                  <a href="tel:+1-904-866-1738" className="text-[#00a8e8] hover:underline font-semibold">
                    (904) 866-1738
                  </a>{' '}
                  for our current hours.
                </p>
              </div>

              {/* Service Areas */}
              <div className="mt-8 p-6 border border-gray-200 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Areas</h3>
                <p className="text-gray-600 mb-4">{content.serviceAreasDescription}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  {content.serviceAreasList.map((area, index) => (
                    <div key={index}>{area}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column on Desktop / Top on Mobile: Contact Form */}
          <div className="order-1 lg:order-2">
              <div className="bg-brand-ink p-8 rounded-2xl shadow-xl text-white">
                <h2 className="text-3xl font-semibold mb-8">Request a Free Quote</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-white/10 border border-green-400 rounded-lg flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-white">
                    <p className="font-medium">Thank you for your inquiry!</p>
                    <p className="text-sm mt-1 text-white/80">We&apos;ve received your message and will respond within 24 hours.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-white/10 border border-red-400 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-white">
                    <p className="font-medium">Unable to submit form</p>
                    <p className="text-sm mt-1 text-white/80">{errorMessage || 'Please try again or call us directly at +1 (904) 866-1738.'}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - hidden from real users */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <label htmlFor="company_website">Company Website</label>
                  <input
                    type="text"
                    id="company_website"
                    name="company_website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white/90 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a8e8] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white/90 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a8e8] transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a8e8] transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white/90 mb-2">
                    Phone *
                  </label>
                  <div className="relative flex">
                    {formData.phone && (
                      <span className="inline-flex items-center px-3 border border-transparent border-r-gray-200 rounded-l-lg bg-gray-50 text-gray-700 font-bold text-sm select-none">
                        +1
                      </span>
                    )}
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formatPhoneNumber(formData.phone)}
                      onChange={handlePhoneChange}
                      required
                      className={`w-full px-4 py-3 bg-white border border-transparent focus:outline-none focus:ring-2 focus:ring-[#00a8e8] transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                        formData.phone ? 'rounded-r-lg' : 'rounded-lg'
                      }`}
                      placeholder="(904) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-white/90 mb-2">
                    Project Type *
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a8e8] transition-all duration-200 text-gray-900"
                  >
                    <option value="">Select a service...</option>
                    <option value="Kitchen Backsplash">Kitchen Backsplash</option>
                    <option value="Bathroom Tiles">Bathroom Tiles</option>
                    <option value="Flooring">Flooring</option>
                    <option value="Patio/Outdoor">Patio/Outdoor</option>
                    <option value="Fireplace">Fireplace</option>
                    <option value="Commercial">Commercial Project</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a8e8] transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                    placeholder="Tell us about your project, including size, timeline, and any specific requirements..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00a8e8] text-white py-4 px-6 rounded-lg hover:bg-blue-400 disabled:bg-blue-300 transition-all duration-300 font-bold transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Quote Request
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-sm text-white/70 text-center">
                <p>
                  * Required fields. We&apos;ll respond within 24 hours.
                  <br />
                  For immediate assistance, call{' '}
                  <a href="tel:+1-904-866-1738" className="text-[#00a8e8] hover:underline font-semibold">
                    +1 (904) 866-1738
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">{content.mapHeading}</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[400px] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://maps.google.com/maps?q=445+Hutchinson+Ln,+Saint+Augustine,+FL+32095&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Tola Tiles Location - Saint Augustine, FL"
                />
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Location</h3>
                <address className="not-italic space-y-4 text-gray-600 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#00a8e8] mt-0.5 flex-shrink-0" />
                    <span>445 Hutchinson Ln<br />Saint Augustine, FL 32095</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#00a8e8] flex-shrink-0" />
                    <a href="tel:+1-904-866-1738" className="hover:text-[#00a8e8] transition-colors">+1 (904) 866-1738</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#00a8e8] flex-shrink-0" />
                    <a href="mailto:menitola@tolatiles.com" className="hover:text-[#00a8e8] transition-colors">menitola@tolatiles.com</a>
                  </div>
                </address>
                <a
                  href="https://maps.app.goo.gl/YwPC3vTSgi4eRTvK7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand-ink text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0097d2] transition-all duration-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
