import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContactPage from '@/components/pages/ContactPage';
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
    title: `Contact Us - ${locationName} FL Tile Installation | Get Free Quote`,
    description: `Contact Tola Tiles for expert tile installation services in ${locationName}. Get a free quote, schedule consultation, or call (904) 866-1738. Licensed professionals serving ${locationName}.`,
    keywords: `contact tola tiles ${locationName.toLowerCase()}, tile installation quote ${locationName.toLowerCase()}, free estimate, tile contractor contact, schedule consultation, tile installation phone number`,
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/contact`,
    },
  };
}

export default async function Contact({ params }: { params: Promise<{ location: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  const location = resolvedParams.location;
  const breadcrumbItems =
    location === 'florida'
      ? null
      : buildCityBreadcrumbs(location, [{ name: 'Contact', url: `https://tolatiles.com/${location}/contact` }]);

  return (
    <>
      {breadcrumbItems && <BreadcrumbSchema items={breadcrumbItems} />}
      <ContactPage location={location} />
    </>
  );
}
