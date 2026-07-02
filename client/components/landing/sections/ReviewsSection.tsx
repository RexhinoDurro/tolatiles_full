import { Star } from 'lucide-react';

interface Review {
  author?: string;
  text?: string;
  rating?: number;
}

interface ReviewsConfig {
  heading?: string;
  quotes?: Review[];
}

interface ReviewsSectionProps {
  config: ReviewsConfig;
}

export default function ReviewsSection({ config }: ReviewsSectionProps) {
  const heading = config.heading || 'What Our Customers Say';
  const quotes = config.quotes || [];

  if (quotes.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{heading}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              {review.text && <p className="text-gray-700 mb-4">&ldquo;{review.text}&rdquo;</p>}
              {review.author && <p className="font-semibold text-gray-900">{review.author}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
