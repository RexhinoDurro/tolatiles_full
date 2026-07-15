import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryPage from '@/components/pages/GalleryPage';
import { getGalleryData } from '@/lib/galleryServer';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';

const validCategories = ['backsplashes', 'patios', 'showers', 'flooring', 'fireplaces'];

// Rich per-category metadata for targeted SEO
const categoryMeta: Record<
  string,
  { label: string; h1: string; metaTitle: string; metaDescription: string; keywords: string; serviceSlug: string }
> = {
  backsplashes: {
    label: 'Kitchen Backsplash',
    h1: 'Kitchen Backsplash Tile Installation Gallery',
    metaTitle: 'Kitchen Backsplash Tile Gallery Jacksonville & St. Augustine FL | Tola Tiles',
    metaDescription:
      'Browse our kitchen backsplash tile installation gallery for Jacksonville and St. Augustine, FL. Subway tiles, glass mosaics, natural stone, and custom designs by Tola Tiles — Northeast Florida tile experts.',
    keywords:
      'kitchen backsplash tile gallery jacksonville fl, backsplash tile examples st augustine, subway tile backsplash florida, glass mosaic backsplash gallery, natural stone kitchen backsplash northeast florida',
    serviceSlug: 'kitchen-backsplash',
  },
  showers: {
    label: 'Custom Shower',
    h1: 'Custom Shower Tile Installation Gallery',
    metaTitle: 'Shower Tile Installation Gallery Jacksonville & St. Augustine FL | Tola Tiles',
    metaDescription:
      'See our custom shower tile installations in Jacksonville and St. Augustine, FL. Walk-in showers, curbless designs, marble, porcelain, and mosaic tile work with complete waterproofing by Tola Tiles.',
    keywords:
      'shower tile gallery jacksonville fl, custom shower tile st augustine, walk-in shower tile examples florida, curbless shower tile gallery, marble shower tile northeast florida',
    serviceSlug: 'shower-tile',
  },
  flooring: {
    label: 'Floor Tile',
    h1: 'Floor Tile Installation Gallery',
    metaTitle: 'Floor Tile Installation Gallery Jacksonville & St. Augustine FL | Tola Tiles',
    metaDescription:
      'Browse floor tile installations in Jacksonville and St. Augustine, FL. Large format porcelain, wood-look planks, travertine, natural stone, and more — installed by Tola Tiles across Northeast Florida.',
    keywords:
      'floor tile gallery jacksonville fl, floor tile examples st augustine, large format porcelain floor florida, wood look tile floor gallery, travertine floor tile northeast florida',
    serviceSlug: 'floor-tile',
  },
  patios: {
    label: 'Patio & Pool Deck',
    h1: 'Outdoor Patio & Pool Deck Tile Gallery',
    metaTitle: 'Patio & Pool Deck Tile Gallery Jacksonville & St. Augustine FL | Tola Tiles',
    metaDescription:
      'Explore our outdoor patio and pool deck tile installations in Jacksonville and St. Augustine, FL. Travertine, porcelain pavers, slate, and anti-slip tile designed for Florida outdoor living by Tola Tiles.',
    keywords:
      'patio tile gallery jacksonville fl, pool deck tile examples st augustine fl, outdoor tile gallery florida, travertine pool deck northeast florida, slip resistant patio tile gallery',
    serviceSlug: 'patio-tile',
  },
  fireplaces: {
    label: 'Fireplace Surround',
    h1: 'Fireplace Tile Surround Installation Gallery',
    metaTitle: 'Fireplace Tile Surround Gallery Jacksonville & St. Augustine FL | Tola Tiles',
    metaDescription:
      'Browse our fireplace tile surround installations in Jacksonville and St. Augustine, FL. Marble, stacked stone, contemporary porcelain panels, and Talavera ceramic designs by Tola Tiles.',
    keywords:
      'fireplace tile gallery jacksonville fl, fireplace surround tile examples st augustine, marble fireplace tile florida, stacked stone fireplace gallery, gas fireplace tile surround northeast florida',
    serviceSlug: 'fireplace-tile',
  },
};

export function generateStaticParams() {
  return validCategories.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;

  if (!validCategories.includes(category)) return { title: 'Not Found' };

  const meta = categoryMeta[category];

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    keywords: meta.keywords,
    alternates: {
      canonical: `https://tolatiles.com/gallery/${category}`,
    },
    openGraph: {
      title: meta.metaTitle,
      description: meta.metaDescription,
      url: `https://tolatiles.com/gallery/${category}`,
      type: 'website',
      siteName: 'Tola Tiles',
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function GalleryCategory({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!validCategories.includes(category)) notFound();

  const meta = categoryMeta[category];
  const { images, categories } = await getGalleryData(category);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tolatiles.com' },
      { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://tolatiles.com/gallery' },
      {
        '@type': 'ListItem',
        position: 3,
        name: meta.label,
        item: `https://tolatiles.com/gallery/${category}`,
      },
    ],
  };

  const imageGallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${meta.h1} — Tola Tiles Northeast Florida`,
    description: meta.metaDescription,
    url: `https://tolatiles.com/gallery/${category}`,
    about: { '@type': 'Thing', name: meta.h1 },
    author: {
      '@type': 'LocalBusiness',
      '@id': 'https://tolatiles.com/#business',
      name: 'Tola Tiles',
      telephone: '+1-904-866-1738',
      url: 'https://tolatiles.com',
    },
    isPartOf: {
      '@type': 'ImageGallery',
      name: 'Tola Tiles Project Gallery',
      url: 'https://tolatiles.com/gallery',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }} />
      <GalleryPage location="florida" category={category} initialImages={images} initialCategories={categories} />
    </>
  );
}
