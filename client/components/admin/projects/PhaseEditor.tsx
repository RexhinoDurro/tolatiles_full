'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Phase, ProjectMedia } from '@/types/api';
import MediaDragGrid from './MediaDragGrid';

const TipTapEditor = dynamic(() => import('@/components/admin/blog/TipTapEditor'), { ssr: false });

interface PhaseEditorProps {
  phase: Phase;
  projectId: number;
  onUpdate: (phaseId: number, updates: Partial<Phase>) => void;
  onDelete: (phaseId: number) => void;
  onMediaUpload: (phaseId: number, file: File) => Promise<void>;
  onMediaYouTubeAdd: (phaseId: number, url: string) => Promise<void>;
  onMediaDelete: (phaseId: number, mediaId: number) => void;
  onMediaReorder: (phaseId: number, items: { id: number; order: number }[]) => void;
  onMediaChange: (phaseId: number, media: ProjectMedia[]) => void;
}

export default function PhaseEditor({
  phase,
  projectId,
  onUpdate,
  onDelete,
  onMediaUpload,
  onMediaYouTubeAdd,
  onMediaDelete,
  onMediaReorder,
  onMediaChange,
}: PhaseEditorProps) {
  const [collapsed, setCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Phase header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={phase.title}
          onChange={(e) => onUpdate(phase.id, { title: e.target.value })}
          placeholder="Phase title"
          className="flex-1 bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
        />

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => onDelete(phase.id)}
          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Description (TipTap) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <TipTapEditor
                content={phase.description}
                onChange={(content) => onUpdate(phase.id, { description: content })}
                placeholder="Describe this phase..."
              />
            </div>
          </div>

          {/* Media */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Media</label>
            <MediaDragGrid
              media={phase.media}
              projectId={projectId}
              phaseId={phase.id}
              onChange={(media) => onMediaChange(phase.id, media)}
              onUpload={(file) => onMediaUpload(phase.id, file)}
              onYouTubeAdd={(url) => onMediaYouTubeAdd(phase.id, url)}
              onDelete={(mediaId) => onMediaDelete(phase.id, mediaId)}
              onReorder={(items) => onMediaReorder(phase.id, items)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
