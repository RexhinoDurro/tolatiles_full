import type { ServiceId } from './services';

export interface ServiceSubtypeOption {
  value: string;
  label: string;
}

/**
 * Step-1 options for ServiceTypeForm on each service page — the scope-of-work
 * question asked once the service itself is already known from page context.
 * Bathroom's list is exact wording from the business owner; the rest are a
 * reasonable first draft grounded in each service's existing site copy
 * (data/services.ts, data/serviceDetails.ts) — safe to edit here without
 * touching any component.
 */
export const serviceSubtypes: Record<ServiceId, ServiceSubtypeOption[]> = {
  bathroom: [
    { value: 'Tub to Shower Conversion', label: 'Tub to Shower Conversion' },
    { value: 'Shower to Tub Conversion', label: 'Shower to Tub Conversion' },
    { value: 'Full Bathroom Remodel', label: 'Full Bathroom Remodel' },
    { value: 'Safe Bathing Remodels', label: 'Safe Bathing Remodels' },
    { value: 'Tub & Shower Updates', label: 'Tub & Shower Updates' },
  ],
  'kitchen-backsplash': [
    { value: 'New Backsplash Installation', label: 'New Backsplash Installation' },
    { value: 'Backsplash Replacement', label: 'Backsplash Replacement' },
    { value: 'Full Kitchen Tile Remodel', label: 'Full Kitchen Tile Remodel' },
    { value: 'Accent / Mosaic Feature Wall', label: 'Accent / Mosaic Feature Wall' },
  ],
  flooring: [
    { value: 'New Floor Installation', label: 'New Floor Installation' },
    { value: 'Floor Replacement / Re-Tile', label: 'Floor Replacement / Re-Tile' },
    { value: 'Whole-Home Flooring', label: 'Whole-Home Flooring' },
    { value: 'Heated Floor Upgrade', label: 'Heated Floor Upgrade' },
  ],
  patio: [
    { value: 'New Patio Installation', label: 'New Patio Installation' },
    { value: 'Patio Resurfacing / Replacement', label: 'Patio Resurfacing / Replacement' },
    { value: 'Pool Deck Tiling', label: 'Pool Deck Tiling' },
    { value: 'Outdoor Kitchen Tiling', label: 'Outdoor Kitchen Tiling' },
  ],
  fireplace: [
    { value: 'New Fireplace Surround', label: 'New Fireplace Surround' },
    { value: 'Surround Replacement', label: 'Surround Replacement' },
    { value: 'Hearth Tiling', label: 'Hearth Tiling' },
    { value: 'Decorative (Non-Working) Fireplace', label: 'Decorative (Non-Working) Fireplace' },
  ],
  shower: [
    { value: 'New Custom Shower', label: 'New Custom Shower' },
    { value: 'Shower Replacement / Remodel', label: 'Shower Replacement / Remodel' },
    { value: 'Curbless / Aging-in-Place Shower', label: 'Curbless / Aging-in-Place Shower' },
    { value: 'Niche & Bench Addition', label: 'Niche & Bench Addition' },
  ],
};
