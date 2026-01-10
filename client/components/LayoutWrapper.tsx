'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Admin pages render without Navbar/Footer
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
