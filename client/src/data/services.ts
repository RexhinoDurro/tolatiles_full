// src/data/services.ts
export interface Service {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  icon: string;
  features: string[];
  timeline: string;
}

export type ServiceId = 
  | 'kitchen-backsplash' 
  | 'bathroom' 
  | 'flooring' 
  | 'patio' 
  | 'fireplace' 
  | 'shower';

export const services: Service[] = [
  {
    id: 'kitchen-backsplash',
    title: 'Kitchen Backsplash Installation',
    description: 'Transform your kitchen with stunning custom backsplash designs using premium tiles.',
    detailedDescription: 'Our expert team specializes in creating beautiful, functional kitchen backsplashes that protect your walls while adding aesthetic value to your space. We work with a wide variety of materials including ceramic, porcelain, glass, and natural stone tiles to match your unique style and budget. From modern subway tiles to intricate mosaic patterns, we bring your vision to life with precision and craftsmanship.',
    icon: 'ChefHat',
    features: [
      'Custom design consultation and planning',
      'Professional surface preparation and leveling',
      'Precision tile cutting and installation',
      'Expert grouting and sealing',
      'Post-installation cleanup and inspection',
      'Material selection guidance'
    ],
    timeline: '1-3 days'
  },
  {
    id: 'bathroom',
    title: 'Bathroom Tile Installation',
    description: 'Complete bathroom tiling solutions including floors, walls, and shower enclosures.',
    detailedDescription: 'Create a spa-like retreat in your home with our comprehensive bathroom tiling services. We handle everything from floor tiles to wall installations and custom shower designs. Our waterproofing expertise ensures your bathroom not only looks beautiful but also stands the test of time. We use only the highest quality materials and proven installation techniques to prevent moisture damage and maintain the integrity of your bathroom.',
    icon: 'Bath',
    features: [
      'Complete waterproofing solutions',
      'Custom shower and tub surrounds',
      'Slip-resistant flooring options',
      'Heated floor installation available',
      'Niche and shelf integration',
      'Matching grout color selection'
    ],
    timeline: '3-7 days'
  },
  {
    id: 'flooring',
    title: 'Floor Tiling',
    description: 'Durable and elegant floor tiling for residential and commercial spaces.',
    detailedDescription: 'Whether you\'re updating a single room or tiling an entire property, our flooring experts deliver exceptional results. We specialize in various flooring materials including ceramic, porcelain, natural stone, and luxury vinyl tile. Our meticulous installation process ensures proper leveling, spacing, and finishing for a floor that\'s both beautiful and built to last. We pay special attention to high-traffic areas and can recommend the best materials for your specific needs.',
    icon: 'Home',
    features: [
      'Subfloor preparation and leveling',
      'Radiant heating system installation',
      'Large format tile expertise',
      'Pattern design and layout',
      'Transition strip installation',
      'Commercial-grade options available'
    ],
    timeline: '2-5 days'
  },
  {
    id: 'patio',
    title: 'Patio & Outdoor Tile',
    description: 'Weather-resistant outdoor tiling for patios, decks, and pool areas.',
    detailedDescription: 'Extend your living space outdoors with our professional patio and outdoor tiling services. We use weather-resistant, slip-resistant materials designed to withstand the elements while maintaining their beauty year-round. Our outdoor installations are perfect for patios, pool decks, walkways, and outdoor entertainment areas. We ensure proper drainage and use specialized adhesives and grouts suitable for outdoor conditions and temperature fluctuations.',
    icon: 'Palette',
    features: [
      'Freeze-thaw resistant materials',
      'Proper drainage planning',
      'Slip-resistant surface options',
      'UV-resistant grout and sealant',
      'Pool deck specialization',
      'Outdoor kitchen backsplash'
    ],
    timeline: '3-6 days'
  },
  {
    id: 'fireplace',
    title: 'Fireplace Tile',
    description: 'Stunning fireplace surrounds and hearths with heat-resistant materials.',
    detailedDescription: 'Create a focal point in your home with a beautifully tiled fireplace surround. We specialize in both traditional and contemporary fireplace designs using heat-resistant materials that are both safe and stunning. From rustic stone to sleek modern tiles, we can help you choose the perfect materials to complement your home\'s decor. Our installations meet all safety codes and building regulations while delivering the aesthetic impact you desire.',
    icon: 'Hammer',
    features: [
      'Heat-resistant material selection',
      'Custom surround design',
      'Mantel and hearth integration',
      'Safety code compliance',
      'Stone and tile combinations',
      'Accent lighting options'
    ],
    timeline: '2-4 days'
  },
  {
    id: 'shower',
    title: 'Shower Installation',
    description: 'Custom shower tile installations with complete waterproofing solutions.',
    detailedDescription: 'Transform your bathroom with a custom-tiled shower that combines functionality with luxury. Our shower installations feature complete waterproofing systems, proper slope for drainage, and expertly installed tiles that create a beautiful, water-tight enclosure. We can create everything from simple, elegant designs to elaborate multi-pattern installations with accent strips, niches, and benches. All our shower installations come with a comprehensive waterproofing warranty.',
    icon: 'Wrench',
    features: [
      'Complete waterproofing membrane',
      'Custom shower pan installation',
      'Built-in niches and benches',
      'Multiple tile pattern options',
      'Accent strip integration',
      'Lifetime leak warranty'
    ],
    timeline: '4-7 days'
  }
];