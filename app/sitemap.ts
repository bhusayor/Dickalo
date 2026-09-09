import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/seo/sitemap';

/**
 * Dynamic sitemap at /sitemap.xml.
 *
 * Revalidated hourly so a newly published project appears in search without
 * waiting for a deploy.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
