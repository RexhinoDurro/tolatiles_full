import { Phone } from 'lucide-react';
import { displayPhoneNumber } from '@/lib/phoneUtils';

interface HeroConfig {
  headline?: string;
  subheadline?: string;
  media_type?: 'image' | 'video';
  image?: string;
  video_url?: string;
}

interface HeroSectionProps {
  config: HeroConfig;
  phoneNumber: string;
}

export default function HeroSection({ config, phoneNumber }: HeroSectionProps) {
  const { headline, subheadline, media_type, image, video_url } = config;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900">
      {media_type === 'video' && video_url ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={video_url}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center text-white">
        {headline && (
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">{headline}</h1>
        )}
        {subheadline && (
          <p className="text-xl sm:text-2xl text-white/90 mb-10">{subheadline}</p>
        )}
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white text-2xl sm:text-3xl font-bold px-10 py-5 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-105"
          >
            <Phone className="w-8 h-8" />
            Call {displayPhoneNumber(phoneNumber)}
          </a>
        )}
      </div>
    </section>
  );
}
