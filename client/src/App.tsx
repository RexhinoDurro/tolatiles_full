import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Mail, Phone, MapPin, Menu, X, ArrowRight } from 'lucide-react';

// Sample images - In a real app, these would come from src/images/
interface TileImage {
  id: number;
  src: string;
  title: string;
  description: string;
}

interface SampleImages {
  backsplashes: TileImage[];
  patios: TileImage[];
  showers: TileImage[];
  flooring: TileImage[];
  fireplaces: TileImage[];
}

const sampleImages: SampleImages = {
  backsplashes: [
    { id: 1, src: '/api/placeholder/400/300', title: 'Subway Tile Backsplash', description: 'Classic white subway tile' },
    { id: 2, src: '/api/placeholder/400/300', title: 'Mosaic Glass Backsplash', description: 'Colorful glass mosaic' },
    { id: 3, src: '/api/placeholder/400/300', title: 'Natural Stone Backsplash', description: 'Elegant natural stone' },
    { id: 4, src: '/api/placeholder/400/300', title: 'Hexagon Tile Backsplash', description: 'Modern hexagon pattern' },
    { id: 5, src: '/api/placeholder/400/300', title: 'Marble Backsplash', description: 'Luxury marble finish' },
    { id: 6, src: '/api/placeholder/400/300', title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' }
  ],
  patios: [
    { id: 7, src: '/api/placeholder/400/300', title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 8, src: '/api/placeholder/400/300', title: 'Porcelain Patio Tiles', description: 'Weather-resistant porcelain' },
    { id: 9, src: '/api/placeholder/400/300', title: 'Travertine Patio', description: 'Natural travertine stone' },
    { id: 10, src: '/api/placeholder/400/300', title: 'Concrete Tile Patio', description: 'Modern concrete tiles' },
    { id: 11, src: '/api/placeholder/400/300', title: 'Brick Patio Tiles', description: 'Traditional brick pattern' },
    { id: 12, src: '/api/placeholder/400/300', title: 'Limestone Patio', description: 'Premium limestone tiles' }
  ],
  showers: [
    { id: 13, src: '/api/placeholder/400/300', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 14, src: '/api/placeholder/400/300', title: 'Ceramic Shower Tiles', description: 'Water-resistant ceramic' },
    { id: 15, src: '/api/placeholder/400/300', title: 'Glass Shower Tiles', description: 'Modern glass tile design' },
    { id: 16, src: '/api/placeholder/400/300', title: 'Subway Shower Tiles', description: 'Classic subway pattern' },
    { id: 17, src: '/api/placeholder/400/300', title: 'Natural Stone Shower', description: 'Spa-like natural stone' },
    { id: 18, src: '/api/placeholder/400/300', title: 'Mosaic Shower Accent', description: 'Decorative mosaic accent' }
  ],
  flooring: [
    { id: 19, src: '/api/placeholder/400/300', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 20, src: '/api/placeholder/400/300', title: 'Marble Floor Tiles', description: 'Elegant marble flooring' },
    { id: 21, src: '/api/placeholder/400/300', title: 'Ceramic Floor Tiles', description: 'Durable ceramic flooring' },
    { id: 22, src: '/api/placeholder/400/300', title: 'Large Format Tiles', description: 'Modern large format' },
    { id: 23, src: '/api/placeholder/400/300', title: 'Terrazzo Floor Tiles', description: 'Contemporary terrazzo' },
    { id: 24, src: '/api/placeholder/400/300', title: 'Stone Floor Tiles', description: 'Natural stone flooring' }
  ],
  fireplaces: [
    { id: 25, src: '/api/placeholder/400/300', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 26, src: '/api/placeholder/400/300', title: 'Marble Fireplace', description: 'Luxury marble fireplace' },
    { id: 27, src: '/api/placeholder/400/300', title: 'Ceramic Fireplace Tiles', description: 'Heat-resistant ceramic' },
    { id: 28, src: '/api/placeholder/400/300', title: 'Brick Fireplace Tiles', description: 'Traditional brick design' },
    { id: 29, src: '/api/placeholder/400/300', title: 'Slate Fireplace', description: 'Sophisticated slate tiles' },
    { id: 30, src: '/api/placeholder/400/300', title: 'Glass Tile Fireplace', description: 'Modern glass tile accent' }
  ]
};

const TolaTiles = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<keyof SampleImages | 'all'>('all');
  const [isGalleryDropdownOpen, setIsGalleryDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'gallery', label: 'Gallery', hasDropdown: true },
    { id: 'about', label: 'About' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const galleryCategories = [
    { id: 'all', label: 'All Projects' },
    { id: 'backsplashes', label: 'Backsplashes' },
    { id: 'patios', label: 'Patios' },
    { id: 'showers', label: 'Showers' },
    { id: 'flooring', label: 'Flooring' },
    { id: 'fireplaces', label: 'Fireplaces' }
  ];

  const services = [
    {
      title: 'Tile Installation',
      description: 'Professional installation of ceramic, porcelain, and natural stone tiles for any surface.',
      icon: '🔧'
    },
    {
      title: 'Design Consultation',
      description: 'Expert design advice to help you choose the perfect tiles for your space.',
      icon: '🎨'
    },
    {
      title: 'Custom Solutions',
      description: 'Tailored tile solutions for unique spaces and special requirements.',
      icon: '⚡'
    },
    {
      title: 'Maintenance & Repair',
      description: 'Ongoing maintenance and repair services to keep your tiles looking perfect.',
      icon: '🛠️'
    }
  ];

  const faqs = [
    {
      question: 'How long does a typical tile installation take?',
      answer: 'Installation time varies depending on the size and complexity of the project. A standard bathroom typically takes 3-5 days, while larger projects like kitchen backsplashes may take 1-2 days.'
    },
    {
      question: 'What types of tiles do you work with?',
      answer: 'We work with all types of tiles including ceramic, porcelain, natural stone, glass, marble, travertine, and specialty tiles for various applications.'
    },
    {
      question: 'Do you provide free estimates?',
      answer: 'Yes, we provide free estimates for all projects. Contact us to schedule a consultation and receive your detailed quote.'
    },
    {
      question: 'What warranty do you offer on your work?',
      answer: 'We offer a comprehensive 2-year warranty on all installation work, covering both materials and labor.'
    },
    {
      question: 'Can you help with tile selection and design?',
      answer: 'Absolutely! Our experienced design consultants can help you choose the perfect tiles and create a design that matches your vision and budget.'
    }
  ];

  const getFilteredImages = (): TileImage[] => {
    if (selectedCategory === 'all') {
      return Object.values(sampleImages).flat();
    }
    return sampleImages[selectedCategory as keyof SampleImages] || [];
  };

  const handleGalleryNavigation = (category: keyof SampleImages | 'all') => {
    setSelectedCategory(category);
    setCurrentPage('gallery');
    setIsGalleryDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (galleryRef.current) {
      galleryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const Header = () => (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">Tola Tiles</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <div key={item.id} className="relative">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsGalleryDropdownOpen(!isGalleryDropdownOpen)}
                      className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      {item.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    {isGalleryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        {galleryCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleGalleryNavigation(category.id as keyof SampleImages | 'all')}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                      currentPage === item.id ? 'text-blue-600' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Request Quote
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto">
          <nav className="px-4 py-6 space-y-4">
            {navigationItems.map((item) => (
              <div key={item.id}>
                {item.hasDropdown ? (
                  <div>
                    <div className="text-gray-700 font-medium py-2 border-b border-gray-200">
                      {item.label}
                    </div>
                    <div className="ml-4 mt-2 space-y-2">
                      {galleryCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleGalleryNavigation(category.id as keyof SampleImages | 'all')}
                          className="block w-full text-left py-2 text-gray-600 hover:text-blue-600"
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left py-2 font-medium ${
                      currentPage === item.id ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
            <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-6">
              Request Quote
            </button>
          </nav>
        </div>
      )}
    </header>
  );

  const Hero = () => (
    <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Transform Your Space with <span className="text-blue-300">Premium Tiles</span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Professional tile installation services for kitchens, bathrooms, patios, and more. 
            Quality craftsmanship that lasts a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentPage('gallery')}
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              View Our Work <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors">
              Get Free Quote
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const HomePage = () => (
    <div>
      <Hero />
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Tola Tiles?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We bring years of experience and unmatched expertise to every tile installation project
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">⭐</div>
              <h4 className="text-xl font-semibold mb-2">Premium Quality</h4>
              <p className="text-gray-600">Only the finest materials and expert craftsmanship for lasting results</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="text-xl font-semibold mb-2">Fast Installation</h4>
              <p className="text-gray-600">Efficient project completion without compromising on quality</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">💎</div>
              <h4 className="text-xl font-semibold mb-2">Lifetime Warranty</h4>
              <p className="text-gray-600">Comprehensive warranty coverage for your peace of mind</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Work Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Featured Projects</h3>
            <p className="text-xl text-gray-600">Take a look at some of our recent tile installations</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {Object.values(sampleImages).flat().slice(0, 6).map((image: TileImage) => (
              <div key={image.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <img 
                    src={image.src} 
                    alt={image.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <h4 className="font-semibold text-lg">{image.title}</h4>
                      <p className="text-sm">{image.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => setCurrentPage('gallery')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Full Gallery
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const ServicesPage = () => (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tile solutions for residential and commercial properties
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Learn More →
              </button>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Project?</h3>
          <p className="text-gray-600 mb-6">Get a free consultation and quote for your tile installation needs</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Request Free Quote
          </button>
        </div>
      </div>
    </div>
  );

  const GalleryPage = () => (
    <div ref={galleryRef} className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Project Gallery</h2>
          <p className="text-xl text-gray-600">Explore our completed tile installations</p>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {galleryCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as keyof SampleImages | 'all')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        
        {/* Image Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {getFilteredImages().map((image: TileImage) => (
            <div key={image.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg shadow-md">
                <img 
                  src={image.src} 
                  alt={image.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <h4 className="font-semibold text-lg mb-2">{image.title}</h4>
                    <p className="text-sm">{image.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AboutPage = () => (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About Tola Tiles</h2>
            <p className="text-lg text-gray-600 mb-6">
              With over 15 years of experience in the tile industry, Tola Tiles has established itself 
              as the premier tile installation company in the region. We specialize in transforming 
              spaces with beautiful, durable tile solutions.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our team of certified professionals is committed to delivering exceptional craftsmanship 
              and outstanding customer service on every project, from small residential bathrooms to 
              large commercial installations.
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Projects Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">15+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">2-Year</div>
                <div className="text-gray-600">Warranty</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <img src="/api/placeholder/500/400" alt="Tola Tiles Team" className="rounded-lg object-cover w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const FAQsPage = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Find answers to common questions about our tile services</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openFAQ === index ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ContactPage = () => (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-xl text-gray-600">Get in touch to discuss your tile installation project</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Phone className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-lg text-gray-700">(555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-lg text-gray-700">info@tolatiles.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-lg text-gray-700">123 Tile Street, City, State 12345</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h4>
              <div className="space-y-2 text-gray-600">
                <div>Monday - Friday: 8:00 AM - 6:00 PM</div>
                <div>Saturday: 9:00 AM - 4:00 PM</div>
                <div>Sunday: Closed</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Request a Quote</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select a service...</option>
                  <option>Kitchen Backsplash</option>
                  <option>Bathroom Tiles</option>
                  <option>Flooring</option>
                  <option>Patio/Outdoor</option>
                  <option>Fireplace</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Details</label>
                <textarea 
                  rows={4} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold"
              >
                Send Quote Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const Footer = () => (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Tola Tiles</h3>
            <p className="text-gray-300 mb-4">
              Premium tile installation services for residential and commercial properties.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">in</span>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">ig</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Tile Installation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kitchen Backsplashes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bathroom Remodeling</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Floor Tiling</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Outdoor Patios</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => setCurrentPage('gallery')} className="hover:text-white transition-colors">Gallery</button></li>
              <li><button onClick={() => setCurrentPage('faqs')} className="hover:text-white transition-colors">FAQs</button></li>
              <li><button onClick={() => setCurrentPage('contact')} className="hover:text-white transition-colors">Contact</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@tolatiles.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>123 Tile Street<br />City, State 12345</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Tola Tiles. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'services':
        return <ServicesPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'about':
        return <AboutPage />;
      case 'faqs':
        return <FAQsPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {renderCurrentPage()}
      <Footer />
    </div>
  );
};

export default TolaTiles;