import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { handleApiError, jsonError, safeJson } from '@/lib/api/errorHandler';
import { CACHE_TAGS } from '@/lib/sanity/queries';

/**
 * POST /api/revalidate
 *
 * Sanity webhook target. When an editor publishes, this purges only the cache
 * tags that document type touches, so a testimonial edit does not rebuild the
 * whole portfolio.
 *
 * Configure in Sanity: Manage → API → Webhooks
 *   URL:     https://dickalo.com/api/revalidate?secret=<REVALIDATE_SECRET>
 *   Trigger: Create, Update, Delete
 *   Payload: {"_type": "_type", "slug": "slug.current"}
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface WebhookPayload {
  _type?: string;
  slug?: string;
}

/** Which cache tags and paths each document type invalidates. */
const INVALIDATION: Record<string, { tags: string[]; paths: string[] }> = {
  project: { tags: [CACHE_TAGS.projects], paths: ['/', '/projects'] },
  service: { tags: [CACHE_TAGS.services], paths: ['/', '/services'] },
  teamMember: { tags: [CACHE_TAGS.team], paths: ['/about'] },
  testimonial: { tags: [CACHE_TAGS.testimonials], paths: ['/'] },
  siteSettings: { tags: [CACHE_TAGS.settings], paths: ['/'] },
};

export async function POST(request: Request) {
  try {
    const secret = new URL(request.url).searchParams.get('secret');
    const expected = process.env.REVALIDATE_SECRET;

    if (!expected) {
      console.error('[api:revalidate] REVALIDATE_SECRET is not set; refusing to revalidate.');
      return jsonError('Revalidation is not configured.', 'SERVICE_UNAVAILABLE', 503);
    }

    if (secret !== expected) {
      // Deliberately vague — a precise message helps someone guessing.
      return jsonError('Not authorised.', 'UNAUTHORIZED', 401);
    }

    const payload = await safeJson<WebhookPayload>(request);
    const type = payload?._type;

    if (!type) {
      return jsonError('The webhook payload had no _type.', 'VALIDATION_ERROR', 400);
    }

    const rule = INVALIDATION[type];

    if (!rule) {
      // An unknown type is not an error — it is a document type we do not render.
      return NextResponse.json({
        success: true,
        data: { revalidated: false, reason: `No cached routes depend on "${type}".` },
      });
    }

    rule.tags.forEach((tag) => revalidateTag(tag));
    rule.paths.forEach((path) => revalidatePath(path));

    // A project also has its own page, which needs purging by slug.
    if (type === 'project' && payload?.slug) {
      revalidateTag(`project:${payload.slug}`);
      revalidatePath(`/projects/${payload.slug}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        revalidated: true,
        type,
        tags: rule.tags,
        paths: rule.paths,
        at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, 'revalidate');
  }
}

/** Health check, so the webhook URL can be verified without publishing. */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'ready',
      configured: Boolean(process.env.REVALIDATE_SECRET),
      types: Object.keys(INVALIDATION),
    },
  });
}
