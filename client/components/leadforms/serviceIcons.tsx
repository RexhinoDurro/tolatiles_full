/**
 * Hand-drawn service icons for the lead forms, built around actual tile patterns
 * (running-bond subway tile, aligned floor grid, paver bond, etc.) instead of
 * generic borrowed symbols — same simple single-weight-line style as lucide-react
 * (stroke="currentColor", strokeWidth 2, round caps/joins) so they drop in cleanly
 * next to the rest of the site's icon usage, but specific to Tola Tiles' actual work.
 */

interface IconProps {
  className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Running-bond subway tile pattern — kitchen backsplash. */
export function BacksplashTileIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="15" rx="1" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="12" y1="5" x2="12" y2="10" />
      <line x1="7.5" y1="10" x2="7.5" y2="15" />
      <line x1="16.5" y1="10" x2="16.5" y2="15" />
      <line x1="12" y1="15" x2="12" y2="20" />
    </svg>
  );
}

/** Tiled wall behind a tub — bathroom tile. */
export function BathroomTileIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="5" y1="2" x2="5" y2="7" />
      <line x1="10" y1="2" x2="10" y2="7" />
      <line x1="15" y1="2" x2="15" y2="7" />
      <line x1="19" y1="2" x2="19" y2="7" />
      <line x1="3" y1="4.5" x2="21" y2="4.5" />
      <rect x="3" y="11" width="18" height="7" rx="3.5" />
      <line x1="3" y1="14" x2="21" y2="14" />
      <line x1="7" y1="18" x2="7" y2="21" />
      <line x1="17" y1="18" x2="17" y2="21" />
    </svg>
  );
}

/** Aligned floor tile grid — flooring. */
export function FlooringTileIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
    </svg>
  );
}

/** Paver bond pattern under a sun — patio & outdoor. */
export function PatioTileIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="18" cy="5" r="2" />
      <line x1="18" y1="1" x2="18" y2="1.8" />
      <line x1="22" y1="5" x2="21.2" y2="5" />
      <line x1="20.8" y1="2.8" x2="20.2" y2="3.4" />
      <rect x="3" y="9" width="15" height="12" rx="1" />
      <line x1="3" y1="15" x2="18" y2="15" />
      <line x1="9" y1="9" x2="9" y2="15" />
      <line x1="13.5" y1="15" x2="13.5" y2="21" />
    </svg>
  );
}

/** Tiled surround flanking a firebox flame — fireplace. */
export function FireplaceTileIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="3" width="19" height="18" rx="1" />
      <line x1="7" y1="3" x2="7" y2="21" />
      <line x1="17" y1="3" x2="17" y2="21" />
      <path d="M12 17c2.5 0 3.5-1.8 3.5-3.5 0-1.6-1-2.6-1.7-3.8-.3.9-.8 1.3-1.3 1.6.2-1.6-.5-3.3-2-4.3.3 1.6-.4 2.6-1.4 3.6-.9.9-1.6 1.9-1.6 3 0 1.7 1.5 3.4 4.5 3.4Z" />
    </svg>
  );
}

/** Showerhead with water falling onto a tiled base — shower installation. */
export function ShowerTileIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 8a7 7 0 0 1 7-7" />
      <circle cx="12" cy="8" r="2.5" />
      <line x1="8" y1="13" x2="8" y2="15" />
      <line x1="12" y1="14" x2="12" y2="16" />
      <line x1="16" y1="13" x2="16" y2="15" />
      <line x1="8" y1="17" x2="8" y2="19" />
      <line x1="12" y1="18" x2="12" y2="20" />
      <line x1="16" y1="17" x2="16" y2="19" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  );
}
