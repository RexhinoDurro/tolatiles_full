'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Loader2, GripVertical } from 'lucide-react';
import { api } from '@/lib/api';
import type { HomepageSlot, ProjectListItem, SlotType, Phase, ProjectLocation } from '@/types/api';
import SlotCard from './SlotCard';
import DisplayStyleModal from './DisplayStyleModal';

const LOCATIONS: { value: ProjectLocation; label: string }[] = [
  { value: 'florida', label: 'Florida' },
  { value: 'jacksonville', label: 'Jacksonville' },
  { value: 'st-augustine', label: 'St. Augustine' },
];

function DraggableProjectCard({ project }: { project: ProjectListItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: project.id });
  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-grab active:cursor-grabbing transition-colors"
      {...attributes}
      {...listeners}
    >
      {project.cover_image && (
        <img src={project.cover_image} alt={project.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
        <p className="text-xs text-gray-500">{project.phase_count} phases</p>
      </div>
      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>
  );
}

export default function HomepageManager() {
  const [activeLocation, setActiveLocation] = useState<ProjectLocation>('florida');
  const [slots, setSlots] = useState<HomepageSlot[]>([]);
  const [availableProjects, setAvailableProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    slot: HomepageSlot;
    project: ProjectListItem;
    phases: Phase[];
  } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = async (location: ProjectLocation) => {
    setLoading(true);
    try {
      const [slotsData, projectsData] = await Promise.all([
        api.getHomepageSlots(location),
        api.getProjects({ location, status: 'completed' }),
      ]);
      setSlots(slotsData);
      setAvailableProjects(projectsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeLocation);
  }, [activeLocation]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as number;
    const slotType = over.id as SlotType;
    const project = availableProjects.find((p) => p.id === projectId);
    const slot = slots.find((s) => s.slot_type === slotType);
    if (!project || !slot) return;

    // Load project phases for modal
    const fullProject = await api.getProject(projectId);
    setModal({ slot, project, phases: fullProject.phases });
  };

  const handleClearSlot = async (slotType: SlotType) => {
    await api.updateHomepageSlot(activeLocation, {
      slot_type: slotType,
      project_id: null,
      display_style: '',
      before_media_id: null,
      after_media_id: null,
    });
    load(activeLocation);
  };

  const handleEditSlot = async (slot: HomepageSlot) => {
    if (!slot.project) return;
    const fullProject = await api.getProject(slot.project.id);
    setModal({ slot, project: slot.project, phases: fullProject.phases });
  };

  return (
    <div>
      {/* Location tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.value}
            onClick={() => setActiveLocation(loc.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeLocation === loc.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-6">
            {/* Slot panels (left 2/3) */}
            <div className="flex-1 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">Homepage Slots</h3>
              {slots.map((slot) => (
                <SlotCard
                  key={slot.slot_type}
                  slot={slot}
                  onEdit={handleEditSlot}
                  onClear={handleClearSlot}
                />
              ))}
            </div>

            {/* Available projects (right 1/3) */}
            <div className="w-72 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Available Projects</h3>
              <div className="space-y-2">
                {availableProjects.map((project) => (
                  <DraggableProjectCard key={project.id} project={project} />
                ))}
                {availableProjects.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No completed projects for this location.
                  </p>
                )}
              </div>
            </div>
          </div>
        </DndContext>
      )}

      {/* Modal */}
      {modal && (
        <DisplayStyleModal
          location={activeLocation}
          slotType={modal.slot.slot_type}
          project={modal.project}
          phases={modal.phases}
          onClose={() => setModal(null)}
          onSaved={() => load(activeLocation)}
        />
      )}
    </div>
  );
}
