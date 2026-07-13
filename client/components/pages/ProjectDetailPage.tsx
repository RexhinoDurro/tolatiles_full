'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Project, ProjectMedia } from '@/types/api';
import { SERVICE_TYPES } from '@/types/api';

interface ProjectDetailPageProps {
  project: Project;
}

function PhaseMedia({ media, title }: { media: ProjectMedia; title: string }) {
  if (media.media_type === 'youtube' && media.youtube_embed_url) {
    return (
      <iframe
        src={media.youtube_embed_url}
        title={media.alt_text || title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    );
  }
  if (media.media_type === 'video' && media.file) {
    return (
      <video
        src={media.file}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    );
  }
  if (media.file) {
    return (
      <img
        src={media.file}
        alt={media.alt_text || title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    );
  }
  return null;
}

const WORK_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  started: { label: 'Started', className: 'bg-sky-50 text-sky-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
};

export default function ProjectDetailPage({ project }: ProjectDetailPageProps) {
  const serviceTypeMap = Object.fromEntries(SERVICE_TYPES.map((s) => [s.slug, s.name]));
  const hasMainVideo = project.main_video_type !== 'none';
  const workStatus = WORK_STATUS_LABELS[project.work_status];

  return (
    <div className="pt-[var(--navbar-height)] min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#00a8e8] mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Projects
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">{project.title}</h1>
          <div className="w-12 h-1 bg-[#00a8e8] my-5 rounded-full" />

          <div className="flex flex-wrap gap-2 mb-4">
            {workStatus && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${workStatus.className}`}>
                {workStatus.label}
              </span>
            )}
            {project.job_types.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 font-medium"
              >
                {serviceTypeMap[slug] ?? slug}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main video */}
        {hasMainVideo && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg bg-gray-950">
            <div className="relative w-full aspect-video">
              {project.main_video_type === 'youtube' && project.main_video_embed_url ? (
                <iframe
                  src={project.main_video_embed_url}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : project.main_video ? (
                <video
                  src={project.main_video}
                  controls
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : null}
            </div>
          </div>
        )}

        {/* Description */}
        {project.description && (
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-16 whitespace-pre-line">
            {project.description}
          </p>
        )}

        {/* Phases — zigzag layout */}
        {project.phases.length > 0 && (
          <div className="flex flex-col gap-16 mt-4">
            {project.phases.map((phase, index) => {
              const firstMedia = phase.media[0];
              const textOrder = index % 2 === 0 ? 'order-1' : 'order-2';
              const mediaOrder = index % 2 === 0 ? 'order-2' : 'order-1';

              if (!firstMedia) {
                return (
                  <div key={phase.id} className="max-w-3xl">
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
                      {phase.title}
                    </h2>
                    <div className="w-8 md:w-12 h-1 bg-[#00a8e8] mb-3 md:mb-6 rounded-full" />
                    {phase.description && (
                      <p className="text-sm md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                        {phase.description}
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div key={phase.id} className="grid grid-cols-2 gap-4 md:gap-12 items-center group">
                  {/* Text Side */}
                  <div className={`w-full flex flex-col justify-center ${textOrder}`}>
                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4 group-hover:text-[#00a8e8] transition-colors">
                      {phase.title}
                    </h2>
                    <div className="w-8 md:w-12 h-1 bg-[#00a8e8] mb-3 md:mb-6 rounded-full" />
                    {phase.description && (
                      <p className="text-sm md:text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                        {phase.description}
                      </p>
                    )}
                  </div>

                  {/* Media Side */}
                  <div className={`w-full ${mediaOrder}`}>
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 bg-gray-200 h-48 md:h-80 lg:h-96">
                      <PhaseMedia media={firstMedia} title={phase.title} />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
