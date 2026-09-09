'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

/**
 * Sanity Studio, mounted at /studio.
 *
 * Editors log in here with the same domain as the site, so preview links work
 * without a cross-origin session. Excluded from the sitemap and disallowed in
 * robots.txt.
 */
export const dynamic = 'force-static';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
