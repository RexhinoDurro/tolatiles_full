import type { Metadata, Viewport } from 'next';
import AdminPWA from '@/components/AdminPWA';
import { NotificationProviderWrapper } from '@/contexts/NotificationContext';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin Portal | Tola Tiles',
  description: 'Tola Tiles administration portal',
  robots: 'noindex, nofollow',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TT Admin',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e293b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProviderWrapper>
      <AdminPWA />
      {children}
    </NotificationProviderWrapper>
  );
}
