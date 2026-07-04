import GoogleReviewsSlider from '@/components/GoogleReviewsSlider';

interface ReviewsConfig {
  location?: string;
}

interface ReviewsSectionProps {
  config: ReviewsConfig;
}

export default function ReviewsSection({ config }: ReviewsSectionProps) {
  return <GoogleReviewsSlider location={config.location || 'jacksonville'} />;
}
