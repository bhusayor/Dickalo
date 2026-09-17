import { groq } from 'next-sanity';
import { sanityFetch } from './client';
import { FALLBACK_PROJECTS, FALLBACK_TESTIMONIALS, SERVICES } from '@/lib/constants';
import type { Project, Service, SiteSettings, TeamMember, Testimonial } from '@/lib/types';

/**
 * GROQ queries.
 *
 * Every projection is explicit. Selecting `...` would ship editor metadata and
 * unresolved references to the browser and make the payload two to three times
 * larger than it needs to be.
 */

// ---------------------------------------------------------------------------
// Shared fragments
// ---------------------------------------------------------------------------

/**
 * Image fragment. `lqip` and `dimensions` come from Sanity's asset metadata, so
 * `next/image` gets a real blur placeholder and the correct aspect ratio
 * without a second round trip.
 */
const imageFragment = groq`{
  _type,
  asset,
  hotspot,
  crop,
  alt,
  caption,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions{ width, height, aspectRatio }
}`;

const seoFragment = groq`{
  metaTitle,
  metaDescription,
  noIndex,
  ogImage ${imageFragment}
}`;

/** Fields needed by a project card. Kept lean — grids render many at once. */
const projectCardFragment = groq`{
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  tagline,
  category,
  status,
  location,
  year,
  area,
  excerpt,
  featured,
  order,
  coverImage ${imageFragment}
}`;

const projectFullFragment = groq`{
  _id,
  _createdAt,
  title,
  "slug": slug.current,
  tagline,
  category,
  status,
  location,
  year,
  client,
  area,
  duration,
  services,
  excerpt,
  body,
  featured,
  order,
  facts[]{ label, value },
  coverImage ${imageFragment},
  gallery[] ${imageFragment},
  seo ${seoFragment}
}`;

// ---------------------------------------------------------------------------
// Query strings (exported so they can be reused in route handlers)
// ---------------------------------------------------------------------------

export const projectsQuery = groq`
  *[_type == "project" && !(_id in path("drafts.**"))]
  | order(coalesce(order, 999) asc, _createdAt desc)
  ${projectCardFragment}
`;

export const featuredProjectsQuery = groq`
  *[_type == "project" && featured == true && !(_id in path("drafts.**"))]
  | order(coalesce(order, 999) asc, _createdAt desc)[0...$limit]
  ${projectCardFragment}
`;

export const projectsByCategoryQuery = groq`
  *[_type == "project" && category == $category && !(_id in path("drafts.**"))]
  | order(coalesce(order, 999) asc, _createdAt desc)
  ${projectCardFragment}
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0]
  ${projectFullFragment}
`;

/**
 * Neighbouring projects for the "next project" control on a detail page.
 * Same category first, then anything else, never the current project.
 */
export const relatedProjectsQuery = groq`
  *[_type == "project" && slug.current != $slug && !(_id in path("drafts.**"))]
  | score(category == $category)
  | order(_score desc, coalesce(order, 999) asc)[0...$limit]
  ${projectCardFragment}
`;

export const projectSlugsQuery = groq`
  *[_type == "project" && defined(slug.current) && !(_id in path("drafts.**"))].slug.current
`;

export const servicesQuery = groq`
  *[_type == "service" && !(_id in path("drafts.**"))]
  | order(coalesce(order, 999) asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    description,
    icon,
    deliverables,
    order,
    image ${imageFragment}
  }
`;

export const teamQuery = groq`
  *[_type == "teamMember" && !(_id in path("drafts.**"))]
  | order(coalesce(order, 999) asc) {
    _id,
    name,
    role,
    bio,
    credentials,
    linkedin,
    email,
    order,
    image ${imageFragment}
  }
`;

export const testimonialsQuery = groq`
  *[_type == "testimonial" && !(_id in path("drafts.**"))]
  | order(featured desc, _createdAt desc) {
    _id,
    quote,
    author,
    role,
    company,
    rating,
    featured,
    image ${imageFragment},
    project->{ title, "slug": slug.current }
  }
`;

export const settingsQuery = groq`
  *[_type == "siteSettings"][0] {
    _id,
    title,
    description,
    email,
    phone,
    address,
    socials[]{ platform, url },
    stats[]{ label, value, suffix },
    ogImage ${imageFragment}
  }
`;

// ---------------------------------------------------------------------------
// Cache tags — mirrored by /api/revalidate
// ---------------------------------------------------------------------------

export const CACHE_TAGS = {
  projects: 'projects',
  services: 'services',
  team: 'team',
  testimonials: 'testimonials',
  settings: 'settings',
} as const;

// ---------------------------------------------------------------------------
// Typed fetchers
// ---------------------------------------------------------------------------

export function getProjects(preview = false): Promise<Project[]> {
  return sanityFetch<Project[]>(projectsQuery, {}, FALLBACK_PROJECTS, {
    preview,
    tags: [CACHE_TAGS.projects],
  });
}

export function getFeaturedProjects(limit = 4, preview = false): Promise<Project[]> {
  return sanityFetch<Project[]>(
    featuredProjectsQuery,
    { limit },
    FALLBACK_PROJECTS.filter((p) => p.featured).slice(0, limit),
    { preview, tags: [CACHE_TAGS.projects] },
  );
}

export function getProjectsByCategory(category: string, preview = false): Promise<Project[]> {
  return sanityFetch<Project[]>(
    projectsByCategoryQuery,
    { category },
    FALLBACK_PROJECTS.filter((p) => p.category === category),
    { preview, tags: [CACHE_TAGS.projects] },
  );
}

export function getProjectBySlug(slug: string, preview = false): Promise<Project | null> {
  return sanityFetch<Project | null>(
    projectBySlugQuery,
    { slug },
    FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null,
    { preview, tags: [CACHE_TAGS.projects, `project:${slug}`] },
  );
}

export function getRelatedProjects(
  slug: string,
  category: string,
  limit = 3,
  preview = false,
): Promise<Project[]> {
  return sanityFetch<Project[]>(
    relatedProjectsQuery,
    { slug, category, limit },
    FALLBACK_PROJECTS.filter((p) => p.slug !== slug).slice(0, limit),
    { preview, tags: [CACHE_TAGS.projects] },
  );
}

export function getProjectSlugs(): Promise<string[]> {
  return sanityFetch<string[]>(
    projectSlugsQuery,
    {},
    FALLBACK_PROJECTS.map((p) => p.slug),
    { tags: [CACHE_TAGS.projects] },
  );
}

export function getServices(preview = false): Promise<Service[]> {
  return sanityFetch<Service[]>(servicesQuery, {}, SERVICES, {
    preview,
    tags: [CACHE_TAGS.services],
  });
}

export function getTeam(preview = false): Promise<TeamMember[]> {
  return sanityFetch<TeamMember[]>(teamQuery, {}, FALLBACK_TEAM, {
    preview,
    tags: [CACHE_TAGS.team],
  });
}

export function getTestimonials(preview = false): Promise<Testimonial[]> {
  return sanityFetch<Testimonial[]>(testimonialsQuery, {}, FALLBACK_TESTIMONIALS, {
    preview,
    tags: [CACHE_TAGS.testimonials],
  });
}

export function getSettings(preview = false): Promise<SiteSettings | null> {
  return sanityFetch<SiteSettings | null>(settingsQuery, {}, null, {
    preview,
    tags: [CACHE_TAGS.settings],
  });
}

/**
 * Fallback team. Lives here rather than in constants because it is only ever
 * used as a CMS fallback, and keeping it next to the query makes the shape
 * obvious.
 */
export const FALLBACK_TEAM: TeamMember[] = [
  {
    _id: 'tm-1',
    name: 'Chidi Okafor',
    role: 'Founder & Principal Architect',
    bio: 'Leads the studio and reviews every project at key design and construction stages. His work keeps the original brief intact through handover.',
    imageUrl: '/images/team/chidi-okafor.webp',
    credentials: ['ARCON registered', 'M.Arch, University of Lagos'],
    order: 1,
  },
  {
    _id: 'tm-2',
    name: 'Amara Eze',
    role: 'Director of Construction',
    bio: 'Leads construction planning and site delivery across Nigeria. She keeps programme, quality and procurement moving toward handover.',
    imageUrl: '/images/team/amara-eze.webp',
    credentials: ['COREN registered', 'B.Eng Civil Engineering, UNN'],
    order: 2,
  },
  {
    _id: 'tm-3',
    name: 'Segun Adeyemi',
    role: 'Head of Design',
    bio: 'Leads concept and technical design from the first site study through coordinated drawings. He turns ambitious ideas into buildable details.',
    imageUrl: '/images/team/segun-adeyemi.webp',
    credentials: ['ARCON registered', 'M.Arch, TU Delft'],
    order: 3,
  },
  {
    _id: 'tm-4',
    name: 'Ngozi Umeh',
    role: 'Head of Interiors',
    bio: 'Leads interior planning, material specification and installation. She makes every finish practical to source and maintain in Nigeria.',
    imageUrl: '/images/team/ngozi-umeh.webp',
    credentials: ['IDAN member', 'BA Interior Architecture, Kingston'],
    order: 4,
  },
];
