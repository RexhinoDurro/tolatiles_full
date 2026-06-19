'use client';

import { useState, useRef, useCallback } from 'react';
import type { ProjectMedia } from '@/types/api';

interface BeforeAfterSliderProps {
  before: ProjectMedia;
  after: ProjectMedia;
}

function MediaElement({ media, className, style }: { media: ProjectMedia; className?: string; style?: React.CSSProperties }) {
  if (media.media_type === 'video') {
    return (
      <video
        src={media.file}
        autoPlay
        muted
        loop
        playsInline
        className={className}
        style={style}
      />
    );
  }
  return <img src={media.file} alt={media.alt_text || ''} className={className} style={style} />;
}

export default function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => { dragging.current = true; };
  const handleMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePosition(e.clientX); };
  const handleMouseUp = () => { dragging.current = false; };

  const handleTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl select-none cursor-ew-resize"
      style={{ aspectRatio: '16/9' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* After (full width, behind) */}
      <MediaElement media={after} className="absolute inset-0 w-full h-full object-cover" />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <MediaElement media={before} className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (position / 100)}%` } as React.CSSProperties} />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded font-medium pointer-events-none">
        Before
      </span>
      <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded font-medium pointer-events-none">
        After
      </span>
    </div>
  );
}
