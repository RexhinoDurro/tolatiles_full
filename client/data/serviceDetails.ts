// Per-service extended content: SEO keywords, expertise, FAQs, process steps.
// Visual theme classes live in ServiceDetailPage.tsx (must be in Tailwind's content scan).

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceExpertise {
  name: string;
  description: string;
  image: string;
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
  /** Expertise specific to this service */
  expertise: ServiceExpertise[];
  /** Service-specific FAQs (renders accordion UI + FAQPage schema) */
  faqs: ServiceFAQ[];
  /** Service-specific installation process steps */
  processSteps: ServiceProcessStep[];
}

export const serviceDetailsMap: Record<string, ServiceDetails> = {
  'kitchen-backsplash': {
    keywordBase: 'Expert Kitchen Backsplash Tile Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Kitchen Backsplash',
    whySubtitle: 'Flawless layout planning and precision craftsmanship for the heart of your home',
    expertise: [
      {
        name: 'Advanced Leveling Systems',
        description:
          'Installing large panels requires advanced mortar coverage techniques and edge-leveling systems to prevent hollow spots and uneven edges (lippage). We extensively prep the surface to achieve a seamless, perfectly flat look.',
        image: '/images/backsplash/5.webp',
      },
      {
        name: 'Laser-Aligned Layouts',
        description:
          'We ensure perfect laser-aligned layouts, symmetrical corners, and flawless grout lines. From complex geometric patterns to classic subway formats, we calculate the perfect starting points to ensure symmetrical cuts around outlets and cabinetry.',
        image: '/images/backsplash/1.webp',
      },
      {
        name: 'Specialized Cutting & Handling',
        description:
          'Delicate materials require specialized cutting tools and specific thinset techniques to prevent shadowing or edge chipping. We handle all installations with expert care for a brilliant, clean finish.',
        image: '/images/backsplash/2.webp',
      },
      {
        name: 'Premium Stone Sealing & Protection',
        description:
          'Porous materials require expert care. We use premium non-staining adhesives and apply high-quality penetrating sealants to protect your investment from kitchen splatters and moisture.',
        image: '/images/backsplash/3.webp',
      },
    ],
    faqs: [
      {
        question: 'Do you provide the tile, or do I need to buy it?',
        answer:
          'We focus 100% on expert installation and craftsmanship. You purchase the tile you love from your preferred supplier, and we provide the labor, setting materials (thinset, waterproofing), and expertise to install it flawlessly. During our consultation, we will tell you exactly how much tile to order.',
      },
      {
        question: 'How long does kitchen backsplash tile installation take?',
        answer:
          'Most kitchen backsplash installations are completed in 1 to 3 days. A standard range surround takes about one day. Full surround installations covering all countertop walls take 2–3 days. We work efficiently to minimize disruption to your kitchen routine.',
      },
      {
        question: 'What tile materials work best for kitchen backsplashes in Florida?',
        answer:
          "We can install any material you choose, though glass, ceramic, and porcelain perform exceptionally well in Florida kitchens because they resist moisture and heat. Natural stone is beautiful but requires periodic sealing to handle humidity and grease. We ensure whichever you pick is installed correctly.",
      },
      {
        question: 'How much does kitchen backsplash installation cost in Jacksonville or St. Augustine?',
        answer:
          'Backsplash installation labor typically runs $15 to $40 per square foot, depending on tile complexity (like herringbone) and prep work required. We provide free, detailed estimates for our installation services. Contact us for a same-week consultation.',
      },
      {
        question: 'Can you install backsplash tile over existing tile?',
        answer:
          'In many cases, yes. If the existing tile is solidly adhered and the wall can handle the added weight, we can tile over it. However, if tiles are loose, or if building up height creates clearance issues with outlets, removal is the better approach. We assess this during your free consultation.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Measurement & Consultation',
        description:
          'We evaluate your kitchen space, discuss layout options (like herringbone or brick), and provide exact material quantities so you can confidently purchase your tile.',
      },
      {
        step: '02',
        title: 'Wall Preparation',
        description:
          'Removal of old backsplash (if needed), surface cleaning, leveling, and moisture-resistant backer installation to create a perfectly flat canvas.',
      },
      {
        step: '03',
        title: 'Expert Installation',
        description:
          'Laser-level precision cutting, layout planning, and professional setting using premium adhesive suited for Florida kitchens and your specific tile.',
      },
      {
        step: '04',
        title: 'Grout & Seal',
        description:
          'Color-matched grouting, protective sealant application (for natural stone), grout haze removal, and final cleanup for a stunning finish.',
      },
    ],
  },

  bathroom: {
    keywordBase: 'Professional Bathroom Tile Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Bathroom Renovation',
    whySubtitle: 'Bulletproof waterproofing systems and spa-quality craftsmanship in every bathroom we build',
    expertise: [
      {
        name: 'Multi-Layer Waterproofing Systems',
        description:
          'We install premium moisture barriers over all surfaces and seams. Every penetration is individually sealed, ensuring your walls and floors are 100% watertight before a single tile is laid.',
        image: '/images/shower/1.webp',
      },
      {
        name: 'Slope & Drainage Engineering',
        description:
          'For wet rooms and floors, we expertly grade the surface underneath the tile to ensure rapid, complete water evacuation to the drain with zero pooling, utilizing precision dry-pack mortar beds.',
        image: '/images/shower/2.webp',
      },
      {
        name: 'Advanced Wall Leveling',
        description:
          'We use specialized suction equipment and edge-leveling clips to install oversized panels on bathroom walls, ensuring a perfectly flat finish with minimal grout lines and zero lippage.',
        image: '/images/shower/3.webp',
      },
      {
        name: 'Custom Fabrications & Integration',
        description:
          'We frame, waterproof, and seamlessly tile custom niches and seating benches, perfectly aligning the grout lines with the surrounding walls without compromising the moisture barrier.',
        image: '/images/shower/4.webp',
      },
    ],
    faqs: [
      {
        question: 'Do you provide the tile, or do I need to buy it?',
        answer:
          'We focus 100% on expert installation and craftsmanship. You purchase the tile you love from your preferred supplier, and we provide the labor, setting materials (thinset, waterproofing), and expertise to install it flawlessly. During our consultation, we will tell you exactly how much tile to order.',
      },
      {
        question: 'How long does a full bathroom tile installation take?',
        answer:
          'A complete bathroom tile installation — floor, walls, and shower — typically takes 3 to 7 days depending on the size and complexity. We provide a detailed schedule before work begins and stick to it.',
      },
      {
        question: 'Do you provide a waterproofing warranty for bathroom tile installations?',
        answer:
          'Yes. Every bathroom tile installation includes our comprehensive waterproofing warranty covering the integrity of the moisture barrier and grout joints. We use industry-leading membrane systems specifically engineered to prevent moisture intrusion.',
      },
      {
        question: 'Can you tile over existing bathroom floor tiles?',
        answer:
          'Tiling over existing tiles is possible when they are firmly bonded, the subfloor is structurally sound, and the added height will not cause issues. We assess this during your consultation, though removal first often produces the most reliable long-term result.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Consultation & Measurement',
        description:
          'We visit your bathroom, assess the space, discuss layout plans, and calculate the exact tile quantities you need to order from your supplier.',
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
    expertise: [
      {
        name: 'Precision Slab Leveling & Preparation',
        description:
          'Florida slabs settle and crack. We grind high spots, use self-leveling compounds, and apply crack-isolation membranes to ensure your new floor never cracks or shifts.',
        image: '/images/flooring/1.webp',
      },
      {
        name: 'Advanced Mortar Coverage Techniques',
        description:
          'Installing large formats requires advanced mortar coverage and edge-leveling systems to prevent hollow spots and uneven edges (lippage). We guarantee perfectly flat results.',
        image: '/images/flooring/2.webp',
      },
      {
        name: 'Intricate Layout Mastery',
        description:
          'Precision laser alignment is critical. We use specialized staggered layouts (1/3 offset for planks) and calculate exact center lines so the pattern flows seamlessly from room to room.',
        image: '/images/flooring/3.webp',
      },
      {
        name: 'Seamless Surface Transitions',
        description:
          'We expertly manage the height differences where your new floor meets existing carpet, hardwood, or doorways, creating smooth, trip-free transitions throughout the home.',
        image: '/images/flooring/4.webp',
      },
    ],
    faqs: [
      {
        question: 'Do you provide the tile, or do I need to buy it?',
        answer:
          'We focus 100% on expert installation and craftsmanship. You purchase the tile you love from your preferred supplier, and we provide the labor, setting materials (thinset, waterproofing), and expertise to install it flawlessly. During our consultation, we will tell you exactly how much tile to order.',
      },
      {
        question: 'How do you prepare a concrete slab for tile installation in Florida?',
        answer:
          'Florida homes are built on concrete slabs that can have moisture vapor emission issues. We start with a moisture test, then grind high spots, fill low areas with self-leveling compound, and prime the surface. If needed, we apply a crack-isolation membrane before setting tile.',
      },
      {
        question: 'How long does floor tile installation take?',
        answer:
          'Most residential floor tile installations are completed in 2 to 5 days. Full first-floor renovations covering open-plan living and kitchen areas typically take 3–5 days. We factor in tile set time and grout curing.',
      },
      {
        question: 'What tile size looks best in open-concept floor plans?',
        answer:
          'Large format tiles (24×24 or larger) look exceptional in open spaces because fewer grout lines create a seamless appearance. We specialize in installing rectified tiles with tight 1/16" grout joints for this exact look.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Measurement & Assessment',
        description:
          'We measure the space, check the slab for moisture or levelness issues, discuss layout directions, and give you a precise material order list.',
      },
      {
        step: '02',
        title: 'Surface Leveling',
        description:
          'Grinding high spots, pouring self-leveling compound for low areas, and applying crack-isolation membranes to prepare the Florida concrete slab.',
      },
      {
        step: '03',
        title: 'Precision Installation',
        description:
          'Layout planning, diagonal or straight patterns, precision tile cutting, and expert setting with correct expansion joints throughout.',
      },
      {
        step: '04',
        title: 'Grout & Final Cleaning',
        description:
          'Color-matched grouting, thorough grout haze removal, and protective sealant application to lock in the beauty and simplify long-term cleaning.',
      },
    ],
  },

  patio: {
    keywordBase: 'Outdoor Patio & Pool Deck Tile Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Outdoor Space',
    whySubtitle: 'Florida outdoor living expertise — built for sun, rain, and thermal expansion',
    expertise: [
      {
        name: 'Exterior Grade Bonding',
        description:
          'We use specialized exterior-grade adhesives and leveling systems to securely bond heavy materials to concrete slabs, preventing any shifting over time despite the elements.',
        image: '/images/patio/1.webp',
      },
      {
        name: 'Slope & Runoff Management',
        description:
          'Outdoor installations must shed water away from the house. We expertly grade the mortar bed to ensure perfect runoff without creating noticeable or awkward slopes.',
        image: '/images/patio/2.webp',
      },
      {
        name: 'Thermal Expansion Engineering',
        description:
          'Florida sun causes outdoor surfaces to expand significantly. We calculate and install flexible soft joints at correct intervals to guarantee the installation never buckles or cracks.',
        image: '/images/patio/3.webp',
      },
      {
        name: 'Exterior Waterproofing',
        description:
          'For second-story balconies or patios over living spaces, we install robust exterior waterproofing membranes to protect the structure below from Florida thunderstorms.',
        image: '/images/patio/4.webp',
      },
    ],
    faqs: [
      {
        question: 'Do you provide the tile, or do I need to buy it?',
        answer:
          'We focus 100% on expert installation and craftsmanship. You purchase the outdoor tile or pavers you love from your preferred supplier, and we provide the labor, setting materials, and expertise to install it flawlessly. During our consultation, we will tell you exactly how much material to order.',
      },
      {
        question: "How do outdoor tiles hold up in Florida's weather?",
        answer:
          "Proper installation is the key. We use UV-stable grouts and polymer-modified adhesives that flex with temperature changes. We also install mandatory expansion joints so the surface can expand in the Florida sun without cracking or buckling.",
      },
      {
        question: 'How long does patio tile installation take?',
        answer:
          'A standard patio tile installation takes 3 to 6 days depending on complexity and weather conditions. Drainage slope work and surface prep are critical for handling summer rainfall and are never rushed.',
      },
      {
        question: 'Can you install tiles on an existing concrete patio?',
        answer:
          'Yes, in most cases. Existing concrete must be structurally sound and free of major cracks. We test for moisture, repair cracks with flexible patching compound, and apply primer before tiling.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Site Measurement & Consultation',
        description:
          'We evaluate drainage, slope, and sun exposure, discuss slip-resistant options, and provide exact material quantities for you to order.',
      },
      {
        step: '02',
        title: 'Base Preparation',
        description:
          'Crack repair, primer application, and slope adjustment to ensure proper water drainage away from your home foundation.',
      },
      {
        step: '03',
        title: 'Weather-Resistant Installation',
        description:
          'Using exterior-grade adhesive, precision layout, and correct expansion joint spacing to accommodate outdoor thermal movement.',
      },
      {
        step: '04',
        title: 'Grout & Outdoor Sealant',
        description:
          'UV-resistant sanded grout, polymer sealing for natural stone, and a final inspection to confirm every piece is solid and drainage flows correctly.',
      },
    ],
  },

  fireplace: {
    keywordBase: 'Fireplace Tile Surround Installation',
    whyHeading: 'Why Choose Tola Tiles for Your Fireplace Surround',
    whySubtitle: 'Creating stunning focal points with heat-safe installation and artisan precision',
    expertise: [
      {
        name: 'Heat-Rated Installation Adherence',
        description:
          'We strictly adhere to NFPA 211 and local Florida building codes for firebox clearances, using specialized heat-rated adhesives that won\'t fail under extreme temperature changes.',
        image: '/images/fireplace/1.webp',
      },
      {
        name: 'Symmetrical Layout Planning',
        description:
          'A fireplace is the focal point of the room. We laser-align the exact center of the firebox and calculate the layout so all cuts are perfectly symmetrical on both sides for a balanced aesthetic.',
        image: '/images/fireplace/2.webp',
      },
      {
        name: 'Mitered Corners & Artisan Edges',
        description:
          'Instead of using cheap metal trim, we bevel (miter) the edges at 45 degrees to create flawless, professional outside corners that look like solid masonry.',
        image: '/images/fireplace/3.webp',
      },
      {
        name: 'Heavy-Duty Vertical Mounting',
        description:
          'Installing massive panels or heavy ledger stone on vertical fireplace faces requires structural expertise. We ensure the substrate can handle the weight and use heavy-duty bonding methods.',
        image: '/images/fireplace/4.webp',
      },
    ],
    faqs: [
      {
        question: 'Do you provide the tile, or do I need to buy it?',
        answer:
          'We focus 100% on expert installation and craftsmanship. You purchase the tile you love from your preferred supplier, and we provide the labor, setting materials, and expertise to install it flawlessly. During our consultation, we will tell you exactly how much tile to order.',
      },
      {
        question: 'What tiles are safe to use on fireplace surrounds?',
        answer:
          'The critical requirement is that materials must be installed at code-required clearances from the firebox opening. We use heat-rated adhesives for areas close to the firebox. Natural stone, porcelain, and ceramic are all excellent choices. We will verify your material choice during consultation.',
      },
      {
        question: 'How long does fireplace tile installation take?',
        answer:
          'Most fireplace surround installations are completed in 2 to 4 days. A standard surround takes 1–2 days. Floor-to-ceiling stacked stone installations take 3–4 days to allow proper adhesive set time before grouting.',
      },
      {
        question: 'Can I tile over my existing fireplace surround?',
        answer:
          'Often yes — particularly over existing ceramic or brick, provided it is solidly bonded. We verify clearances from the firebox remain compliant after adding tile thickness. We assess this during your free consultation.',
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Design Planning & Measurement',
        description:
          'We measure your surround, verify your design meets building code clearances, and provide exact material quantities for you to purchase.',
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
          'Heat-resistant adhesive, precision tile cutting around the firebox opening, mitered corners, and careful pattern alignment from hearth to mantel.',
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
    whySubtitle: 'Bulletproof waterproofing systems and precise slope engineering for Northeast Florida showers',
    expertise: [
      {
        name: 'Impermeable Waterproofing Mastery',
        description:
          'We install premium systems sealing every seam, corner, and screw penetration so your walls and floors are 100% watertight before a single piece is laid, preventing leaks permanently.',
        image: '/images/shower/1.webp',
      },
      {
        name: 'Precision Pan Engineering',
        description:
          'We hand-pack custom dry-pack mortar beds, engineering the exact slope (1/4" per foot) required to ensure complete water evacuation to the drain with zero pooling.',
        image: '/images/shower/2.webp',
      },
      {
        name: 'Curbless (Zero-Threshold) Accessibility',
        description:
          'We specialize in lowering the subfloor or raising the bathroom floor to create stunning, accessible curbless showers using sleek linear drains with flawless barrier-free entry.',
        image: '/images/shower/3.webp',
      },
      {
        name: 'Envelope Cutting for Large Formats',
        description:
          'If you want large formats on the shower floor, we perform expert "envelope cuts" (diagonal cuts matching the slope) to allow them to drain properly toward a center drain without sacrificing aesthetics.',
        image: '/images/shower/4.webp',
      },
    ],
    faqs: [
      {
        question: 'Do you provide the tile, or do I need to buy it?',
        answer:
          'We focus 100% on expert installation and craftsmanship. You purchase the tile you love from your preferred supplier, and we provide the labor, setting materials (thinset, waterproofing), and expertise to install it flawlessly. During our consultation, we will tell you exactly how much tile to order.',
      },
      {
        question: "How do you prevent shower tiles from leaking?",
        answer:
          "Preventing leaks requires a multi-layer waterproofing system. We apply a waterproofing membrane (Schluter KERDI or similar) over all surfaces and seams. Every penetration — drain, niche corners, bench screws — is individually sealed. This protects your home regardless of Florida's humidity.",
      },
      {
        question: 'How long does custom shower tile installation take?',
        answer:
          'Custom shower tile installations typically take 4 to 7 days. A basic tub-to-shower conversion takes 4–5 days. A large walk-in shower with custom niches and a built-in bench takes 6–7 days. We never rush the critical waterproofing stages.',
      },
      {
        question: 'Do you install curbless (zero-threshold) walk-in showers?',
        answer:
          "Yes — curbless showers are among our most-requested designs. The critical element is engineering the slope before any tile is set to ensure water flows entirely to the drain without escaping into the main bathroom.",
      },
    ],
    processSteps: [
      {
        step: '01',
        title: 'Measurement & Consultation',
        description:
          'We discuss your vision (curbless, niches, benches), plan the layout, and calculate exact material quantities for you to order from your tile supplier.',
      },
      {
        step: '02',
        title: 'Waterproofing & Pan Engineering',
        description:
          'Custom shower pan slope creation and full waterproofing membrane application — the most critical stage of any shower project.',
      },
      {
        step: '03',
        title: 'Tile Installation',
        description:
          'Wall tiles, floor tiles, built-in niches, and bench tiling installed with laser precision and proper grout joint alignment.',
      },
      {
        step: '04',
        title: 'Grout, Seal & Flood Test',
        description:
          'Application of mold-resistant or epoxy grout, a 24-hour flood test to verify the drain system integrity, and a full customer walkthrough.',
      },
    ],
  },
};
