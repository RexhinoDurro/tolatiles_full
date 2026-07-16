'use client';

import { useState } from 'react';
import Image from 'next/image';

const WHAT_WE_DO_DATA = [
  {
    category: "Showers",
    services: [
      {
        title: "Zero-Entry (Curbless)",
        description: "The shower floor sits completely flush with the rest of your bathroom. There is no step, lip, or barrier to trip over, creating a seamless, modern look that is also fully accessible.",
        image: "/images/services/tolatiles-wet-room-shower-enclosure-tile.webp"
      },
      {
        title: "Linear Drain System",
        description: "Instead of a traditional round drain in the center, water flows into a sleek trench at the edge of the shower. This allows us to use large, elegant tiles on the floor rather than small mosaic pieces.",
        image: "/images/services/tolatiles-linear-shower-drain-tile.webp"
      },
      {
        title: "Envelope Cut Layout",
        description: "If you want large tiles but need a standard center drain, we use this precision technique. We cut the large tiles diagonally from the corners to the drain, creating a subtle, clean 'envelope' shape that guides the water perfectly.",
        image: "/images/services/tolatiles-envelope-cut-shower-pan-tile.webp"
      },
      {
        title: "Built-in Niches & Benches",
        description: "Instead of using wire racks or plastic stools, we frame custom recessed shelves and seating directly into the wall structure before tiling. This gives you permanent, waterproof storage that blends perfectly with your design.",
        image: "/images/services/tolatiles-built-in-shower-niche-tile.webp"
      }
    ]
  },
  {
    category: "Bathroom",
    services: [
      {
        title: "Wet Room Enclosure",
        description: "We waterproof the entire bathroom space, allowing the shower and even a freestanding tub to share an open, seamless environment. It maximizes space and creates a high-end spa feel.",
        image: "/images/services/tolatiles-wet-room-shower-enclosure-tile.webp"
      },
      {
        title: "Wainscoting (Half-Wall)",
        description: "Tile is installed on the lower half of the walls to protect against splashing and moisture, capped with decorative trim. It provides durability exactly where you need it while keeping material costs manageable.",
        image: "/images/services/tolatiles-half-wall-wainscoting-tile.webp"
      },
      {
        title: "Cove Base (Tiled Baseboards)",
        description: "Instead of traditional wood baseboards that can rot or warp from moisture, we install a row of tile that curves slightly to meet the floor. It’s incredibly durable and makes cleaning effortless.",
        image: "/images/services/tolatiles-cove-base-bathroom-tile.webp"
      }
    ]
  },
  {
    category: "Floor",
    services: [
      {
        title: "Uncoupling Membrane",
        description: "Before laying any tile, we install a specialized flexible grid layer over your subfloor. This absorbs the natural shifting of your house, ensuring your tile and grout never crack over time.",
        image: "/images/services/tolatiles-membrane-waterproofing-floor-tile.webp"
      },
      {
        title: "Radiant Heated Floors",
        description: "We embed a custom electric heating mat or hydronic system directly into the mortar beneath your tiles. You get perfectly warm floors controlled by a digital thermostat—ideal for chilly mornings.",
        image: "/images/services/tolatiles-heated-floor-tile-installation.webp"
      },
      {
        title: "Flush Transitions",
        description: "We carefully adjust the subfloor heights so your new tile meets your existing hardwood or carpet perfectly level, eliminating the need for bulky thresholds or tripping hazards between rooms.",
        image: "/images/services/tolatiles-flush-transition-floor-tile.webp"
      }
    ]
  },
  {
    category: "Backsplash",
    services: [
      {
        title: "Counter-to-Cabinet",
        description: "The classic installation that perfectly covers the exposed wall between your countertops and upper cabinets, protecting your drywall from cooking splatters while pulling the kitchen design together.",
        image: "/images/services/tolatiles-counter-height-kitchen-backsplash-tile.webp"
      },
      {
        title: "Full-Height / Ceiling",
        description: "Instead of stopping at the cabinets, we run the tile all the way up to the ceiling. This turns your entire kitchen wall into a stunning architectural feature, especially beautiful around windows or floating shelves.",
        image: "/images/services/full_height_backsplash.webp"
      },
      {
        title: "Feature Panel (Medallion)",
        description: "We create a custom, framed focal point directly behind your stove using a different tile pattern (like herringbone) or accent material to make the cooking area stand out.",
        image: "/images/services/medallion_backsplash.webp"
      }
    ]
  },
  {
    category: "Patio & Outdoors",
    services: [
      {
        title: "Pedestal System",
        description: "Heavy porcelain pavers are installed over adjustable supports rather than glued down. Rainwater drains perfectly underneath, and it allows us to hide outdoor electrical or plumbing lines completely out of sight.",
        image: "/images/services/level-up-tile-suburban-patio-pedestals.webp"
      },
      {
        title: "Mortar Bed (Wet Set)",
        description: "Tiles are permanently bonded to a poured concrete slab using specialized, freeze-thaw resistant mortar. It feels just like an indoor floor but is built to withstand extreme outdoor weather.",
        image: "/images/services/tolatiles-mortar-bed-patio-tile.webp"
      },
      {
        title: "Dry Lay (Sand Set)",
        description: "Thick outdoor tiles are set over a compacted base of gravel and sand, allowing the patio to shift slightly during freezing weather without cracking. Perfect for integrating with natural landscaping.",
        image: "/images/services/dry_patio.webp"
      }
    ]
  },
  {
    category: "Fireplace",
    services: [
      {
        title: "Floor-to-Ceiling Surround",
        description: "We replace standard wooden mantels with a massive, modern focal point by running tile from the floor all the way up the chimney breast to the ceiling.",
        image: "/images/services/tolatiles-floor-to-ceiling-fireplace-tile.webp"
      },
      {
        title: "Floating Hearth",
        description: "The base in front of the firebox is built out as a raised, cantilevered bench and wrapped entirely in tile, creating a sleek, modern seating area.",
        image: "/images/services/tolatiles-floating-hearth-fireplace-tile.webp"
      },
      {
        title: "Flush Hearth",
        description: "The tiled floor area immediately in front of the fireplace is installed perfectly level with your surrounding hardwood or carpet, creating a safe, seamless transition.",
        image: "/images/services/tolatiles-flush-fireplace-tile-surround.webp"
      }
    ]
  }
];

export default function WhatWeDoSection() {
  const [activeCategory, setActiveCategory] = useState(WHAT_WE_DO_DATA[0].category);

  const currentCategoryData = WHAT_WE_DO_DATA.find((c) => c.category === activeCategory) || WHAT_WE_DO_DATA[0];

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <section className="py-20 bg-gray-50" aria-labelledby="what-we-do-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="what-we-do-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See What We Do
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our specialized tile installation services and techniques across every room in your home.
          </p>
        </div>

        {/* Top Row (Tabs) */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {WHAT_WE_DO_DATA.map((cat) => (
            <button
              key={cat.category}
              onClick={() => handleCategoryChange(cat.category)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${activeCategory === cat.category
                  ? 'bg-brand-ink text-white border-brand-ink shadow-md scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#00a8e8] hover:text-[#00a8e8] hover:shadow-sm'
                }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Bottom Area (Zigzag List of Service Types) */}
        <div className="flex flex-col gap-16 max-w-6xl mx-auto mt-8">
          {currentCategoryData.services.map((service, index) => {
            const textOrder = index % 2 === 0 ? "order-1" : "order-2";
            const imageOrder = index % 2 === 0 ? "order-2" : "order-1";

            return (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 md:gap-12 items-center group"
              >
                {/* Text Side */}
                <div className={`w-full flex flex-col justify-center ${textOrder}`}>
                  <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4 group-hover:text-[#00a8e8] transition-colors">
                    {service.title}
                  </h3>
                  <div className="w-8 md:w-12 h-1 bg-[#00a8e8] mb-3 md:mb-6 rounded-full"></div>
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Image Side */}
                <div className={`w-full ${imageOrder}`}>
                  <div
                    className="relative w-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 bg-gray-200 h-48 md:h-80 lg:h-96"
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 340px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

