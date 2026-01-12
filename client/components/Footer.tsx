'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Clock, ExternalLink, Facebook, Instagram } from 'lucide-react';
import { getEmail, getMailtoLink } from '@/lib/email';

type LocationType = 'florida' | 'jacksonville' | 'st-augustine';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Determine current location based on pathname
  const currentLocation: LocationType = useMemo(() => {
    if (pathname.startsWith('/st-augustine') || pathname.includes('-st-augustine')) {
      return 'st-augustine';
    }
    if (pathname.startsWith('/jacksonville') || pathname.includes('-jacksonville')) {
      return 'jacksonville';
    }
    return 'florida';
  }, [pathname]);

  // Get service links based on location
  const serviceLinks = useMemo(() => {
    if (currentLocation === 'st-augustine') {
      return {
        all: '/st-augustine',
        kitchenBacksplash: '/services/kitchen-backsplash-st-augustine',
        bathroom: '/services/bathroom-tile-st-augustine',
        floor: '/services/floor-tile-st-augustine',
        patio: '/services/patio-tile-st-augustine',
        fireplace: '/services/fireplace-tile-st-augustine',
      };
    }
    if (currentLocation === 'jacksonville') {
      return {
        all: '/jacksonville',
        kitchenBacksplash: '/services/kitchen-backsplash-jacksonville',
        bathroom: '/services/bathroom-tile-jacksonville',
        floor: '/services/floor-tile-jacksonville',
        patio: '/services/patio-tile-jacksonville',
        fireplace: '/services/fireplace-tile-jacksonville',
      };
    }
    // Default Florida
    return {
      all: '/services',
      kitchenBacksplash: '/services/kitchen-backsplash',
      bathroom: '/services/bathroom-tile',
      floor: '/services/floor-tile',
      patio: '/services/patio-tile',
      fireplace: '/services/fireplace-tile',
    };
  }, [currentLocation]);

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
                  <Link href={serviceLinks.all} className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Tile Installation
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.kitchenBacksplash}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Kitchen Backsplashes
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.bathroom}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Bathroom Remodeling
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.floor}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Floor Tiling
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.patio}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Outdoor Patios
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.fireplace}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Fireplace Surrounds
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Quick Links & Service Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <nav aria-label="Quick links">
              <ul className="space-y-3 text-gray-300 mb-6">
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
              </ul>
            </nav>

            <h4 className="text-md font-semibold mb-4 text-gray-200">Service Areas</h4>
            <nav aria-label="Service areas">
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/jacksonville" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Tile Installer Jacksonville FL
                  </Link>
                </li>
                <li>
                  <Link href="/st-augustine" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Tile Installer St Augustine FL
                  </Link>
                </li>
                <li>
                  <a
                    href="/sitemap.xml"
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-flex items-center gap-1 text-sm text-gray-400"
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
                  <a href="tel:+1-904-866-1738" className="hover:text-white transition-colors font-medium" itemProp="telephone">
                    +1 (904) 866-1738
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
                  <a href={getMailtoLink()} className="hover:text-white transition-colors" itemProp="email">
                    {getEmail()}
                  </a>
                </div>
              </div>

              <div className="flex items-start group">
                <MapPin
                  className="h-4 w-4 mr-3 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Where we are established</div>
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

            <div className="flex flex-col items-center md:items-end gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <span>4.9/5 rating</span>
              </div>
              <a
                href="https://montrose.agency"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Developed by Montrose Agency
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
