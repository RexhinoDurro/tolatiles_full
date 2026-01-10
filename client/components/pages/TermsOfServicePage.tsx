'use client';

import Link from 'next/link';
import { FileText, Mail, Phone } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing our website or using Tola Tiles&apos; tile installation services, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Tola Tiles provides professional tile installation services including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Kitchen backsplash installation</li>
              <li>Bathroom tile installation and remodeling</li>
              <li>Floor tiling (residential and commercial)</li>
              <li>Patio and outdoor tile installation</li>
              <li>Fireplace surround installation</li>
              <li>Shower tile installation</li>
              <li>Tile repair and replacement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quotes and Estimates</h2>
            <div className="space-y-4 text-gray-600">
              <p className="leading-relaxed">
                All quotes and estimates provided by Tola Tiles are valid for 30 days from the date of issue unless
                otherwise specified. Quotes are based on the information provided and site conditions observed during the
                initial assessment.
              </p>
              <p className="leading-relaxed">
                Additional costs may apply if hidden conditions are discovered during the project, such as water damage,
                structural issues, or the need for subfloor repair. We will communicate any changes before proceeding with
                additional work.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
            <div className="space-y-4 text-gray-600">
              <p className="leading-relaxed">
                A deposit may be required to schedule your project and secure materials. The remaining balance is due upon
                completion of the work unless otherwise agreed in writing.
              </p>
              <p className="leading-relaxed">
                We accept cash, check, and major credit cards. Payment arrangements must be discussed and agreed upon
                before work begins.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Scheduling and Cancellation</h2>
            <div className="space-y-4 text-gray-600">
              <p className="leading-relaxed">
                We will make every effort to complete projects within the estimated timeline. However, delays may occur
                due to weather, material availability, or unforeseen circumstances.
              </p>
              <p className="leading-relaxed">
                If you need to cancel or reschedule, please provide at least 48 hours notice. Cancellations made with less
                than 48 hours notice may be subject to a cancellation fee.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Warranty</h2>
            <div className="space-y-4 text-gray-600">
              <p className="leading-relaxed">
                Tola Tiles provides a workmanship warranty on all tile installation services. This warranty covers defects
                in installation for a period specified in your service agreement.
              </p>
              <p className="leading-relaxed">
                The warranty does not cover damage caused by improper use, lack of maintenance, settling of the structure,
                or acts of nature. Material warranties are provided by the respective manufacturers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Customer Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">As our customer, you agree to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide accurate information about your project requirements</li>
              <li>Ensure access to the work area on scheduled dates</li>
              <li>Remove or protect personal belongings in the work area</li>
              <li>Notify us of any known issues that may affect the installation</li>
              <li>Make timely payments as agreed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Tola Tiles shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of our services. Our total liability shall not exceed the amount paid for the
              services giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on our website, including text, images, logos, and design, is the property of Tola Tiles and is
              protected by copyright and trademark laws. You may not reproduce, distribute, or use our content without
              written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
            <p className="text-gray-600 leading-relaxed">
              Any disputes arising from these terms or our services shall be resolved through good-faith negotiation. If
              negotiation fails, disputes shall be resolved through mediation or arbitration in St. Johns County, Florida,
              in accordance with Florida law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately
              upon posting on our website. Your continued use of our services after changes constitutes acceptance of the
              modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of the State of
              Florida, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3 text-blue-600" />
                <a href="mailto:menitola@tolatiles.com" className="hover:text-blue-600 transition-colors">
                  menitola@tolatiles.com
                </a>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3 text-blue-600" />
                <a href="tel:+1-904-210-3094" className="hover:text-blue-600 transition-colors">
                  (904) 210-3094
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default TermsOfServicePage;
