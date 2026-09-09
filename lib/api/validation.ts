import { z } from 'zod';

/**
 * Form validation.
 *
 * The same schemas run on the client and on the server, so a message can never
 * be accepted in one place and rejected in the other.
 *
 * Error messages are written as full sentences that say what to do. "Invalid
 * input" tells someone they failed; "That email address is missing an @" tells
 * them how to succeed.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const nameSchema = z
  .string({ required_error: 'We need a name to address you by.' })
  .trim()
  .min(2, 'That looks too short to be a name.')
  .max(100, 'Names on this form are limited to 100 characters.')
  // Letters, spaces, hyphens and apostrophes — enough for Nigerian, European
  // and hyphenated names without rejecting anyone legitimate.
  .regex(/^[\p{L}\p{M}\s'’-]+$/u, 'Please use letters only, without numbers or symbols.');

const emailSchema = z
  .string({ required_error: 'We need an email address to reply to.' })
  .trim()
  .toLowerCase()
  .min(1, 'We need an email address to reply to.')
  .email('That email address looks incomplete. Check for a missing @ or dot.')
  .max(254, 'That email address is too long to be real.');

/**
 * Nigerian and international numbers, loosely. Deliberately permissive: a
 * rejected phone number costs an enquiry, and a wrong one costs a phone call.
 */
const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^[+]?[\d\s()-]{7,20}$/,
    'That phone number has characters we do not recognise. Digits, spaces and + only.',
  )
  .optional()
  .or(z.literal(''));

/**
 * Honeypot. A real person never sees this field, so anything in it is a bot.
 *
 * Deliberately permissive: rejecting it here would return a validation error
 * that tells the bot exactly which field gave it away. The route handlers
 * detect a non-empty value themselves and return a fake success instead.
 */
const honeypotSchema = z.string().max(200).optional();

// ---------------------------------------------------------------------------
// Contact form
// ---------------------------------------------------------------------------

export const projectTypeSchema = z.enum(
  ['residential', 'commercial', 'interior', 'renovation', 'consultancy', 'other'],
  { errorMap: () => ({ message: 'Pick the closest option — we can refine it when we talk.' }) },
);

export const budgetSchema = z
  .enum(['under-25m', '25m-100m', '100m-500m', 'over-500m', 'not-sure'])
  .optional();

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().trim().max(120, 'That company name is longer than we can store.').optional().or(z.literal('')),
  projectType: projectTypeSchema,
  budget: budgetSchema,
  location: z
    .string()
    .trim()
    .max(160, 'Just the area and city is plenty.')
    .optional()
    .or(z.literal('')),
  message: z
    .string({ required_error: 'Tell us a little about the project.' })
    .trim()
    .min(20, 'A sentence or two more, please. Site, size and timing help us most.')
    .max(5000, 'That is longer than this form can take. Email us the full brief instead.'),
  website: honeypotSchema,
  consent: z.literal(true, {
    errorMap: () => ({ message: 'We need your permission before we can reply.' }),
  }),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Project-page enquiry: the same shape plus where it came from. */
export const projectInquirySchema = contactSchema.extend({
  projectSlug: z.string().min(1),
  projectTitle: z.string().optional(),
});

export type ProjectInquiryInput = z.infer<typeof projectInquirySchema>;

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export const subscribeSchema = z.object({
  email: emailSchema,
  name: z.string().trim().max(100).optional().or(z.literal('')),
  source: z.string().max(60).optional(),
  website: honeypotSchema,
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

export const projectQuerySchema = z.object({
  category: z
    .enum(['residential', 'commercial', 'hospitality', 'interior', 'mixed-use', 'institutional'])
    .optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ProjectQuery = z.infer<typeof projectQuerySchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Flatten a ZodError into `{ fieldName: message }`.
 *
 * Only the first error per field is kept. Showing someone three problems with
 * one field at once makes them fix none of them.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.errors) {
    const key = issue.path.join('.') || 'form';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  fieldErrors?: Record<string, string>;
  /** A single summary line for a screen-reader announcement or a toast. */
  summary?: string;
}

/** Validate and shape the result for a form to consume directly. */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): ValidationResult<z.infer<T>> {
  const parsed = schema.safeParse(input);

  if (parsed.success) return { success: true, data: parsed.data };

  const fieldErrors = toFieldErrors(parsed.error);
  const count = Object.keys(fieldErrors).length;

  return {
    success: false,
    fieldErrors,
    summary:
      count === 1
        ? 'One field needs attention before we can send this.'
        : `${count} fields need attention before we can send this.`,
  };
}
