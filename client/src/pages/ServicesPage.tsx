import React from 'react';
import { 
  Hammer, 
  ChefHat, 
  Bath, 
  Home, 
  Palette, 
  Wrench,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { services } from '../data/services';

const iconMap = {
  Hammer,
  ChefHat,
  Bath,
  Home,
  Palette,
  Wrench
};

const ServicesPage: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fadeIn">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-slideInUp">
            Comprehensive tile solutions for residential and commercial properties. 
            From design consultation to installation and maintenance, we're your trusted tile experts.
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-gray-600 animate-slideInUp">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span>15+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>2-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap];
              
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                >
                  {/* Header */}
                  <div className="p-8 pb-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                      </div>
                    </div>

                    {/* Detailed Description */}
                    <p className="text-gray-700 leading-relaxed mb-6">{service.detailedDescription}</p>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">What's Included:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{service.timeline}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{service.priceRange}</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                      Get Quote for {service.title}
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Process Section */}
          <div className="bg-white rounded-2xl shadow-lg p-12 mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Process</h3>
              <p className="text-xl text-gray-600">How we ensure perfect results every time</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Consultation', description: 'Free in-home consultation and design planning' },
                { step: '02', title: 'Material Selection', description: 'Choose from our extensive tile and material library' },
                { step: '03', title: 'Professional Installation', description: 'Expert installation by certified craftsmen' },
                { step: '04', title: 'Quality Inspection', description: 'Thorough quality check and customer walkthrough' }
              ].map((process, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    {process.step}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{process.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{process.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-6">Ready to Start Your Project?</h3>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              Get a free consultation and detailed quote for your tile installation needs. 
              Our experts are ready to help bring your vision to life with professional craftsmanship and premium materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Schedule Free Consultation
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                Call (555) 123-4567
              </button>
            </div>
            
            {/* Guarantees */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-blue-500">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="font-semibold mb-1">Quality Guarantee</div>
                <div className="text-sm text-blue-200">2-year warranty on all work</div>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="font-semibold mb-1">On-Time Completion</div>
                <div className="text-sm text-blue-200">Projects finished as scheduled</div>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="font-semibold mb-1">Satisfaction Promise</div>
                <div className="text-sm text-blue-200">100% customer satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;