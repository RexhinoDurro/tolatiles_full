import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, Users, Clock, Shield, Star, Heart, Target, Lightbulb } from 'lucide-react';
import { teamMembers } from '../data/team';
import type { TeamMember } from '../data/team';

const AboutPage: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-6 animate-fadeIn">About Tola Tiles</h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-slideInUp">
              Transforming spaces with exceptional craftsmanship since 2008. 
              We're not just tile installers—we're artisans who bring your vision to life with precision, 
              passion, and an unwavering commitment to quality.
            </p>
          </div>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-slideInUp">
            <div className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,500+</div>
              <div className="text-gray-600 font-medium">Projects Completed</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Years of Excellence</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Customer Satisfaction</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-4xl font-bold text-blue-600 mb-2">2-Year</div>
              <div className="text-gray-600 font-medium">Quality Warranty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slideInLeft">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  What started as a small family business in 2008 has grown into the region's most trusted tile installation company. 
                  Founded by Michael Tola with just a vision for exceptional craftsmanship, we've built our reputation one perfectly placed tile at a time.
                </p>
                <p>
                  We believe that your home or business deserves nothing less than perfection. Every project, whether it's a single bathroom renovation 
                  or a large commercial installation, receives the same meticulous attention to detail and commitment to quality that has defined us for over a decade.
                </p>
                <p>
                  Today, our team of certified craftsmen and design experts continues to push the boundaries of what's possible in tile installation, 
                  combining traditional techniques with innovative approaches to create spaces that are both beautiful and built to last.
                </p>
              </div>
              
              <div className="mt-8 flex items-center space-x-6">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-gray-700 font-medium">Licensed & Insured</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-gray-700 font-medium">Bonded & Certified</span>
                </div>
              </div>
            </div>
            
            <div className="animate-slideInRight">
              <TeamSlider />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">What Drives Us</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values guide every decision we make and every tile we place. 
              These principles have shaped our company culture and earned the trust of our clients.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Target className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900">Precision First</h4>
              <p className="text-gray-600 leading-relaxed">
                Every measurement, every cut, every placement is executed with meticulous precision. 
                We believe that excellence lies in the details.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Heart className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900">Customer Devotion</h4>
              <p className="text-gray-600 leading-relaxed">
                Your satisfaction isn't just our goal—it's our passion. We listen, communicate, 
                and go above and beyond to exceed your expectations.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Shield className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900">Uncompromising Quality</h4>
              <p className="text-gray-600 leading-relaxed">
                We use only premium materials and proven techniques. Quality isn't negotiable—
                it's the foundation of everything we do.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Lightbulb className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900">Innovative Solutions</h4>
              <p className="text-gray-600 leading-relaxed">
                We stay ahead of industry trends and continuously innovate our techniques 
                to provide cutting-edge solutions for every challenge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-8">Our Mission</h3>
          <blockquote className="text-2xl text-gray-700 leading-relaxed italic font-light">
            "To transform ordinary spaces into extraordinary experiences through masterful tile installation, 
            innovative design, and unwavering commitment to craftsmanship. We believe that every room has the potential 
            to become a work of art, and we're honored to be the artisans who bring that vision to life."
          </blockquote>
          <div className="mt-8 text-gray-600 font-medium">- Michael Tola, Founder</div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-6">Why Tola Tiles?</h3>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              When you choose us, you're not just hiring contractors—you're partnering with passionate craftsmen 
              who care about your project as much as you do.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center text-white">
              <Users className="h-16 w-16 mx-auto mb-6 text-blue-200" />
              <h4 className="text-2xl font-semibold mb-4">Expert Team</h4>
              <p className="text-blue-100 leading-relaxed">
                Our certified professionals bring decades of combined experience and ongoing training 
                to ensure the highest standards of installation.
              </p>
            </div>
            
            <div className="text-center text-white">
              <Clock className="h-16 w-16 mx-auto mb-6 text-blue-200" />
              <h4 className="text-2xl font-semibold mb-4">Reliable Timeline</h4>
              <p className="text-blue-100 leading-relaxed">
                We respect your time and schedule. Our detailed project planning ensures we complete 
                your installation on time, every time.
              </p>
            </div>
            
            <div className="text-center text-white">
              <Star className="h-16 w-16 mx-auto mb-6 text-blue-200" />
              <h4 className="text-2xl font-semibold mb-4">Lifetime Partnership</h4>
              <p className="text-blue-100 leading-relaxed">
                Our relationship doesn't end when the project is complete. We provide ongoing support, 
                maintenance advice, and are always here when you need us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Slider Component
const TeamSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamMembers.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % teamMembers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentMember = teamMembers[currentSlide];

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Team Member Card */}
      <div className="p-8">
        <div className="text-center mb-6">
          <div className="relative mx-auto mb-6">
            <img 
              src={currentMember.image} 
              alt={currentMember.name}
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-100"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {currentMember.experience}
            </div>
          </div>
          
          <h4 className="text-2xl font-bold text-gray-900 mb-1">{currentMember.name}</h4>
          <p className="text-blue-600 font-semibold mb-4">{currentMember.position}</p>
          
          <blockquote className="text-gray-600 italic mb-6 text-sm leading-relaxed">
            "{currentMember.quote}"
          </blockquote>
        </div>
        
        <div className="text-left">
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{currentMember.bio}</p>
          
          <div>
            <h5 className="font-semibold text-gray-900 mb-2 text-sm">Specialties:</h5>
            <div className="flex flex-wrap gap-2">
              {currentMember.specialties.map((specialty, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4">
        <button
          onClick={prevSlide}
          className="bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 right-4">
        <button
          onClick={nextSlide}
          className="bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {teamMembers.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AboutPage;