import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { PageHeader } from '@/components/common/PageHeader';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { CTA } from '@/components/sections/CTA';
import { Team } from '@/components/sections/Team';
import { siteConfig } from '@/config/site';
import { getTeam } from '@/lib/sanity/queries';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdScript, personSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = buildMetadata(pageMeta.team);
export const revalidate = REVALIDATE_SECONDS;

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            ...team.map(personSchema),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'About', path: '/about' },
              { name: 'Team', path: '/about/team' },
            ]),
          ]),
        }}
      />

      <PageHeader
        eyebrow="The team"
        title="Names you will actually deal with."
        description="No account managers. The person who presents your design is the person who draws it, and the person who runs your site is on it most days — whether that site is in Lagos, Abuja or Kano."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Team' },
        ]}
        titleClassName="max-w-[16ch]"
      />

      <Team members={team} showHeading={false} />

      {/* Recruitment. Honest about what it is like, which is the point. */}
      <section className="pb-section" aria-labelledby="careers-heading">
        <Container>
          <FadeInScroll className="flex flex-col gap-5 border-t border-line pt-14">
            <h2 id="careers-heading" className="font-display text-display-sm text-content-primary">
              We hire about four people a year.
            </h2>
            <p className="max-w-prose text-pretty text-body-lg text-content-secondary">
              Mostly architects with site experience and site managers who can read a detail
              drawing. It is a demanding studio and the projects are real, which suits some people
              and not others. If it sounds like you, send work and tell us what you built.
            </p>
            <a
              href={`mailto:${siteConfig.contact.careersEmail}?subject=Portfolio`}
              className="link-underline w-fit text-body-lg text-content-accent"
            >
              {siteConfig.contact.careersEmail}
            </a>
          </FadeInScroll>
        </Container>
      </section>

      <CTA />
    </>
  );
}
