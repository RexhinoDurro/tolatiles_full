import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryPage from '@/components/pages/GalleryPage';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';

const validCategories = ['backsplashes', 'patios', 'showers', 'flooring', 'fireplaces'];

const categoryLabels: Record<string, string> = {
  backsplashes: 'Backsplashes',
  patios: 'Patios',
  showers: 'Showers',
  flooring: 'Flooring',
  fireplaces: 'Fireplaces',
};

const categoryDescriptions: Record<string, (location: string) => string> = {
  backsplashes: (loc) => `Explore our kitchen backsplash gallery featuring subway tiles, glass mosaics, and natural stone installations in ${loc} homes. Custom designs for every style.`,
  patios: (loc) => `View our outdoor patio and pool deck tile installations across ${loc}. Slip-resistant, UV-stable materials perfect for year-round Florida living.`,
  showers: (loc) => `Browse custom shower tile installations with waterproofing systems designed for Florida humidity. Walk-in showers, built-in niches, and luxury designs for ${loc} homes.`,
  flooring: (loc) => `See our floor tile portfolio including large format porcelain, natural stone, and ceramic installations. Professional flooring for homes and businesses in ${loc}.`,
  fireplaces: (loc) => `Discover fireplace tile surrounds featuring marble, stacked stone, and contemporary designs. Creating stunning focal points in ${loc} homes.`,
};

export function generateStaticParams() {
  const params: { location: string; category: string }[] = [];

  for (const location of VALID_LOCATIONS) {
    for (const category of validCategories) {
      params.push({ location, category });
    }
  }

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ location: string; category: string }> }): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    return { title: 'Not Found' };
  }

  if (!validCategories.includes(resolvedParams.category)) {
    return { title: 'Gallery Not Found' };
  }

  const locationName = locationNames[resolvedParams.location];
  const categoryLabel = categoryLabels[resolvedParams.category];
  const description = categoryDescriptions[resolvedParams.category](locationName);

  return {
    title: `${categoryLabel} Tile Gallery ${locationName} FL | Tola Tiles`,
    description,
    keywords: [
      `${resolvedParams.category} tile gallery ${locationName.toLowerCase()}`,
      `${resolvedParams.category} tile installation ${locationName.toLowerCase()}`,
      `${categoryLabel.toLowerCase()} renovation florida`,
      `${categoryLabel.toLowerCase()} tile examples`,
      `tile contractor ${locationName.toLowerCase()}`,
    ].join(', '),
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/gallery/${resolvedParams.category}`,
    },
    openGraph: {
      title: `${categoryLabel} Tile Gallery ${locationName} FL | Tola Tiles`,
      description,
      url: `https://tolatiles.com/${resolvedParams.location}/gallery/${resolvedParams.category}`,
      type: 'website',
    },
  };
}

export default async function GalleryCategory({ params }: { params: Promise<{ location: string; category: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  if (!validCategories.includes(resolvedParams.category)) {
    notFound();
  }

  return <GalleryPage category={resolvedParams.category} location={resolvedParams.location} />;
}
