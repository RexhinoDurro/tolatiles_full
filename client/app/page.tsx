import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'Tola Tiles - Tile Installers in Jacksonville and Saint Augustine, Florida',
  description:
    'Bath & Kitchen Remodeling Company, Tile Installation Services in Jacksonville, Ponte Vedra, and Saint Augustine Florida, Tile Contractors, Flooring Installers, Tile Installers',
  keywords:
    'tile installers jacksonville FL, tile installers Saint Augustine FL, backsplash jacksonville fl, backsplash saint augustine fl, bathroom tiles jacksonville fl, patio tiles, flooring installer, ceramic tiles, porcelain tiles, natural stone, tile contractor, tile installer jacksonville fl, tile installer saint augustine fl, home renovation',
  alternates: {
    canonical: 'https://tolatiles.com',
  },
};

export default function Home() {
  return <HomePage />;
}
