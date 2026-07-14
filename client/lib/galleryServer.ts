import type { Category, GalleryImage } from '@/types/api';
import { categoryNameMap } from '@/types/api';
import { sampleImages } from '@/data/gallery';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface DisplayImage {
  id: number;
  src: string;
  title: string;
  description: string;
}

export interface DisplayCategory {
  id: string;
  label: string;
  count: number;
}

/**
 * Server-side fetch for /gallery routes so the image grid is present in the
 * initial HTML for crawlers, not injected client-side after hydration. Falls
 * back to the bundled static sample images if the API is unavailable.
 */
export async function getGalleryData(selectedCategory: string): Promise<{ images: DisplayImage[]; categories: DisplayCategory[] }> {
  try {
    const categoryRes = await fetch(`${API_BASE}/categories/`, { next: { revalidate: 300 } });
    if (!categoryRes.ok) throw new Error('categories fetch failed');
    const categoryPayload = await categoryRes.json();
    const categoryData: Category[] = Array.isArray(categoryPayload) ? categoryPayload : categoryPayload.results || [];
    const allCount = categoryData.reduce((sum, cat) => sum + cat.image_count, 0);

    const categories: DisplayCategory[] = [
      { id: 'all', label: 'All Projects', count: allCount },
      ...categoryData.map((cat) => ({
        id: cat.name === 'backsplash' ? 'backsplashes' :
            cat.name === 'patio' ? 'patios' :
            cat.name === 'shower' ? 'showers' :
            cat.name === 'fireplace' ? 'fireplaces' :
            cat.name,
        label: cat.label,
        count: cat.image_count,
      })),
    ];

    const apiCategory = categoryNameMap[selectedCategory];
    const imageEndpoint = apiCategory
      ? `${API_BASE}/gallery/?category=${apiCategory}`
      : `${API_BASE}/gallery/all_images/`;
    const imageRes = await fetch(imageEndpoint, { next: { revalidate: 300 } });
    if (!imageRes.ok) throw new Error('images fetch failed');
    const imagePayload = await imageRes.json();
    const imageData: GalleryImage[] = Array.isArray(imagePayload) ? imagePayload : imagePayload.results || [];

    const images: DisplayImage[] = imageData.map((img) => ({
      id: img.id,
      src: img.image_url || img.image,
      title: img.title,
      description: img.description,
    }));

    return { images, categories };
  } catch {
    const staticCategories: DisplayCategory[] = [
      { id: 'all', label: 'All Projects', count: Object.values(sampleImages).flat().length },
      { id: 'backsplashes', label: 'Backsplashes', count: sampleImages.backsplashes.length },
      { id: 'patios', label: 'Patios', count: sampleImages.patios.length },
      { id: 'showers', label: 'Showers', count: sampleImages.showers.length },
      { id: 'flooring', label: 'Flooring', count: sampleImages.flooring.length },
      { id: 'fireplaces', label: 'Fireplaces', count: sampleImages.fireplaces.length },
    ];

    const images: DisplayImage[] = selectedCategory === 'all'
      ? Object.values(sampleImages).flat()
      : sampleImages[selectedCategory as keyof typeof sampleImages] || [];

    return { images, categories: staticCategories };
  }
}
