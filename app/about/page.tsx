import { Container } from '@/components/common/Container';
import { Image } from '@/components/common/Image';
import { PageHeader } from '@/components/common/PageHeader';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { ParallaxSection } from '@/components/animations/ParallaxSection';
import { CTA } from '@/components/sections/CTA';
import { Stats } from '@/components/sections/Stats';
import { Team } from '@/components/sections/Team';
import { siteConfig } from '@/config/site';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { getTeam } from '@/lib/sanity/queries';
import { jsonLdScript, personSchema } from '@/lib/seo/structuredData';

export const revalidate = REVALIDATE_SECONDS;

const PRINCIPLES = [
  {
    title: 'One team owns the whole answer',
    body: 'Architecture, construction and interiors sit together in Ilorin. Decisions move between the drawing table and the site without being lost between separate companies.',
  },
  {
    title: 'The site changes the design',
    body: 'Climate, access, local skills and available materials shape every project. We design for the place where the building will stand, not for a generic presentation image.',
  },
  {
    title: 'Distance needs a clear system',
    body: 'For projects outside Kwara, we establish the right resident site team, reporting rhythm and procurement route before work begins. Nationwide delivery is planned, not improvised.',
  },
  {
    title: 'We speak before a risk becomes a delay',
    body: 'Every active project has a visible programme, cost position and decision list. When something changes, the client hears the reason and the proposed action early.',
  },
];

const STUDIO_FACTS = [
  { label: 'Based', value: 'Ilorin, Kwara State' },
  { label: 'Available', value: 'Nationwide' },
  { label: 'Experience', value: 'Projects across Nigeria' },
];

export default async function AboutPage() {
  const team = await getTeam();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(team.map(personSchema)) }}
      />

      <PageHeader
        eyebrow="The studio"
        title="Based in Ilorin. Built to work across Nigeria."
        description="DICKALO is an architecture and construction practice with one permanent base in Ilorin and project experience across Nigeria. We bring design, technical coordination and site delivery into one accountable team."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Studio' }]}
        titleClassName="max-w-[15ch]"
      />

      <section className="studio-page-hero bg-surface-base">
        <Container>
          <ParallaxSection speed={0.1} scale className="studio-page-hero-frame">
            <Image
              src="/images/studio/ilorin-studio.webp"
              alt="Nigerian architects and construction professionals working around a model in an Ilorin design studio"
              fill
              priority
              sizes="100vw"
              wrapperClassName="h-full w-full"
            />
          </ParallaxSection>
          <div className="studio-page-hero-caption">
            <span>Ilorin studio / Kwara State</span>
            <span>Design, construction and interiors under one roof</span>
          </div>
        </Container>
      </section>

      <section className="studio-page-story section-space bg-surface-base">
        <Container>
          <div className="studio-page-story-grid">
            <FadeInScroll>
              <p className="micro-label">
                <span className="label-dot" /> Where we work
              </p>
              <h2>Rooted in one place. Ready for many.</h2>
            </FadeInScroll>

            <FadeInScroll delay={0.1} className="studio-page-story-copy">
              <p>
                Ilorin is our working base. It is where briefs become drawings, materials are tested
                and the design and construction teams sit close enough to solve problems in the same
                conversation.
              </p>
              <p>
                Our reach is national. We have worked on projects in different states and organise
                each commission around its actual location, programme and supply chain. When the
                site is outside Kwara, the site team lives close to the work and the Ilorin studio
                remains connected through scheduled reviews and clear weekly reporting.
              </p>
              <p>
                That balance matters to us: the continuity of one permanent studio, with the
                practical ability to mobilise wherever the right project is in Nigeria.
              </p>
            </FadeInScroll>
          </div>

          <dl className="studio-page-facts">
            {STUDIO_FACTS.map((fact, index) => (
              <FadeInScroll key={fact.label} as="div" delay={index * 0.08}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </FadeInScroll>
            ))}
          </dl>
        </Container>
      </section>

      <section className="studio-page-practice bg-surface-raised">
        <Container>
          <div className="studio-page-practice-grid">
            <FadeInScroll className="studio-page-practice-image studio-page-practice-image--large">
              <Image
                src="/images/studio/nationwide-site-review.webp"
                alt="DICKALO architects and construction professionals reviewing drawings on a Nigerian building site"
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                wrapperClassName="h-full w-full"
              />
              <span>On site / Nigeria</span>
            </FadeInScroll>

            <div className="studio-page-practice-side">
              <FadeInScroll direction="right" className="studio-page-practice-copy">
                <p className="micro-label">
                  <span className="label-dot" /> Studio to site
                </p>
                <h2>The detail travels with the team.</h2>
                <p>
                  We use models, samples and coordinated drawings to settle the work before it
                  reaches site. The same people then review how those decisions are being built,
                  wherever the project is located.
                </p>
              </FadeInScroll>
              <FadeInScroll direction="right" className="studio-page-practice-image">
                <Image
                  src="/images/studio/material-study.webp"
                  alt="Architectural model, drawings and Nigerian material samples on the Ilorin studio table"
                  fill
                  sizes="(max-width: 900px) 100vw, 38vw"
                  wrapperClassName="h-full w-full"
                />
                <span>Material study / Ilorin</span>
              </FadeInScroll>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-space bg-surface-base" aria-labelledby="principles-heading">
        <Container>
          <FadeInScroll className="mb-14 lg:mb-20">
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-gold-600" aria-hidden="true" />
              How we work
            </p>
            <h2
              id="principles-heading"
              className="max-w-[18ch] text-balance font-display text-display-md text-content-primary"
            >
              The habits that keep distant sites connected.
            </h2>
          </FadeInScroll>

          <ol className="grid gap-px overflow-hidden bg-ink-200 md:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <FadeInScroll
                key={principle.title}
                as="li"
                delay={index * 0.08}
                className="flex flex-col gap-4 bg-surface-base p-8 lg:p-12"
              >
                <span className="numeric font-display text-caption text-content-accent/70">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-balance font-display text-heading-lg text-content-primary">
                  {principle.title}
                </h3>
                <p className="text-body-md text-content-secondary">{principle.body}</p>
              </FadeInScroll>
            ))}
          </ol>
        </Container>
      </section>

      <Stats />

      <Team members={team} />

      <section
        className="studio-page-careers bg-surface-base pb-section"
        aria-labelledby="careers-heading"
      >
        <Container>
          <FadeInScroll className="studio-page-careers-inner">
            <div>
              <p className="micro-label">
                <span className="label-dot" /> Join the studio
              </p>
              <h2 id="careers-heading">Bring work you can explain.</h2>
            </div>
            <div>
              <p>
                We look for architects who understand site work, construction people who can read a
                detail and interior designers who care how materials perform after handover. Send a
                concise portfolio and tell us what you were responsible for.
              </p>
              <a href={`mailto:${siteConfig.contact.careersEmail}?subject=Portfolio`}>
                {siteConfig.contact.careersEmail}
              </a>
            </div>
          </FadeInScroll>
        </Container>
      </section>

      <CTA
        eyebrow="Work with us"
        title="Have a project anywhere in Nigeria?"
        description="Tell us where the site is, what you want to build and the stage you are at. Our Ilorin team will reply with the right first step within two working days."
      />
    </>
  );
}
