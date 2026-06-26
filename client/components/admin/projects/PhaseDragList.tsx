'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import type { Phase, ProjectMedia } from '@/types/api';
import PhaseEditor from './PhaseEditor';

interface PhaseDragListProps {
  phases: Phase[];
  projectId: number;
  onPhasesChange: (phases: Phase[]) => void;
  onPhaseUpdate: (phaseId: number, updates: Partial<Phase>) => void;
  onPhaseDelete: (phaseId: number) => void;
  onPhaseReorder: (items: { id: number; order: number }[]) => void;
  onMediaUpload: (phaseId: number, file: File) => Promise<void>;
  onMediaYouTubeAdd: (phaseId: number, url: string) => Promise<void>;
  onMediaDelete: (phaseId: number, mediaId: number) => void;
  onMediaReorder: (phaseId: number, items: { id: number; order: number }[]) => void;
  onMediaChange: (phaseId: number, media: ProjectMedia[]) => void;
}

export default function PhaseDragList({
  phases,
  projectId,
  onPhasesChange,
  onPhaseUpdate,
  onPhaseDelete,
  onPhaseReorder,
  onMediaUpload,
  onMediaYouTubeAdd,
  onMediaDelete,
  onMediaReorder,
  onMediaChange,
}: PhaseDragListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = phases.findIndex((p) => p.id === active.id);
      const newIndex = phases.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(phases, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }));
      onPhasesChange(reordered);
      onPhaseReorder(reordered.map((p) => ({ id: p.id, order: p.order })));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={phases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {phases.map((phase) => (
            <PhaseEditor
              key={phase.id}
              phase={phase}
              projectId={projectId}
              onUpdate={onPhaseUpdate}
              onDelete={onPhaseDelete}
              onMediaUpload={onMediaUpload}
              onMediaYouTubeAdd={onMediaYouTubeAdd}
              onMediaDelete={onMediaDelete}
              onMediaReorder={onMediaReorder}
              onMediaChange={onMediaChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
