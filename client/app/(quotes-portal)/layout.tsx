import type { Metadata, Viewport } from 'next';
import QuotesPortalPWA from '@/components/quotes-portal/QuotesPortalPWA';

export const metadata: Metadata = {
  title: 'TolaTiles Quotes Portal',
  robots: { index: false, follow: false },
  manifest: '/quotes-portal-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TT Quotes',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function QuotesPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <QuotesPortalPWA />
      {children}
    </>
  );
}
