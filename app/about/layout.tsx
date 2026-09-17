import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdScript } from '@/lib/seo/structuredData';

export const metadata: Metadata = buildMetadata(pageMeta.about);

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Studio', path: '/about' },
            ]),
          ),
        }}
      />
      {children}
    </>
  );
}
