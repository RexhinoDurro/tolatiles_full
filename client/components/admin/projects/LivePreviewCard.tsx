'use client';

import type { Project } from '@/types/api';
import { SERVICE_TYPES } from '@/types/api';
import ProjectStatusBadge from './ProjectStatusBadge';

interface LivePreviewCardProps {
  project: Partial<Project>;
}

const locationLabels: Record<string, string> = {
  florida: 'Florida',
  jacksonville: 'Jacksonville',
  'st-augustine': 'St. Augustine',
};

export default function LivePreviewCard({ project }: LivePreviewCardProps) {
  const serviceTypeMap = Object.fromEntries(SERVICE_TYPES.map((s) => [s.slug, s.name]));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {project.status && <ProjectStatusBadge status={project.status} />}
          {project.location && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
              {locationLabels[project.location] ?? project.location}
            </span>
          )}
          {project.is_featured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
              Featured
            </span>
          )}
        </div>

        <h2 className="font-bold text-gray-900 text-base leading-tight">
          {project.title || <span className="text-gray-400 italic">Untitled project</span>}
        </h2>

        {project.description && (
          <p className="text-gray-600 text-xs mt-1 line-clamp-2">{project.description}</p>
        )}

        {(project.job_types ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(project.job_types ?? []).map((slug) => (
              <span key={slug} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                {serviceTypeMap[slug] ?? slug}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Phases */}
      {(project.phases ?? []).length > 0 ? (
        <div className="divide-y divide-gray-100">
          {(project.phases ?? []).map((phase) => (
            <div key={phase.id} className="p-4">
              <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-2">
                {phase.title || 'Untitled phase'}
              </h3>

              {phase.media.length > 0 && (
                <div className="grid grid-cols-3 gap-1">
                  {phase.media.slice(0, 6).map((m) => (
                    <div key={m.id} className="aspect-square rounded overflow-hidden bg-gray-100">
                      {m.media_type === 'youtube' ? (
                        <img src={m.youtube_thumbnail ?? undefined} alt={m.alt_text} className="w-full h-full object-cover" />
                      ) : m.media_type === 'video' ? (
                        <video src={m.file ?? undefined} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.file ?? undefined} alt={m.alt_text} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {phase.description && (
                <div
                  className="text-xs text-gray-600 mt-2 line-clamp-3 prose prose-xs"
                  dangerouslySetInnerHTML={{ __html: phase.description }}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-400 text-xs">
          Add phases to see a preview
        </div>
      )}
    </div>
  );
}
