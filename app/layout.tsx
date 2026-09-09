import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider';
import { jsonLdScript, organizationSchema, websiteSchema } from '@/lib/seo/structuredData';
import { defaultMetadata, defaultViewport } from './metadata';

import '@/styles/globals.css';

/** Self-hosted webfont fallback for the local architectural sans-serif stack. */
const fontFallback = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = defaultViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-NG"
      className={fontFallback.variable}
      // Lenis writes classes onto <html>, and browser extensions add attributes
      // there too. Both would otherwise be reported as hydration mismatches.
      suppressHydrationWarning
    >
      <head>
        {/* Sanity's image CDN is on the critical path for every page with imagery. */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />

        {/*
          Site-wide structured data. Declared once in the root layout so the
          Organization and WebSite entities are available on every page and can
          be referenced by @id from page-level schemas.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript([organizationSchema(), websiteSchema()]),
          }}
        />
      </head>

      <body className="bg-surface-base font-body text-content-primary antialiased">
        <SmoothScrollProvider>
          <Navbar />
          {/* Target of the skip link. tabIndex allows focus to land here. */}
          <main id="main" tabIndex={-1} className="min-h-screen outline-none">
            {children}
          </main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
