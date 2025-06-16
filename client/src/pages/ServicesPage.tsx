import React from 'react';
import { services } from '../data/services';

const ServicesPage: React.FC = () => {
  return (
    <div className="pt-20">
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tile solutions for residential and commercial properties
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors group-hover:translate-x-2 transform duration-300 inline-flex items-center">
                  Learn More →
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start Your Project?</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              Get a free consultation and quote for your tile installation needs. Our experts are ready to help bring your vision to life.
            </p>
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Request Free Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;