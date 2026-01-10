import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Search, Phone } from 'lucide-react';
import GoBackButton from '@/components/GoBackButton';

export const metadata: Metadata = {
  title: 'Page Not Found - 404 Error | Tola Tiles',
  description: "The page you're looking for doesn't exist. Visit our homepage to find tile installation services, gallery, and contact information for Tola Tiles.",
};

export default function NotFound() {
  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 404 Graphic */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-4 animate-pulse">404</div>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops! Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          The page you&apos;re looking for seems to have been moved, deleted, or doesn&apos;t exist. Don&apos;t worry, we can help you find what you need!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            Back to Homepage
          </Link>

          <GoBackButton />
        </div>

        {/* Helpful Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-left">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">What you might be looking for:</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Services</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/services" className="hover:text-blue-600 transition-colors">
                    Tile Installation Services
                  </Link>
                </li>
                <li>
                  <Link href="/gallery/backsplashes" className="hover:text-blue-600 transition-colors">
                    Kitchen Backsplashes
                  </Link>
                </li>
                <li>
                  <Link href="/gallery/showers" className="hover:text-blue-600 transition-colors">
                    Bathroom Renovations
                  </Link>
                </li>
                <li>
                  <Link href="/gallery/flooring" className="hover:text-blue-600 transition-colors">
                    Floor Tiling
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/gallery" className="hover:text-blue-600 transition-colors">
                    Project Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-blue-600 transition-colors">
                    About Tola Tiles
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-blue-600 transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-600 transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 p-6 bg-blue-600 text-white rounded-xl">
          <h3 className="text-xl font-semibold mb-4">Need Immediate Help?</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href="tel:+1-904-210-3094"
              className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call (904) 210-3094
            </a>
            <span className="text-blue-200">or</span>
            <Link href="/contact" className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-lg hover:bg-white/30 transition-colors">
              <Search className="h-5 w-5" aria-hidden="true" />
              Get Free Quote
            </Link>
          </div>
        </div>

        {/* SEO-friendly content */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact us at{' '}
            <a href="mailto:menitola@tolatiles.com" className="text-blue-600 hover:underline">
              menitola@tolatiles.com
            </a>{' '}
            so we can help resolve the issue.
          </p>
        </div>
      </div>
    </div>
  );
}
