'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { SERVICE_TYPES } from '@/types/api';
import type { ProjectListItem } from '@/types/api';
import ProjectCard from '@/components/projects/ProjectCard';

const LOCATION_LABELS: Record<string, string> = {
  florida: 'Florida',
  jacksonville: 'Jacksonville',
  'st-augustine': 'St. Augustine',
};

interface ServiceProjectsGalleryProps {
  params: Promise<{ location: string; slug: string }>;
}

export default function ServiceProjectsGallery({ params }: ServiceProjectsGalleryProps) {
  const unwrappedParams = use(params);
  const { location, slug } = unwrappedParams;
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const serviceName = SERVICE_TYPES.find((s) => s.slug === slug)?.name ?? slug;
  const locationLabel = LOCATION_LABELS[location] ?? location;

  useEffect(() => {
    api
      .getPublicServiceProjects(slug)
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/${location}/services/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {serviceName}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Our {serviceName} Work in {locationLabel}
          </h1>
          <p className="text-gray-600 mt-2">Browse our completed {serviceName.toLowerCase()} projects</p>
        </div>
      </div>

      {/* Projects grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No projects found yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
