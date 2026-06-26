import type { Metadata } from 'next';
import ContactPage from '@/components/pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Tola Tiles - Get Free Quote | Tile Installation Jacksonville & St. Augustine FL',
  description: 'Contact Tola Tiles for expert tile installation services in Jacksonville and St. Augustine. Get a free quote, schedule consultation, or call (904) 866-1738. Licensed professionals serving Northeast Florida.',
  keywords: 'contact tola tiles, tile installation quote jacksonville, tile installation quote st augustine, free estimate tile florida, tile contractor contact northeast florida',
  alternates: {
    canonical: 'https://tolatiles.com/contact',
  },
};

export default function Contact() {
  return <ContactPage location="florida" />;
}
