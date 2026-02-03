import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryPage from '@/components/pages/GalleryPage';

const validCategories = ['backsplashes', 'patios', 'showers', 'flooring', 'fireplaces'];

const categoryLabels: Record<string, string> = {
  backsplashes: 'Backsplashes',
  patios: 'Patios',
  showers: 'Showers',
  flooring: 'Flooring',
  fireplaces: 'Fireplaces',
};

// Enhanced category descriptions for SEO
const categoryDescriptions: Record<string, string> = {
  backsplashes: 'Explore our kitchen backsplash gallery featuring subway tiles, glass mosaics, and natural stone installations in Jacksonville, St. Augustine, and Northeast Florida homes. Custom designs for every style.',
  patios: 'View our outdoor patio and pool deck tile installations across Northeast Florida. Slip-resistant, UV-stable materials perfect for year-round Florida living in Jacksonville and St. Augustine areas.',
  showers: 'Browse custom shower tile installations with waterproofing systems designed for Florida humidity. Walk-in showers, built-in niches, and luxury designs for Jacksonville and St. Augustine homes.',
  flooring: 'See our floor tile portfolio including large format porcelain, natural stone, and ceramic installations. Professional flooring for homes and businesses throughout Northeast Florida.',
  fireplaces: 'Discover fireplace tile surrounds featuring marble, stacked stone, and contemporary designs. Creating stunning focal points in Jacksonville, St. Augustine, and Ponte Vedra homes.',
};

// Service links for each category
const categoryServiceLinks: Record<string, string> = {
  backsplashes: '/services/kitchen-backsplash',
  patios: '/services/patio-tile',
  showers: '/services/shower-tile',
  flooring: '/services/floor-tile',
  fireplaces: '/services/fireplace-tile',
};

export async function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryLabel = categoryLabels[resolvedParams.category] || resolvedParams.category;

  if (!validCategories.includes(resolvedParams.category)) {
    return {
      title: 'Gallery Not Found',
    };
  }

  const description = categoryDescriptions[resolvedParams.category] || `View our ${categoryLabel.toLowerCase()} tile installation projects in Northeast Florida.`;

  return {
    title: `${categoryLabel} Tile Gallery Jacksonville & St Augustine FL | Tola Tiles`,
    description,
    keywords: [
      `${resolvedParams.category} tile gallery`,
      `${resolvedParams.category} tile installation jacksonville`,
      `${resolvedParams.category} tile st augustine`,
      `${categoryLabel.toLowerCase()} renovation florida`,
      `${categoryLabel.toLowerCase()} tile examples`,
      'tile contractor northeast florida',
    ].join(', '),
    alternates: {
      canonical: `https://tolatiles.com/gallery/${resolvedParams.category}`,
    },
    openGraph: {
      title: `${categoryLabel} Tile Gallery | Tola Tiles`,
      description,
      url: `https://tolatiles.com/gallery/${resolvedParams.category}`,
      type: 'website',
    },
    other: {
      'geo.region': 'US-FL',
      'geo.placename': 'Jacksonville',
    },
  };
}

export default async function GalleryCategory({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;

  if (!validCategories.includes(resolvedParams.category)) {
    notFound();
  }

  return <GalleryPage category={resolvedParams.category} />;
}
