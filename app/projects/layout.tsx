import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdScript } from '@/lib/seo/structuredData';

export const metadata: Metadata = buildMetadata(pageMeta.projects);

/**
 * Projects layout.
 *
 * Carries the breadcrumb structured data for the whole section. The detail
 * pages extend the trail with their own project name.
 */
export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Projects', path: '/projects' },
            ]),
          ),
        }}
      />
      {children}
    </>
  );
}
