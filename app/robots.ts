import type { MetadataRoute } from 'next';
import { buildRobots } from '@/lib/seo/sitemap';

/** robots.txt, generated so the sitemap URL always matches the deployed domain. */
export default function robots(): MetadataRoute.Robots {
  return buildRobots();
}
