import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryPage from '@/components/pages/GalleryPage';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';
import BreadcrumbSchema, { buildCityBreadcrumbs } from '@/components/BreadcrumbSchema';
import { getGalleryData } from '@/lib/galleryServer';

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
    title: `Tile Installation Gallery ${locationName} FL - Premium Tile Work`,
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

  const location = resolvedParams.location;
  const breadcrumbItems =
    location === 'florida'
      ? null
      : buildCityBreadcrumbs(location, [{ name: 'Gallery', url: `https://tolatiles.com/${location}/gallery` }]);
  const { images, categories } = await getGalleryData('all');

  return (
    <>
      {breadcrumbItems && <BreadcrumbSchema items={breadcrumbItems} />}
      <GalleryPage location={location} initialImages={images} initialCategories={categories} />
    </>
  );
}
