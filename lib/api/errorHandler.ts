import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { toFieldErrors } from './validation';
import type { ApiErrorCode, ApiResponse } from '@/lib/types';

/**
 * API error handling.
 *
 * Two audiences, two messages: the console gets the cause, the visitor gets a
 * sentence they can act on. Internal detail never crosses that line.
 */

/** Errors we raise deliberately, with a status and a public message. */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode = 'INTERNAL_ERROR',
    public readonly status: number = 500,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errors = {
  validation: (fieldErrors: Record<string, string>) =>
    new AppError('Some details need checking before we can send this.', 'VALIDATION_ERROR', 400, fieldErrors),

  rateLimited: (retryAfterSeconds: number) =>
    new AppError(
      `That is a few messages in quick succession. Try again in ${Math.ceil(retryAfterSeconds)} seconds.`,
      'RATE_LIMITED',
      429,
    ),

  notFound: (what = 'That page') => new AppError(`${what} does not exist.`, 'NOT_FOUND', 404),

  unauthorized: () => new AppError('You are not allowed to do that.', 'UNAUTHORIZED', 401),

  serviceUnavailable: () =>
    new AppError(
      'We could not reach the service that handles this. Try again in a minute.',
      'SERVICE_UNAVAILABLE',
      503,
    ),

  internal: () =>
    new AppError(
      'Something broke on our side. Not your fault — try again, or email studio@dickalo.com.',
      'INTERNAL_ERROR',
      500,
    ),
} as const;

export function jsonSuccess<T>(data: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function jsonError(
  error: string,
  code: ApiErrorCode,
  status: number,
  fieldErrors?: Record<string, string>,
  headers?: HeadersInit,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, error, code, fieldErrors }, { status, headers });
}

/**
 * Convert anything thrown inside a route handler into a safe JSON response.
 * Wrap every handler body in try/catch and pass the caught value here.
 */
export function handleApiError(error: unknown, context: string): NextResponse<ApiResponse<never>> {
  // Zod errors that escaped explicit validation.
  if (error instanceof ZodError) {
    const fieldErrors = toFieldErrors(error);
    console.warn(`[api:${context}] validation failed`, fieldErrors);
    return jsonError(
      'Some details need checking before we can send this.',
      'VALIDATION_ERROR',
      400,
      fieldErrors,
    );
  }

  if (error instanceof AppError) {
    // Client mistakes are warnings; server faults are errors.
    const log = error.status >= 500 ? console.error : console.warn;
    log(`[api:${context}] ${error.code}: ${error.message}`);
    return jsonError(error.message, error.code, error.status, error.fieldErrors);
  }

  // Anything else is a bug. Log the real cause, return a generic message.
  console.error(`[api:${context}] unhandled`, error);
  const fallback = errors.internal();
  return jsonError(fallback.message, fallback.code, fallback.status);
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory sliding window.
 *
 * This is per-instance, so on serverless it only limits bursts that hit the
 * same warm lambda. It is the first line, not the only one — the contact route
 * also checks Supabase, which is shared across instances.
 */
const buckets = new Map<string, Bucket>();

/** Bounded so a flood of unique keys cannot grow the map without limit. */
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, maxRequests = 5, windowMs = 60_000): RateLimitResult {
  const now = Date.now();

  // Opportunistic sweep of expired buckets.
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: (existing.resetAt - now) / 1000,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Best-effort client IP behind Vercel's proxy. `x-forwarded-for` can hold a
 * chain; the first entry is the original client.
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? null;
}

/** Standard rate-limit headers so clients can back off intelligently. */
export function rateLimitHeaders(result: RateLimitResult, limit: number): HeadersInit {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    ...(result.retryAfterSeconds > 0
      ? { 'Retry-After': String(Math.ceil(result.retryAfterSeconds)) }
      : {}),
  };
}

/**
 * Parse a JSON body without letting a malformed payload become a 500.
 * Returns `null` on anything unparseable.
 */
export async function safeJson<T = unknown>(request: Request): Promise<T | null> {
  try {
    const text = await request.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
