import { NextResponse } from 'next/server';
import { sendContactEmails } from '@/lib/api/email';
import {
  errors,
  getClientIp,
  handleApiError,
  jsonError,
  jsonSuccess,
  rateLimit,
  rateLimitHeaders,
  safeJson,
} from '@/lib/api/errorHandler';
import { contactSchema, validate } from '@/lib/api/validation';
import {
  countRecentSubmissions,
  hashIp,
  markEmailSent,
  saveContactSubmission,
  saveProjectInquiry,
} from '@/lib/supabase/server';
import { RATE_LIMIT } from '@/lib/constants';

/**
 * POST /api/contact
 *
 * Order of operations matters here. The email is sent before the database write
 * is confirmed, because an enquiry that reaches a human but is missing from the
 * table is a minor annoyance; one stored quietly and never read is a lost job.
 *
 * Node runtime rather than edge: Resend's SDK and the crypto hashing both want
 * Node APIs.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ContactBody {
  projectSlug?: string;
  projectTitle?: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    // --- Rate limit, layer 1: in-memory, per instance -----------------------
    const ip = getClientIp(request);
    const limitKey = `contact:${ip ?? 'unknown'}`;
    const limit = rateLimit(limitKey, RATE_LIMIT.maxRequests, RATE_LIMIT.windowMs);

    if (!limit.allowed) {
      const error = errors.rateLimited(limit.retryAfterSeconds);
      return jsonError(
        error.message,
        error.code,
        error.status,
        undefined,
        rateLimitHeaders(limit, RATE_LIMIT.maxRequests),
      );
    }

    // --- Parse and validate ------------------------------------------------
    const body = await safeJson<ContactBody>(request);
    if (!body) {
      return jsonError('That request could not be read.', 'VALIDATION_ERROR', 400);
    }

    const result = validate(contactSchema, body);

    if (!result.success || !result.data) {
      const error = errors.validation(result.fieldErrors ?? {});
      return jsonError(error.message, error.code, error.status, error.fieldErrors);
    }

    const input = result.data;

    // --- Honeypot ----------------------------------------------------------
    // A filled honeypot is a bot. Return 200 so the bot believes it succeeded
    // and does not retry with a different strategy.
    if (input.website) {
      console.info('[api:contact] honeypot triggered; discarding submission.');
      return jsonSuccess({ received: true }, 'Thank you.');
    }

    // --- Rate limit, layer 2: durable, shared across instances --------------
    const ipHash = hashIp(ip);
    if (ipHash) {
      const recent = await countRecentSubmissions(ipHash, 60 * 60 * 1000);
      // Six in an hour is well past anyone with a genuine enquiry.
      if (recent >= 6) {
        const error = errors.rateLimited(600);
        return jsonError(error.message, error.code, error.status);
      }
    }

    // --- Store -------------------------------------------------------------
    const stored = await saveContactSubmission({
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      company: input.company || null,
      project_type: input.projectType,
      budget: input.budget ?? null,
      location: input.location || null,
      message: input.message,
      consent: input.consent,
      source: body.projectSlug ? 'project-page' : 'contact-page',
      referrer: request.headers.get('referer'),
      user_agent: request.headers.get('user-agent'),
      ip_hash: ipHash,
    });

    // Attribute the enquiry to a project when it came from a project page.
    if (stored.ok && body.projectSlug) {
      await saveProjectInquiry({
        project_slug: body.projectSlug,
        project_title: body.projectTitle ?? null,
        submission_id: stored.data?.id ?? null,
        name: input.name,
        email: input.email,
        message: input.message,
      });
    }

    // --- Notify ------------------------------------------------------------
    const emailResult = await sendContactEmails(input);

    if (emailResult.ok && stored.data?.id) {
      await markEmailSent(stored.data.id);
    }

    /**
     * If both the store and the send failed, the enquiry is genuinely lost —
     * say so, and give the visitor a route that does not depend on us.
     */
    if (!stored.ok && !emailResult.ok) {
      console.error('[api:contact] enquiry lost — storage and email both failed.', {
        storage: stored.error,
        email: emailResult.error,
      });
      const error = errors.serviceUnavailable();
      return jsonError(
        'We could not deliver that. Please email studio@dickalo.com directly and we will pick it up there.',
        error.code,
        error.status,
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { id: stored.data?.id ?? null },
        message: 'Your enquiry is with the studio.',
      },
      { status: 201, headers: rateLimitHeaders(limit, RATE_LIMIT.maxRequests) },
    );
  } catch (error) {
    return handleApiError(error, 'contact');
  }
}

/** Anything other than POST. Advertises what is allowed. */
export async function GET() {
  return jsonError('Send enquiries with POST.', 'VALIDATION_ERROR', 405);
}
