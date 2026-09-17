import type { MetadataRoute } from 'next';
import { getProjectSlugs } from '@/lib/sanity/queries';
import { SERVICES } from '@/lib/constants';
import { absoluteUrl } from '@/lib/utils';

/**
 * Sitemap generation.
 *
 * Priorities reflect what actually earns traffic: the homepage and the
 * portfolio, then services, then everything else. `changeFrequency` is a hint
 * search engines mostly ignore, but it costs nothing to be accurate.
 */

interface Route {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}

export const STATIC_ROUTES: Route[] = [
  { path: '/', priority: 1.0, changeFrequency: 'monthly' },
  { path: '/projects', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  ...SERVICES.map((service) => ({
    path: `/services/${service.slug}`,
    priority: 0.75,
    changeFrequency: 'monthly' as const,
  })),
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

/** Routes that must never appear in the sitemap or be crawled. */
export const EXCLUDED_ROUTES = ['/studio', '/api', '/contact/thank-you'];

export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // A CMS outage should produce a smaller sitemap, not a build failure.
  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getProjectSlugs();
    projectEntries = slugs.map((slug) => ({
      url: absoluteUrl(`/projects/${slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('[sitemap] Could not load project slugs.', error);
  }

  return [...staticEntries, ...projectEntries];
}

/** robots.txt body, generated so the sitemap URL cannot drift from the domain. */
export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: EXCLUDED_ROUTES,
      },
      // Aggressive scrapers that add load and return nothing.
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'],
        disallow: '/',
      },
    ],
    // Two entries: the dynamic route, and the static file next-sitemap
    // writes at build time as a fallback.
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/sitemap-static.xml')],
    host: absoluteUrl(),
  };
}
