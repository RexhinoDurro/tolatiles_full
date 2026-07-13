'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, Loader2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { Project, Phase, ProjectMedia, ProjectCreate } from '@/types/api';
import ProjectForm from './ProjectForm';
import MainVideoUploader from './MainVideoUploader';
import PhaseDragList from './PhaseDragList';
import LivePreview from './LivePreview';

interface ProjectEditorProps {
  projectId?: number;
}

const defaultProject: Partial<Project> = {
  title: '',
  description: '',
  status: 'draft',
  work_status: 'started',
  is_featured: false,
  job_types: [],
  phases: [],
};

export default function ProjectEditor({ projectId }: ProjectEditorProps) {
  const router = useRouter();
  const [localProject, setLocalProject] = useState<Partial<Project>>(defaultProject);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(!!projectId);
  const [savedId, setSavedId] = useState<number | undefined>(projectId);

  useEffect(() => {
    if (!projectId) return;
    api.getProject(projectId).then((p) => {
      setLocalProject(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [projectId]);

  const updateProject = useCallback((updates: Partial<Project>) => {
    setLocalProject((prev) => ({ ...prev, ...updates }));
  }, []);

  const updatePhase = useCallback((phaseId: number, updates: Partial<Phase>) => {
    setLocalProject((prev) => ({
      ...prev,
      phases: (prev.phases ?? []).map((p) =>
        p.id === phaseId ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const deletePhase = useCallback(async (phaseId: number) => {
    if (!savedId) return;
    await api.deletePhase(savedId, phaseId);
    setLocalProject((prev) => ({
      ...prev,
      phases: (prev.phases ?? []).filter((p) => p.id !== phaseId),
    }));
  }, [savedId]);

  const addPhase = useCallback(async () => {
    if (!savedId) {
      alert('Save the project first before adding phases.');
      return;
    }
    const phase = await api.createPhase(savedId, {
      title: `Phase ${(localProject.phases?.length ?? 0) + 1}`,
      order: localProject.phases?.length ?? 0,
    });
    setLocalProject((prev) => ({
      ...prev,
      phases: [...(prev.phases ?? []), { ...phase, media: [] }],
    }));
  }, [savedId, localProject.phases]);

  const handlePhasesChange = useCallback((phases: Phase[]) => {
    setLocalProject((prev) => ({ ...prev, phases }));
  }, []);

  const handlePhaseReorder = useCallback(async (items: { id: number; order: number }[]) => {
    if (!savedId) return;
    await api.reorderPhases(savedId, items);
  }, [savedId]);

  const handleMediaUpload = useCallback(async (phaseId: number, file: File) => {
    if (!savedId) return;
    const media = await api.uploadMedia(savedId, phaseId, file);
    setLocalProject((prev) => ({
      ...prev,
      phases: (prev.phases ?? []).map((p) =>
        p.id === phaseId ? { ...p, media: [...p.media, media] } : p
      ),
    }));
  }, [savedId]);

  const handleYouTubeAdd = useCallback(async (phaseId: number, url: string) => {
    if (!savedId) return;
    const media = await api.addYouTubeMedia(savedId, phaseId, url);
    setLocalProject((prev) => ({
      ...prev,
      phases: (prev.phases ?? []).map((p) =>
        p.id === phaseId ? { ...p, media: [...p.media, media] } : p
      ),
    }));
  }, [savedId]);

  const handleMediaDelete = useCallback(async (phaseId: number, mediaId: number) => {
    if (!savedId) return;
    await api.deleteMedia(savedId, phaseId, mediaId);
    setLocalProject((prev) => ({
      ...prev,
      phases: (prev.phases ?? []).map((p) =>
        p.id === phaseId ? { ...p, media: p.media.filter((m) => m.id !== mediaId) } : p
      ),
    }));
  }, [savedId]);

  const handleMediaReorder = useCallback(async (phaseId: number, items: { id: number; order: number }[]) => {
    if (!savedId) return;
    await api.reorderMedia(savedId, phaseId, items);
  }, [savedId]);

  const handleMediaChange = useCallback((phaseId: number, media: ProjectMedia[]) => {
    setLocalProject((prev) => ({
      ...prev,
      phases: (prev.phases ?? []).map((p) =>
        p.id === phaseId ? { ...p, media } : p
      ),
    }));
  }, []);

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    setSaving(true);
    try {
      const payload: ProjectCreate = {
        title: localProject.title ?? '',
        description: localProject.description,
        status: targetStatus ?? localProject.status ?? 'draft',
        work_status: localProject.work_status ?? 'started',
        is_featured: localProject.is_featured,
        job_types: localProject.job_types,
      };

      let saved: Project;
      if (savedId) {
        saved = await api.updateProject(savedId, payload);
      } else {
        saved = await api.createProject(payload);
        setSavedId(saved.id);
        router.replace(`/admin/projects/${saved.id}/edit`);
      }
      setLocalProject((prev) => ({ ...prev, ...saved }));
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to save project.';
      alert(`Failed to save project: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!savedId) return;
    if (!window.confirm(`Delete "${localProject.title || 'this project'}"? This permanently removes the project, its phases, and all media. This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteProject(savedId);
      router.push('/admin/projects/all');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to delete project.';
      alert(`Failed to delete project: ${message}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Project form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Project Details</h2>
          <ProjectForm project={localProject} onChange={updateProject} />
        </div>

        {/* Main video */}
        {savedId ? (
          <MainVideoUploader
            project={localProject}
            projectId={savedId}
            onUpdated={(saved) => setLocalProject((prev) => ({ ...prev, ...saved }))}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Main Video</h2>
            <p className="text-sm text-gray-500">Save the project first to add a main video.</p>
          </div>
        )}

        {/* Phases */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Phases</h2>
          {savedId ? (
            <PhaseDragList
              phases={localProject.phases ?? []}
              projectId={savedId}
              onPhasesChange={handlePhasesChange}
              onPhaseUpdate={updatePhase}
              onPhaseDelete={deletePhase}
              onPhaseReorder={handlePhaseReorder}
              onMediaUpload={handleMediaUpload}
              onMediaYouTubeAdd={handleYouTubeAdd}
              onMediaDelete={handleMediaDelete}
              onMediaReorder={handleMediaReorder}
              onMediaChange={handleMediaChange}
            />
          ) : (
            <p className="text-sm text-gray-500">Save the project first to add phases.</p>
          )}

          {savedId && (
            <button
              type="button"
              onClick={addPhase}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Phase
            </button>
          )}
        </div>

        {/* Save actions */}
        <div className="flex gap-3 pb-6">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          {localProject.status !== 'published' && (
            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish
            </button>
          )}
          {savedId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Project
            </button>
          )}
        </div>
      </div>

      {/* Right panel - Live preview */}
      <div className="hidden lg:flex w-1/2 max-w-lg flex-col sticky top-0 h-full overflow-hidden">
        <LivePreview project={localProject} />
      </div>
    </div>
  );
}
