import type { LandingPageSection } from '@/types/api';
import HeroSection from './sections/HeroSection';
import HeadlineSection from './sections/HeadlineSection';
import CTASection from './sections/CTASection';
import LeadFormSection from './sections/LeadFormSection';
import ReviewsSection from './sections/ReviewsSection';
import GallerySection from './sections/GallerySection';
import CustomCodeSection from './sections/CustomCodeSection';

interface SectionRendererProps {
  sections: LandingPageSection[];
  phoneNumber: string;
  landingPageId: number;
}

export default function SectionRenderer({ sections, phoneNumber, landingPageId }: SectionRendererProps) {
  const ordered = [...sections].filter((s) => s.is_enabled).sort((a, b) => a.order - b.order);

  return (
    <main>
      {ordered.map((section) => {
        switch (section.section_type) {
          case 'hero':
            return (
              <HeroSection
                key={section.id}
                config={section.config}
                phoneNumber={phoneNumber}
                landingPageId={landingPageId}
              />
            );
          case 'headline':
            return <HeadlineSection key={section.id} config={section.config} />;
          case 'cta':
            return <CTASection key={section.id} config={section.config} phoneNumber={phoneNumber} />;
          case 'lead_form':
            return (
              <LeadFormSection
                key={section.id}
                config={section.config}
                landingPageId={landingPageId}
              />
            );
          case 'reviews':
            return <ReviewsSection key={section.id} config={section.config} />;
          case 'gallery':
            return <GallerySection key={section.id} config={section.config} />;
          case 'custom_code':
            return <CustomCodeSection key={section.id} config={section.config} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
