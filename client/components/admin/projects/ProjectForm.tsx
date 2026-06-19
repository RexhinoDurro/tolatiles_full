'use client';

import { SERVICE_TYPES } from '@/types/api';
import type { Project, ProjectStatus, ProjectLocation, ServiceTypeSlug } from '@/types/api';

interface ProjectFormProps {
  project: Partial<Project>;
  onChange: (updates: Partial<Project>) => void;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const LOCATION_OPTIONS: { value: ProjectLocation; label: string }[] = [
  { value: 'florida', label: 'Florida' },
  { value: 'jacksonville', label: 'Jacksonville' },
  { value: 'st-augustine', label: 'St. Augustine' },
];

export default function ProjectForm({ project, onChange }: ProjectFormProps) {
  const jobTypes = project.job_types ?? [];

  const toggleJobType = (slug: ServiceTypeSlug) => {
    const next = jobTypes.includes(slug)
      ? jobTypes.filter((j) => j !== slug)
      : [...jobTypes, slug];
    onChange({ job_types: next });
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={project.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Project title"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={project.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          placeholder="Short description of the project"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Status + Location row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={project.status ?? 'draft'}
            onChange={(e) => onChange({ status: e.target.value as ProjectStatus })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={project.location ?? 'florida'}
            onChange={(e) => onChange({ location: e.target.value as ProjectLocation })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LOCATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Is Featured */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_featured"
          checked={project.is_featured ?? false}
          onChange={(e) => onChange({ is_featured: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
          Featured project
        </label>
      </div>

      {/* Job Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Job Types</label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_TYPES.map((s) => (
            <label
              key={s.slug}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                jobTypes.includes(s.slug)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={jobTypes.includes(s.slug)}
                onChange={() => toggleJobType(s.slug)}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
