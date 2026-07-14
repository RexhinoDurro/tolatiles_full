// Shared content engine config for Blog / Guides / Design Ideas / Stories.
// One Django model + admin + API powers all four site sections; this file
// is the single source of truth for how each type maps to routes and copy.

export type ContentType = 'blog' | 'guide' | 'design_idea' | 'story';

export const CONTENT_TYPES: ContentType[] = ['blog', 'guide', 'design_idea', 'story'];

// Root-level route prefix per type — flat parallel routes, no shared /content/ hub.
export const CONTENT_TYPE_ROUTE_PREFIX: Record<ContentType, string> = {
  blog: 'blog',
  guide: 'guides',
  design_idea: 'design-ideas',
  story: 'stories',
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blog: 'Blog',
  guide: 'Guide',
  design_idea: 'Design Idea',
  story: 'Story',
};

export const CONTENT_TYPE_LABELS_PLURAL: Record<ContentType, string> = {
  blog: 'Blog',
  guide: 'Guides',
  design_idea: 'Design Ideas',
  story: 'Stories',
};

interface ContentTypeHeroCopy {
  heroH1: string;
  heroSubtitle: string;
}

export const CONTENT_TYPE_HERO_COPY: Record<ContentType, ContentTypeHeroCopy> = {
  blog: {
    heroH1: 'Tile Installation Blog - Northeast Florida',
    heroSubtitle: 'Expert tips, design inspiration, and industry insights from the Tola Tiles team',
  },
  guide: {
    heroH1: 'Tile Installation Guides - Northeast Florida',
    heroSubtitle: 'Step-by-step guides covering materials, planning, and what to expect from your tile project',
  },
  design_idea: {
    heroH1: 'Tile Design Ideas - Northeast Florida',
    heroSubtitle: 'Inspiration and design ideas for kitchens, bathrooms, floors, and outdoor spaces',
  },
  story: {
    heroH1: 'Customer Stories - Northeast Florida',
    heroSubtitle: 'Real projects and real homeowners we’ve worked with across Jacksonville and St. Augustine',
  },
};

// Related Service Page options: the 2 city hubs + 6 services x 2 cities,
// grouped by city. Mirrors server/blog/models.py RELATED_SERVICE_PAGE_CHOICES.
export interface RelatedServicePageOption {
  value: string;
  label: string;
}

export interface RelatedServicePageGroup {
  city: string;
  options: RelatedServicePageOption[];
}

export const RELATED_SERVICE_PAGE_OPTIONS: RelatedServicePageGroup[] = [
  {
    city: 'Jacksonville',
    options: [
      { value: '/jacksonville', label: 'Jacksonville — City Hub' },
      { value: '/jacksonville/services/kitchen-backsplash-installation', label: 'Jacksonville — Kitchen Backsplash' },
      { value: '/jacksonville/services/bathroom-tile-installation', label: 'Jacksonville — Bathroom Tile' },
      { value: '/jacksonville/services/floor-tile-installation', label: 'Jacksonville — Floor Tile' },
      { value: '/jacksonville/services/patio-tile-installation', label: 'Jacksonville — Patio Tile' },
      { value: '/jacksonville/services/fireplace-tile-installation', label: 'Jacksonville — Fireplace Tile' },
      { value: '/jacksonville/services/shower-tile-installation', label: 'Jacksonville — Shower Tile' },
    ],
  },
  {
    city: 'St. Augustine',
    options: [
      { value: '/st-augustine', label: 'St. Augustine — City Hub' },
      { value: '/st-augustine/services/kitchen-backsplash-installation', label: 'St. Augustine — Kitchen Backsplash' },
      { value: '/st-augustine/services/bathroom-tile-installation', label: 'St. Augustine — Bathroom Tile' },
      { value: '/st-augustine/services/floor-tile-installation', label: 'St. Augustine — Floor Tile' },
      { value: '/st-augustine/services/patio-tile-installation', label: 'St. Augustine — Patio Tile' },
      { value: '/st-augustine/services/fireplace-tile-installation', label: 'St. Augustine — Fireplace Tile' },
      { value: '/st-augustine/services/shower-tile-installation', label: 'St. Augustine — Shower Tile' },
    ],
  },
];

export function isValidContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as string[]).includes(value);
}
