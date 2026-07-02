import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { LandingPagePublic } from '@/types/api';
import LandingPageTracking from '@/components/landing/LandingPageTracking';
import SectionRenderer from '@/components/landing/SectionRenderer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function getLandingPage(subdomain: string): Promise<LandingPagePublic | null> {
  try {
    const response = await fetch(`${API_BASE}/landing-pages/by-subdomain/${subdomain}/`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/** True once the request actually arrived via the subdomain rewrite, not a direct visit to this internal path. */
async function isRealSubdomainRequest(subdomain: string): Promise<boolean> {
  const headersList = await headers();
  const host = (headersList.get('host') || '').split(':')[0];
  return host === `${subdomain}.tolatiles.com` || host === `${subdomain}.localhost`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const landingPage = await getLandingPage(subdomain);

  if (!landingPage) {
    return { title: 'Not Found' };
  }

  return {
    // { absolute } bypasses the root layout's "%s | Tola Tiles" title template —
    // landing pages are a separate brand surface for the campaign, not a Tola Tiles subpage.
    title: { absolute: landingPage.effective_meta_title },
    description: landingPage.effective_meta_description || undefined,
    alternates: {
      canonical: landingPage.canonical_url || `https://${subdomain}.tolatiles.com/`,
    },
    robots: landingPage.is_indexed ? 'index, follow' : 'noindex, nofollow',
    openGraph: {
      title: landingPage.effective_meta_title,
      description: landingPage.effective_meta_description || undefined,
      type: 'website',
      url: `https://${subdomain}.tolatiles.com/`,
      images: landingPage.og_image ? [{ url: landingPage.og_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: landingPage.effective_meta_title,
      description: landingPage.effective_meta_description || undefined,
      images: landingPage.og_image ? [landingPage.og_image] : [],
    },
  };
}

export default async function LandingSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  if (!(await isRealSubdomainRequest(subdomain))) {
    notFound();
  }

  const landingPage = await getLandingPage(subdomain);
  if (!landingPage) notFound();

  return (
    <>
      <LandingPageTracking
        pixelId={landingPage.meta_pixel_id}
        gtmId={landingPage.gtm_container_id}
        gaId={landingPage.ga_measurement_id}
        headScripts={landingPage.custom_head_scripts}
        bodyScripts={landingPage.custom_body_scripts}
      />
      <SectionRenderer
        sections={landingPage.sections}
        phoneNumber={landingPage.phone_number}
        landingPageId={landingPage.id}
      />
    </>
  );
}
