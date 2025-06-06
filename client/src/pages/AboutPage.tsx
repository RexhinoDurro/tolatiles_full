import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="pt-20">
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-8">About Tola Tiles</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                With over 15 years of experience in the tile industry, Tola Tiles has established itself 
                as the premier tile installation company in the region. We specialize in transforming 
                spaces with beautiful, durable tile solutions.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our team of certified professionals is committed to delivering exceptional craftsmanship 
                and outstanding customer service on every project, from small residential bathrooms to 
                large commercial installations.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-gray-600 font-medium">Projects Completed</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
                  <div className="text-gray-600 font-medium">Years Experience</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
                  <div className="text-gray-600 font-medium">Satisfaction Rate</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-4xl font-bold text-blue-600 mb-2">2-Year</div>
                  <div className="text-gray-600 font-medium">Warranty</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl h-96 flex items-center justify-center overflow-hidden">
                <img 
                  src="/api/placeholder/500/400" 
                  alt="Tola Tiles Team" 
                  className="rounded-2xl object-cover w-full h-full hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl">
                <div className="text-2xl font-bold text-blue-600">Family Owned</div>
                <div className="text-gray-600">Since 2008</div>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="mt-20 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h3>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              To transform homes and businesses with premium tile installations that combine beauty, 
              durability, and craftsmanship. We believe every space deserves to be extraordinary, 
              and we're committed to making that vision a reality for every client.
            </p>
          </div>

          {/* Values Section */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-xl font-semibold mb-4">Quality First</h4>
                <p className="text-gray-600">We never compromise on quality, using only the finest materials and proven techniques.</p>
              </div>
              <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4">🤝</div>
                <h4 className="text-xl font-semibold mb-4">Customer Focus</h4>
                <p className="text-gray-600">Your satisfaction is our priority. We listen, communicate, and deliver beyond expectations.</p>
              </div>
              <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4">💼</div>
                <h4 className="text-xl font-semibold mb-4">Integrity</h4>
                <p className="text-gray-600">Honest pricing, reliable timelines, and transparent communication in every project.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;