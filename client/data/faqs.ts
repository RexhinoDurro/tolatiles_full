export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
}

export const faqCategories: FAQCategory[] = [
  { id: 'general', name: 'General Questions', icon: 'HelpCircle' },
  { id: 'services', name: 'Services & Installation', icon: 'Hammer' },
  { id: 'pricing', name: 'Pricing & Timeline', icon: 'DollarSign' },
  { id: 'materials', name: 'Materials & Design', icon: 'Palette' },
  { id: 'maintenance', name: 'Care & Maintenance', icon: 'Shield' },
];

export const faqs: FAQ[] = [
  // General Questions
  {
    category: 'general',
    question: 'How long has Tola Tiles been in business?',
    answer:
      "Tola Tiles has been serving the community for over 15 years since 2008. We're a family-owned business with a proven track record of quality installations and satisfied customers.",
  },
  {
    category: 'general',
    question: 'Are you licensed and insured?',
    answer:
      "Yes, we are fully licensed, bonded, and insured. We carry comprehensive liability insurance and workers' compensation coverage to protect both our team and your property during all projects.",
  },
  {
    category: 'general',
    question: 'Do you work on both residential and commercial projects?',
    answer:
      'Absolutely! We handle both residential homes and commercial properties. Our team has experience with everything from single bathroom renovations to large-scale commercial installations.',
  },
  {
    category: 'general',
    question: 'What areas do you serve?',
    answer:
      'We primarily serve the greater metropolitan area within a 50-mile radius of our main office. Contact us to confirm if we service your specific location - we may be able to accommodate projects outside our standard area.',
  },

  // Services & Installation
  {
    category: 'services',
    question: 'What types of tile installation services do you offer?',
    answer:
      'We offer comprehensive tile services including kitchen backsplashes, bathroom renovations, floor tiling, shower installations, fireplace surrounds, outdoor patios, and commercial installations. We also provide design consultation and maintenance services.',
  },
  {
    category: 'services',
    question: 'How long does a typical tile installation take?',
    answer:
      'Timeline varies by project size and complexity. A standard bathroom takes 3-5 days, kitchen backsplashes typically require 1-2 days, and floor installations range from 2-5 days depending on square footage and preparation needed.',
  },
  {
    category: 'services',
    question: 'Do you handle the demolition and prep work?',
    answer:
      'Yes, we provide complete service including demolition, surface preparation, waterproofing, and cleanup. We ensure your subfloor or walls are properly prepared for a long-lasting installation.',
  },
  {
    category: 'services',
    question: 'Can you install heated floors with tile?',
    answer:
      "Absolutely! We're experienced with radiant floor heating systems. We can install electric or hydronic heating systems beneath your tile floors for added comfort and luxury.",
  },
  {
    category: 'services',
    question: 'Do you offer emergency repair services?',
    answer:
      "Yes, we provide repair services for cracked tiles, damaged grout, water damage, and other tile-related issues. Contact us for urgent repairs and we'll prioritize your needs.",
  },

  // Pricing & Timeline
  {
    category: 'pricing',
    question: 'Do you provide free estimates?',
    answer:
      'Yes, we provide free, detailed estimates for all projects. Our consultations include measurements, design recommendations, material suggestions, and transparent pricing with no hidden fees.',
  },
  {
    category: 'pricing',
    question: 'What factors affect the cost of tile installation?',
    answer:
      'Pricing depends on tile type, square footage, pattern complexity, surface preparation needs, demolition requirements, and accessibility. Premium materials like natural stone cost more than standard ceramic tiles.',
  },
  {
    category: 'pricing',
    question: 'Do you require payment upfront?',
    answer:
      'We typically require a small deposit to secure your project date and order materials. The majority of payment is due upon completion. We accept cash, check, and major credit cards.',
  },
  {
    category: 'pricing',
    question: 'Can you work within my budget?',
    answer:
      "Absolutely! We offer solutions for various budgets and can recommend cost-effective materials and approaches that still deliver beautiful, durable results. We'll work with you to prioritize your needs.",
  },
  {
    category: 'pricing',
    question: 'What if the project takes longer than expected?',
    answer:
      "If delays are due to our work, there's no additional cost to you. If unforeseen issues arise (like structural problems), we'll discuss options and get your approval before proceeding with any additional work.",
  },

  // Materials & Design
  {
    category: 'materials',
    question: 'What types of tiles do you work with?',
    answer:
      'We work with all tile types including ceramic, porcelain, natural stone (marble, granite, travertine), glass, mosaic, subway tiles, large format tiles, and specialty designer tiles. We can source virtually any tile you desire.',
  },
  {
    category: 'materials',
    question: 'Can you help me choose the right tiles for my space?',
    answer:
      "Yes! Our design consultants will help you select tiles that match your style, budget, and practical needs. We consider factors like durability, maintenance, slip resistance, and how tiles will coordinate with your existing décor.",
  },
  {
    category: 'materials',
    question: 'Do you supply the tiles or do I need to purchase them?',
    answer:
      'We can handle material procurement for you, ensuring proper quantities and coordination. Alternatively, if you prefer to purchase tiles yourself, we can provide detailed material lists and specifications.',
  },
  {
    category: 'materials',
    question: "What's the difference between ceramic and porcelain tiles?",
    answer:
      'Porcelain is denser and less porous than ceramic, making it more durable and water-resistant. Porcelain is ideal for high-traffic areas and wet locations, while ceramic is cost-effective for walls and moderate-use areas.',
  },
  {
    category: 'materials',
    question: 'Are natural stone tiles harder to maintain?',
    answer:
      'Natural stone requires periodic sealing and gentle cleaning products, but with proper care, it can last decades and adds significant value. We provide detailed care instructions and can perform maintenance services.',
  },

  // Care & Maintenance
  {
    category: 'maintenance',
    question: 'What warranty do you offer on your work?',
    answer:
      'We provide a comprehensive 2-year warranty on all installation work, covering both materials and labor. This covers any defects in our workmanship, though normal wear and tear is not included.',
  },
  {
    category: 'maintenance',
    question: 'How do I maintain my new tile installation?',
    answer:
      "Regular cleaning with appropriate cleaners, prompt cleanup of spills, and periodic grout sealing will keep your tiles looking great. We provide detailed care instructions specific to your tile type and will recommend maintenance schedules.",
  },
  {
    category: 'maintenance',
    question: 'How often should grout be resealed?',
    answer:
      'Grout should typically be resealed every 1-2 years in high-moisture areas like showers, and every 2-3 years in other areas. We offer maintenance services and can remind you when resealing is due.',
  },
  {
    category: 'maintenance',
    question: 'What should I do if a tile cracks?',
    answer:
      'Contact us for an assessment. Small cracks might be repairable, but replacement is often the best solution. We keep detailed records and photos of installations to help match materials for repairs.',
  },
  {
    category: 'maintenance',
    question: 'Can you clean and restore old tile installations?',
    answer:
      'Yes! We offer restoration services including deep cleaning, grout renewal, resealing, and tile replacement. We can often restore older installations to like-new condition at a fraction of replacement cost.',
  },
];
