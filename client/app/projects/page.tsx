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
        url: `https://tolatiles.com/projects/${p.id}`,
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Projects</h1>
            <div className="w-12 h-1 bg-[#00a8e8] my-4 rounded-full" />
            <p className="text-gray-600 text-lg max-w-2xl">
              Real tile installations completed by our team — follow each project phase by phase, from
              preparation to the finished result.
            </p>
          </div>
        </div>

        {/* Filters + projects grid */}
        <ProjectsIndexContent projects={projects} />
      </div>
    </>
  );
}
