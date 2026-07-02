import type { GalleryImage } from '@/types/api';

interface GalleryConfig {
  heading?: string;
  images?: GalleryImage[];
}

interface GallerySectionProps {
  config: GalleryConfig;
}

export default function GallerySection({ config }: GallerySectionProps) {
  const heading = config.heading || 'Our Recent Work';
  const images = config.images || [];

  if (images.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{heading}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="aspect-square rounded-xl overflow-hidden shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url || img.image}
                alt={img.title || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
