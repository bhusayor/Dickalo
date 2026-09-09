import { PageHeader } from '@/components/common/PageHeader';
import { CTA } from '@/components/sections/CTA';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { Services } from '@/components/sections/Services';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { getServices } from '@/lib/sanity/queries';
import { REVALIDATE_SECONDS } from '@/lib/constants';
import { jsonLdScript, serviceSchema } from '@/lib/seo/structuredData';

export const revalidate = REVALIDATE_SECONDS;

/**
 * Services overview.
 *
 * One page for all six services rather than six thin pages. Someone choosing a
 * contractor wants to compare, and comparison across six navigations is
 * comparison nobody does.
 */
export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(services.map(serviceSchema)),
        }}
      />

      <PageHeader
        eyebrow="Services"
        title="One team from sketch to keys."
        description="Most projects in Nigeria are split between an architect who draws and a contractor who builds, and the gap between them is where the money and the months go. We closed that gap by doing both."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
        titleClassName="max-w-[15ch]"
        aside={
          <FadeInScroll direction="right">
            <div className="border-l-2 border-gold pl-6">
              <p className="text-body-lg text-content-primary">
                You can hire us for one service or all six. What you cannot do is get a different
                answer from our design team than from our site team.
              </p>
            </div>
          </FadeInScroll>
        }
      />

      <Services services={services} variant="full" showHeading={false} />

      <ProcessTimeline />

      <CTA
        eyebrow="Get a number"
        title="Not sure which of these you need?"
        description="Most people are not, at the start. Describe the site and what you want out of it, and we will tell you which services apply and roughly what they cost."
      />
    </>
  );
}
