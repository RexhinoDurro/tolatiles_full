export interface LocationContent {
  localDescription: string;      // 150-200 words unique per location
  localFeatures: string[];       // 3 location-specific features
  areasServed: string[];         // Neighborhoods/cities
  keywords: string[];            // Local SEO keywords
  sellingPoints: string[];       // 3 unique selling points
}

export interface Service {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  icon: string;
  features: string[];
  timeline: string;
  locations: {
    florida: LocationContent;
    jacksonville: LocationContent;
    'st-augustine': LocationContent;
  };
}

export type ServiceId = 'kitchen-backsplash' | 'bathroom' | 'flooring' | 'patio' | 'fireplace' | 'shower';

export const services: Service[] = [
  {
    id: 'kitchen-backsplash',
    title: 'Kitchen Backsplash Installation',
    description: 'Transform your kitchen with stunning custom backsplash designs using premium tiles.',
    detailedDescription:
      "Our expert team specializes in creating beautiful, functional kitchen backsplashes that protect your walls while adding aesthetic value to your space. We work with a wide variety of materials including ceramic, porcelain, glass, and natural stone tiles to match your unique style and budget. From modern subway tiles to intricate mosaic patterns, we bring your vision to life with precision and craftsmanship.",
    icon: 'ChefHat',
    features: [
      'Custom design consultation and planning',
      'Professional surface preparation and leveling',
      'Precision tile cutting and installation',
      'Expert grouting and sealing',
      'Post-installation cleanup and inspection',
      'Material selection guidance',
    ],
    timeline: '1-3 days',
    locations: {
      florida: {
        localDescription: "Serving Northeast Florida homeowners, our kitchen backsplash installations combine coastal-inspired design with hurricane-ready durability. Whether you're in a Jacksonville high-rise, a St. Augustine historic home, or a Ponte Vedra beach house, we bring the same attention to detail and Florida Building Code compliance to every project. Our team understands the unique challenges of Florida's humid climate, selecting materials and adhesives that resist moisture and mold growth. We've completed hundreds of backsplash projects across Duval, St. Johns, and Clay counties, transforming kitchens from dated to stunning. From sleek glass tiles that reflect natural light to hand-painted ceramic pieces that add character, we help you find the perfect backsplash for your Florida lifestyle.",
        localFeatures: [
          'Humidity-resistant materials and installation methods',
          'Florida Building Code compliant installations',
          'Coastal and contemporary design expertise',
        ],
        areasServed: ['Jacksonville', 'St. Augustine', 'Ponte Vedra', 'Orange Park', 'Fleming Island', 'Palm Coast'],
        keywords: ['tile installer florida', 'northeast florida tile contractor', 'florida backsplash installation'],
        sellingPoints: [
          'Licensed and insured throughout Northeast Florida',
          'Climate-appropriate material recommendations',
          'Serving Jacksonville, St. Augustine, and surrounding areas',
        ],
      },
      jacksonville: {
        localDescription: "Jacksonville homeowners in Riverside and San Marco know that a beautiful kitchen backsplash can transform the heart of their home. Our team has installed countless backsplashes throughout Duval County, from the historic bungalows of Avondale to the modern condos of Downtown Jacksonville. We understand the unique aesthetic of Jacksonville neighborhoods—whether you prefer the eclectic charm of Five Points or the elegant style of Mandarin. Florida's humidity presents real challenges, but our moisture-resistant installation techniques ensure your backsplash stays beautiful for years. We source materials that complement Jacksonville's blend of contemporary and traditional architecture, offering everything from classic subway tiles to bold geometric patterns that make a statement.",
        localFeatures: [
          'Expertise with Jacksonville historic home renovations',
          'Same-day consultations throughout Duval County',
          'Materials suited for Jacksonville\'s humid subtropical climate',
        ],
        areasServed: ['Riverside', 'San Marco', 'Mandarin', 'Jacksonville Beach', 'Neptune Beach', 'Atlantic Beach', 'Orange Park', 'Avondale', 'Ortega'],
        keywords: ['tile installer jacksonville fl', 'jax tile contractor', 'duval county tile', 'jacksonville backsplash installation'],
        sellingPoints: [
          'Deep knowledge of Jacksonville neighborhood styles',
          'Quick response times across Duval County',
          'Experience with both new construction and renovations',
        ],
      },
      'st-augustine': {
        localDescription: "In the Ancient City, kitchen backsplashes must honor the unique character of St. Augustine's architecture while standing up to our coastal climate. Our installers have worked in homes throughout St. Johns County, from the historic districts downtown to the beachside communities of Vilano Beach and Crescent Beach. We specialize in designs that complement Spanish Colonial and Mediterranean-style kitchens, popular in our area's vacation rentals and primary residences alike. Salt air and humidity require special attention—we use corrosion-resistant materials and premium sealants that protect your investment. Whether your home overlooks the Intracoastal or sits in the shaded streets of Lincolnville, we create backsplashes that capture the timeless elegance St. Augustine is known for while meeting modern durability standards.",
        localFeatures: [
          'Historic home backsplash expertise',
          'Coastal-grade materials for salt air exposure',
          'Vacation rental quick-turnaround services',
        ],
        areasServed: ['Downtown St. Augustine', 'St. Augustine Beach', 'Vilano Beach', 'Anastasia Island', 'World Golf Village', 'Ponte Vedra', 'Nocatee'],
        keywords: ['tile installer st augustine fl', 'st johns county tile', 'ancient city tile contractor', 'st augustine backsplash'],
        sellingPoints: [
          'Specialists in historic St. Augustine home renovations',
          'Understanding of coastal building requirements',
          'Fast turnarounds for vacation rental properties',
        ],
      },
    },
  },
  {
    id: 'bathroom',
    title: 'Bathroom Tile Installation',
    description: 'Complete bathroom tiling solutions including floors, walls, and shower enclosures.',
    detailedDescription:
      "Create a spa-like retreat in your home with our comprehensive bathroom tiling services. We handle everything from floor tiles to wall installations and custom shower designs. Our waterproofing expertise ensures your bathroom not only looks beautiful but also stands the test of time. We use only the highest quality materials and proven installation techniques to prevent moisture damage and maintain the integrity of your bathroom.",
    icon: 'Bath',
    features: [
      'Complete waterproofing solutions',
      'Custom shower and tub surrounds',
      'Slip-resistant flooring options',
      'Heated floor installation available',
      'Niche and shelf integration',
      'Matching grout color selection',
    ],
    timeline: '3-7 days',
    locations: {
      florida: {
        localDescription: "Bathroom tile installation in Northeast Florida demands expertise in waterproofing and humidity control that goes beyond typical installations. Our team serves homeowners from Jacksonville to Palm Coast, bringing professional-grade waterproofing systems and mold-resistant materials to every bathroom project. Florida's year-round humidity means we pay extra attention to ventilation considerations and moisture barriers behind every tile. We've renovated master bathrooms in Ponte Vedra mansions, updated guest baths in St. Augustine vacation homes, and transformed powder rooms in Orange Park family residences. Our installations meet Florida Building Code requirements and exceed industry standards for moisture protection, ensuring your bathroom remains beautiful and functional regardless of our subtropical climate.",
        localFeatures: [
          'Advanced waterproofing for Florida humidity',
          'Mold and mildew resistant materials',
          'Florida Building Code compliant installations',
        ],
        areasServed: ['Jacksonville', 'St. Augustine', 'Ponte Vedra', 'Orange Park', 'Fleming Island', 'Palm Coast', 'Green Cove Springs'],
        keywords: ['bathroom tile florida', 'florida bathroom renovation', 'northeast florida tile installer'],
        sellingPoints: [
          'Humidity-focused installation techniques',
          'Comprehensive waterproofing warranty',
          'Service throughout Northeast Florida',
        ],
      },
      jacksonville: {
        localDescription: "Jacksonville bathrooms face unique challenges—from the humidity that seeps into Riverside bungalows to the salt air affecting Jacksonville Beach condos. Our bathroom tile installation team has completed hundreds of projects across Duval County, developing specialized techniques for our local climate. In Mandarin and the Southside, we've transformed dated builder-grade bathrooms into modern retreats. Along the beaches, we use marine-grade materials that resist corrosion. Our master bathroom renovations in San Marco and Ortega showcase attention to detail that matches these historic neighborhoods' character. Every installation includes premium waterproofing membranes and proper slope for drainage, critical in Jacksonville's wet climate. We offer heated floor options perfect for those surprisingly cool Florida mornings.",
        localFeatures: [
          'Marine-grade materials for beach communities',
          'Historic home bathroom renovation expertise',
          'Heated floor systems for Jacksonville homes',
        ],
        areasServed: ['Riverside', 'San Marco', 'Mandarin', 'Jacksonville Beach', 'Neptune Beach', 'Atlantic Beach', 'Southside', 'Ortega', 'Avondale'],
        keywords: ['bathroom tile jacksonville fl', 'jacksonville bathroom renovation', 'duval county bathroom tile', 'jax bathroom remodel'],
        sellingPoints: [
          'Hundreds of Duval County bathrooms completed',
          'Beach-appropriate material expertise',
          'Same-week consultations available',
        ],
      },
      'st-augustine': {
        localDescription: "St. Augustine bathrooms tell a story—from the coquina-inspired designs in historic downtown homes to the bright, airy beach house bathrooms on Anastasia Island. Our team specializes in bathroom tile installations that honor the Ancient City's architectural heritage while incorporating modern waterproofing technology. Vacation rental owners throughout St. Johns County trust us for durable, easy-clean installations that handle heavy guest traffic. We've worked in World Golf Village master suites, Vilano Beach cottages, and historic bed-and-breakfasts in the downtown district. Salt air and coastal humidity require extra protection, so we use premium sealants and corrosion-resistant fixtures. Whether you're updating a century-old bathroom or building new in Nocatee, our installations blend seamlessly with St. Augustine's unique character.",
        localFeatures: [
          'Historic bathroom renovation specialists',
          'High-traffic vacation rental installations',
          'Coastal corrosion protection',
        ],
        areasServed: ['Downtown St. Augustine', 'St. Augustine Beach', 'Vilano Beach', 'Anastasia Island', 'World Golf Village', 'Nocatee', 'Hastings'],
        keywords: ['bathroom tile st augustine fl', 'st johns county bathroom renovation', 'st augustine bathroom remodel', 'ancient city tile'],
        sellingPoints: [
          'Trusted by St. Johns County vacation rental owners',
          'Experience with historic building requirements',
          'Fast turnarounds for rental properties',
        ],
      },
    },
  },
  {
    id: 'flooring',
    title: 'Floor Tiling',
    description: 'Durable and elegant floor tiling for residential and commercial spaces.',
    detailedDescription:
      "Whether you're updating a single room or tiling an entire property, our flooring experts deliver exceptional results. We specialize in various flooring materials including ceramic, porcelain, natural stone, and luxury vinyl tile. Our meticulous installation process ensures proper leveling, spacing, and finishing for a floor that's both beautiful and built to last. We pay special attention to high-traffic areas and can recommend the best materials for your specific needs.",
    icon: 'Home',
    features: [
      'Subfloor preparation and leveling',
      'Radiant heating system installation',
      'Large format tile expertise',
      'Pattern design and layout',
      'Transition strip installation',
      'Commercial-grade options available',
    ],
    timeline: '2-5 days',
    locations: {
      florida: {
        localDescription: "Floor tile installation in Northeast Florida requires understanding how our climate affects both materials and subfloors. Concrete slabs common in Florida homes need proper preparation to ensure lasting adhesion, and we bring that expertise to every project from Jacksonville to Palm Coast. We specialize in large format porcelain tiles that create seamless, modern looks while hiding the imperfections common in Florida construction. Our installations handle the temperature fluctuations between air-conditioned interiors and humid outdoor air. We've tiled open-concept living spaces in Ponte Vedra, commercial lobbies in downtown Jacksonville, and cozy Florida rooms throughout the region. Every floor we install includes proper expansion joints and moisture barriers suited to our subtropical environment.",
        localFeatures: [
          'Florida slab foundation expertise',
          'Temperature fluctuation considerations',
          'Large format tile specialization',
        ],
        areasServed: ['Jacksonville', 'St. Augustine', 'Ponte Vedra', 'Orange Park', 'Fleming Island', 'Palm Coast', 'Middleburg'],
        keywords: ['floor tile florida', 'florida flooring installation', 'northeast florida tile floors'],
        sellingPoints: [
          'Experts in Florida concrete slab installations',
          'Climate-appropriate material selection',
          'Residential and commercial flooring services',
        ],
      },
      jacksonville: {
        localDescription: "Jacksonville's diverse housing stock—from 1920s Riverside bungalows to brand-new Arlington townhomes—demands flooring expertise that adapts to every situation. Our floor tile installations have transformed living rooms in San Marco, kitchens in Mandarin, and entire first floors in Southside new construction. We excel with large format tiles that make Jacksonville's open floor plans feel even more spacious. The concrete slabs typical in Duval County construction require specific preparation techniques we've perfected over years of local work. For Jacksonville Beach and Atlantic Beach properties, we recommend porcelain tiles rated for moisture resistance. Our team handles everything from elegant marble entryways in Ortega to durable commercial flooring in Jacksonville's business districts.",
        localFeatures: [
          'Open floor plan design expertise',
          'Duval County concrete slab specialists',
          'Beach-appropriate moisture-resistant options',
        ],
        areasServed: ['Riverside', 'San Marco', 'Mandarin', 'Jacksonville Beach', 'Neptune Beach', 'Southside', 'Arlington', 'Ortega', 'Downtown Jacksonville'],
        keywords: ['floor tile jacksonville fl', 'jacksonville flooring installation', 'duval county floor tile', 'jax tile floors'],
        sellingPoints: [
          'Experience across all Jacksonville neighborhoods',
          'Large format tile installation experts',
          'Both residential and commercial capabilities',
        ],
      },
      'st-augustine': {
        localDescription: "St. Augustine's historic homes and coastal properties present unique flooring challenges that our team has mastered through years of local experience. From the uneven subfloors in downtown's oldest buildings to the moisture concerns in Vilano Beach cottages, we know how to create beautiful, lasting tile floors throughout St. Johns County. Vacation rentals need flooring that withstands constant traffic and sandy feet—we recommend specific porcelain tiles proven in our coastal environment. In World Golf Village and Nocatee, we install elegant large format tiles that complement modern open floor plans. Historic properties often require careful leveling work before installation, and our craftsmen take pride in preserving the character of St. Augustine's architectural heritage while providing modern durability.",
        localFeatures: [
          'Historic building floor leveling expertise',
          'High-traffic vacation rental durability',
          'Coastal-grade moisture protection',
        ],
        areasServed: ['Downtown St. Augustine', 'St. Augustine Beach', 'Vilano Beach', 'Anastasia Island', 'World Golf Village', 'Nocatee', 'Ponte Vedra'],
        keywords: ['floor tile st augustine fl', 'st johns county flooring', 'st augustine floor installation', 'ancient city tile floors'],
        sellingPoints: [
          'Specialists in historic St. Augustine properties',
          'Recommended by vacation rental managers',
          'Fast, clean installations for occupied homes',
        ],
      },
    },
  },
  {
    id: 'patio',
    title: 'Patio & Outdoor Tile',
    description: 'Weather-resistant outdoor tiling for patios, decks, and pool areas.',
    detailedDescription:
      'Extend your living space outdoors with our professional patio and outdoor tiling services. We use weather-resistant, slip-resistant materials designed to withstand the elements while maintaining their beauty year-round. Our outdoor installations are perfect for patios, pool decks, walkways, and outdoor entertainment areas. We ensure proper drainage and use specialized adhesives and grouts suitable for outdoor conditions and temperature fluctuations.',
    icon: 'Palette',
    features: [
      'Freeze-thaw resistant materials',
      'Proper drainage planning',
      'Slip-resistant surface options',
      'UV-resistant grout and sealant',
      'Pool deck specialization',
      'Outdoor kitchen backsplash',
    ],
    timeline: '3-6 days',
    locations: {
      florida: {
        localDescription: "Outdoor living is year-round in Northeast Florida, making patio tile installation one of our most popular services. From Jacksonville pool decks to St. Augustine courtyard patios, we create beautiful outdoor spaces that handle Florida's intense sun, afternoon thunderstorms, and occasional tropical weather. Our slip-resistant tiles provide safety around pools while UV-resistant grouts maintain their color despite constant sun exposure. We've transformed backyards throughout Duval and St. Johns counties into entertainment destinations with outdoor kitchens, covered lanais, and elegant walkways. Proper drainage is critical in Florida's heavy rain season, and every installation includes careful slope planning. Whether you're enhancing a Ponte Vedra pool area or creating a cozy Fleming Island patio, we deliver outdoor spaces built for Florida living.",
        localFeatures: [
          'Hurricane and storm-resistant installations',
          'UV-resistant materials for Florida sun',
          'Expert drainage planning for heavy rains',
        ],
        areasServed: ['Jacksonville', 'St. Augustine', 'Ponte Vedra', 'Orange Park', 'Fleming Island', 'Palm Coast', 'Fernandina Beach'],
        keywords: ['patio tile florida', 'florida outdoor tile', 'northeast florida patio installation', 'florida pool deck tile'],
        sellingPoints: [
          'Year-round outdoor living expertise',
          'Storm-resistant installation methods',
          'Pool deck and outdoor kitchen specialists',
        ],
      },
      jacksonville: {
        localDescription: "Jacksonville's outdoor lifestyle calls for patio spaces that work as hard as you play. Our team has installed patio tiles throughout Duval County, from the poolside decks of Ponte Vedra to the cozy backyard patios of Mandarin. We understand Jacksonville's weather patterns—scorching summers, afternoon storms, and the occasional freeze—and select materials that handle it all. In Jacksonville Beach and Atlantic Beach, we use marine-grade installations that resist salt air corrosion. Outdoor kitchens have become increasingly popular in Riverside and San Marco, and we offer backsplash installations that complement your grilling setup. Every Jacksonville patio installation includes proper drainage planning to handle our summer downpours and slip-resistant surfaces for pool areas.",
        localFeatures: [
          'Duval County outdoor living specialists',
          'Marine-grade beach community installations',
          'Outdoor kitchen tile expertise',
        ],
        areasServed: ['Riverside', 'San Marco', 'Mandarin', 'Jacksonville Beach', 'Ponte Vedra Beach', 'Atlantic Beach', 'Orange Park', 'Southside'],
        keywords: ['patio tile jacksonville fl', 'jacksonville outdoor tile', 'duval county patio installation', 'jax pool deck tile'],
        sellingPoints: [
          'Jacksonville outdoor living experts',
          'Beach-appropriate installations',
          'Storm drainage expertise',
        ],
      },
      'st-augustine': {
        localDescription: "St. Augustine's Spanish Colonial architecture makes courtyard patios and outdoor living spaces essential to the local lifestyle. Our outdoor tile installations capture the Ancient City's charm while providing modern durability against salt air and coastal weather. We've created stunning courtyard patios in the historic district, pool decks overlooking the Intracoastal at Vilano Beach, and outdoor entertainment areas in World Golf Village. Vacation rental owners especially value our slip-resistant pool deck installations that keep guests safe while requiring minimal maintenance. St. Augustine's afternoon rain showers demand expert drainage planning, which we incorporate into every design. From traditional terra cotta looks to contemporary large format pavers, we help you extend your living space into St. Augustine's beautiful outdoors.",
        localFeatures: [
          'Spanish Colonial courtyard expertise',
          'Vacation rental pool deck specialists',
          'Historic district outdoor installations',
        ],
        areasServed: ['Downtown St. Augustine', 'St. Augustine Beach', 'Vilano Beach', 'Anastasia Island', 'World Golf Village', 'Ponte Vedra', 'Palm Coast'],
        keywords: ['patio tile st augustine fl', 'st johns county outdoor tile', 'st augustine patio installation', 'ancient city pool deck'],
        sellingPoints: [
          'Courtyard and historic patio specialists',
          'Vacation rental owner trusted',
          'Coastal weather durability',
        ],
      },
    },
  },
  {
    id: 'fireplace',
    title: 'Fireplace Tile',
    description: 'Stunning fireplace surrounds and hearths with heat-resistant materials.',
    detailedDescription:
      "Create a focal point in your home with a beautifully tiled fireplace surround. We specialize in both traditional and contemporary fireplace designs using heat-resistant materials that are both safe and stunning. From rustic stone to sleek modern tiles, we can help you choose the perfect materials to complement your home's decor. Our installations meet all safety codes and building regulations while delivering the aesthetic impact you desire.",
    icon: 'Hammer',
    features: [
      'Heat-resistant material selection',
      'Custom surround design',
      'Mantel and hearth integration',
      'Safety code compliance',
      'Stone and tile combinations',
      'Accent lighting options',
    ],
    timeline: '2-4 days',
    locations: {
      florida: {
        localDescription: "While Florida's mild climate means fewer roaring fires, fireplace surrounds remain a beloved design feature in homes throughout Northeast Florida. Our fireplace tile installations create stunning focal points in living rooms from Jacksonville to St. Augustine. Gas fireplaces are particularly popular here, and we specialize in surrounds that safely accommodate these units while making a visual statement. We've installed elegant marble surrounds in Ponte Vedra estates, rustic stone treatments in Orange Park family rooms, and contemporary linear designs in modern Jacksonville condos. Even decorative fireplaces—those that never see flame—deserve beautiful tile work that anchors the room. Our installations meet all Florida building codes for heat clearance while allowing your creativity to shine.",
        localFeatures: [
          'Gas fireplace surround specialists',
          'Florida building code compliance',
          'Decorative fireplace design expertise',
        ],
        areasServed: ['Jacksonville', 'St. Augustine', 'Ponte Vedra', 'Orange Park', 'Fleming Island', 'Nocatee', 'Palm Coast'],
        keywords: ['fireplace tile florida', 'florida fireplace surround', 'northeast florida fireplace installation'],
        sellingPoints: [
          'Gas fireplace installation experts',
          'Create stunning focal points',
          'Safety code compliant designs',
        ],
      },
      jacksonville: {
        localDescription: "Jacksonville homes increasingly feature fireplaces as design statements rather than heat sources, and our tile surrounds help make them unforgettable focal points. From the craftsman bungalows of Riverside where original fireplaces get updated surrounds, to the new construction in Nocatee where gas units need elegant framing, we bring fireplace tile expertise throughout Duval County. We've created dramatic floor-to-ceiling installations in San Marco living rooms and cozy, traditional surrounds in Mandarin family spaces. The clean lines of modern gas fireplaces offer exciting design opportunities—geometric tiles, stacked stone, or sleek porcelain panels that transform your space. Every Jacksonville fireplace installation we complete meets local building codes while achieving the visual impact you envision.",
        localFeatures: [
          'Historic fireplace restoration expertise',
          'Modern gas fireplace surrounds',
          'Floor-to-ceiling installation capability',
        ],
        areasServed: ['Riverside', 'San Marco', 'Mandarin', 'Ortega', 'Avondale', 'Nocatee', 'Southside', 'Arlington'],
        keywords: ['fireplace tile jacksonville fl', 'jacksonville fireplace surround', 'duval county fireplace installation', 'jax fireplace tile'],
        sellingPoints: [
          'Historic Riverside fireplace experts',
          'Modern and traditional designs',
          'Complete surround transformations',
        ],
      },
      'st-augustine': {
        localDescription: "Fireplaces in St. Augustine often serve as decorative centerpieces that honor the city's rich architectural heritage. Our fireplace tile installations complement everything from Spanish Revival homes in the historic district to Mediterranean-style estates in Ponte Vedra. We've restored original fireplace surrounds in century-old bed-and-breakfasts and created contemporary statements in World Golf Village great rooms. Even non-working fireplaces become stunning focal points with the right tile treatment—hand-painted Talavera tiles, elegant marble, or textured stone that adds depth and character. Vacation rental properties benefit from eye-catching fireplace surrounds that photograph beautifully and create memorable guest experiences. Our St. Augustine fireplace installations blend Old World charm with modern installation techniques.",
        localFeatures: [
          'Historic fireplace restoration',
          'Spanish and Mediterranean design expertise',
          'Decorative non-working fireplace beautification',
        ],
        areasServed: ['Downtown St. Augustine', 'St. Augustine Beach', 'Vilano Beach', 'World Golf Village', 'Ponte Vedra', 'Nocatee', 'Palm Coast'],
        keywords: ['fireplace tile st augustine fl', 'st johns county fireplace surround', 'st augustine fireplace installation', 'ancient city fireplace tile'],
        sellingPoints: [
          'Historic fireplace preservation experts',
          'Mediterranean design specialists',
          'Vacation rental photo-ready finishes',
        ],
      },
    },
  },
  {
    id: 'shower',
    title: 'Shower Installation',
    description: 'Custom shower tile installations with complete waterproofing solutions.',
    detailedDescription:
      "Transform your bathroom with a custom-tiled shower that combines functionality with luxury. Our shower installations feature complete waterproofing systems, proper slope for drainage, and expertly installed tiles that create a beautiful, water-tight enclosure. We can create everything from simple, elegant designs to elaborate multi-pattern installations with accent strips, niches, and benches. All our shower installations come with a comprehensive waterproofing warranty.",
    icon: 'Wrench',
    features: [
      'Complete waterproofing membrane',
      'Custom shower pan installation',
      'Built-in niches and benches',
      'Multiple tile pattern options',
      'Accent strip integration',
      'Lifetime leak warranty',
    ],
    timeline: '4-7 days',
    locations: {
      florida: {
        localDescription: "Shower installations in Northeast Florida demand waterproofing expertise that goes beyond standard practices. Our team has perfected moisture protection systems designed for Florida's intense humidity, preventing the mold and mildew issues that plague many local bathrooms. From Jacksonville to Palm Coast, we've installed custom showers that combine luxury with lasting durability. Curbless walk-in showers have become especially popular for their accessibility and modern aesthetics—we ensure proper drainage slope even without traditional curbs. Our installations include vapor barriers, waterproofing membranes, and mold-resistant backer boards that work together to protect your home. Whether you want a spa-like rainfall shower in Ponte Vedra or a practical, beautiful guest shower in Orange Park, we deliver Florida-ready solutions.",
        localFeatures: [
          'Advanced humidity-resistant waterproofing',
          'Curbless shower drainage expertise',
          'Mold prevention systems',
        ],
        areasServed: ['Jacksonville', 'St. Augustine', 'Ponte Vedra', 'Orange Park', 'Fleming Island', 'Palm Coast', 'Green Cove Springs'],
        keywords: ['shower tile florida', 'florida shower installation', 'northeast florida custom shower', 'florida bathroom remodel'],
        sellingPoints: [
          'Florida humidity waterproofing experts',
          'Curbless and accessible designs',
          'Lifetime leak protection warranty',
        ],
      },
      jacksonville: {
        localDescription: "Jacksonville homeowners expect showers that feel like personal retreats, and our installations deliver that experience with bulletproof waterproofing underneath. We've transformed master bathrooms throughout Duval County—creating spa-worthy showers in Mandarin, elegant walk-ins in San Marco, and beach-rinse ready enclosures in Jacksonville Beach. Our curbless shower installations are perfect for aging-in-place renovations popular in established neighborhoods like Ortega and Avondale. Jacksonville's humidity makes proper waterproofing critical; we use premium membrane systems and mold-resistant materials that protect your investment for decades. Every shower includes thoughtful details—properly placed niches for shampoo, solid benches for comfort, and drainage slopes that keep water moving. From modest updates to complete luxury transformations, we make Jacksonville showers shine.",
        localFeatures: [
          'Aging-in-place accessible designs',
          'Beach house rinse-off shower expertise',
          'Luxury master shower transformations',
        ],
        areasServed: ['Riverside', 'San Marco', 'Mandarin', 'Jacksonville Beach', 'Neptune Beach', 'Atlantic Beach', 'Ortega', 'Avondale', 'Southside'],
        keywords: ['shower tile jacksonville fl', 'jacksonville shower installation', 'duval county custom shower', 'jax bathroom tile'],
        sellingPoints: [
          'Curbless aging-in-place specialists',
          'Beach community shower experts',
          'Luxury spa-shower transformations',
        ],
      },
      'st-augustine': {
        localDescription: "St. Augustine showers must handle everything from sandy beach feet to the Ancient City's persistent coastal humidity. Our shower installations throughout St. Johns County combine beautiful tile work with waterproofing systems built for our unique environment. Vacation rental owners particularly value our quick-drain floors and easy-clean tile selections—practical features guests appreciate without sacrificing style. In World Golf Village and Nocatee, we create luxurious walk-in showers with rain heads and body sprays. Historic district homes often require creative solutions for small bathrooms, and our space-efficient designs maximize every inch. We've installed showers in Vilano Beach cottages, Anastasia Island beach houses, and elegant homes throughout Ponte Vedra. Every St. Augustine shower installation includes our comprehensive waterproofing warranty and humidity-resistant construction.",
        localFeatures: [
          'Beach house quick-drain installations',
          'Vacation rental practical luxury',
          'Small bathroom space optimization',
        ],
        areasServed: ['Downtown St. Augustine', 'St. Augustine Beach', 'Vilano Beach', 'Anastasia Island', 'World Golf Village', 'Nocatee', 'Ponte Vedra'],
        keywords: ['shower tile st augustine fl', 'st johns county shower installation', 'st augustine custom shower', 'ancient city bathroom remodel'],
        sellingPoints: [
          'Beach house shower specialists',
          'Vacation rental quick turnarounds',
          'Historic small bathroom experts',
        ],
      },
    },
  },
];
