import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryPage from '@/components/pages/GalleryPage';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';

export function generateStaticParams() {
  return VALID_LOCATIONS.map((location) => ({
    location,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    return { title: 'Not Found' };
  }

  const locationName = locationNames[resolvedParams.location];

  return {
    title: `Tile Installation Gallery ${locationName} FL - Premium Tile Work | Tola Tiles`,
    description: `Browse our complete gallery of tile installation projects in ${locationName}, FL including kitchen backsplashes, bathroom renovations, patio installations, and flooring work by Tola Tiles.`,
    keywords: `tile gallery ${locationName.toLowerCase()}, tile installation examples ${locationName.toLowerCase()}, kitchen backsplash gallery, bathroom tile gallery, patio tile gallery, flooring gallery`,
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/gallery`,
    },
  };
}

export default async function Gallery({ params }: { params: Promise<{ location: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  return <GalleryPage location={resolvedParams.location} />;
}
