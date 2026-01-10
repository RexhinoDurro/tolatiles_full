import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Tola Tiles',
  description: 'Tola Tiles administration portal',
  robots: 'noindex, nofollow',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
