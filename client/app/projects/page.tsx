import type { Metadata } from 'next';
import type { ProjectListItem } from '@/types/api';
import ProjectsIndexContent from '@/components/pages/ProjectsIndexContent';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const metadata: Metadata = {
  title: 'Tile Installation Projects Jacksonville & St. Augustine FL | Tola Tiles',
  description:
    'Explore completed tile installation projects by Tola Tiles — kitchen backsplashes, custom showers, bathroom renovations, floor tile, patios, and fireplace surrounds across Northeast Florida. See each project phase by phase.',
  keywords:
    'tile installation projects jacksonville fl, tile projects st augustine fl, kitchen backsplash project, shower tile renovation, bathroom remodel tile, floor tile installation project, tola tiles portfolio',
  alternates: {
    canonical: 'https://tolatiles.com/projects',
  },
  openGraph: {
    title: 'Tile Installation Projects — Tola Tiles',
    description:
      'Real completed tile projects across Northeast Florida, documented phase by phase with photos and video.',
    url: 'https://tolatiles.com/projects',
    type: 'website',
    siteName: 'Tola Tiles',
  },
};

async function getProjects(): Promise<ProjectListItem[]> {
  try {
    const response = await fetch(`${API_BASE}/projects/public/`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tola Tiles Projects — Tile Installation Portfolio',
    description:
      'Completed tile installation projects across Northeast Florida, documented phase by phase.',
    url: 'https://tolatiles.com/projects',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.title,
        url: `https://tolatiles.com/projects/${p.slug}`,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tolatiles.com' },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://tolatiles.com/projects' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="pt-[var(--navbar-height)] min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Tile Installation Projects in Jacksonville &amp; St. Augustine, FL
            </h1>
            <div className="w-12 h-1 bg-[#00a8e8] my-4 rounded-full" />
            <p className="text-gray-600 text-lg max-w-3xl">
              Every project here is a real job for a real homeowner — not a stock photo. Browse recent{' '}
              <strong className="font-semibold text-gray-900">kitchen backsplash</strong>,{' '}
              <strong className="font-semibold text-gray-900">bathroom</strong>,{' '}
              <strong className="font-semibold text-gray-900">shower</strong>,{' '}
              <strong className="font-semibold text-gray-900">floor</strong>,{' '}
              <strong className="font-semibold text-gray-900">patio</strong>, and{' '}
              <strong className="font-semibold text-gray-900">fireplace</strong> installations across
              Jacksonville and St. Augustine, and follow each one phase by phase — from demo and prep
              through the finished result. If you see a style or material you like, it's an easy way to
              know exactly what to ask for when you call.
            </p>
          </div>
        </div>

        {/* Filters + projects grid */}
        <ProjectsIndexContent projects={projects} />

        {/* Browse by service — internal links for SEO + a clear next step */}
        <section className="bg-white border-t border-gray-200 py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Browse Projects by Service
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Looking for a specific kind of project? Jump straight to that service.
            </p>
            <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200">
              {[
                { label: 'Kitchen Backsplash Installation', slug: 'kitchen-backsplash' },
                { label: 'Bathroom Tile Installation', slug: 'bathroom-tile' },
                { label: 'Shower Installation', slug: 'shower-tile' },
                { label: 'Floor Tiling', slug: 'floor-tile' },
                { label: 'Patio & Outdoor Tile', slug: 'patio-tile' },
                { label: 'Fireplace Tile', slug: 'fireplace-tile' },
              ].map((svc) => (
                <a
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="group flex items-center justify-between py-4 px-2 -mx-2 hover:bg-gray-50 transition-colors font-semibold text-gray-900 hover:text-[#00a8e8]"
                >
                  {svc.label}
                  <span className="text-[#00a8e8] group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
