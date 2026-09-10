import { createClient, type SanityClient } from 'next-sanity';

/**
 * Sanity clients.
 *
 * Two clients, deliberately:
 * - `sanityClient` is CDN-backed and anonymous. Used for all published content.
 * - `previewClient` is token-authenticated and bypasses the CDN. Used only in
 *   draft mode.
 *
 * `isSanityConfigured` lets callers fall back to `lib/constants.ts` content so
 * a clone without credentials still renders a complete site.
 */

const DEFAULT_DATASET = 'production';
const DEFAULT_API_VERSION = '2024-10-01';

/**
 * Vercel treats an environment variable that exists with an empty value as an
 * empty string. Nullish coalescing does not catch that case, and Sanity throws
 * while this module is imported, before the site's fallback content can run.
 * Normalize public CMS settings before creating the client so an incomplete
 * optional CMS setup can never stop a production build.
 */
const configuredProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? '';
const configuredDataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? '';
const configuredApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() ?? '';

const isValidApiVersion = (value: string) => value === '1' || /^\d{4}-\d{2}-\d{2}$/.test(value);
const isValidDataset = (value: string) => /^[a-z0-9][a-z0-9_-]*$/.test(value);
const isValidProjectId = (value: string) =>
  value !== 'your_project_id' && /^[a-z0-9][a-z0-9-]*$/.test(value);

export const projectId = isValidProjectId(configuredProjectId) ? configuredProjectId : '';
export const dataset = isValidDataset(configuredDataset) ? configuredDataset : DEFAULT_DATASET;
export const apiVersion = isValidApiVersion(configuredApiVersion)
  ? configuredApiVersion
  : DEFAULT_API_VERSION;

/** True only when a real project id is present. */
export const isSanityConfigured = projectId.length > 0;

export const sanityClient: SanityClient = createClient({
  projectId: projectId || 'placeholder',
  dataset,
  apiVersion,
  // The CDN serves published content from the edge. Never used with a token.
  useCdn: true,
  perspective: 'published',
});

/** Token client for draft previews. Falls back to the public client if unset. */
export const previewClient: SanityClient = process.env.SANITY_API_READ_TOKEN
  ? sanityClient.withConfig({
      token: process.env.SANITY_API_READ_TOKEN,
      useCdn: false,
      perspective: 'previewDrafts',
      ignoreBrowserTokenWarning: true,
    })
  : sanityClient;

export function getClient(preview = false): SanityClient {
  return preview ? previewClient : sanityClient;
}

export interface FetchOptions {
  preview?: boolean;
  /** ISR window in seconds. `false` opts out of caching entirely. */
  revalidate?: number | false;
  /** Cache tags for on-demand revalidation from /api/revalidate. */
  tags?: string[];
}

/**
 * Typed GROQ fetch with a fallback.
 *
 * If Sanity is not configured, or the query fails, the fallback is returned and
 * the error is logged. A CMS outage should degrade the page, never break it.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T,
  options: FetchOptions = {},
): Promise<T> {
  const { preview = false, revalidate = 1800, tags } = options;

  if (!isSanityConfigured) return fallback;

  try {
    const client = getClient(preview);
    const result = await client.fetch<T>(query, params, {
      // Draft content must never be cached.
      cache: preview ? 'no-store' : 'force-cache',
      next: preview ? undefined : { revalidate: revalidate === false ? 0 : revalidate, tags },
    });

    // A query that legitimately resolves to null (missing document) should not
    // silently become the fallback list — but an empty array should.
    if (result === null || result === undefined) return fallback;
    if (Array.isArray(result) && result.length === 0 && Array.isArray(fallback)) {
      return fallback;
    }
    return result;
  } catch (error) {
    console.error('[sanity] Query failed, serving fallback content.', {
      query: query.slice(0, 120),
      error: error instanceof Error ? error.message : error,
    });
    return fallback;
  }
}
