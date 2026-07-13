'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { ProjectListItem } from '@/types/api';
import { SERVICE_TYPES } from '@/types/api';
import ProjectCard from './ProjectCard';

interface ServiceProjectsSectionProps {
  location: string;
  serviceSlug: string;
  serviceName?: string;
}

export default function ServiceProjectsSection({
  location,
  serviceSlug,
  serviceName,
}: ServiceProjectsSectionProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPublicServiceProjects(serviceSlug)
      .then((data) => setProjects(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [serviceSlug]);

  if (!loading && projects.length === 0) return null;

  const displayName =
    serviceName ??
    SERVICE_TYPES.find((s) => s.slug === serviceSlug)?.name ??
    serviceSlug;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Work</h2>
            <p className="text-gray-600">{displayName} projects in your area</p>
          </div>
          <Link
            href={`/${location}/services/${serviceSlug}/projects`}
            className="hidden sm:inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href={`/${location}/services/${serviceSlug}/projects`}
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                View All {displayName} Projects
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
