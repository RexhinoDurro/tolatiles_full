import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServicesPage from '@/components/pages/ServicesPage';
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
    title: `Professional Tile Installation Services ${locationName} FL | Kitchen, Bathroom & Flooring`,
    description: `Expert tile installation services in ${locationName}, FL for kitchens, bathrooms, patios, and flooring. Licensed professionals with 15+ years experience. Free estimates and 2-year warranty.`,
    keywords: `tile installation ${locationName.toLowerCase()} fl, kitchen backsplash ${locationName.toLowerCase()}, bathroom tile installation ${locationName.toLowerCase()}, floor tiling ${locationName.toLowerCase()}, tile contractor ${locationName.toLowerCase()} fl, ceramic tile installation ${locationName.toLowerCase()}`,
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/services`,
    },
  };
}

export default async function Services({ params }: { params: Promise<{ location: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  return <ServicesPage location={resolvedParams.location} />;
}
