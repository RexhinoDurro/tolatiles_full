'use client';

import { useDroppable } from '@dnd-kit/core';
import { Edit2, Trash2 } from 'lucide-react';
import type { HomepageSlot, SlotType } from '@/types/api';

const SLOT_LABELS: Record<SlotType, string> = {
  hero: 'Hero Section',
  mid_slider: 'Mid-Page Slider',
  bottom_grid: 'Bottom Grid',
};

const STYLE_LABELS: Record<string, string> = {
  before_after_slider: 'Before/After',
  cinematic_video_header: 'Cinematic Video',
  process_grid: 'Process Grid',
};

interface SlotCardProps {
  slot: HomepageSlot;
  onEdit: (slot: HomepageSlot) => void;
  onClear: (slotType: SlotType) => void;
}

export default function SlotCard({ slot, onEdit, onClear }: SlotCardProps) {
  const { setNodeRef, isOver } = useDroppable({ id: slot.slot_type });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 transition-colors min-h-[120px] ${
        isOver
          ? 'border-blue-400 bg-blue-50'
          : slot.project
          ? 'border-gray-200 bg-white'
          : 'border-dashed border-gray-300 bg-gray-50'
      }`}
    >
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {SLOT_LABELS[slot.slot_type]}
        </p>

        {slot.project ? (
          <div className="flex items-start gap-3">
            {slot.project.cover_image && (
              <img
                src={slot.project.cover_image}
                alt={slot.project.title}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{slot.project.title}</p>
              {slot.display_style && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 mt-1">
                  {STYLE_LABELS[slot.display_style] ?? slot.display_style}
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onEdit(slot)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onClear(slot.slot_type)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 text-sm text-gray-400">
            {isOver ? 'Drop project here' : 'Drag a project here'}
          </div>
        )}
      </div>
    </div>
  );
}
