import { locationNames, countyNames } from '@/lib/locations';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

const BASE_URL = 'https://tolatiles.com';

/**
 * Build the standard Home > Florida > County > City breadcrumb trail for a
 * city page. County gets no URL segment (see the site's location/SEO
 * policy) — it's a virtual crumb pointing at the city page URL since no
 * dedicated county page exists.
 */
export function buildCityBreadcrumbs(
  location: 'jacksonville' | 'st-augustine',
  trailingItems: BreadcrumbItem[] = []
): BreadcrumbItem[] {
  const cityUrl = `${BASE_URL}/${location}`;
  return [
    { name: 'Home', url: BASE_URL },
    { name: 'Florida', url: BASE_URL },
    { name: countyNames[location], url: cityUrl },
    { name: locationNames[location], url: cityUrl },
    ...trailingItems,
  ];
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
