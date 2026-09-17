import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FadeInScroll } from '@/components/animations/FadeInScroll';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import { ArrowRight, Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { Image } from '@/components/common/Image';
import { ProjectCard } from '@/components/common/ProjectCard';
import { ServiceFaq } from '@/components/services/ServiceFaq';
import { CTA } from '@/components/sections/CTA';
import { FALLBACK_PROJECTS, REVALIDATE_SECONDS, SERVICES } from '@/lib/constants';
import { getProjects, getServices } from '@/lib/sanity/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, jsonLdScript, serviceSchema } from '@/lib/seo/structuredData';
import { SERVICE_DETAILS, SERVICE_SLUGS } from '@/lib/serviceDetails';

export const revalidate = REVALIDATE_SECONDS;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = SERVICES.find((item) => item.slug === params.slug);
  const detail = SERVICE_DETAILS[params.slug];

  if (!service || !detail) {
    return buildMetadata({
      title: 'Service not found',
      description: 'This service does not exist, or it has moved.',
      path: `/services/${params.slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${service.title} in Nigeria — DICKALO`,
    description: detail.introduction,
    path: `/services/${service.slug}`,
    image: detail.heroImage.src,
    imageAlt: detail.heroImage.alt,
    keywords: [`${service.title} Nigeria`, `${service.title} Lagos`],
  });
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const detail = SERVICE_DETAILS[params.slug];
  if (!detail) notFound();

  const [services, projects] = await Promise.all([getServices(), getProjects()]);
  const service =
    services.find((item) => item.slug === params.slug) ??
    SERVICES.find((item) => item.slug === params.slug);
  if (!service) notFound();

  const projectPool = [...projects, ...FALLBACK_PROJECTS];
  const relatedProjects = detail.relatedProjectSlugs
    .map((slug) => projectPool.find((project) => project.slug === slug))
    .filter((project, index, array) => project && array.indexOf(project) === index)
    .slice(0, 2);

  const serviceIndex = SERVICES.findIndex((item) => item.slug === params.slug);
  const nextService = SERVICES[(serviceIndex + 1) % SERVICES.length];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            serviceSchema(service),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
              { name: service.title, path: `/services/${service.slug}` },
            ]),
          ]),
        }}
      />

      <header className="service-detail-hero">
        <Container>
          <nav aria-label="Breadcrumb" className="service-detail-breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/services">Services</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{service.title}</span>
          </nav>

          <div className="service-detail-hero-copy">
            <div>
              <p className="eyebrow">Service {String(serviceIndex + 1).padStart(2, '0')}</p>
              <h1>{detail.headline}</h1>
            </div>
            <div className="service-detail-hero-intro">
              <p>{detail.introduction}</p>
              <div className="service-detail-actions">
                <Button
                  href={`/contact?service=${service.slug}`}
                  size="lg"
                  iconRight={<ArrowRight />}
                >
                  Discuss your project
                </Button>
                <Link href="#how-it-works" className="service-detail-text-link">
                  See how it works
                  <span aria-hidden="true">↓</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="service-detail-hero-image">
            <Image
              source={service.image}
              src={detail.heroImage.src}
              alt={service.image?.alt ?? detail.heroImage.alt}
              fill
              priority
              cdnWidth={2200}
              sizes="100vw"
              wrapperClassName="h-full w-full"
            />
            <div className="service-detail-image-label">
              <span>{service.title}</span>
              <span>Nigeria / DICKALO</span>
            </div>
          </div>
        </Container>
      </header>

      <section className="service-detail-story section-space">
        <Container>
          <div className="service-detail-story-grid">
            <FadeInScroll>
              <p className="micro-label">
                <span className="label-dot" /> What changes
              </p>
              <h2>{detail.storyTitle}</h2>
              <div className="service-detail-story-copy">
                {detail.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </FadeInScroll>

            <FadeInScroll direction="right" className="service-detail-scope">
              <p className="micro-label">This service is useful for</p>
              <ul>
                {detail.bestFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="service-detail-deliverables">
                <p className="micro-label">What you receive</p>
                <ul>
                  {service.deliverables?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </FadeInScroll>
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="service-detail-process section-space">
        <Container>
          <div className="service-detail-section-heading">
            <div>
              <p className="micro-label">
                <span className="label-dot" /> How it works
              </p>
              <h2>Four clear stages.</h2>
            </div>
            <p>{detail.processIntroduction}</p>
          </div>

          <StaggerContainer className="service-detail-process-grid" stagger={0.08}>
            {detail.process.map((step, index) => (
              <StaggerItem key={step.title} className="service-detail-process-card">
                <span className="numeric">{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div>
                  <span>At this stage</span>
                  <strong>{step.deliverable}</strong>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {relatedProjects.length ? (
        <section className="service-detail-related section-space" aria-labelledby="related-work">
          <Container>
            <div className="service-detail-section-heading">
              <div>
                <p className="micro-label">
                  <span className="label-dot" /> Related work
                </p>
                <h2 id="related-work">See it in practice.</h2>
              </div>
              <Button href="/projects" variant="ghost" iconRight={<ArrowRight />}>
                All projects
              </Button>
            </div>
            <div className="service-detail-project-grid">
              {relatedProjects.map((project) =>
                project ? (
                  <ProjectCard key={project._id} project={project} variant="feature" />
                ) : null,
              )}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="service-detail-faq section-space" aria-labelledby="service-faq-heading">
        <Container>
          <div className="service-detail-faq-grid">
            <div>
              <p className="micro-label">
                <span className="label-dot" /> Before we begin
              </p>
              <h2 id="service-faq-heading">Questions worth asking.</h2>
              <p>
                These are the practical questions we hear most often about{' '}
                {service.title.toLowerCase()}.
              </p>
            </div>
            <ServiceFaq items={detail.faqs} serviceTitle={service.title} />
          </div>
        </Container>
      </section>

      <section className="service-detail-next">
        <Container>
          <Link href={`/services/${nextService.slug}`}>
            <span>Next service</span>
            <strong>{nextService.title}</strong>
            <ArrowRight />
          </Link>
        </Container>
      </section>

      <CTA
        eyebrow={service.title}
        title={`Ready to discuss ${service.title.toLowerCase()}?`}
        description="Send us the site, the stage you are at and what you need to decide next. We will reply with the right first step within two working days."
        primaryLabel="Discuss your project"
        primaryHref={`/contact?service=${service.slug}`}
      />
    </>
  );
}
