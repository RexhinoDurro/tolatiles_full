import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TolaTiles Quotes Portal',
  robots: { index: false, follow: false },
};

export default function QuotesPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
