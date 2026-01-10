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

  return {
    title: `${categoryLabel} Gallery - Tile Installation | Tola Tiles`,
    description: `View our ${categoryLabel.toLowerCase()} tile installation projects. Professional ${categoryLabel.toLowerCase()} installation with premium materials and expert craftsmanship by Tola Tiles.`,
    keywords: `${resolvedParams.category} tile gallery, ${resolvedParams.category} installation, ${resolvedParams.category} renovation, ${resolvedParams.category} tile examples`,
    alternates: {
      canonical: `https://tolatiles.com/gallery/${resolvedParams.category}`,
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
