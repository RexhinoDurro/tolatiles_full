'use client';

import Link from 'next/link';
import { PenSquare, BookOpen, Palette, Sparkles } from 'lucide-react';
import { CONTENT_TYPES, CONTENT_TYPE_LABELS_PLURAL, ADMIN_CONTENT_TYPE_ROUTE_PREFIX, type ContentType } from '@/lib/contentTypes';

interface ContentTypeTabsProps {
  active: ContentType;
}

const TAB_ICONS: Record<ContentType, typeof PenSquare> = {
  blog: PenSquare,
  guide: BookOpen,
  design_idea: Palette,
  story: Sparkles,
};

// Shared nav for switching between the four content sections nested under
// /admin/blog (Blog/Guides/Design Ideas/Stories all share one BlogPost model
// and admin surface -- see lib/contentTypes.ts). Rendered at the top of each
// section's list page so any of them acts as an "overview" for the others.
export default function ContentTypeTabs({ active }: ContentTypeTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-4 sm:mb-6">
      {CONTENT_TYPES.map((type) => {
        const Icon = TAB_ICONS[type];
        const isActive = type === active;
        return (
          <Link
            key={type}
            href={`/admin/${ADMIN_CONTENT_TYPE_ROUTE_PREFIX[type]}`}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {CONTENT_TYPE_LABELS_PLURAL[type]}
          </Link>
        );
      })}
    </div>
  );
}
