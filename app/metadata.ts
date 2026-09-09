import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@/config/site';
import { BASE_KEYWORDS } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/utils';

/**
 * Global metadata.
 *
 * The title template appends the brand to every page title automatically, so
 * individual routes only declare the part that is unique to them.
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline} in Nigeria`,
    template: `%s — ${siteConfig.name}`,
  },

  description: siteConfig.description,
  keywords: BASE_KEYWORDS,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName, url: siteConfig.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  category: 'Architecture',

  alternates: {
    canonical: siteConfig.url,
  },

  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline} in Nigeria`,
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: 'DICKALO — architecture and construction firm working across Nigeria',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.shortDescription,
    images: [absoluteUrl(siteConfig.ogImage)],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },

  manifest: '/site.webmanifest',

  // Stops Safari and Chrome auto-linking phone numbers and addresses, which
  // overrides our own styling with a blue system link.
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },

  other: {
    // Head-office coordinates. `geo.region` stays NG-LA because that is where
    // the registered office is; national reach is expressed through
    // `areaServed` in the JSON-LD instead, which is what search engines read.
    'geo.region': 'NG-LA',
    'geo.placename': 'Lagos',
    'geo.position': `${siteConfig.address.latitude};${siteConfig.address.longitude}`,
  },
};

export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Pinch zoom stays available. Capping it at 1 is an accessibility failure.
  maximumScale: 5,
  themeColor: '#F6F5F0',
  colorScheme: 'light',
};
