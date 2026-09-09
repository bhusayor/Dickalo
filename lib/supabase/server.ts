import 'server-only';

import { createHash } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  ContactSubmissionInsert,
  ContactSubmissionRow,
  Database,
  NewsletterSubscriberRow,
  ProjectInquiryInsert,
} from './types';

/**
 * Server-side Supabase access.
 *
 * The service role key bypasses Row Level Security, which is exactly why this
 * file is marked `server-only`: importing it from a client component is a build
 * error rather than a security incident.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const isServerSupabaseConfigured =
  supabaseUrl.startsWith('https://') && serviceRoleKey.length > 20;

let adminClient: SupabaseClient<Database> | null = null;

/** Admin client, or null when credentials are absent. */
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  if (!isServerSupabaseConfigured) return null;

  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-application-name': 'dickalo-server' } },
    });
  }

  return adminClient;
}

/**
 * Hash an IP address before storing it.
 *
 * We need to recognise repeat submitters for rate limiting, but we do not need
 * to know who they are. Salting with a server secret means the hashes are
 * useless if the table leaks.
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.REVALIDATE_SECRET ?? 'dickalo-static-salt';
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 32);
}

export interface PersistResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Store a contact enquiry.
 *
 * Returns `ok: false` rather than throwing so the route handler can still send
 * the notification email and give the visitor a success message. Losing a row
 * is bad; losing the enquiry entirely is worse.
 */
export async function saveContactSubmission(
  payload: ContactSubmissionInsert,
): Promise<PersistResult<ContactSubmissionRow>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured; enquiry was not stored.' };
  }

  const { data, error } = await supabase
    .from('contact_submissions')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[supabase] contact_submissions insert failed', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, data };
}

/** Link an enquiry to the project page it came from. */
export async function saveProjectInquiry(
  payload: ProjectInquiryInsert,
): Promise<PersistResult<null>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' };

  const { error } = await supabase.from('project_inquiries').insert(payload);

  if (error) {
    console.error('[supabase] project_inquiries insert failed', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export interface SubscribeResult {
  ok: boolean;
  /** True when the address was already on the list — not an error state. */
  alreadySubscribed?: boolean;
  error?: string;
}

/**
 * Add a subscriber.
 *
 * Re-subscribing an existing address reactivates it instead of failing on the
 * unique index, so someone who unsubscribed and changed their mind is not told
 * their email is invalid.
 */
export async function saveSubscriber(
  email: string,
  name?: string,
  source = 'footer',
): Promise<SubscribeResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' };

  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'active') {
      return { ok: true, alreadySubscribed: true };
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'active', unsubscribed_at: null })
      .eq('id', existing.id);

    if (error) {
      console.error('[supabase] resubscribe failed', error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, name, source, status: 'active' });

  if (error) {
    // 23505 is a unique violation — a race with a concurrent signup.
    if (error.code === '23505') return { ok: true, alreadySubscribed: true };
    console.error('[supabase] subscribe failed', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** Mark a subscriber as unsubscribed using their token. */
export async function unsubscribeByToken(token: string): Promise<PersistResult<null>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' };

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Count submissions from one hashed IP inside a window. Backs the durable half
 * of the rate limiter, which survives serverless cold starts where the
 * in-memory limiter does not.
 */
export async function countRecentSubmissions(ipHash: string, windowMs: number): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !ipHash) return 0;

  const since = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await supabase
    .from('contact_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);

  if (error) {
    console.error('[supabase] rate limit lookup failed', error.message);
    return 0;
  }

  return count ?? 0;
}

/** Flag that the notification email went out, so failures are visible later. */
export async function markEmailSent(submissionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from('contact_submissions').update({ email_sent: true }).eq('id', submissionId);
}

export type { NewsletterSubscriberRow };
