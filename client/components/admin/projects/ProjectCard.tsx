'use client';

import Link from 'next/link';
import { Edit2, Layers } from 'lucide-react';
import type { ProjectListItem } from '@/types/api';
import { SERVICE_TYPES } from '@/types/api';
import ProjectStatusBadge from './ProjectStatusBadge';

interface ProjectCardProps {
  project: ProjectListItem;
}

const locationLabels: Record<string, string> = {
  florida: 'Florida',
  jacksonville: 'Jacksonville',
  'st-augustine': 'St. Augustine',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const serviceTypeMap = Object.fromEntries(SERVICE_TYPES.map((s) => [s.slug, s.name]));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover media */}
      <div className="bg-gray-100 relative overflow-hidden w-full">
        {project.cover_image ? (
          project.cover_media_type === 'video' ? (
            <video
              src={project.cover_image}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto block"
            />
          ) : (
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-auto block"
            />
          )
        ) : (
          <div className="aspect-video flex items-center justify-center text-gray-400 text-sm">
            No media
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {project.title}
          </h3>
          <Link
            href={`/admin/projects/${project.id}/edit`}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <ProjectStatusBadge status={project.status} />
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
            {locationLabels[project.location] ?? project.location}
          </span>
          {project.is_featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
              Featured
            </span>
          )}
        </div>

        {project.job_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.job_types.map((slug) => (
              <span key={slug} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                {serviceTypeMap[slug] ?? slug}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Layers className="w-3 h-3" />
          <span>{project.phase_count} phase{project.phase_count !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
