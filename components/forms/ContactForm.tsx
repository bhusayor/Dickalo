'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Button } from '@/components/common/Button';
import {
  CheckboxField,
  Honeypot,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/forms/FormField';
import { fadeUp, transitions } from '@/lib/animations/transitions';
import { BUDGET_OPTIONS, COPY, PROJECT_TYPE_OPTIONS } from '@/lib/constants';
import { contactSchema, validate, type ContactInput } from '@/lib/api/validation';
import type { ApiResponse, FormStatus } from '@/lib/types';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  projectType: '',
  budget: '',
  location: '',
  message: '',
  website: '',
  consent: false,
};

type FormState = typeof EMPTY_FORM;

export interface ContactFormProps {
  /** Set on a project page so the enquiry is attributed to that project. */
  projectSlug?: string;
  projectTitle?: string;
  /** Navigate to /contact/thank-you instead of showing inline success. */
  redirectOnSuccess?: boolean;
  className?: string;
}

/**
 * Contact form.
 *
 * Validation strategy is the important part. Fields are validated on blur only
 * after the first submit attempt, never while someone is still typing their
 * first character. Telling someone their email is invalid when they have typed
 * "a" is technically true and completely unhelpful.
 */
export function ContactForm({
  projectSlug,
  projectTitle,
  redirectOnSuccess = false,
  className,
}: ContactFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    // Clear an error the moment the person starts fixing it.
    setErrors((previous) => {
      if (!previous[key as string]) return previous;
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  }, []);

  /** Validate one field on blur, but only after a failed submit. */
  const validateField = useCallback(
    (key: keyof FormState) => {
      if (!submitted) return;

      const result = validate(contactSchema, {
        ...form,
        projectType: form.projectType || undefined,
      });
      const message = result.fieldErrors?.[key as string];

      setErrors((previous) => {
        const next = { ...previous };
        if (message) next[key as string] = message;
        else delete next[key as string];
        return next;
      });
    },
    [form, submitted],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setServerMessage('');

    const payload = {
      ...form,
      projectType: form.projectType || undefined,
      budget: form.budget || undefined,
    };

    const result = validate(contactSchema, payload);

    if (!result.success) {
      setErrors(result.fieldErrors ?? {});
      setStatus('error');
      setServerMessage(result.summary ?? '');

      // Move focus to the summary so a screen-reader user hears the problem
      // instead of silently landing back on a broken field.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus('submitting');
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(result.data as ContactInput),
          ...(projectSlug ? { projectSlug, projectTitle } : {}),
        }),
      });

      const body = (await response.json()) as ApiResponse<{ id?: string }>;

      if (!body.success) {
        setStatus('error');
        setErrors(body.fieldErrors ?? {});
        setServerMessage(body.error);
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }

      setStatus('success');
      setForm(EMPTY_FORM);
      setSubmitted(false);

      if (redirectOnSuccess) {
        router.push('/contact/thank-you');
      } else {
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    } catch {
      // Network failure, not a validation failure — say so, and give a way out.
      setStatus('error');
      setServerMessage(COPY.form.errorBody);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  };

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------

  if (status === 'success' && !redirectOnSuccess) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className={cn(
          'hairline-gold flex flex-col gap-5 rounded-md bg-surface-raised p-8 md:p-10',
          className,
        )}
        ref={summaryRef}
        tabIndex={-1}
        role="status"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gold text-black">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 10.5l4 4 8-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="font-display text-display-sm text-content-primary">
          {COPY.form.successTitle}
        </h3>
        <p className="max-w-measure text-body-lg text-content-secondary">{COPY.form.successBody}</p>
        <p className="text-body-sm text-content-muted">
          Nothing arrived? Email us directly at{' '}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="link-underline text-content-accent"
          >
            {siteConfig.contact.email}
          </a>
          .
        </p>
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const isSubmitting = status === 'submitting';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('relative flex flex-col gap-8', className)}
    >
      <Honeypot value={form.website} onChange={(value) => setField('website', value)} />

      {/* Error summary. Focusable, so submission failures are announced. */}
      <AnimatePresence>
        {status === 'error' && serverMessage ? (
          <motion.div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={transitions.fast}
            className="bg-danger/8 rounded-sm border-l-2 border-danger px-4 py-3.5 outline-none"
          >
            <p className="text-body-sm font-medium text-content-primary">{COPY.form.errorTitle}</p>
            <p className="mt-1 text-body-sm text-content-secondary">{serverMessage}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Your name"
          name="name"
          autoComplete="name"
          placeholder="Adaeze Okonkwo"
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
          onBlur={() => validateField('name')}
          error={errors.name}
          disabled={isSubmitting}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(event) => setField('email', event.target.value)}
          onBlur={() => validateField('email')}
          error={errors.email}
          disabled={isSubmitting}
        />

        <TextField
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+234 801 234 5678"
          optional
          hint="Only if you would rather we called."
          value={form.phone}
          onChange={(event) => setField('phone', event.target.value)}
          onBlur={() => validateField('phone')}
          error={errors.phone}
          disabled={isSubmitting}
        />

        <TextField
          label="Company"
          name="company"
          autoComplete="organization"
          optional
          value={form.company}
          onChange={(event) => setField('company', event.target.value)}
          error={errors.company}
          disabled={isSubmitting}
        />

        <SelectField
          label="What are you building?"
          name="projectType"
          placeholder="Choose the closest option"
          options={PROJECT_TYPE_OPTIONS}
          value={form.projectType}
          onChange={(event) => setField('projectType', event.target.value)}
          onBlur={() => validateField('projectType')}
          error={errors.projectType}
          disabled={isSubmitting}
        />

        <SelectField
          label="Budget range"
          name="budget"
          placeholder="Choose a range"
          optional
          hint="A rough band is enough. It tells us which conversation to have."
          options={BUDGET_OPTIONS}
          value={form.budget}
          onChange={(event) => setField('budget', event.target.value)}
          error={errors.budget}
          disabled={isSubmitting}
        />

        <TextField
          label="Where is the site?"
          name="location"
          optional
          placeholder="Maitama, Abuja"
          wrapperClassName="sm:col-span-2"
          value={form.location}
          onChange={(event) => setField('location', event.target.value)}
          error={errors.location}
          disabled={isSubmitting}
        />
      </div>

      <TextAreaField
        label="Tell us about the project"
        name="message"
        rows={6}
        maxLength={5000}
        placeholder="Plot size, what you want to build, and when you would like to start. Rough numbers are fine — we would rather hear an honest guess than a polished one."
        hint="The more you write here, the more useful our first reply will be."
        value={form.message}
        onChange={(event) => setField('message', event.target.value)}
        onBlur={() => validateField('message')}
        error={errors.message}
        disabled={isSubmitting}
      />

      <CheckboxField
        label={COPY.form.consent}
        name="consent"
        checked={form.consent}
        onChange={(event) => setField('consent', event.target.checked)}
        error={errors.consent}
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-measure text-caption text-content-faint">
          {COPY.form.privacyNote}{' '}
          <Link href="/privacy" className="link-underline text-content-secondary">
            Read our privacy policy.
          </Link>
        </p>
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          iconRight={isSubmitting ? undefined : <ArrowRight />}
          className="sm:min-w-[13rem]"
        >
          {isSubmitting ? COPY.form.submitting : COPY.form.submit}
        </Button>
      </div>
    </form>
  );
}
