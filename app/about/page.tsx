import Link from 'next/link';
import { ArrowRight, Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { Image } from '@/components/common/Image';
import { PageHeader } from '@/components/common/PageHeader';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { ParallaxSection } from '@/components/animations/ParallaxSection';
import { CTA } from '@/components/sections/CTA';
import { Stats } from '@/components/sections/Stats';
import { Team } from '@/components/sections/Team';
import { brandStatements, siteConfig } from '@/config/site';
import { getTeam } from '@/lib/sanity/queries';
import { REVALIDATE_SECONDS } from '@/lib/constants';

export const revalidate = REVALIDATE_SECONDS;

/**
 * What we will and will not do. Stating the limits plainly filters out the
 * enquiries that waste everyone's time, and the specificity is what makes the
 * positive claims believable.
 */
const PRINCIPLES = [
  {
    title: 'The date in the contract is the date',
    body: 'We build float into the programme before you sign it, not excuses after. When a date is genuinely at risk you hear it that Friday, with what we are doing about it.',
  },
  {
    title: 'One number, and it moves for reasons',
    body: 'Our price includes what we know will be needed, not the cheapest defensible version of it. If it changes, you get the reason and the receipt before the work happens.',
  },
  {
    title: 'We say no to work we would do badly',
    body: 'We turn down two or three projects a year because the budget cannot buy what the brief describes. Saying that early costs us a job and saves you eighteen months.',
  },
  {
    title: 'Built for the climate, not the photograph',
    body: 'Salt air on the coast, harmattan dust in the north, and heat everywhere. We detail for the climate the building is actually in. That is why our work still looks right at year ten, when buildings designed for the render have started to stain.',
  },
];

export default async function AboutPage() {
  const team = await getTeam();

  return (
    <>
      <PageHeader
        eyebrow="About the studio"
        title="We are the architect and the contractor."
        description={brandStatements.aboutIntro}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      {/* --- Studio image --------------------------------------------------- */}
      <section className="bg-surface-base">
        <ParallaxSection speed={0.14} scale className="h-[45vh] min-h-[20rem] lg:h-[65vh]">
          <Image
            src="/images/studio.jpg"
            alt="The DICKALO studio in Victoria Island, Lagos"
            reveal
            fill
            priority
            ratio="auto"
            sizes="100vw"
            wrapperClassName="h-full w-full"
          />
        </ParallaxSection>
      </section>

      {/* --- Story ---------------------------------------------------------- */}
      <section className="section-space bg-surface-base">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <FadeInScroll>
              <h2 className="text-balance font-display text-display-sm text-content-primary">
                Why both, and not one or the other
              </h2>
            </FadeInScroll>

            <FadeInScroll delay={0.1} className="prose-dickalo">
              <p>
                DICKALO started in {siteConfig.founded} with a single house in Ikoyi and three
                people, two of whom were on site every day. The reason we took the construction as
                well as the design was not ambition. It was that the previous contractor had walked
                off, and finishing it ourselves was the only way the client was ever going to move
                in.
              </p>
              <p>
                We have kept that arrangement since, and the reason is unglamorous: when the same
                firm draws the detail and installs it, there is nobody to blame and therefore nobody
                trying to. Coordination problems get solved in a corridor conversation instead of a
                claim.
              </p>
              <p>
                Today we are {team.length > 0 ? '42 people' : 'a full team'} across design,
                engineering, site management and interiors, working out of three offices in Lagos,
                Abuja and Port Harcourt. Everyone who draws your building has stood on a site in the
                rain, and it shows in the drawings.
              </p>
            </FadeInScroll>
          </div>
        </Container>
      </section>

      {/* --- Principles ----------------------------------------------------- */}
      <section className="section-space bg-surface-raised" aria-labelledby="principles-heading">
        <Container>
          <FadeInScroll className="mb-14 lg:mb-20">
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-gold-600" aria-hidden="true" />
              How we work
            </p>
            <h2
              id="principles-heading"
              className="max-w-[20ch] text-balance font-display text-display-md text-content-primary"
            >
              Four things we hold to, including the inconvenient one.
            </h2>
          </FadeInScroll>

          <ol className="grid gap-px overflow-hidden rounded-lg bg-ink-200 md:grid-cols-2">
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
                <p className="text-pretty text-body-md text-content-secondary">{principle.body}</p>
              </FadeInScroll>
            ))}
          </ol>
        </Container>
      </section>

      <Stats />

      <Team members={team.slice(0, 4)} />

      <section className="pb-section">
        <Container>
          <FadeInScroll className="flex flex-col items-start gap-5 border-t border-line pt-10">
            <p className="max-w-measure text-body-lg text-content-secondary">
              There are {Math.max(team.length - 4, 0) + 38} more people behind these four, on site
              and in the studio.
            </p>
            <Button href="/about/team" variant="secondary" iconRight={<ArrowRight />}>
              Meet the whole team
            </Button>
          </FadeInScroll>
        </Container>
      </section>

      <CTA
        eyebrow="Work with us"
        title="Think we would suit your project?"
        description="Send us the brief. If we are the wrong firm for it we will say so, and where we can, point you at someone better placed."
      />
    </>
  );
}
