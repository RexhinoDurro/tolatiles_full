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

  // Determine current location based on pathname (location is now the first segment)
  const currentLocation: LocationType = useMemo(() => {
    const firstSegment = pathname.split('/')[1];
    if (firstSegment === 'st-augustine') return 'st-augustine';
    if (firstSegment === 'jacksonville') return 'jacksonville';
    return 'florida';
  }, [pathname]);

  const basePath = currentLocation === 'florida' ? '' : `/${currentLocation}`;

  // Get service links using new location-prefixed URLs
  const serviceLinks = useMemo(() => {
    return {
      kitchenBacksplash: `${basePath}/services/kitchen-backsplash-installation`,
      bathroom: `${basePath}/services/bathroom-tile-installation`,
      floor: `${basePath}/services/floor-tile-installation`,
      patio: `${basePath}/services/patio-tile-installation`,
      fireplace: `${basePath}/services/fireplace-tile-installation`,
      shower: `${basePath}/services/shower-tile-installation`,
    };
  }, [basePath]);

  // Location display name
  const locationName = currentLocation === 'st-augustine'
    ? 'St Augustine'
    : currentLocation === 'jacksonville'
      ? 'Jacksonville'
      : 'Florida';

  return (
    <footer className="bg-gray-900 text-white py-16" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src="/images/whitelogo.svg"
                alt="Tola Tiles Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <h2 className="text-2xl font-bold">Tola Tiles</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Premium tile installation services for residential and commercial properties in {locationName}. Creating beautiful, lasting spaces since 2008.
            </p>

            {/* Social Media */}
            <div className="flex space-x-4 mb-6">
              <a
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/TolaTiles'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#00a8e8] rounded-full flex items-center justify-center hover:bg-[#0097d2] transition-colors"
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

          {/* Services - with location-aware links and anchor text */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services in {locationName}</h3>
            <nav aria-label="Services">
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link
                    href={serviceLinks.kitchenBacksplash}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Kitchen Backsplash {locationName}
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.bathroom}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Bathroom Tile {locationName}
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.floor}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Floor Tiling {locationName}
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.patio}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Outdoor Patios {locationName}
                  </Link>
                </li>
                <li>
                  <Link
                    href={serviceLinks.fireplace}
                    className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
                  >
                    Fireplace Surrounds {locationName}
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
                  <Link href={`${basePath}/about`} className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    About Tola Tiles {locationName}
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/gallery`} className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    {locationName} Project Gallery
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/blog`} className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Tile Tips & Blog
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/faqs`} className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Tile Installation FAQs
                  </Link>
                </li>
                <li>
                  <Link href={`${basePath}/contact`} className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    Contact Us - Free Estimate
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
                  <Link href="/" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block">
                    All Florida Services
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
              <meta itemProp="name" content={`Tola Tiles - ${locationName}`} />
              <div className="flex items-start group">
                <Phone
                  className="h-4 w-4 mr-3 mt-1 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Call us today</div>
                  <a href="tel:+1-904-866-1738" className="hover:text-white transition-colors font-medium" itemProp="telephone">
                    (904) 866-1738
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
                  <div className="text-sm text-gray-400 mb-1">Serving {locationName}</div>
                  <address className="not-italic" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="streetAddress">445 Hutchinson Ln</span>
                    <br />
                    <span itemProp="addressLocality">St Augustine</span>, <span itemProp="addressRegion">FL</span>{' '}
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
                <span>5.0★ rating</span>
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
