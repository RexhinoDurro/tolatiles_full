import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AboutPage from '@/components/pages/AboutPage';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';
import BreadcrumbSchema, { buildCityBreadcrumbs } from '@/components/BreadcrumbSchema';

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
    title: `About Us - ${locationName} FL Tile Installation | 13+ Years Experience`,
    description: `Learn about Tola Tiles - family-owned tile installation company serving ${locationName} since 2013. Meet our expert team, discover our values, and see why we're the premier choice for tile installation in ${locationName}.`,
    keywords: `about tola tiles ${locationName.toLowerCase()}, tile installation company ${locationName.toLowerCase()}, tile contractor history, expert tile team, family owned business, tile installation experience`,
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/about`,
    },
  };
}

export default async function About({ params }: { params: Promise<{ location: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  const location = resolvedParams.location;
  const breadcrumbItems =
    location === 'florida'
      ? null
      : buildCityBreadcrumbs(location, [{ name: 'About Us', url: `https://tolatiles.com/${location}/about` }]);

  return (
    <>
      {breadcrumbItems && <BreadcrumbSchema items={breadcrumbItems} />}
      <AboutPage location={location} />
    </>
  );
}
