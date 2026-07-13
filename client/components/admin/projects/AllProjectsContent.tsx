'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Plus, Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { SERVICE_TYPES } from '@/types/api';
import type { ProjectListItem, ProjectStatus, WorkStatus, ServiceTypeSlug } from '@/types/api';
import ProjectCard from './ProjectCard';
import ProjectsTable from './ProjectsTable';

const STATUS_OPTIONS: { value: '' | ProjectStatus; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

const WORK_STATUS_OPTIONS: { value: '' | WorkStatus; label: string }[] = [
  { value: '', label: 'All Work Statuses' },
  { value: 'started', label: 'Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function AllProjectsContent() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ProjectStatus>('');
  const [workStatusFilter, setWorkStatusFilter] = useState<'' | WorkStatus>('');
  const [jobTypeFilter, setJobTypeFilter] = useState<'' | ServiceTypeSlug>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getProjects({
          status: statusFilter || undefined,
          work_status: workStatusFilter || undefined,
          job_type: jobTypeFilter || undefined,
        });
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [statusFilter, workStatusFilter, jobTypeFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, search]);

  const handleDelete = async (project: ProjectListItem) => {
    if (!window.confirm(`Delete "${project.title}"? This permanently removes the project, its phases, and all media. This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to delete project.';
      alert(`Failed to delete project: ${message}`);
    }
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | ProjectStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={workStatusFilter}
            onChange={(e) => setWorkStatusFilter(e.target.value as '' | WorkStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {WORK_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value as '' | ServiceTypeSlug)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Job Types</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>

          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-2 ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">No projects found.</div>
          )}
        </div>
      ) : (
        <ProjectsTable projects={filtered} onDelete={handleDelete} />
      )}
    </div>
  );
}
