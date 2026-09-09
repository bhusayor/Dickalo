import type { Metadata } from 'next';
import { CTA } from '@/components/sections/CTA';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { StudioIntro } from '@/components/sections/StudioIntro';
import { StudioFilm } from '@/components/sections/StudioFilm';
import { FAQ } from '@/components/sections/FAQ';
import { Hero } from '@/components/sections/Hero';
import { ProcessTimeline } from '@/components/sections/ProcessTimeline';
import { Services } from '@/components/sections/Services';
import { Stats } from '@/components/sections/Stats';
import { Testimonials } from '@/components/sections/Testimonials';
import {
  getFeaturedProjects,
  getServices,
  getSettings,
  getTestimonials,
} from '@/lib/sanity/queries';
import { REVALIDATE_SECONDS, STATS } from '@/lib/constants';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';
import type { StatItem } from '@/lib/types';

export const metadata: Metadata = buildMetadata(pageMeta.home);

/** Incremental static regeneration: rebuilt at most every 30 minutes. */
export const revalidate = REVALIDATE_SECONDS;

/**
 * Homepage.
 *
 * A server component. All four CMS reads run in parallel — sequential awaits
 * here would add three round trips to the time to first byte for no benefit.
 */
export default async function HomePage() {
  const [projects, services, testimonials, settings] = await Promise.all([
    getFeaturedProjects(4),
    getServices(),
    getTestimonials(),
    getSettings(),
  ]);

  // Editors can override the headline numbers from the Studio; otherwise the
  // defaults in constants are used.
  const stats: StatItem[] =
    settings?.stats?.length === 4
      ? settings.stats.map((stat) => ({
          value: stat.value,
          label: stat.label,
          suffix: stat.suffix,
        }))
      : STATS;

  const featuredTestimonials = testimonials.filter((item) => item.featured !== false).slice(0, 5);

  return (
    <>
      <Hero />
      <StudioIntro />
      <FeaturedProjects projects={projects} />
      <Services services={services} variant="compact" />
      <StudioFilm />
      <ProcessTimeline />
      <Stats stats={stats} />
      <Testimonials testimonials={featuredTestimonials} />
      <FAQ />
      <CTA />
    </>
  );
}
