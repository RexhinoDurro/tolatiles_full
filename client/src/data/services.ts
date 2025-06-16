export interface Service {
  title: string;
  description: string;
  detailedDescription: string;
  features: string[];
  icon: string;
  timeline: string;
  priceRange: string;
}

export const services: Service[] = [
  {
    title: 'Tile Installation',
    description: 'Professional installation of ceramic, porcelain, and natural stone tiles for any surface.',
    detailedDescription: 'Our expert craftsmen specialize in precision tile installation for kitchens, bathrooms, foyers, and commercial spaces. Using industry-leading techniques and premium materials, we ensure every tile is perfectly aligned and securely bonded for lasting durability.',
    features: [
      'Ceramic, porcelain, and natural stone expertise',
      'Perfect pattern alignment and spacing',
      'Waterproof membrane installation',
      'Custom trim and edge finishing',
      'Commercial and residential projects'
    ],
    icon: 'Hammer',
    timeline: '1-5 days',
    priceRange: '$8-15 per sq ft'
  },
  {
    title: 'Kitchen Backsplashes',
    description: 'Transform your kitchen with stunning backsplash designs that combine beauty and functionality.',
    detailedDescription: 'Create a focal point in your kitchen with our custom backsplash installations. From classic subway tiles to intricate mosaics, we help you choose the perfect style that complements your cabinets, countertops, and overall design aesthetic.',
    features: [
      'Custom design consultation',
      'Subway, mosaic, and natural stone options',
      'Behind-stove heat shields',
      'Electrical outlet integration',
      'Grout sealing and protection'
    ],
    icon: 'ChefHat',
    timeline: '1-3 days',
    priceRange: '$12-25 per sq ft'
  },
  {
    title: 'Bathroom Remodeling',
    description: 'Complete bathroom transformations with expert tile work for walls, floors, and shower enclosures.',
    detailedDescription: 'Turn your bathroom into a luxurious retreat with our comprehensive remodeling services. We handle everything from floor-to-ceiling tile installation to custom shower niches, ensuring every detail meets the highest standards of craftsmanship.',
    features: [
      'Floor and wall tile installation',
      'Custom shower and tub surrounds',
      'Heated floor systems available',
      'Waterproofing and moisture barriers',
      'ADA-compliant installations'
    ],
    icon: 'Bath',
    timeline: '3-7 days',
    priceRange: '$10-20 per sq ft'
  },
  {
    title: 'Floor Tiling',
    description: 'Durable and beautiful floor installations for residential and commercial properties.',
    detailedDescription: 'From elegant marble entryways to practical porcelain floors, our flooring specialists deliver exceptional results that stand the test of time. We prepare subfloors properly and use premium adhesives for long-lasting installations.',
    features: [
      'Subfloor preparation and leveling',
      'Large format and specialty tiles',
      'Radiant heating compatibility',
      'Transition strip installation',
      'Commercial-grade installations'
    ],
    icon: 'Home',
    timeline: '2-5 days',
    priceRange: '$6-18 per sq ft'
  },
  {
    title: 'Design Consultation',
    description: 'Expert design advice to help you choose the perfect tiles and layout for your space.',
    detailedDescription: 'Our experienced design consultants work with you to select tiles that perfectly match your vision, budget, and lifestyle needs. We provide detailed mockups, material samples, and layout options to ensure your complete satisfaction.',
    features: [
      'In-home design consultations',
      'Material and color selection',
      'Layout and pattern design',
      'Budget planning and optimization',
      '3D visualization available'
    ],
    icon: 'Palette',
    timeline: '1-2 hours',
    priceRange: 'Free with project'
  },
  {
    title: 'Maintenance & Repair',
    description: 'Ongoing maintenance and repair services to keep your tiles looking perfect for years to come.',
    detailedDescription: 'Protect your investment with our comprehensive maintenance services. From routine cleaning and resealing to crack repairs and tile replacement, we help maintain the beauty and integrity of your tile installations.',
    features: [
      'Grout cleaning and resealing',
      'Cracked tile replacement',
      'Caulk renewal and repair',
      'Stone polishing and restoration',
      'Preventive maintenance programs'
    ],
    icon: 'Wrench',
    timeline: '2-4 hours',
    priceRange: '$150-400 per visit'
  }
];