'use client';

import { useRef, useEffect } from 'react';

interface VideoWithSoundProps {
  src: string;
  className?: string;
  threshold?: number; // how much of the video must be visible before unmuting (0-1)
}

export default function VideoWithSound({ src, className, threshold = 0.5 }: VideoWithSoundProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.muted = false;
          // Some browsers still block unmuting without a direct user gesture —
          // fall back to muted so autoplay keeps running.
          el.play().catch(() => {
            el.muted = true;
          });
        } else {
          el.muted = true;
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted          // must start muted for autoplay to work
      loop
      playsInline
      className={className}
    />
  );
}
