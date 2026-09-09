import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema, contactPageSchema, jsonLdScript } from '@/lib/seo/structuredData';

export const metadata: Metadata = buildMetadata(pageMeta.contact);

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            contactPageSchema(),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Contact', path: '/contact' },
            ]),
          ]),
        }}
      />
      {children}
    </>
  );
}
