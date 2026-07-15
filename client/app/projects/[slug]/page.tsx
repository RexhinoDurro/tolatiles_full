import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Project } from '@/types/api';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function getProject(slugOrId: string): Promise<Project | null> {
  try {
    const response = await fetch(`${API_BASE}/projects/public/${slugOrId}/`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function firstPhaseImage(project: Project): string | null {
  for (const phase of project.phases) {
    for (const m of phase.media) {
      if (m.media_type === 'youtube' && m.youtube_thumbnail) return m.youtube_thumbnail;
      if (m.media_type === 'image' && m.file) return m.file;
    }
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  const description = project.description
    ? project.description.length > 157
      ? `${project.description.slice(0, 157)}...`
      : project.description
    : `See how Tola Tiles completed the ${project.title} project, phase by phase.`;
  const ogImage = project.main_video_thumbnail ?? firstPhaseImage(project) ?? 'https://tolatiles.com/images/logo.webp';

  return {
    title: project.title,
    description,
    alternates: {
      canonical: `https://tolatiles.com/projects/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description,
      url: `https://tolatiles.com/projects/${project.slug}`,
      type: 'website',
      siteName: 'Tola Tiles',
      images: [{ url: ogImage, alt: project.title }],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  // Old numeric /projects/{id} links (already indexed/bookmarked) still resolve via
  // the API's dual lookup — canonicalize them to the real slug URL with a permanent
  // redirect so search engines transfer ranking signal to the new URL instead of
  // treating it as a duplicate.
  if (project.slug !== slug) {
    permanentRedirect(`/projects/${project.slug}`);
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tolatiles.com' },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://tolatiles.com/projects' },
      { '@type': 'ListItem', position: 3, name: project.title, item: `https://tolatiles.com/projects/${project.slug}` },
    ],
  };

  const videoSchema =
    project.main_video_type === 'youtube' && project.main_video_embed_url
      ? {
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: project.title,
          description: project.description || project.title,
          thumbnailUrl: project.main_video_thumbnail,
          embedUrl: project.main_video_embed_url,
          uploadDate: project.created_at,
        }
      : project.main_video_type === 'video' && project.main_video
        ? {
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: project.title,
            description: project.description || project.title,
            contentUrl: project.main_video,
            uploadDate: project.created_at,
          }
        : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {videoSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />
      )}
      <ProjectDetailPage project={project} />
    </>
  );
}
