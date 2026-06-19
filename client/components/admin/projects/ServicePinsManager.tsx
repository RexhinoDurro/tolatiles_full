'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragEndEvent } from '@dnd-kit/core';
import { GripVertical, X, Plus, Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { SERVICE_TYPES } from '@/types/api';
import type { ServicePin, ProjectListItem, ProjectLocation, ServiceTypeSlug } from '@/types/api';

const LOCATIONS: { value: ProjectLocation; label: string }[] = [
  { value: 'florida', label: 'Florida' },
  { value: 'jacksonville', label: 'Jacksonville' },
  { value: 'st-augustine', label: 'St. Augustine' },
];

function SortablePinRow({ pin, onRemove }: { pin: ServicePin; onRemove: (id: number) => void }) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({
    id: pin.project.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400">
        <GripVertical className="w-4 h-4" />
      </div>
      {pin.project.cover_image && (
        <img src={pin.project.cover_image} alt={pin.project.title} className="w-8 h-8 rounded object-cover" />
      )}
      <span className="flex-1 text-sm font-medium text-gray-900 truncate">{pin.project.title}</span>
      <button
        type="button"
        onClick={() => onRemove(pin.project.id)}
        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ServicePinsManager() {
  const [activeLocation, setActiveLocation] = useState<ProjectLocation>('florida');
  const [activeService, setActiveService] = useState<ServiceTypeSlug>('kitchen-backsplash');
  const [pins, setPins] = useState<ServicePin[]>([]);
  const [available, setAvailable] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = async (location: ProjectLocation, service: ServiceTypeSlug) => {
    setLoading(true);
    try {
      const [pinsData, projectsData] = await Promise.all([
        api.getServicePins(location, service),
        api.getProjects({ location, job_type: service }),
      ]);
      setPins(pinsData);
      const pinnedIds = new Set(pinsData.map((p) => p.project.id));
      setAvailable(projectsData.filter((p) => !pinnedIds.has(p.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeLocation, activeService);
  }, [activeLocation, activeService]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pins.findIndex((p) => p.project.id === active.id);
      const newIndex = pins.findIndex((p) => p.project.id === over.id);
      setPins(arrayMove(pins, oldIndex, newIndex));
    }
  };

  const addPin = (project: ProjectListItem) => {
    setPins((prev) => [...prev, { project, order: prev.length }]);
    setAvailable((prev) => prev.filter((p) => p.id !== project.id));
  };

  const removePin = (projectId: number) => {
    const pin = pins.find((p) => p.project.id === projectId);
    if (!pin) return;
    setPins((prev) => prev.filter((p) => p.project.id !== projectId));
    setAvailable((prev) => [...prev, pin.project]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateServicePins(
        activeLocation,
        activeService,
        pins.map((p, i) => ({ project_id: p.project.id, order: i }))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to save pins.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Location tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.value}
            onClick={() => setActiveLocation(loc.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeLocation === loc.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      {/* Service tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SERVICE_TYPES.map((s) => (
          <button
            key={s.slug}
            onClick={() => setActiveService(s.slug)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeService === s.slug
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Pinned (left) */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">
                Pinned Projects
                <span className="ml-2 text-xs font-normal text-gray-500">({pins.length})</span>
              </h3>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Order
              </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={pins.map((p) => p.project.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {pins.map((pin) => (
                    <SortablePinRow key={pin.project.id} pin={pin} onRemove={removePin} />
                  ))}
                  {pins.length === 0 && (
                    <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                      No pinned projects. Add from the right panel.
                    </p>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Available (right) */}
          <div className="w-72 flex-shrink-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Available Projects</h3>
            <div className="space-y-2">
              {available.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                >
                  {project.cover_image && (
                    <img src={project.cover_image} alt={project.title} className="w-8 h-8 rounded object-cover" />
                  )}
                  <span className="flex-1 text-sm text-gray-900 truncate">{project.title}</span>
                  <button
                    type="button"
                    onClick={() => addPin(project)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {available.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">All projects pinned.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
