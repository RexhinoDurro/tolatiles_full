'use client';

import Link from 'next/link';
import type { ProjectListItem } from '@/types/api';
import { SERVICE_TYPES } from '@/types/api';
import VideoWithSound from './VideoWithSound';

interface ProjectCardProps {
  project: ProjectListItem;
  location: string;
  serviceSlug?: string;
}

export default function ProjectCard({ project, location, serviceSlug }: ProjectCardProps) {
  const serviceTypeMap = Object.fromEntries(SERVICE_TYPES.map((s) => [s.slug, s.name]));

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      {/* Cover media */}
      <div className="overflow-hidden bg-gray-100 w-full relative">
        {project.cover_image ? (
          project.cover_media_type === 'video' ? (
            <VideoWithSound src={project.cover_image} className="w-full h-auto block" />
          ) : (
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-auto block group-hover:scale-105 transition-transform duration-300"
            />
          )
        ) : (
          <div className="aspect-video flex items-center justify-center text-gray-400 text-sm">No photo</div>
        )}
        {/* YouTube play button overlay for YouTube cover */}
        {project.cover_media_type === 'youtube' && project.cover_image && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 leading-tight">{project.title}</h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">{project.phase_count} phase{project.phase_count !== 1 ? 's' : ''}</span>
        </div>

        {project.job_types.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.job_types.map((slug) => (
              <span key={slug} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 font-medium">
                {serviceTypeMap[slug] ?? slug}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
