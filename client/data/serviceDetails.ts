// Per-service extended content: SEO keywords, materials, FAQs, process steps.
// Visual theme classes live in ServiceDetailPage.tsx (must be in Tailwind's content scan).

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceMaterial {
  name: string;
  description: string;
}

export interface ServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServiceDetails {
  /** Base H1 keyword phrase — location suffix appended by the component */
  keywordBase: string;
  /** Heading for the "Why Choose Us" section */
  whyHeading: string;
  /** Short intro for the Why section subtitle */
  whySubtitle: string;
  /** Tile materials/styles specific to this service */
  materials: ServiceMaterial[];
  /** Service-specific FAQs (renders accordion UI + FAQPage schema) */
  faqs: ServiceFAQ[];
  /** Service-specific installation process steps */
  processSteps: ServiceProcessStep[];
}

export const serviceDetailsMap: Record<string, ServiceDetails> = {
  'kitchen-backsplash': {
    keywordBase: 'Expert Kitchen Backsplash Tile Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Kitchen Backsplash',
    whySubtitle: 'Design expertise and precision craftsmanship for the heart of your home',
    materials: [
      {
        name: 'Subway Tiles',
        description:
          'Classic 3×6 and 4×12 ceramic and porcelain subway tiles — timeless, easy to clean, and available in hundreds of colors and finishes for modern or traditional kitchens.',
      },
      {
        name: 'Glass Mosaic',
        description:
          'Reflective glass mosaic panels amplify natural light and add brilliant color depth behind your range or sink. Non-porous and fully waterproof.',
      },
      {
        name: 'Natural Stone',
        description:
          'Marble, travertine, and slate backsplash tiles deliver a luxurious, one-of-a-kind look with genuine organic texture. Sealed for Florida humidity.',
      },
      {
        name: 'Hexagonal Tiles',
        description:
          'On-trend hex patterns in ceramic or porcelain add geometric interest and personality. Available in penny-round, 2-inch, and 4-inch formats.',
      },
      {
        name: 'Hand-Painted Ceramic',
        description:
          'Artisan Talavera and hand-painted ceramics bring color, character, and a personal story to any kitchen — especially popular in St. Augustine homes.',
      },
      {
        name: 'Large Format Porcelain Slabs',
        description:
          'Minimal-grout, large format porcelain tiles create a seamless, contemporary look that is easier to clean and visually expands your kitchen.',
      },
    ],
    faqs: [
      {
        question: 'How long does kitchen backsplash tile installation take?',
        answer:
          'Most kitchen backsplash installations are completed in 1 to 3 days. A standard range surround takes about one day. Full surround installations covering all countertop walls take 2–3 days. We work efficiently to minimize disruption to your kitchen routine.',
      },
      {
        question: 'What tile materials work best for kitchen backsplashes in Florida?',
        answer:
          "Glass, ceramic, and porcelain tiles perform exceptionally well in Florida kitchens. Porcelain is especially popular because it resists moisture, heat, and grease stains. Glass tiles are non-porous and clean easily. Natural stone is beautiful but requires periodic sealing to handle Florida's humidity and kitchen grease splatter.",
      },
      {
        question: 'How much does kitchen backsplash installation cost in Jacksonville or St. Augustine?',
        answer:
          'Backsplash installation in Northeast Florida typically runs $15 to $40 per square foot installed, depending on tile material complexity and prep work required. We provide free, detailed estimates with no hidden fees. Contact us for a same-week consultation.',
      },
      {
        question: 'Can you install backsplash tile over existing tile?',
        answer:
          'In many cases, yes. If the existing tile is solidly adhered and the wall can handle the added weight, we can tile over it. However, if tiles are cracked, loose, or if building up height creates clearance issues with outlets or cabinets, removal is the better approach. We assess this during your free consultation.',
      },
      {
        question: 'Do you match grout colors to existing countertops or cabinets?',
        answer:
          'Absolutely. Grout color selection is part of our design consultation process. We bring samples to your home and work with your countertop, cabinet, and appliance colors to choose a grout that ties everything together — whether matching, contrasting, or complementary in tone.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Design & Material Selection',
        description:
          'We bring tile samples to your kitchen and help you choose the perfect pattern, color, and material for your space and budget.',
      },
      {
        step: '02',
        title: 'Wall Preparation',
        description:
          'Removal of old backsplash (if needed), surface cleaning, leveling, and moisture-resistant backer installation.',
      },
      {
        step: '03',
        title: 'Expert Installation',
        description:
          'Precision tile cutting, layout planning, and professional setting using moisture-resistant adhesive suited for Florida kitchens.',
      },
      {
        step: '04',
        title: 'Grout & Seal',
        description:
          'Color-matched grouting, protective sealant application, grout haze removal, and final cleanup for a kitchen-ready finish.',
      },
    ],
  },

  bathroom: {
    keywordBase: 'Professional Bathroom Tile Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Bathroom Renovation',
    whySubtitle: 'Waterproofing expertise and spa-quality craftsmanship in every bathroom we build',
    materials: [
      {
        name: 'Large Format Porcelain',
        description:
          'Oversized 24×48 or 12×24 porcelain wall tiles that minimize grout lines and create a clean, spa-like appearance in master baths and ensuites. Ideal for Florida humidity.',
      },
      {
        name: 'Slip-Resistant Floor Tiles',
        description:
          'Matte and textured porcelain floor tiles with PEI rating 3–4, designed specifically for wet bathroom floors. Safe, durable, and low-maintenance.',
      },
      {
        name: 'Natural Stone',
        description:
          'Marble, travertine, and slate tiles bring organic luxury to bathroom floors and feature walls. Honed and properly sealed for moisture protection in Florida bathrooms.',
      },
      {
        name: 'Mosaic Accent Tiles',
        description:
          'Glass, stone, and porcelain mosaic tiles used for decorative borders, shower niches, and floor medallions that add personality and focal-point interest.',
      },
      {
        name: 'Wood-Look Porcelain Planks',
        description:
          'Porcelain plank tiles that replicate the warmth of hardwood without any moisture concern — a perfect alternative to wood flooring in Florida bathrooms.',
      },
      {
        name: 'Penny Round & Hex Tiles',
        description:
          'Classic circular mosaic tiles on mesh backing for vintage-inspired bathroom floors and shower pan flooring. Excellent grip and distinctive character.',
      },
    ],
    faqs: [
      {
        question: 'How long does a full bathroom tile installation take?',
        answer:
          'A complete bathroom tile installation — floor, walls, and shower — typically takes 3 to 7 days. Simple floor-only updates are done in 1–2 days. Larger master baths with custom shower designs may take up to 7 days. We provide a detailed schedule before work begins and stick to it.',
      },
      {
        question: 'What is the best tile for bathroom floors in Florida?',
        answer:
          "Porcelain tiles with a textured or matte finish are the top choice for Florida bathroom floors. They resist moisture, don't require sealing, and maintain their appearance year-round despite humidity. A PEI rating of 3 or higher ensures durability under daily foot traffic.",
      },
      {
        question: 'Do you provide a waterproofing warranty for bathroom tile installations?',
        answer:
          'Yes. Every bathroom tile installation includes our comprehensive waterproofing warranty covering the integrity of the moisture barrier and grout joints. We use industry-leading membrane systems — such as Schluter KERDI or Laticrete Hydro Ban — specifically engineered to prevent moisture intrusion behind tiles.',
      },
      {
        question: 'Can you tile over existing bathroom floor tiles?',
        answer:
          'Tiling over existing tiles is possible when they are firmly bonded, the subfloor is structurally sound, and the added height will not cause issues with doors or transitions. We assess this during your consultation. In many Florida homes with concrete slab construction, removal first produces the most reliable long-term result.',
      },
      {
        question: 'What is the difference between ceramic and porcelain tiles for bathrooms?',
        answer:
          "Porcelain is denser, less porous, and harder than ceramic, making it the preferred choice for bathroom floors in Florida's humid environment. Ceramic tiles work well for bathroom walls where moisture absorption is less critical. Porcelain costs slightly more but requires less maintenance and holds up better over the long term in wet applications.",
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Design Consultation',
        description:
          'We visit your bathroom, assess the space, and collaborate on tile selection, layout planning, and feature wall ideas.',
      },
      {
        step: '02',
        title: 'Waterproofing System',
        description:
          'Professional moisture barrier and waterproofing membrane installation — the critical foundation that prevents leaks for decades.',
      },
      {
        step: '03',
        title: 'Expert Tile Installation',
        description:
          'Precision installation on floors and walls, including custom cuts, built-in niches, benches, and decorative accent details.',
      },
      {
        step: '04',
        title: 'Finishing & Inspection',
        description:
          'Color-matched grout, sealant on natural stone, grout haze removal, and a complete customer walkthrough before we leave.',
      },
    ],
  },

  flooring: {
    keywordBase: 'Durable Floor Tile Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Floor Tile Project',
    whySubtitle: 'Florida slab expertise and precision leveling for floors that last decades',
    materials: [
      {
        name: 'Large Format Porcelain',
        description:
          'Oversized 24×24, 24×48, or 32×32 rectified porcelain tiles that create dramatic, seamless floors with minimal grout lines. The most popular choice for Northeast Florida open-plan homes.',
      },
      {
        name: 'Wood-Look Plank Tiles',
        description:
          'Porcelain plank tiles in 6×36 or 8×48 sizes replicate hardwood without Florida moisture concerns. Resists humidity, scratches, and heavy traffic on concrete slab floors.',
      },
      {
        name: 'Natural Travertine',
        description:
          'Classic travertine floor tiles bring timeless elegance to Florida homes. Filled and honed finishes are recommended for interior applications to minimize maintenance.',
      },
      {
        name: 'Ceramic Floor Tiles',
        description:
          'Cost-effective, durable ceramic tiles in a wide range of colors and textures. A reliable choice for laundry rooms, kitchens, and secondary bathrooms throughout Florida.',
      },
      {
        name: 'Slate & Natural Stone',
        description:
          'Natural slate and stone tiles add unique texture and earthy character to entryways, sunrooms, and Florida rooms. Each piece is naturally unique.',
      },
      {
        name: 'Commercial Porcelain',
        description:
          'Heavy-duty porcelain tiles rated for commercial-level traffic — used in home offices, garages, and high-traffic living areas requiring maximum durability.',
      },
    ],
    faqs: [
      {
        question: 'What is the best tile for high-traffic floors in a Florida home?',
        answer:
          'Porcelain tile is the top recommendation for high-traffic floors in Florida. Its water absorption rate under 0.5% makes it resistant to moisture, stains, and heavy foot traffic. Look for a PEI rating of 4 or 5 for entryways, kitchens, and hallways. Large format porcelain also hides dirt better between cleanings.',
      },
      {
        question: 'How do you prepare a concrete slab for tile installation in Florida?',
        answer:
          'Florida homes are built on concrete slabs that can have moisture vapor emission issues. We start with a moisture test, then grind high spots, fill low areas with self-leveling compound, and prime the surface. If vapor emission is a concern, we apply a vapor suppression membrane before setting tile to prevent adhesive failure down the road.',
      },
      {
        question: 'How long does floor tile installation take?',
        answer:
          'Most residential floor tile installations are completed in 2 to 5 days. A single room takes 1–2 days. Full first-floor renovations covering open-plan living and kitchen areas typically take 3–5 days. We factor in tile set time, grout curing, and a final sealing step in all our project timelines.',
      },
      {
        question: 'What tile size looks best in open-concept floor plans?',
        answer:
          'Large format tiles (24×24 or larger) look exceptional in open-concept spaces because fewer grout lines create a seamless, expansive appearance. Rectified tiles — cut to precise dimensions — allow for tight 1/16" grout joints that make the floor feel like one continuous surface. This is our most-requested look for Northeast Florida new builds and renovations.',
      },
      {
        question: 'Can tile be installed over existing hardwood floors?',
        answer:
          "Installing tile over hardwood is generally not recommended because wood flexes with Florida's humidity changes, causing tile to crack over time. The best approach is to remove the hardwood, check the subfloor, and install tile directly. In some cases a decoupling membrane (like Schluter DITRA) can isolate the tile from subfloor movement if removal is not feasible.",
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Subfloor Assessment',
        description:
          'We check for moisture vapor emission, levelness, and structural integrity — the foundation for a tile floor that lasts without cracking.',
      },
      {
        step: '02',
        title: 'Surface Leveling',
        description:
          'Grinding high spots, self-leveling compound for low areas, and primer application for optimal tile adhesion on Florida concrete slabs.',
      },
      {
        step: '03',
        title: 'Precision Installation',
        description:
          'Layout planning, diagonal or straight patterns, precision tile cutting, and expert setting with correct expansion joints throughout.',
      },
      {
        step: '04',
        title: 'Grout & Sealant',
        description:
          'Color-matched grouting, grout haze removal, and protective sealant to lock in the beauty and simplify long-term cleaning.',
      },
    ],
  },

  patio: {
    keywordBase: 'Outdoor Patio & Pool Deck Tile Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Outdoor Space',
    whySubtitle: 'Florida outdoor living expertise — built for sun, rain, and salt air',
    materials: [
      {
        name: 'Porcelain Pavers (20mm)',
        description:
          'Heavy-duty 20mm outdoor porcelain pavers designed for patios, pool decks, and walkways. Frost-resistant, UV-stable, and the most durable outdoor tile option available.',
      },
      {
        name: 'Travertine',
        description:
          "Classic Florida pool tile. Travertine's natural texture provides slip resistance, and its thermal properties keep the surface cooler underfoot even under direct Florida sun.",
      },
      {
        name: 'Slate',
        description:
          'Natural slate tiles provide rugged, earthy outdoor character and excellent slip resistance for patios, walkways, and courtyard areas throughout Northeast Florida.',
      },
      {
        name: 'Concrete-Look Porcelain',
        description:
          'Contemporary concrete-look outdoor tiles deliver an industrial-modern aesthetic without the maintenance of real concrete. UV-stable pigments and frost-resistant body.',
      },
      {
        name: 'Terra Cotta',
        description:
          "Traditional terra cotta tiles bring warmth and Mediterranean charm to outdoor courtyards and covered lanais — a natural fit for St. Augustine's Spanish Colonial architecture.",
      },
      {
        name: 'Anti-Slip Textured Porcelain',
        description:
          'Safety-rated anti-slip porcelain tiles with DCOF (Dynamic Coefficient of Friction) above 0.42 — required for pool deck and commercial outdoor installations in Florida.',
      },
    ],
    faqs: [
      {
        question: 'What tiles are safest around pool areas in Florida?',
        answer:
          'Tiles with a Dynamic Coefficient of Friction (DCOF) rating above 0.42 are required for pool surrounds in Florida. We recommend travertine (natural texture provides grip), anti-slip textured porcelain, or brushed natural stone. We never install polished tiles around pools. All our pool deck installations comply with Florida Building Code slip-resistance requirements.',
      },
      {
        question: "How do outdoor tiles hold up in Florida's weather?",
        answer:
          "Florida outdoor tiles face intense UV exposure, afternoon thunderstorms, and occasional cool snaps. We use porcelain tiles with water absorption under 0.5%, UV-stable grouts, and polymer-modified adhesives that flex with temperature changes. Properly installed outdoor tiles in Northeast Florida routinely last 20+ years without cracking or fading.",
      },
      {
        question: 'How long does patio tile installation take?',
        answer:
          'A standard patio tile installation takes 3 to 6 days. Small patios (under 200 sq ft) are often completed in 2–3 days. Larger pool decks, outdoor kitchens, and multi-area projects take 4–7 days depending on complexity. Drainage slope work adds time but is critical for handling Florida summer rainfall.',
      },
      {
        question: 'What is the difference between indoor and outdoor tiles?',
        answer:
          "Outdoor tiles must be rated for slip resistance, UV exposure, and moisture cycling. They are typically thicker and have higher water-resistance ratings than indoor tiles. In Florida, UV stability and moisture resistance take priority over freeze-thaw cycling. We never install indoor-rated tiles in exterior applications — the adhesive, grout, and tile all change for outdoor use.",
      },
      {
        question: 'Can you install tiles on an existing concrete patio?',
        answer:
          'Yes, in most cases. Existing concrete must be structurally sound, clean, and free of major cracks. We test for moisture vapor emission, repair cracks with flexible patching compound, and apply primer before tiling. If the concrete has extensive cracking or heaving — common in Florida clay soils — we may recommend a decoupling membrane to isolate the tile layer from slab movement.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Site Assessment',
        description:
          'We evaluate drainage, slope, existing concrete condition, and sun exposure to design an outdoor installation built to perform in Florida weather for decades.',
      },
      {
        step: '02',
        title: 'Base Preparation',
        description:
          'Crack repair, moisture barrier, primer application, and slope adjustment to ensure proper water drainage away from your home foundation.',
      },
      {
        step: '03',
        title: 'Tile Installation',
        description:
          'Weather-appropriate adhesive, precision layout, slip-resistant tile placement, and correct expansion joint spacing for outdoor thermal movement.',
      },
      {
        step: '04',
        title: 'Grout & Outdoor Sealant',
        description:
          'UV-resistant sanded grout, polymer sealing, and a final inspection to confirm every tile is solid and drainage flows correctly.',
      },
    ],
  },

  fireplace: {
    keywordBase: 'Fireplace Tile Surround Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Fireplace Surround',
    whySubtitle: 'Creating stunning focal points with heat-safe materials and artisan precision',
    materials: [
      {
        name: 'Natural Marble',
        description:
          "Carrara, Calacatta, and Nero Marquina marble create timeless, luxury fireplace surrounds that become the undisputed focal point of any Florida living room. Installed at code-compliant clearances from the firebox.",
      },
      {
        name: 'Travertine',
        description:
          "Natural travertine tiles in classic cream and walnut tones bring warmth and Mediterranean character to fireplace surrounds — especially popular in St. Augustine's historic homes.",
      },
      {
        name: 'Ledger Stacked Stone',
        description:
          'Ledger stone and stacked slate panels create dramatic floor-to-ceiling fireplace features with deep texture and natural color variation that is impossible to replicate artificially.',
      },
      {
        name: 'Porcelain Panels',
        description:
          'Large format porcelain panels with marble or concrete looks offer a sleek contemporary fireplace surround with near-invisible grout lines and a high-end hotel aesthetic.',
      },
      {
        name: 'Glass Mosaic Tiles',
        description:
          'Reflective glass tile surrounds catch firelight beautifully, adding shimmer and ambient light to gas fireplace installations and electric fireplace feature walls.',
      },
      {
        name: 'Hand-Painted Ceramic',
        description:
          "Artisan Talavera and hand-painted decorative tiles create one-of-a-kind fireplace surrounds — a perfect fit for St. Augustine's Spanish Colonial and arts-and-crafts style homes.",
      },
    ],
    faqs: [
      {
        question: 'What tiles are safe to use on fireplace surrounds?',
        answer:
          'The critical requirement is that tiles must be installed at code-required clearances from the firebox opening. For areas within 6 inches of the opening, we use heat-rated materials including natural stone, porcelain, and ceramic with heat-rated adhesives. We always follow NFPA 211 and local Florida building codes for clearance requirements. Never use glass tiles or standard latex-modified adhesives directly adjacent to the firebox.',
      },
      {
        question: 'How long does fireplace tile installation take?',
        answer:
          'Most fireplace surround installations are completed in 2 to 4 days. A standard surround (hearth, face, and mantel area) takes 1–2 days. Floor-to-ceiling stacked stone installations or surrounds with intricate patterns take 3–4 days. We allow proper adhesive set time before grouting — a one-day install may still require a second visit for grouting to ensure quality.',
      },
      {
        question: 'Can I tile over my existing fireplace surround?',
        answer:
          'Often yes — particularly over existing ceramic or porcelain. The existing surround must be solidly bonded and clean, and we verify clearances from the firebox remain compliant after adding tile thickness. Tiling over cultured stone or thick brick veneer is usually not feasible; we recommend removal in those cases for a better finished result.',
      },
      {
        question: 'Do you work with gas fireplace installations?',
        answer:
          'Yes. Gas fireplaces are extremely popular in Northeast Florida, and we work extensively with both linear gas fireplace surrounds and traditional gas insert framing. We coordinate with your fireplace installer and ensure all tile work maintains required clearances and uses heat-tolerant materials and adhesives rated for the specific BTU output of your unit.',
      },
      {
        question: 'What fireplace tile styles are popular in Jacksonville and St. Augustine?',
        answer:
          "In Jacksonville, large format porcelain panels with concrete and marble looks are trending — especially in Southside and San Marco modern builds and Riverside historic renovations. In St. Augustine, homeowners prefer natural materials like travertine and hand-painted Talavera tiles that complement the city's Spanish and Mediterranean architectural heritage. We can show you local project photos during your free consultation.",
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Design Planning',
        description:
          'We measure your surround, review tile options, and verify your design meets Florida building code clearances from the firebox opening.',
      },
      {
        step: '02',
        title: 'Substrate Preparation',
        description:
          'Cement backer board installation, heat clearance verification, and surface priming before any heat-rated adhesive is applied.',
      },
      {
        step: '03',
        title: 'Expert Installation',
        description:
          'Heat-resistant adhesive, precision tile cutting around the firebox opening, and careful pattern alignment from hearth to mantel.',
      },
      {
        step: '04',
        title: 'Grout & Finishing',
        description:
          'Color-matched grouting, natural stone sealing (if applicable), and a final inspection of the completed surround before use.',
      },
    ],
  },

  shower: {
    keywordBase: 'Custom Shower Tile Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Custom Shower',
    whySubtitle: 'Bulletproof waterproofing systems and spa-quality tile work for Northeast Florida showers',
    materials: [
      {
        name: 'Large Format Porcelain Wall Tiles',
        description:
          'Full-body porcelain in 12×24, 24×48, or larger formats create shower walls with minimal grout lines and exceptional moisture resistance — ideal for Florida bathroom humidity.',
      },
      {
        name: 'Ceramic Subway Tiles',
        description:
          'Classic 3×6 or 4×12 subway tiles remain one of the most popular shower wall choices. Clean lines, easy maintenance, and available in hundreds of colors and glaze finishes.',
      },
      {
        name: 'Glass Mosaic',
        description:
          'Glass mosaic tiles used for accent feature walls, niche liners, and shower floors add reflective beauty and offer non-porous moisture protection in wet environments.',
      },
      {
        name: 'Natural Marble',
        description:
          'Honed marble for walls and textured marble for floors bring spa-level luxury to master bathroom showers. Properly sealed with penetrating sealer for lasting moisture protection.',
      },
      {
        name: 'Pebble Floor Mosaic',
        description:
          'Natural river pebble mosaic tiles create slip-resistant, spa-inspired shower floors with excellent drainage and a natural, organic aesthetic that never goes out of style.',
      },
      {
        name: 'Large Format Thin-Body Tiles',
        description:
          'Slim-profile large format tiles (up to 60×120cm) create dramatic statement shower walls with near-invisible grout lines and a modern hotel-suite aesthetic.',
      },
    ],
    faqs: [
      {
        question: "How do you prevent shower tiles from leaking in Florida's humid climate?",
        answer:
          "Preventing leaks requires a multi-layer waterproofing system. We install a vapor barrier behind the backer board, apply a waterproofing membrane (Schluter KERDI, Laticrete Hydro Ban, or RedGard) over all surfaces and seams, and use waterproof setting adhesive. Every penetration — drain, niche corners, bench screws — is individually sealed. This system protects your home regardless of Florida's year-round humidity.",
      },
      {
        question: 'How long does custom shower tile installation take?',
        answer:
          'Custom shower tile installations typically take 4 to 7 days. A basic tub-to-shower conversion takes 4–5 days. A large walk-in shower with custom niches, a built-in bench, and a feature wall takes 6–7 days. The timeline always includes waterproofing cure time and tile set time — we never rush these critical stages.',
      },
      {
        question: 'What tiles are best for shower walls vs. shower floors?',
        answer:
          "For shower walls, large format porcelain or ceramic (12×24 or larger) minimizes grout lines and simplifies cleaning. For shower floors, use tiles with slip-resistant texture — matte porcelain, pebble mosaic, or 4×4 tiles that allow more grout lines for grip. We never recommend polished stone or large-format tiles (18×18 and above) for shower floors due to the slip hazard when wet.",
      },
      {
        question: 'Do you install curbless (zero-threshold) walk-in showers?',
        answer:
          "Yes — curbless showers are among our most-requested designs in Jacksonville and St. Augustine, especially for aging-in-place renovations and beach house aesthetics. The critical element is a linear drain with the correct slope across the entire shower floor. We engineer the slope before any tile is set to ensure water flows entirely to the drain without pooling anywhere on the floor.",
      },
      {
        question: 'What is included in your shower waterproofing warranty?',
        answer:
          'Our shower waterproofing warranty covers the integrity of the moisture barrier, membrane seams, and drain connection for the life of the installation when maintained per our care guidelines. If any tile fails due to moisture intrusion through our installed system, we return to repair it at no cost. We use manufacturer-certified materials that carry independent warranties alongside ours.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Waterproofing System',
        description:
          'Vapor barrier installation, cement backer board, and waterproofing membrane application — the most critical stage of any shower project.',
      },
      {
        step: '02',
        title: 'Pan & Drainage',
        description:
          'Custom shower pan, linear or center drain installation, and precision slope engineering for complete water evacuation with no standing water.',
      },
      {
        step: '03',
        title: 'Tile Installation',
        description:
          'Wall tiles, floor tiles, built-in niches, bench tiling, and all accent details installed with precision setting and proper alignment.',
      },
      {
        step: '04',
        title: 'Grout, Seal & Flood Test',
        description:
          'Mold-resistant grout, waterproof sealant, a 24-hour flood test to verify the drain system, and a full customer walkthrough.',
      },
    ],
  },
};
