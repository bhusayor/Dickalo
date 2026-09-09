import { NextResponse } from 'next/server';
import { handleApiError, jsonError } from '@/lib/api/errorHandler';
import { projectQuerySchema } from '@/lib/api/validation';
import { getProjects, getProjectsByCategory } from '@/lib/sanity/queries';

/**
 * GET /api/projects
 *
 * Public read endpoint, used by the portfolio grid's client-side filtering and
 * available to anything else that wants the list as JSON.
 *
 * Query parameters:
 *   category  one of the six project categories
 *   featured  "true" | "false"
 *   limit     1–100, default 50
 *   offset    pagination offset
 */
/**
 * Reading `searchParams` makes this route inherently dynamic, so Next cannot
 * prerender it. Caching is handled at the CDN instead, via the Cache-Control
 * header on the response — which is where it belongs for a filtered endpoint.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = projectQuerySchema.safeParse({
      category: searchParams.get('category') ?? undefined,
      featured: searchParams.get('featured') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(
        'One of those filters is not a value we recognise.',
        'VALIDATION_ERROR',
        400,
      );
    }

    const { category, featured, limit, offset } = parsed.data;

    const all = category ? await getProjectsByCategory(category) : await getProjects();
    const filtered = featured === undefined ? all : all.filter((p) => p.featured === featured);
    const page = filtered.slice(offset, offset + limit);

    return NextResponse.json(
      {
        success: true,
        data: page,
        meta: {
          total: filtered.length,
          limit,
          offset,
          hasMore: offset + limit < filtered.length,
        },
      },
      {
        headers: {
          // Serve from cache for 30 minutes, then keep serving the stale copy
          // for an hour while the fresh one is fetched in the background.
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      },
    );
  } catch (error) {
    return handleApiError(error, 'projects');
  }
}
