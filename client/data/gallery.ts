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
    { id: 1, src: '/images/backsplash/1.webp', title: 'Subway Tile Backsplash', description: 'Classic white subway tile' },
    { id: 2, src: '/images/backsplash/2.webp', title: 'Mosaic Glass Backsplash', description: 'Colorful glass mosaic' },
    { id: 3, src: '/images/backsplash/3.webp', title: 'Natural Stone Backsplash', description: 'Elegant natural stone' },
    { id: 4, src: '/images/backsplash/4.webp', title: 'Hexagon Tile Backsplash', description: 'Modern hexagon pattern' },
    { id: 5, src: '/images/backsplash/5.webp', title: 'Marble Backsplash', description: 'Luxury marble finish' },
    { id: 6, src: '/images/backsplash/6.webp', title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
    { id: 7, src: '/images/backsplash/7.webp', title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
    { id: 8, src: '/images/backsplash/8.webp', title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
    { id: 9, src: '/images/backsplash/9.webp', title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
    { id: 10, src: '/images/backsplash/10.webp', title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
  ],
  patios: [
    { id: 11, src: '/images/patio/1.webp', title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 12, src: '/images/patio/2.webp', title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 13, src: '/images/patio/3.webp', title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 14, src: '/images/patio/4.webp', title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 15, src: '/images/patio/5.webp', title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 16, src: '/images/patio/6.webp', title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 17, src: '/images/patio/7.webp', title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
  ],
  showers: [
    { id: 18, src: '/images/shower/1.webp', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 19, src: '/images/shower/2.webp', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 20, src: '/images/shower/3.webp', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 21, src: '/images/shower/4.webp', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 22, src: '/images/shower/5.webp', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 23, src: '/images/shower/6.webp', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 24, src: '/images/shower/7.webp', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 25, src: '/images/shower/8.webp', title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
  ],
  flooring: [
    { id: 26, src: '/images/flooring/1.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 27, src: '/images/flooring/2.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 28, src: '/images/flooring/3.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 29, src: '/images/flooring/4.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 30, src: '/images/flooring/5.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 31, src: '/images/flooring/6.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 32, src: '/images/flooring/7.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 33, src: '/images/flooring/8.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 34, src: '/images/flooring/9.webp', title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
  ],
  fireplaces: [
    { id: 35, src: '/images/fireplace/1.webp', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 36, src: '/images/fireplace/2.webp', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 37, src: '/images/fireplace/3.webp', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 38, src: '/images/fireplace/4.webp', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 39, src: '/images/fireplace/5.webp', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 40, src: '/images/fireplace/6.webp', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 41, src: '/images/fireplace/7.webp', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 42, src: '/images/fireplace/8.webp', title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
  ],
};
