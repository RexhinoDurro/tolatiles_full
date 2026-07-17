'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, CheckCircle, Send, AlertCircle, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { extractPhoneDigits, formatPhoneNumber } from '@/lib/phoneUtils';
import { loadTurnstileScript } from '@/lib/turnstile';
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

  // Turnstile invisible widget
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenResolverRef = useRef<((token: string) => void) | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);

  // Load Turnstile script and render invisible widget
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !turnstileContainerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          appearance: 'interaction-only',
          execution: 'execute',
          callback: (token: string) => {
            if (tokenResolverRef.current) {
              tokenResolverRef.current(token);
              tokenResolverRef.current = null;
            }
          },
        });
      })
      .catch((err) => console.warn('Turnstile script failed to load', err));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  // The Cloudflare script loads asynchronously, so the widget may not be
  // rendered yet when a fast-filled form is submitted — wait for it instead
  // of failing immediately, otherwise every quick submission loses its token
  // and gets rejected server-side.
  const waitForWidgetReady = (timeoutMs = 8000): Promise<void> =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (window.turnstile && widgetIdRef.current) {
          resolve();
        } else if (Date.now() - start > timeoutMs) {
          reject(new Error('Turnstile failed to load. Please refresh and try again.'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });

  const executeTurnstile = async (): Promise<string> => {
    await waitForWidgetReady();
    return new Promise((resolve, reject) => {
      // Reset so we always get a fresh token on each submission
      window.turnstile.reset(widgetIdRef.current!);
      tokenResolverRef.current = resolve;
      window.turnstile.execute(widgetIdRef.current!);
      // Fail the submission if Cloudflare doesn't respond within 15 s
      setTimeout(() => {
        tokenResolverRef.current = null;
        reject(new Error('Security check timed out. Please try again.'));
      }, 15000);
    });
  };

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
      // Run the invisible Turnstile challenge to get a token. The backend
      // rejects any submission without one, so there's no point sending it —
      // fail fast with an actionable message instead of a doomed request.
      let turnstileToken: string;
      try {
        turnstileToken = await executeTurnstile();
      } catch (turnstileErr) {
        console.warn('Turnstile challenge failed or timed out', turnstileErr);
        setSubmitStatus('error');
        setErrorMessage('Security check failed to load. Please refresh the page and try again, or call us directly.');
        return;
      }

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
        cf_turnstile_response: turnstileToken,
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16">
            <header className="text-center md:text-left md:w-[58%]">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{content.heroH1}</h1>
              <p className="text-xl text-gray-600">{content.heroSubtitle}</p>
            </header>
            <div className="w-full md:w-[42%] flex justify-center md:justify-end">
              <div className="relative w-full max-w-md h-56 md:h-72">
                <Image
                  src="/images/tolatiles-service-truck-jacksonville-st-augustine.webp"
                  alt="Tola Tiles work truck — free estimates, (904) 866-1738"
                  fill
                  sizes="(max-width: 768px) 80vw, 40vw"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
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
                      Saint Augustine, FL 32084
                    </address>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-[#00a8e8] mr-3" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                </div>
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

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">Request a Free Quote</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-green-700">
                    <p className="font-medium">Thank you for your inquiry!</p>
                    <p className="text-sm mt-1">We&apos;ve received your message and will respond within 24 hours.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-red-700">
                    <p className="font-medium">Unable to submit form</p>
                    <p className="text-sm mt-1">{errorMessage || 'Please try again or call us directly at +1 (904) 866-1738.'}</p>
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
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <div className="relative flex">
                    {formData.phone && (
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-brand-ink font-bold text-sm select-none">
                        +1
                      </span>
                    )}
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formatPhoneNumber(formData.phone)}
                      onChange={handlePhoneChange}
                      className={`w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        formData.phone ? 'rounded-r-lg' : 'rounded-lg'
                      }`}
                      placeholder="(904) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell us about your project, including size, timeline, and any specific requirements..."
                  ></textarea>
                </div>

                {/* Cloudflare Turnstile invisible widget — no visible UI */}
                <div ref={turnstileContainerRef} aria-hidden="true" />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-ink text-white py-4 px-6 rounded-lg hover:bg-[#0097d2] disabled:bg-blue-400 transition-all duration-300 font-semibold transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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

              <div className="mt-6 text-sm text-gray-500 text-center">
                <p>
                  * Required fields. We&apos;ll respond within 24 hours.
                  <br />
                  For immediate assistance, call{' '}
                  <a href="tel:+1-904-866-1738" className="text-brand-ink hover:underline">
                    +1 (904) 866-1738
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">{content.mapHeading}</h2>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[400px] rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://maps.google.com/maps?q=445+Hutchinson+Ln,+Saint+Augustine,+FL+32084&t=&z=15&ie=UTF8&iwloc=&output=embed"
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
                    <span>445 Hutchinson Ln<br />Saint Augustine, FL 32084</span>
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
