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
    {
      id: 1,
      src: '/images/backsplash/1.webp',
      title: 'White Subway Tile Kitchen Backsplash',
      description: 'Classic 3×6 white ceramic subway tile in heritage bond layout, Jacksonville kitchen renovation',
    },
    {
      id: 2,
      src: '/images/backsplash/2.webp',
      title: 'Blue Glass Mosaic Kitchen Backsplash',
      description: 'Coastal blue glass mosaic tile backsplash, open-concept kitchen, St. Augustine home',
    },
    {
      id: 3,
      src: '/images/backsplash/3.webp',
      title: 'Natural Travertine Backsplash Tile',
      description: 'Tumbled travertine backsplash with natural color variation, traditional-style Ponte Vedra kitchen',
    },
    {
      id: 4,
      src: '/images/backsplash/4.webp',
      title: 'Hexagon Pattern Porcelain Backsplash',
      description: 'White and grey hexagon porcelain tiles with charcoal grout, modern kitchen design in Mandarin',
    },
    {
      id: 5,
      src: '/images/backsplash/5.webp',
      title: 'Marble Look Porcelain Backsplash',
      description: 'Large format porcelain marble-look tile, full-height installation behind range, Ponte Vedra kitchen',
    },
    {
      id: 6,
      src: '/images/backsplash/6.webp',
      title: 'Hand-Painted Ceramic Tile Backsplash',
      description: 'Artisan hand-painted ceramic backsplash tiles, decorative range surround focal point, St. Augustine',
    },
    {
      id: 7,
      src: '/images/backsplash/7.webp',
      title: 'Charcoal Subway Tile Herringbone Backsplash',
      description: 'Dark charcoal ceramic subway tiles in herringbone layout, contemporary kitchen, Riverside Jacksonville',
    },
    {
      id: 8,
      src: '/images/backsplash/8.webp',
      title: 'Geometric Porcelain Kitchen Backsplash',
      description: 'Bold geometric porcelain tile pattern, statement backsplash installation, Avondale kitchen remodel',
    },
    {
      id: 9,
      src: '/images/backsplash/9.webp',
      title: 'White Arabesque Marble Backsplash',
      description: 'Arabesque-cut white marble tile with pencil border accent strip, elegant kitchen in San Marco',
    },
    {
      id: 10,
      src: '/images/backsplash/10.webp',
      title: 'Mixed Glass and Stone Mosaic Backsplash',
      description: 'Mixed glass and natural stone mosaic backsplash panel, full surround, San Marco kitchen renovation',
    },
  ],

  patios: [
    {
      id: 11,
      src: '/images/patio/1.webp',
      title: 'Natural Travertine Pool Deck Tile',
      description: 'Travertine pavers surrounding residential pool deck, brushed slip-resistant finish, St. Johns County',
    },
    {
      id: 12,
      src: '/images/patio/2.webp',
      title: 'Large Format Porcelain Lanai Tile',
      description: 'Outdoor 24×24 concrete-look porcelain tiles, covered lanai installation, Mandarin backyard',
    },
    {
      id: 13,
      src: '/images/patio/3.webp',
      title: 'Natural Slate Walkway Tile',
      description: 'Natural slate tile walkway from driveway to rear patio, durable and slip-resistant, Orange Park',
    },
    {
      id: 14,
      src: '/images/patio/4.webp',
      title: 'Outdoor Kitchen and Patio Tile Installation',
      description: 'Full outdoor kitchen and dining area with large format ceramic patio tile, Orange Park residence',
    },
    {
      id: 15,
      src: '/images/patio/5.webp',
      title: 'Anti-Slip Porcelain Pool Surround Tile',
      description: 'Safety-rated anti-slip porcelain tile pool surround with coping, Mandarin backyard, Florida',
    },
    {
      id: 16,
      src: '/images/patio/6.webp',
      title: 'Spanish Courtyard Terra Cotta Patio Tile',
      description: 'Traditional terra cotta courtyard tile installation, St. Augustine historic district property',
    },
    {
      id: 17,
      src: '/images/patio/7.webp',
      title: 'Covered Lanai Porcelain Patio Tile',
      description: 'Weather-protected lanai porcelain tile for seamless indoor-outdoor flow, St. Johns County home',
    },
  ],

  showers: [
    {
      id: 18,
      src: '/images/shower/1.webp',
      title: 'Carrara Marble Walk-In Shower Tile',
      description: 'Full Carrara marble wall tiles with hexagon marble floor, master bathroom spa shower, Ponte Vedra',
    },
    {
      id: 19,
      src: '/images/shower/2.webp',
      title: 'Large Format Curbless Shower Tile',
      description: '24×48 porcelain shower walls with built-in recessed niche, curbless linear drain design, Jacksonville',
    },
    {
      id: 20,
      src: '/images/shower/3.webp',
      title: 'White Subway Tile Shower with Bench',
      description: '4×12 white subway tile shower enclosure, dark grout, custom built-in bench, Mandarin bathroom',
    },
    {
      id: 21,
      src: '/images/shower/4.webp',
      title: 'Blue Glass Mosaic Feature Wall Shower',
      description: 'Coastal blue glass mosaic feature shower wall, walk-in design, St. Augustine Beach vacation home',
    },
    {
      id: 22,
      src: '/images/shower/5.webp',
      title: 'River Pebble Mosaic Shower Floor',
      description: 'Natural river pebble mosaic shower floor with large format porcelain walls, spa-inspired look',
    },
    {
      id: 23,
      src: '/images/shower/6.webp',
      title: 'Luxury Rainfall Shower Tile Installation',
      description: 'Hotel-inspired shower with multiple tile patterns, rainfall head and body sprays, Jacksonville Beach',
    },
    {
      id: 24,
      src: '/images/shower/7.webp',
      title: 'Guest Bathroom Shower Tile Renovation',
      description: 'Complete shower tile renovation replacing fiberglass insert, guest bathroom, Nocatee townhome',
    },
    {
      id: 25,
      src: '/images/shower/8.webp',
      title: 'Compact Bathroom Shower Tile Layout',
      description: 'Space-efficient shower tile layout maximizing a compact guest bathroom, St. Augustine historic home',
    },
  ],

  flooring: [
    {
      id: 26,
      src: '/images/flooring/1.webp',
      title: 'Large Format Porcelain Living Room Floor',
      description: 'Rectified 24×24 porcelain floor tile in open-concept living room, minimal grout lines, Riverside home',
    },
    {
      id: 27,
      src: '/images/flooring/2.webp',
      title: 'Wood-Look Porcelain Plank Floor Tile',
      description: '8×48 oak-tone wood-look porcelain planks, warm and moisture-resistant, Mandarin family home',
    },
    {
      id: 28,
      src: '/images/flooring/3.webp',
      title: 'Travertine Entryway Floor with Medallion',
      description: 'Natural travertine entryway floor tile with diamond inlay mosaic medallion, Ortega estate',
    },
    {
      id: 29,
      src: '/images/flooring/4.webp',
      title: 'Herringbone Pattern Floor Tile',
      description: 'Subway tile in herringbone pattern for laundry room and mudroom, Jacksonville Beach home',
    },
    {
      id: 30,
      src: '/images/flooring/5.webp',
      title: 'Commercial Grade Porcelain Floor Tile',
      description: 'Heavy-duty commercial grade porcelain tile for high-traffic retail space, Downtown Jacksonville',
    },
    {
      id: 31,
      src: '/images/flooring/6.webp',
      title: 'Calacatta Marble Floor Tile',
      description: 'Polished Calacatta marble floor in open-plan dining and living area, Ponte Vedra estate',
    },
    {
      id: 32,
      src: '/images/flooring/7.webp',
      title: 'Florida Room Natural Slate Floor Tile',
      description: 'Natural slate tile installed in screened Florida room, durable outdoor-feel flooring, Southside',
    },
    {
      id: 33,
      src: '/images/flooring/8.webp',
      title: 'Master Bathroom Floor Mosaic Medallion',
      description: 'Decorative marble mosaic medallion inlaid in master bathroom floor, custom design, St. Augustine',
    },
    {
      id: 34,
      src: '/images/flooring/9.webp',
      title: 'Kitchen Ceramic Floor Tile Installation',
      description: 'Durable glazed ceramic kitchen floor tile in neutral grey with easy-clean grout, Fleming Island',
    },
  ],

  fireplaces: [
    {
      id: 35,
      src: '/images/fireplace/1.webp',
      title: 'Ledger Stone Floor-to-Ceiling Fireplace Tile',
      description: 'Ledger stack stone from hearth to ceiling, dramatic fireplace feature wall, Mandarin living room',
    },
    {
      id: 36,
      src: '/images/fireplace/2.webp',
      title: 'Carrara Marble Fireplace Surround Tile',
      description: 'Carrara marble tile fireplace surround with matching hearth, classic style, San Marco home',
    },
    {
      id: 37,
      src: '/images/fireplace/3.webp',
      title: 'Contemporary Gas Fireplace Porcelain Tile',
      description: 'Large format porcelain panel linear gas fireplace surround, modern minimalist design, Jacksonville',
    },
    {
      id: 38,
      src: '/images/fireplace/4.webp',
      title: 'Travertine Fireplace Surround and Hearth',
      description: 'Tumbled travertine fireplace tiles with warm natural variation, traditional family room, Orange Park',
    },
    {
      id: 39,
      src: '/images/fireplace/5.webp',
      title: 'Talavera Hand-Painted Fireplace Tile Surround',
      description: 'Mexican Talavera hand-painted ceramic tiles on gas fireplace surround, St. Augustine historic home',
    },
    {
      id: 40,
      src: '/images/fireplace/6.webp',
      title: 'Iridescent Glass Mosaic Fireplace Tile',
      description: 'Iridescent glass mosaic tile fireplace surround catching firelight beautifully, modern Nocatee home',
    },
    {
      id: 41,
      src: '/images/fireplace/7.webp',
      title: 'Slate Floor-to-Ceiling Fireplace Feature Wall',
      description: 'Dramatic natural slate tile from hearth to ceiling, statement fireplace feature wall installation',
    },
    {
      id: 42,
      src: '/images/fireplace/8.webp',
      title: 'Craftsman Natural Stone Fireplace Hearth',
      description: 'Rough-cut natural stone hearth and surround tiles, traditional craftsman-style home, Riverside JAX',
    },
  ],
};
