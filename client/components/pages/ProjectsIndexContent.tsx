'use client';

import { useMemo, useState } from 'react';
import type { ProjectListItem, ServiceTypeSlug } from '@/types/api';
import { SERVICE_TYPES } from '@/types/api';
import ProjectCard from '@/components/projects/ProjectCard';

interface ProjectsIndexContentProps {
  projects: ProjectListItem[];
}

export default function ProjectsIndexContent({ projects }: ProjectsIndexContentProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | ServiceTypeSlug>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((p) => p.job_types.includes(activeFilter));
  }, [projects, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Service filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
            activeFilter === 'all'
              ? 'bg-[#00a8e8] text-white border-[#00a8e8] shadow-md scale-105'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#00a8e8] hover:text-[#00a8e8] hover:shadow-sm'
          }`}
        >
          All
        </button>
        {SERVICE_TYPES.map((s) => (
          <button
            key={s.slug}
            onClick={() => setActiveFilter(s.slug)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
              activeFilter === s.slug
                ? 'bg-[#00a8e8] text-white border-[#00a8e8] shadow-md scale-105'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#00a8e8] hover:text-[#00a8e8] hover:shadow-sm'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Projects grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          {projects.length === 0 ? (
            <>
              <p className="text-lg">No projects published yet.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </>
          ) : (
            <p className="text-lg">No projects in this category yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
