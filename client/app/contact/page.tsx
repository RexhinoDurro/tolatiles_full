import type { Metadata } from 'next';
import ContactPage from '@/components/pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Tola Tiles - Get Free Quote | Tile Installation Services',
  description:
    'Contact Tola Tiles for expert tile installation services. Get a free quote, schedule consultation, or call (904) 210-3094. Licensed professionals serving your area.',
  keywords: 'contact tola tiles, tile installation quote, free estimate, tile contractor contact, schedule consultation, tile installation phone number',
  alternates: {
    canonical: 'https://tolatiles.com/contact',
  },
};

export default function Contact() {
  return <ContactPage />;
}
