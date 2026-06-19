import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogIndexPage from '@/components/pages/BlogIndexPage';
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
    title: `Blog - Tile Installation Tips & Ideas ${locationName} FL | Tola Tiles`,
    description: `Expert tile installation tips, design ideas, and industry insights from Tola Tiles for ${locationName}. Learn about tile care, trends, and get inspiration for your next project.`,
    keywords: `tile installation blog ${locationName.toLowerCase()}, tile tips ${locationName.toLowerCase()}, tile design ideas, tile maintenance, flooring tips, backsplash ideas, bathroom tile, ${locationName.toLowerCase()} tile`,
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/blog`,
    },
  };
}

export default async function Blog({ params }: { params: Promise<{ location: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  return <BlogIndexPage location={resolvedParams.location} />;
}
