'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { HomepageSlot, ProjectLocation } from '@/types/api';
import BeforeAfterSlider from './BeforeAfterSlider';
import ProcessGrid from './ProcessGrid';
import VideoWithSound from './VideoWithSound';

interface HomepageSlotsSectionProps {
  location: ProjectLocation;
}

function SlotRenderer({ slot }: { slot: HomepageSlot }) {
  if (!slot.project) return null;

  if (slot.display_style === 'cinematic_video_header') {
    const { cover_image, cover_media_type, title } = slot.project;
    return (
      <section className="relative w-full overflow-hidden" style={{ height: '70vh', minHeight: '400px' }}>
        {cover_image ? (
          cover_media_type === 'video' ? (
            <VideoWithSound src={cover_image} className="absolute inset-0 w-full h-full object-cover" threshold={0.3} />
          ) : (
            <img src={cover_image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          )
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">{title}</h2>
        </div>
      </section>
    );
  }

  if (slot.display_style === 'before_after_slider' && slot.before_media && slot.after_media) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{slot.project.title}</h2>
          <p className="text-gray-500 text-center mb-6 text-sm">Drag the slider to compare before &amp; after</p>
          <BeforeAfterSlider before={slot.before_media} after={slot.after_media} />
        </div>
      </section>
    );
  }

  if (slot.display_style === 'process_grid') {
    // Fetch full project with phases for ProcessGrid
    return <ProcessGridSlot projectId={slot.project.id} title={slot.project.title} />;
  }

  return null;
}

function ProcessGridSlot({ projectId, title }: { projectId: number; title: string }) {
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    api.getProject(projectId).then(setProject).catch(() => {});
  }, [projectId]);

  if (!project) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h2>
        <ProcessGrid project={project} />
      </div>
    </section>
  );
}

export default function HomepageSlotsSection({ location }: HomepageSlotsSectionProps) {
  const [slots, setSlots] = useState<HomepageSlot[]>([]);

  useEffect(() => {
    api.getPublicHomepage(location).then(setSlots).catch(() => {});
  }, [location]);

  const filledSlots = slots.filter((s) => s.project && s.display_style);
  if (filledSlots.length === 0) return null;

  // Render in slot order: hero, mid_slider, bottom_grid
  const order: Record<string, number> = { hero: 0, mid_slider: 1, bottom_grid: 2 };
  const sorted = [...filledSlots].sort((a, b) => (order[a.slot_type] ?? 9) - (order[b.slot_type] ?? 9));

  return (
    <>
      {sorted.map((slot) => (
        <SlotRenderer key={slot.slot_type} slot={slot} />
      ))}
    </>
  );
}
