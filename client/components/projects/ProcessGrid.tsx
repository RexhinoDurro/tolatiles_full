'use client';

import type { Project } from '@/types/api';
import VideoWithSound from './VideoWithSound';

interface ProcessGridProps {
  project: Project;
}

export default function ProcessGrid({ project }: ProcessGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {project.phases.map((phase) => {
        const coverMedia = phase.media[0];
        return (
          <div key={phase.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
            {/* Cover media */}
            {coverMedia ? (
              <div className="aspect-video overflow-hidden">
                {coverMedia.media_type === 'video' ? (
                  <VideoWithSound src={coverMedia.file} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={coverMedia.file}
                    alt={coverMedia.alt_text || phase.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                No media
              </div>
            )}

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{phase.title}</h3>
              {phase.description && (
                <div
                  className="text-sm text-gray-600 line-clamp-3 prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: phase.description }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
