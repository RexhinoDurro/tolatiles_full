import type { Metadata } from 'next';
import PrivacyPolicyPage from '@/components/pages/PrivacyPolicyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tola Tiles - Tile Installation Services',
  description:
    'Privacy Policy for Tola Tiles. Learn how we collect, use, and protect your personal information when you use our tile installation services.',
  keywords: 'privacy policy, data protection, tola tiles privacy, personal information',
  alternates: {
    canonical: 'https://tolatiles.com/privacy-policy',
  },
};

export default function PrivacyPolicy() {
  return <PrivacyPolicyPage />;
}
