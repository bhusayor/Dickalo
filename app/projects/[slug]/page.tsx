import { PortableText } from '@portabletext/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { Image } from '@/components/common/Image';
import { ProjectCard } from '@/components/common/ProjectCard';
import { ProjectGallery, type ProjectGalleryItem } from '@/components/projects/ProjectGallery';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { ParallaxSection } from '@/components/animations/ParallaxSection';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import { CTA } from '@/components/sections/CTA';
import { CATEGORY_LABELS, REVALIDATE_SECONDS, STATUS_LABELS } from '@/lib/constants';
import { getProjectBySlug, getProjectSlugs, getRelatedProjects } from '@/lib/sanity/queries';
import { urlForImage } from '@/lib/sanity/imageUrlBuilder';
import { buildMetadata, projectTitle } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdScript, projectSchema } from '@/lib/seo/structuredData';
import type { ProjectFact } from '@/lib/types';

export const revalidate = REVALIDATE_SECONDS;

/**
 * Pre-render every project at build time. New ones added later are generated on
 * first request and cached, because `dynamicParams` defaults to true.
 */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return buildMetadata({
      title: 'Project not found',
      description: 'This project does not exist, or it has moved.',
      path: `/projects/${params.slug}`,
      noIndex: true,
    });
  }

  const ogImage = project.seo?.ogImage?.asset?._ref
    ? urlForImage(project.seo.ogImage, { width: 1200, height: 630 })
    : project.coverImage?.asset?._ref
      ? urlForImage(project.coverImage, { width: 1200, height: 630 })
      : undefined;

  return buildMetadata({
    title: project.seo?.metaTitle ?? projectTitle(project.title, project.location),
    description: project.seo?.metaDescription ?? project.excerpt,
    path: `/projects/${project.slug}`,
    image: ogImage,
    imageAlt: project.coverImage?.alt ?? `${project.title}, ${project.location}`,
    type: 'article',
    noIndex: project.seo?.noIndex,
    keywords: [project.category, project.location, `${CATEGORY_LABELS[project.category]} Nigeria`],
  });
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);

  if (!project) notFound();

  const related = await getRelatedProjects(project.slug, project.category, 3);

  /**
   * Detail table. Built from the fixed fields, then extended with whatever the
   * editor added in the Studio, so the sidebar is never a column of dashes.
   */
  const facts: ProjectFact[] = [
    { label: 'Location', value: project.location },
    { label: 'Year', value: project.year },
    { label: 'Category', value: CATEGORY_LABELS[project.category] },
    { label: 'Status', value: STATUS_LABELS[project.status] },
    ...(project.client ? [{ label: 'Client', value: project.client }] : []),
    ...(project.area ? [{ label: 'Floor area', value: project.area }] : []),
    ...(project.duration ? [{ label: 'On site', value: project.duration }] : []),
    ...(project.facts ?? []),
  ];

  const galleryImages: ProjectGalleryItem[] = [
    {
      id: `${project.slug}-cover`,
      source: project.coverImage,
      src: project.coverImageUrl,
      alt: project.coverImage?.alt || `${project.title}, ${project.location}`,
      caption: project.tagline,
    },
    ...(project.gallery ?? []).map((image, index) => ({
      id: image.asset?._ref || `${project.slug}-gallery-${index}`,
      source: image,
      alt: image.alt || `${project.title}, view ${index + 2}`,
      caption: image.caption,
    })),
    ...(project.galleryImageUrls ?? []).map((image, index) => ({
      id: `${project.slug}-reference-${index}`,
      src: image.src,
      alt: image.alt,
      caption: image.caption,
    })),
  ];

  const usesReferenceImagery = Boolean(project.galleryImageUrls?.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            projectSchema(project),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Projects', path: '/projects' },
              { name: project.title, path: `/projects/${project.slug}` },
            ]),
          ]),
        }}
      />

      {/* --- Hero ---------------------------------------------------------- */}
      {/*
        Light-theme structure: the title sits on white ABOVE the photograph,
        not over it. The dark theme could pull white type onto the image behind
        a black scrim; near-black type cannot do the same, because a bright
        frame would drop it below AA and no scrim fixes that without turning
        the photograph to mud.
      */}
      <header className="bg-surface-base pt-32 lg:pt-40">
        <Container>
          <div className="flex flex-col gap-6 pb-10 lg:pb-14">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-caption text-content-muted">
                <li>
                  <Link href="/" className="transition-colors hover:text-content-accent">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-content-faint">
                  /
                </li>
                <li>
                  <Link href="/projects" className="transition-colors hover:text-content-accent">
                    Projects
                  </Link>
                </li>
                <li aria-hidden="true" className="text-content-faint">
                  /
                </li>
                <li className="text-content-primary" aria-current="page">
                  {project.title}
                </li>
              </ol>
            </nav>

            <h1 className="max-w-[18ch] text-balance font-display text-display-lg text-content-primary">
              {project.title}
            </h1>

            {project.tagline ? (
              <p className="max-w-prose text-pretty text-body-lg text-content-accent">
                {project.tagline}
              </p>
            ) : null}

            {/* Key facts inline, so the essentials are readable before the
                photograph has even loaded. */}
            <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
              {[
                { label: 'Location', value: project.location },
                { label: 'Year', value: project.year },
                ...(project.area ? [{ label: 'Floor area', value: project.area }] : []),
                { label: 'Status', value: STATUS_LABELS[project.status] },
              ].map((fact) => (
                <div key={fact.label} className="flex flex-col gap-0.5">
                  <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-content-faint">
                    {fact.label}
                  </dt>
                  <dd className="numeric text-body-sm font-medium text-content-primary">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>

        {/* Full-bleed cover, inset with the page gutter and rounded to match
            the homepage hero's media panel. */}
        <div className="px-gutter">
          <ParallaxSection
            speed={0.14}
            scale
            className="h-[52vh] min-h-[20rem] overflow-hidden rounded-xl lg:h-[76vh]"
          >
            <ProjectGallery images={galleryImages} projectTitle={project.title} variant="cover" />
          </ParallaxSection>
        </div>
      </header>

      {/* --- Body and details ---------------------------------------------- */}
      <section className="section-space">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
            <FadeInScroll className="order-2 lg:order-1">
              <p className="prose-dickalo mb-10 text-body-lg text-content-primary">
                {project.excerpt}
              </p>

              {project.body?.length ? (
                <div className="prose-dickalo">
                  <PortableText
                    value={project.body}
                    components={{
                      types: {
                        // Images inside the story get the same treatment as the
                        // gallery: fixed ratio, blur-up, optional caption.
                        image: ({ value }) => (
                          <figure className="my-10">
                            <Image
                              source={value}
                              alt={value?.alt ?? ''}
                              ratio="3/2"
                              cdnWidth={1400}
                              sizes="(max-width: 1024px) 100vw, 900px"
                              wrapperClassName="rounded-md"
                            />
                            {value?.caption ? <figcaption>{value.caption}</figcaption> : null}
                          </figure>
                        ),
                      },
                      marks: {
                        link: ({ value, children }) => {
                          const href = value?.href ?? '#';
                          const external = href.startsWith('http');
                          return (
                            <a
                              href={href}
                              {...(external
                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                : {})}
                            >
                              {children}
                            </a>
                          );
                        },
                      },
                    }}
                  />
                </div>
              ) : null}
            </FadeInScroll>

            {/* Sticky detail table. Stays with the reader down a long story. */}
            <FadeInScroll direction="none" className="order-1 lg:order-2">
              <div className="lg:sticky lg:top-28">
                <h2 className="eyebrow eyebrow--muted mb-5">Project details</h2>
                <dl className="flex flex-col">
                  {facts.map((fact) => (
                    <div
                      key={`${fact.label}-${fact.value}`}
                      className="flex justify-between gap-6 border-b border-line py-3.5"
                    >
                      <dt className="text-body-sm text-content-muted">{fact.label}</dt>
                      <dd className="numeric text-right text-body-sm font-medium text-content-primary">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {project.services?.length ? (
                  <div className="mt-8">
                    <h2 className="eyebrow eyebrow--muted mb-4">What we did</h2>
                    <ul className="flex flex-wrap gap-2">
                      {project.services.map((service) => (
                        <li
                          key={service}
                          className="rounded-xs border border-line px-2.5 py-1 text-caption text-content-secondary"
                        >
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Button
                  href="/contact"
                  variant="gold-outline"
                  fullWidth
                  className="mt-8"
                  iconRight={<ArrowRight />}
                >
                  Build something like this
                </Button>
              </div>
            </FadeInScroll>
          </div>
        </Container>
      </section>

      {/* --- Gallery -------------------------------------------------------- */}
      {galleryImages.length > 1 ? (
        <section className="pb-section" aria-labelledby="gallery-heading">
          <Container>
            <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <h2 id="gallery-heading" className="eyebrow eyebrow--muted">
                Project gallery
              </h2>
              <p className="max-w-md text-body-sm text-content-muted">
                {usesReferenceImagery
                  ? 'Design reference imagery showing the intended spaces, materials and atmosphere.'
                  : 'Select any image to explore the project in full screen.'}
              </p>
            </div>

            <ProjectGallery images={galleryImages} projectTitle={project.title} />
          </Container>
        </section>
      ) : null}

      {/* --- Related -------------------------------------------------------- */}
      {related.length > 0 ? (
        <section className="border-t border-line py-section" aria-labelledby="related-heading">
          <Container>
            <div className="mb-10 flex items-end justify-between gap-8">
              <h2
                id="related-heading"
                className="font-display text-display-sm text-content-primary"
              >
                More like this
              </h2>
              <Button href="/projects" variant="ghost" iconRight={<ArrowRight />}>
                All projects
              </Button>
            </div>

            <StaggerContainer stagger={0.08} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <StaggerItem key={item._id}>
                  <ProjectCard project={item} variant="compact" />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </section>
      ) : null}

      <CTA
        eyebrow="Start yours"
        title="Want something in this direction?"
        description="Send us the site and roughly what you have in mind. We will come back with what it would take, honestly, within two working days."
      />
    </>
  );
}
