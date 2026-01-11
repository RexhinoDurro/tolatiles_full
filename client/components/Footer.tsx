'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, ExternalLink, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-16" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src="/images/logo.webp"
                alt="Tola Tiles Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg"
              />
              <h2 className="text-2xl font-bold">Tola Tiles</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Premium tile installation services for residential and commercial properties. Creating beautiful, lasting spaces since 2008.
            </p>

            {/* Social Media */}
            <div className="flex space-x-4 mb-6">
              <a
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/TolaTiles'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/tolatiles'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>

            {/* Business Certifications */}
            <div className="text-sm text-gray-400">
              <p className="mb-1">Licensed & Insured</p>
              <p className="mb-1">Bonded & Certified</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <nav aria-label="Services">
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link href="/services" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Tile Installation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery/backsplashes"
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Kitchen Backsplashes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery/showers"
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Bathroom Remodeling
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery/flooring"
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Floor Tiling
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery/patios"
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Outdoor Patios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery/fireplaces"
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Fireplace Surrounds
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <nav aria-label="Quick links">
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Project Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a
                    href="/sitemap.xml"
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener"
                  >
                    Sitemap
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4 text-gray-300" itemScope itemType="https://schema.org/LocalBusiness">
              <div className="flex items-start group">
                <Phone
                  className="h-4 w-4 mr-3 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Call us today</div>
                  <a href="tel:+1-904-210-3094" className="hover:text-white transition-colors font-medium" itemProp="telephone">
                    (904) 210-3094
                  </a>
                </div>
              </div>

              <div className="flex items-start group">
                <Mail
                  className="h-4 w-4 mr-3 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Email us</div>
                  <a href="mailto:menitola@tolatiles.com" className="hover:text-white transition-colors" itemProp="email">
                    menitola@tolatiles.com
                  </a>
                </div>
              </div>

              <div className="flex items-start group">
                <MapPin
                  className="h-4 w-4 mr-3 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Visit us</div>
                  <address className="not-italic" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="streetAddress">445 Hutchinson Ln</span>
                    <br />
                    <span itemProp="addressLocality">Saint Augustine</span>, <span itemProp="addressRegion">FL</span>{' '}
                    <span itemProp="postalCode">32084</span>
                  </address>
                </div>
              </div>

              <div className="flex items-start group">
                <Clock
                  className="h-4 w-4 mr-3 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Business Hours</div>
                  <div className="text-sm">
                    <div>Mon-Fri: 8:00 AM - 6:00 PM</div>
                    <div>Sat: 9:00 AM - 4:00 PM</div>
                    <div>Sun: Closed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Service */}
            <div className="mt-6 p-3 bg-red-900/30 rounded-lg border border-red-800">
              <div className="text-sm font-semibold text-red-200 mb-1">Emergency Service</div>
              <div className="text-xs text-red-300">24/7 emergency tile repair available</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-300 text-sm text-center md:text-left">
              <p>
                &copy; {currentYear} Tola Tiles. All rights reserved. |
                <Link href="/privacy-policy" className="hover:text-white ml-1">
                  Privacy Policy
                </Link>{' '}
                |
                <Link href="/terms-of-service" className="hover:text-white ml-1">
                  Terms of Service
                </Link>
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Designed with excellence in mind</span>
              <div className="flex items-center gap-1">
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
