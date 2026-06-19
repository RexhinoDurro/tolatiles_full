'use client';

import Link from 'next/link';
import { Edit2 } from 'lucide-react';
import type { ProjectListItem } from '@/types/api';
import ProjectStatusBadge from './ProjectStatusBadge';

interface ProjectsTableProps {
  projects: ProjectListItem[];
}

const locationLabels: Record<string, string> = {
  florida: 'Florida',
  jacksonville: 'Jacksonville',
  'st-augustine': 'St. Augustine',
};

export default function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Phases</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                {project.title}
              </td>
              <td className="px-4 py-3">
                <ProjectStatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {locationLabels[project.location] ?? project.location}
              </td>
              <td className="px-4 py-3 text-gray-600">{project.phase_count}</td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(project.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                No projects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
