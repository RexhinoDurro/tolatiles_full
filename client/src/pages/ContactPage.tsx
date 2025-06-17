// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle, Send } from 'lucide-react';
import SEO from '../components/SEO';
import BreadcrumbSchema from '../components/BreadcrumbSchema';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the form data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        projectType: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "Tola Tiles",
      "telephone": "+1-555-123-4567",
      "email": "info@tolatiles.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Tile Street",
        "addressLocality": "City",
        "addressRegion": "State",
        "postalCode": "12345",
        "addressCountry": "US"
      },
      "openingHours": [
        "Mo-Fr 08:00-18:00",
        "Sa 09:00-16:00"
      ],
      "url": "https://tolatiles.com/contact"
    }
  };

  const breadcrumbItems = [
    { name: "Home", url: "https://tolatiles.com" },
    { name: "Contact", url: "https://tolatiles.com/contact" }
  ];

  return (
    <>
      <SEO 
        title="Contact Tola Tiles - Get Free Quote | Tile Installation Services"
        description="Contact Tola Tiles for expert tile installation services. Get a free quote, schedule consultation, or call (555) 123-4567. Licensed professionals serving your area."
        keywords="contact tola tiles, tile installation quote, free estimate, tile contractor contact, schedule consultation, tile installation phone number"
        url="https://tolatiles.com/contact"
        schemaData={contactSchema}
      />
      
      <BreadcrumbSchema items={breadcrumbItems} />

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
                
                <div className="space-y-6 mb-12" itemScope itemType="https://schema.org/LocalBusiness">
                  <div className="flex items-center group">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                      <Phone className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Phone</div>
                      <a 
                        href="tel:+1-555-123-4567" 
                        className="text-lg text-gray-700 hover:text-blue-600 transition-colors"
                        itemProp="telephone"
                      >
                        (555) 123-4567
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center group">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                      <Mail className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <a 
                        href="mailto:info@tolatiles.com" 
                        className="text-lg text-gray-700 hover:text-blue-600 transition-colors"
                        itemProp="email"
                      >
                        info@tolatiles.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center group">
                    <div className="bg-blue-100 p-3 rounded-full mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                      <MapPin className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Address</div>
                      <address className="text-lg text-gray-700 not-italic" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                        <span itemProp="streetAddress">123 Tile Street</span><br />
                        <span itemProp="addressLocality">City</span>, <span itemProp="addressRegion">State</span> <span itemProp="postalCode">12345</span>
                      </address>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6" itemScope itemType="https://schema.org/OpeningHoursSpecification">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-blue-600 mr-3" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <time itemProp="opens">8:00 AM</time> - <time itemProp="closes">6:00 PM</time>
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
                  <p className="text-gray-600 mb-4">
                    We proudly serve the greater metropolitan area within a 50-mile radius of our location.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>• City & Surrounding Areas</div>
                    <div>• North County</div>
                    <div>• South County</div>
                    <div>• East Valley</div>
                    <div>• West Side</div>
                    <div>• Downtown District</div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-semibold text-gray-900 mb-8">Request a Free Quote</h2>
                
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-700">Thank you! Your quote request has been submitted successfully. We'll contact you within 24 hours.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">Sorry, there was an error submitting your request. Please try again or call us directly.</p>
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
                      placeholder="(555) 123-4567"
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
                        Sending...
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
                    * Required fields. We'll respond within 24 hours.
                    <br />
                    For immediate assistance, call <a href="tel:+1-555-123-4567" className="text-blue-600 hover:underline">(555) 123-4567</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Need Emergency Tile Repair?</h2>
              <p className="text-blue-100 mb-6">
                We offer emergency repair services for urgent tile and water damage issues.
              </p>
              <a 
                href="tel:+1-555-123-4567"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call Emergency Line
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;