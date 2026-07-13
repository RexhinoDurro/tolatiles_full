'use client';

import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';
import type { ProjectListItem } from '@/types/api';
import ProjectStatusBadge, { WorkStatusBadge } from './ProjectStatusBadge';

interface ProjectsTableProps {
  projects: ProjectListItem[];
  onDelete?: (project: ProjectListItem) => void;
}

export default function ProjectsTable({ projects, onDelete }: ProjectsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Work</th>
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
              <td className="px-4 py-3">
                <WorkStatusBadge workStatus={project.work_status} />
              </td>
              <td className="px-4 py-3 text-gray-600">{project.phase_count}</td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(project.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(project)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
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
