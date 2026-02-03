import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import Analytics from '@/components/Analytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tolatiles.com'),
  title: {
    default: 'Tola Tiles - Tile Installation Services for Jacksonville and Saint Augustine, FL',
    template: '%s | Tola Tiles',
  },
  description: 'Bath & Kitchen Remodeling Company, Tile Installation Services in Jacksonville, Ponte Vedra, and Saint Augustine Florida, Tile Contractors, Flooring Installers, Tile Installers',
  keywords: ['Tile installers jacksonville FL', 'tile installers Saint Augustine FL', 'backsplash jacksonville fl', 'backsplash saint augustine fl', 'bathroom tiles jacksonville fl', 'patio tiles', 'flooring installer', 'ceramic tiles', 'porcelain tiles', 'natural stone', 'tile contractor', 'tile installer jacksonville fl', 'tile installer saint augustine fl', 'home renovation'],
  authors: [{ name: 'Tola Tiles' }],
  creator: 'Tola Tiles',
  publisher: 'Tola Tiles',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tolatiles.com/',
    siteName: 'Tola Tiles',
    title: 'Tola Tiles - Tile Installer in Jacksonville FL and Saint Augustine FL',
    description: 'Bath & Kitchen Remodeling Company, Tile Installation Services in Jacksonville, Ponte Vedra, and Saint Augustine Florida, Tile Contractors, Flooring Installers, Tile Installers',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tola Tiles - Premium Tile Installation Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tola Tiles - Premium Tile Installation Services',
    description: 'Bath & Kitchen Remodeling Company, Tile Installation Services in Jacksonville, Ponte Vedra, and Saint Augustine Florida',
    images: ['/assets/twitter-image.jpg'],
  },
  verification: {
    google: 'c5Y2e0u5CZDNm6w7wDqyrVcT4l-JjJscPVC-fe2piAw',
  },
  alternates: {
    canonical: 'https://tolatiles.com/',
  },
  icons: {
    icon: '/assets/tolatiles_1.jpg',
    apple: '/assets/tolatiles_1.jpg',
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://tolatiles.com/#business',
  name: 'Tola Tiles',
  description: 'Bath & Kitchen Remodeling Company, Tile Installation Services in Jacksonville, Ponte Vedra, and Saint Augustine Florida, Tile Contractors, Flooring Installers, Tile Installers',
  url: 'https://tolatiles.com',
  telephone: '+1-904-866-1738',
  email: 'Menitola@live.com',
  foundingDate: '2008',
  priceRange: '$8-25 per sq ft',
  paymentAccepted: 'Cash, Check, Credit Card',
  currenciesAccepted: 'USD',
  openingHours: ['Mo-Fr 08:00-18:00', 'Sa 09:00-16:00'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '445 Hutchinson Ln',
    addressLocality: 'Saint Augustine',
    addressRegion: 'FL',
    postalCode: '32095',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '29.901244',
    longitude: '-81.312434',
  },
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: '29.901244',
      longitude: '-81.312434',
    },
    geoRadius: '50000',
  },
  logo: 'https://tolatiles.com/assets/logo.png',
  image: ['https://tolatiles.com/assets/tolatiles_1.jpg'],
  sameAs: ['https://www.facebook.com/TolaTiles', 'https://www.instagram.com/tolatiles'],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tola Tiles',
  url: 'https://tolatiles.com',
  logo: 'https://tolatiles.com/assets/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-904-866-1738',
    contactType: 'Customer Service',
    email: 'Menitola@live.com',
    availableLanguage: 'English',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '445 Hutchinson Ln',
    addressLocality: 'Saint Augustine',
    addressRegion: 'FL',
    postalCode: '32095',
    addressCountry: 'US',
  },
  founder: {
    '@type': 'Person',
    name: 'Gazmend Tola',
  },
  foundingDate: '2008',
  numberOfEmployees: '15',
};

// SiteNavigationElement schema helps Google understand main navigation for sitelinks
const siteNavigationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SiteNavigationElement',
  name: 'Main Navigation',
  hasPart: [
    {
      '@type': 'SiteNavigationElement',
      name: 'Home',
      url: 'https://tolatiles.com/',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Services',
      url: 'https://tolatiles.com/services',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Gallery',
      url: 'https://tolatiles.com/gallery',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'About',
      url: 'https://tolatiles.com/about',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'FAQs',
      url: 'https://tolatiles.com/faqs',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Contact',
      url: 'https://tolatiles.com/contact',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
      </head>
      <body className={inter.className}>
        <Analytics
          gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID}
          gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
        />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
