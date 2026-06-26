'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { ProjectListItem, DisplayStyle, SlotType, Phase, ProjectMedia } from '@/types/api';
import { api } from '@/lib/api';

interface DisplayStyleModalProps {
  location: string;
  slotType: SlotType;
  project: ProjectListItem;
  phases: Phase[];
  onClose: () => void;
  onSaved: () => void;
}

const DISPLAY_STYLES: { value: DisplayStyle; label: string; description: string }[] = [
  { value: 'before_after_slider', label: 'Before/After Slider', description: 'Interactive slider showing two media items side by side' },
  { value: 'cinematic_video_header', label: 'Cinematic Video Header', description: 'Full-width video or image header with title overlay' },
  { value: 'process_grid', label: 'Process Grid', description: 'Grid of phase cards showing the project process' },
];

export default function DisplayStyleModal({
  location,
  slotType,
  project,
  phases,
  onClose,
  onSaved,
}: DisplayStyleModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStyle, setSelectedStyle] = useState<DisplayStyle>('cinematic_video_header');
  const [beforePhaseId, setBeforePhaseId] = useState<number | ''>('');
  const [afterPhaseId, setAfterPhaseId] = useState<number | ''>('');
  const [beforeMediaId, setBeforeMediaId] = useState<number | null>(null);
  const [afterMediaId, setAfterMediaId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const beforePhaseMedia = phases.find((p) => p.id === beforePhaseId)?.media ?? [];
  const afterPhaseMedia = phases.find((p) => p.id === afterPhaseId)?.media ?? [];

  const handleNext = () => {
    if (selectedStyle === 'before_after_slider') {
      setStep(2);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateHomepageSlot(location as any, {
        slot_type: slotType,
        project_id: project.id,
        display_style: selectedStyle,
        before_media_id: beforeMediaId ?? null,
        after_media_id: afterMediaId ?? null,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save slot.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-gray-900">Configure Slot</h2>
            <p className="text-sm text-gray-500">{project.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Choose display style */}
        {step === 1 && (
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Choose Display Style</h3>
            <div className="space-y-3">
              {DISPLAY_STYLES.map((style) => (
                <label
                  key={style.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedStyle === style.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={style.value}
                    checked={selectedStyle === style.value}
                    onChange={() => setSelectedStyle(style.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{style.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{style.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {selectedStyle === 'before_after_slider' ? 'Next: Pick Media' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Before/After media picker */}
        {step === 2 && (
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Pick Before & After Media</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Before */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">BEFORE</p>
                <select
                  value={beforePhaseId}
                  onChange={(e) => { setBeforePhaseId(Number(e.target.value)); setBeforeMediaId(null); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                >
                  <option value="">Select phase</option>
                  {phases.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-1">
                  {beforePhaseMedia.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setBeforeMediaId(m.id)}
                      className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                        beforeMediaId === m.id ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      {m.media_type === 'youtube' ? (
                        <img src={m.youtube_thumbnail ?? undefined} alt={m.alt_text} className="w-full h-full object-cover" />
                      ) : m.media_type === 'video' ? (
                        <video src={m.file ?? undefined} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.file ?? undefined} alt={m.alt_text} className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* After */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">AFTER</p>
                <select
                  value={afterPhaseId}
                  onChange={(e) => { setAfterPhaseId(Number(e.target.value)); setAfterMediaId(null); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                >
                  <option value="">Select phase</option>
                  {phases.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-1">
                  {afterPhaseMedia.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAfterMediaId(m.id)}
                      className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                        afterMediaId === m.id ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      {m.media_type === 'youtube' ? (
                        <img src={m.youtube_thumbnail ?? undefined} alt={m.alt_text} className="w-full h-full object-cover" />
                      ) : m.media_type === 'video' ? (
                        <video src={m.file ?? undefined} muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.file ?? undefined} alt={m.alt_text} className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !beforeMediaId || !afterMediaId}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
