'use client';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const BASE_URL = 'https://tolatiles.com';
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ name: 'Home', url: BASE_URL }];

  let currentPath = '';
  const nameMap: Record<string, string> = {
    services: 'Services',
    gallery: 'Gallery',
    about: 'About Us',
    contact: 'Contact',
    faqs: 'FAQs',
    jacksonville: 'Jacksonville',
    'st-augustine': 'St Augustine',
    backsplashes: 'Backsplashes',
    showers: 'Showers',
    flooring: 'Flooring',
    patios: 'Patios',
    fireplaces: 'Fireplaces',
    'kitchen-backsplash-jacksonville': 'Kitchen Backsplash',
    'bathroom-tile-jacksonville': 'Bathroom Tile',
    'floor-tiling-jacksonville': 'Floor Tiling',
    'patio-tile-jacksonville': 'Patio Tile',
    'fireplace-tile-jacksonville': 'Fireplace Tile',
    'shower-tile-jacksonville': 'Shower Tile',
  };

  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const name = nameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    items.push({
      name,
      url: `${BASE_URL}${currentPath}`,
    });
  });

  return items;
}
