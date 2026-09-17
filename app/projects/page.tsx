import { Suspense } from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { PageHeader } from '@/components/common/PageHeader';
import { CTA } from '@/components/sections/CTA';
import { getProjects } from '@/lib/sanity/queries';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { itemListSchema, jsonLdScript } from '@/lib/seo/structuredData';
import { ProjectsGrid } from './ProjectsGrid';

export const revalidate = REVALIDATE_SECONDS;

/**
 * Portfolio index.
 *
 * The list is fetched and rendered on the server; only the filtering is a
 * client concern. `ProjectsGrid` reads the URL through `useSearchParams`, which
 * requires a Suspense boundary in a statically rendered route.
 */
export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListSchema(projects)) }}
      />

      <PageHeader
        eyebrow="Projects"
        title="Everything we have finished."
        description="Houses, offices, hotels and public buildings, from Lagos to Kano. Each one lists the real floor area, the real programme and what the site threw at us along the way."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Projects' }]}
        titleClassName="max-w-[16ch]"
      />

      <section className="section-space bg-surface-base">
        <Container>
          <article className="virtual-tour-card">
            <div>
              <span className="micro-label">New · interactive prototype</span>
              <h2>Step inside a building before it exists.</h2>
            </div>
            <div className="virtual-tour-card-copy">
              <p>
                Walk through a complete two-storey duplex in your browser. Explore the rooms, change
                floors and experience the plan at human scale.
              </p>
              <Link href="/tour/duplex" className="virtual-tour-card-link">
                Launch the virtual tour
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <path
                    d="M3 9h11M10 4l5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
            </div>
          </article>
          <Suspense
            fallback={
              <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="flex flex-col gap-4">
                    <div className="aspect-[3/2] animate-pulse rounded-md bg-ink-950/[0.06]" />
                    <div className="h-5 w-2/3 animate-pulse rounded-xs bg-line-subtle" />
                  </div>
                ))}
              </div>
            }
          >
            <ProjectsGrid projects={projects} />
          </Suspense>
        </Container>
      </section>

      <CTA
        eyebrow="Yours next"
        title="See something close to what you are planning?"
        description="Tell us about your site and we will tell you what the equivalent would take, in time and in money. No obligation, and no sales call."
      />
    </>
  );
}
