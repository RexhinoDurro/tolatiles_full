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
        firstMedia.media_type === 'youtube' && firstMedia.youtube_embed_url ? (
          <iframe
            src={`${firstMedia.youtube_embed_url}?autoplay=1&mute=1&loop=1&controls=0&playlist=${firstMedia.youtube_embed_url.split('/embed/')[1]}&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none', pointerEvents: 'none' }}
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            title={firstMedia.alt_text || project.title}
          />
        ) : firstMedia.media_type === 'video' && firstMedia.file ? (
          <video
            src={firstMedia.file}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : firstMedia.file ? (
          <img
            src={firstMedia.file}
            alt={firstMedia.alt_text || project.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : firstMedia.youtube_thumbnail ? (
          <img
            src={firstMedia.youtube_thumbnail}
            alt={firstMedia.alt_text || project.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null
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
