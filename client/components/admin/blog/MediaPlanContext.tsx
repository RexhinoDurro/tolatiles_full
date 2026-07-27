'use client';

import { createContext, useContext } from 'react';
import type { MediaPlanEntry, SuggestedLinkEntry } from '@/types/api';

interface MediaPlanContextValue {
  mediaPlan: MediaPlanEntry[];
  suggestedLinks: SuggestedLinkEntry[];
}

// Lets the mediaMarker/linkMarker TipTap node views look up their full
// prompt/status/target info by id. The marker nodes themselves only carry a
// bare id in the saved HTML (<span data-media-marker="1">) -- media_plan/
// suggested_links on the post stay the single source of truth rather than
// duplicating prompt/status text into the document itself.
export const MediaPlanContext = createContext<MediaPlanContextValue>({
  mediaPlan: [],
  suggestedLinks: [],
});

export function useMediaPlanEntry(mediaId: unknown): MediaPlanEntry | undefined {
  const { mediaPlan } = useContext(MediaPlanContext);
  return mediaPlan.find((item) => String(item.id) === String(mediaId));
}

export function useSuggestedLinkEntry(linkId: unknown): SuggestedLinkEntry | undefined {
  const { suggestedLinks } = useContext(MediaPlanContext);
  return suggestedLinks.find((item) => String(item.id) === String(linkId));
}
