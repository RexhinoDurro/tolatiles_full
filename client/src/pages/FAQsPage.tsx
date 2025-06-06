import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs } from '../data/sampleData';

const FAQsPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="pt-20">
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Find answers to common questions about our tile services</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 text-lg pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`h-6 w-6 text-blue-600 transition-transform duration-300 flex-shrink-0 ${
                      openFAQ === index ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${
                  openFAQ === index 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0'
                } overflow-hidden`}>
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help! Contact us for personalized answers to your tile installation questions.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
              Contact Us Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;