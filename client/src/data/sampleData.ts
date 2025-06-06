// Sample data for the website

export interface TileImage {
  id: number;
  src: string;
  title: string;
  description: string;
}

export interface SampleImages {
  backsplashes: TileImage[];
  patios: TileImage[];
  showers: TileImage[];
  flooring: TileImage[];
  fireplaces: TileImage[];
}

export const sampleImages: SampleImages = {
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

export const services = [
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

export const faqs = [
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