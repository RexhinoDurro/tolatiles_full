'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle, Send, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { ContactFormData } from '@/types/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const apiData: ContactFormData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        project_type: projectTypeMap[formData.projectType] || formData.projectType,
        message: formData.message,
      };

      // Submit to API
      await api.submitContactForm(apiData);

      // Success
      setSubmitStatus('success');
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
    <div className="pt-20">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Contact Tola Tiles</h1>
            <p className="text-xl text-gray-600">Get in touch to discuss your tile installation project</p>
          </header>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-8">Get in Touch</h2>

              <div className="space-y-6 mb-12">
                <div className="flex items-center group">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <Phone className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <a href="tel:+1-904-210-3094" className="text-lg text-gray-700 hover:text-blue-600 transition-colors">
                      (904) 210-3094
                    </a>
                  </div>
                </div>

                <div className="flex items-center group">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <Mail className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <a href="mailto:menitola@tolatiles.com" className="text-lg text-gray-700 hover:text-blue-600 transition-colors">
                      menitola@tolatiles.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center group">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <MapPin className="h-6 w-6 text-blue-600" aria-hidden="true" />
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
                  <Clock className="h-6 w-6 text-blue-600 mr-3" aria-hidden="true" />
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
                <p className="text-gray-600 mb-4">We proudly serve Saint Augustine and the greater Northeast Florida area within a 50-mile radius.</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Saint Augustine</div>
                  <div>Ponte Vedra Beach</div>
                  <div>Jacksonville</div>
                  <div>Palm Coast</div>
                  <div>St. Johns County</div>
                  <div>Flagler County</div>
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
                    <p className="text-sm mt-1">{errorMessage || 'Please try again or call us directly at (904) 210-3094.'}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="(904) 123-4567"
                  />
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-300 font-semibold transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                  <a href="tel:+1-904-210-3094" className="text-blue-600 hover:underline">
                    (904) 210-3094
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Emergency Tile Repair?</h2>
            <p className="text-blue-100 mb-6">We offer emergency repair services for urgent tile and water damage issues.</p>
            <a
              href="tel:+1-904-210-3094"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Call Emergency Line
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
