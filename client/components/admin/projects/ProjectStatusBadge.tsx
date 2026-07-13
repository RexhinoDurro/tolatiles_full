'use client';

import type { ProjectStatus, WorkStatus } from '@/types/api';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  published: { label: 'Published', className: 'bg-green-100 text-green-700' },
};

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

const workStatusConfig: Record<WorkStatus, { label: string; className: string }> = {
  started: { label: 'Started', className: 'bg-sky-100 text-sky-700' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
};

export function WorkStatusBadge({ workStatus }: { workStatus: WorkStatus }) {
  const config = workStatusConfig[workStatus] ?? { label: workStatus, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
