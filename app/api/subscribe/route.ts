import { sendSubscribeWelcome } from '@/lib/api/email';
import {
  errors,
  getClientIp,
  handleApiError,
  jsonError,
  jsonSuccess,
  rateLimit,
  safeJson,
} from '@/lib/api/errorHandler';
import { subscribeSchema, validate } from '@/lib/api/validation';
import { saveSubscriber } from '@/lib/supabase/server';

/**
 * POST /api/subscribe
 *
 * Note the treatment of an existing subscriber: it is a success, not an error.
 * "You are already on the list" is information; "that email is invalid" would
 * be a lie, and telling someone their address is already registered is also a
 * small enumeration leak, so the message stays vague about which it was.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`subscribe:${ip ?? 'unknown'}`, 3, 60_000);

    if (!limit.allowed) {
      const error = errors.rateLimited(limit.retryAfterSeconds);
      return jsonError(error.message, error.code, error.status);
    }

    const body = await safeJson(request);
    if (!body) {
      return jsonError('That request could not be read.', 'VALIDATION_ERROR', 400);
    }

    const result = validate(subscribeSchema, body);

    if (!result.success || !result.data) {
      return jsonError(
        result.fieldErrors?.email ?? 'Check that email address and try again.',
        'VALIDATION_ERROR',
        400,
        result.fieldErrors,
      );
    }

    const { email, name, source, website } = result.data;

    // Honeypot: silently accept so the bot stops trying.
    if (website) {
      return jsonSuccess({ subscribed: true });
    }

    const saved = await saveSubscriber(email, name || undefined, source);

    if (!saved.ok) {
      const error = errors.serviceUnavailable();
      return jsonError(
        'We could not add you just now. Try again in a minute.',
        error.code,
        error.status,
      );
    }

    // Only welcome genuinely new subscribers — a second welcome email to
    // someone already on the list reads as a system that is not paying attention.
    if (!saved.alreadySubscribed) {
      await sendSubscribeWelcome(email);
    }

    return jsonSuccess(
      { subscribed: true, alreadySubscribed: saved.alreadySubscribed ?? false },
      saved.alreadySubscribed ? 'You are already on the list.' : 'You are on the list.',
      201,
    );
  } catch (error) {
    return handleApiError(error, 'subscribe');
  }
}
