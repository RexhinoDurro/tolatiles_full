
// Sample data for the website
//backsplash
import backsplash1 from '../assets/images/backsplash/1.webp'
import backsplash2 from '../assets/images/backsplash/2.webp'
import backsplash3 from '../assets/images/backsplash/3.webp'
import backsplash4 from '../assets/images/backsplash/4.webp'
import backsplash5 from '../assets/images/backsplash/5.webp'
import backsplash6 from '../assets/images/backsplash/6.webp'
import backsplash7 from '../assets/images/backsplash/7.webp'
import backsplash8 from '../assets/images/backsplash/8.webp'
import backsplash9 from '../assets/images/backsplash/9.webp'
import backsplash10 from '../assets/images/backsplash/10.webp'

//patio
import patio1 from '../assets/images/patio/1.webp'
import patio2 from '../assets/images/patio/2.webp'
import patio3 from '../assets/images/patio/3.webp'
import patio4 from '../assets/images/patio/4.webp'
import patio5 from '../assets/images/patio/5.webp'
import patio6 from '../assets/images/patio/6.webp'
import patio7 from '../assets/images/patio/7.webp'

//showers
import shower1 from '../assets/images/shower/1.webp'
import shower2 from '../assets/images/shower/2.webp'
import shower3 from '../assets/images/shower/3.webp'
import shower4 from '../assets/images/shower/4.webp'
import shower5 from '../assets/images/shower/5.webp'
import shower6 from '../assets/images/shower/6.webp'
import shower7 from '../assets/images/shower/7.webp'
import shower8 from '../assets/images/shower/8.webp'

//flooring
import flooring1 from '../assets/images/flooring/1.webp'
import flooring2 from '../assets/images/flooring/2.webp'
import flooring3 from '../assets/images/flooring/3.webp'
import flooring4 from '../assets/images/flooring/4.webp'
import flooring5 from '../assets/images/flooring/5.webp'
import flooring6 from '../assets/images/flooring/6.webp'
import flooring7 from '../assets/images/flooring/7.webp'
import flooring8 from '../assets/images/flooring/8.webp'
import flooring9 from '../assets/images/flooring/9.webp'

//fireplaces
import fireplace1 from '../assets/images/fireplace/1.webp' 
import fireplace2 from '../assets/images/fireplace/2.webp' 
import fireplace3 from '../assets/images/fireplace/3.webp' 
import fireplace4 from '../assets/images/fireplace/4.webp' 
import fireplace5 from '../assets/images/fireplace/5.webp' 
import fireplace6 from '../assets/images/fireplace/6.webp' 
import fireplace7 from '../assets/images/fireplace/7.webp' 
import fireplace8 from '../assets/images/fireplace/8.webp' 

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
    { id: 1, src: backsplash1, title: 'Subway Tile Backsplash', description: 'Classic white subway tile' },
    { id: 2, src: backsplash2, title: 'Mosaic Glass Backsplash', description: 'Colorful glass mosaic' },
    { id: 3, src: backsplash3, title: 'Natural Stone Backsplash', description: 'Elegant natural stone' },
    { id: 4, src: backsplash4, title: 'Hexagon Tile Backsplash', description: 'Modern hexagon pattern' },
    { id: 5, src: backsplash5, title: 'Marble Backsplash', description: 'Luxury marble finish' },
    { id: 6, src: backsplash6, title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
    { id: 7, src: backsplash7, title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
    { id: 8, src: backsplash8, title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
    { id: 9, src: backsplash9, title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' },
    { id: 10, src: backsplash10, title: 'Ceramic Backsplash', description: 'Handcrafted ceramic tiles' }
  ],
  patios: [
    { id: 11, src: patio1, title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 12, src: patio2, title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 13, src: patio3, title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 14, src: patio4, title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 15, src: patio5, title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 16, src: patio6, title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    { id: 17, src: patio7, title: 'Outdoor Slate Patio', description: 'Durable slate tiles' },
    
  ],
  showers: [
    { id: 18, src: shower1, title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 19, src: shower2, title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 20, src: shower3, title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 21, src: shower4, title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 22, src: shower5, title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 23, src: shower6, title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 24, src: shower7, title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    { id: 25, src: shower8, title: 'Marble Shower Walls', description: 'Luxurious marble shower' },
    
  ],
  flooring: [
    { id: 26, src: flooring1, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 27, src: flooring2, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 28, src: flooring3, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 29, src: flooring4, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 30, src: flooring5, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 31, src: flooring6, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 32, src: flooring7, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 33, src: flooring8, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    { id: 34, src: flooring9, title: 'Hardwood Look Tiles', description: 'Wood-look porcelain' },
    
  ],
  fireplaces: [
    { id: 35, src: fireplace1, title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 36, src: fireplace2, title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 37, src: fireplace3, title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 38, src: fireplace4, title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 39, src: fireplace5, title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 40, src: fireplace6, title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 41, src: fireplace7, title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    { id: 42, src: fireplace8, title: 'Stone Fireplace Surround', description: 'Natural stone surround' },
    
  ]
};


