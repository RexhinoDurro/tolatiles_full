'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
  /** Set from a server-side host check (see app/layout.tsx) — usePathname() does not
   * reliably reflect the middleware rewrite target for landing-page subdomains, so that
   * case can't be detected from pathname alone. */
  forceNoChrome?: boolean;
}

export default function LayoutWrapper({ children, forceNoChrome }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isQuotesPortalRoute = pathname?.startsWith('/quotes-portal');
  const isLandingSiteRoute = pathname?.startsWith('/landing-site');

  if (forceNoChrome || isAdminRoute || isQuotesPortalRoute || isLandingSiteRoute) {
    // Admin pages and admin-managed landing pages render without Navbar/Footer
    return <>{children}</>;
  }

  // Public pages render with Navbar/Footer
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main role="main">{children}</main>
      <Footer />
    </div>
  );
}
