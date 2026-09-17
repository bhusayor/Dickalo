import { siteConfig } from '@/config/site';
import { urlForImage } from '@/lib/sanity/imageUrlBuilder';
import { absoluteUrl } from '@/lib/utils';
import type { Project, Service, TeamMember, Testimonial } from '@/lib/types';

/**
 * JSON-LD generators.
 *
 * All schema.org types, all validated against Google's Rich Results Test. The
 * `@id` values are stable URLs so entities can reference each other across
 * pages instead of being re-declared as new nodes each time.
 */

const ORG_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

type Json = Record<string, unknown>;

/**
 * The organisation. `LocalBusiness` rather than plain `Organization` because a
 * construction firm with a physical address benefits from local search.
 */
export function organizationSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'GeneralContractor', 'ProfessionalService'],
    '@id': ORG_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    alternateName: 'DICKALO Architecture',
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/images/logo-square.png'),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(siteConfig.ogImage),
    description: siteConfig.description,
    foundingDate: siteConfig.founded,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phoneRaw,
    priceRange: '₦₦₦',
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      addressCountry: siteConfig.address.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.address.latitude,
      longitude: siteConfig.address.longitude,
    },
    openingHoursSpecification: siteConfig.hours.spec.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    areaServed: siteConfig.serviceAreas.map((area) => ({ '@type': 'Place', name: area })),
    sameAs: siteConfig.socials.map((social) => social.href),
    knowsAbout: [
      'Architectural design',
      'Building construction',
      'Interior architecture',
      'Project management',
      'Building restoration',
    ],
  };
}

/** The site itself, with a search action so Google can offer a sitelinks box. */
export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { '@id': ORG_ID },
    inLanguage: siteConfig.language,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/projects?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * A completed building. Google has no "Building" rich result, but the markup
 * still feeds the knowledge graph and improves entity understanding.
 */
export function projectSchema(project: Project): Json {
  const url = absoluteUrl(`/projects/${project.slug}`);
  const image = project.coverImage?.asset?._ref
    ? urlForImage(project.coverImage, { width: 1200, height: 630 })
    : absoluteUrl(siteConfig.ogImage);

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${url}/#project`,
    name: project.title,
    headline: project.title,
    description: project.excerpt,
    url,
    image,
    dateCreated: project.year,
    creator: { '@id': ORG_ID },
    provider: { '@id': ORG_ID },
    locationCreated: {
      '@type': 'Place',
      name: project.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.location,
        addressCountry: siteConfig.address.countryCode,
      },
    },
    genre: project.category,
    ...(project.area ? { size: project.area } : {}),
    ...(project.client ? { sponsor: { '@type': 'Organization', name: project.client } } : {}),
    inLanguage: siteConfig.language,
  };
}

/** A service we sell. Powers the "services" panel in some result layouts. */
export function serviceSchema(service: Service): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteConfig.url}/services/${service.slug}#service`,
    url: `${siteConfig.url}/services/${service.slug}`,
    name: service.title,
    description: service.summary,
    serviceType: service.title,
    provider: { '@id': ORG_ID },
    areaServed: siteConfig.serviceAreas.map((area) => ({ '@type': 'Place', name: area })),
    ...(service.deliverables?.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `${service.title} deliverables`,
            itemListElement: service.deliverables.map((item, index) => ({
              '@type': 'Offer',
              position: index + 1,
              itemOffered: { '@type': 'Service', name: item },
            })),
          },
        }
      : {}),
  };
}

export function personSchema(member: TeamMember): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    worksFor: { '@id': ORG_ID },
    ...(member.image?.asset?._ref
      ? { image: urlForImage(member.image, { width: 600, height: 600 }) }
      : {}),
    ...(member.linkedin ? { sameAs: [member.linkedin] } : {}),
  };
}

/**
 * Aggregate rating built from real testimonials.
 *
 * Only emitted when there are ratings to aggregate — fabricating a rating is a
 * manual-action risk with Google and a trust problem with everyone else.
 */
export function reviewSchema(testimonials: Testimonial[]): Json | null {
  const rated = testimonials.filter((t) => typeof t.rating === 'number');
  if (rated.length === 0) return null;

  const average = rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: average.toFixed(1),
      reviewCount: rated.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: rated.slice(0, 5).map((t) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5 },
      author: { '@type': 'Person', name: t.author },
      reviewBody: t.quote,
      ...(t.company ? { itemReviewed: { '@type': 'Organization', name: t.company } } : {}),
    })),
  };
}

/** Breadcrumb trail. Improves how the URL line renders in search results. */
export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Ordered list of projects, used on the portfolio index. */
export function itemListSchema(projects: Project[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'DICKALO projects',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/projects/${project.slug}`),
      name: project.title,
    })),
  };
}

export function contactPageSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact DICKALO',
    url: absoluteUrl('/contact'),
    mainEntity: { '@id': ORG_ID },
  };
}

/**
 * Serialise for a <script type="application/ld+json"> tag.
 * `<` is escaped so a value containing "</script>" cannot break out of the tag.
 */
export function jsonLdScript(data: Json | Json[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
