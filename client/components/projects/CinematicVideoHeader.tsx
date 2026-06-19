'use client';

import type { Project } from '@/types/api';

interface CinematicVideoHeaderProps {
  project: Project;
}

export default function CinematicVideoHeader({ project }: CinematicVideoHeaderProps) {
  const firstMedia = project.phases[0]?.media[0];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '70vh', minHeight: '400px' }}>
      {firstMedia ? (
        firstMedia.media_type === 'video' ? (
          <video
            src={firstMedia.file}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={firstMedia.file}
            alt={firstMedia.alt_text || project.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      ) : (
        <div className="absolute inset-0 bg-gray-800" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-3">
            {project.title}
          </h1>
          {project.description && (
            <p className="text-white/80 text-lg">{project.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
