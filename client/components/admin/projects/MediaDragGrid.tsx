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
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import type { ProjectMedia } from '@/types/api';
import MediaItem from './MediaItem';
import MediaUploader from './MediaUploader';

interface MediaDragGridProps {
  media: ProjectMedia[];
  projectId: number;
  phaseId: number;
  onChange: (media: ProjectMedia[]) => void;
  onUpload: (file: File) => Promise<void>;
  onDelete: (mediaId: number) => void;
  onReorder: (items: { id: number; order: number }[]) => void;
}

export default function MediaDragGrid({
  media,
  onChange,
  onUpload,
  onDelete,
  onReorder,
}: MediaDragGridProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex((m) => m.id === active.id);
      const newIndex = media.findIndex((m) => m.id === over.id);
      const reordered = arrayMove(media, oldIndex, newIndex).map((m, i) => ({ ...m, order: i }));
      onChange(reordered);
      onReorder(reordered.map((m) => ({ id: m.id, order: m.order })));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={media.map((m) => m.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {media.map((m) => (
            <MediaItem key={m.id} media={m} onDelete={onDelete} />
          ))}
          <MediaUploader onUpload={onUpload} />
        </div>
      </SortableContext>
    </DndContext>
  );
}
