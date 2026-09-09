import { NextResponse } from 'next/server';
import { handleApiError, jsonError } from '@/lib/api/errorHandler';
import { getProjectBySlug, getRelatedProjects } from '@/lib/sanity/queries';
import { REVALIDATE_SECONDS } from '@/lib/constants';

/**
 * GET /api/projects/[id]
 *
 * `id` is the project slug — human-readable identifiers are what the rest of
 * the site routes on, and exposing Sanity's internal document ids in a public
 * URL would tie the API to the CMS.
 *
 * Returns the project plus up to three related ones, so a client rendering a
 * detail view needs a single request.
 */
export const revalidate = REVALIDATE_SECONDS;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const slug = params.id;

    if (!slug || slug.length > 120) {
      return jsonError('That is not a project we recognise.', 'VALIDATION_ERROR', 400);
    }

    const project = await getProjectBySlug(slug);

    if (!project) {
      return jsonError('No project with that address exists.', 'NOT_FOUND', 404);
    }

    const related = await getRelatedProjects(slug, project.category, 3);

    return NextResponse.json(
      { success: true, data: { project, related } },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      },
    );
  } catch (error) {
    return handleApiError(error, 'projects/[id]');
  }
}
