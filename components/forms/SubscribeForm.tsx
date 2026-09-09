'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowRight } from '@/components/common/Button';
import { Honeypot } from '@/components/forms/FormField';
import { feedbackMessage, transitions } from '@/lib/animations/transitions';
import { subscribeSchema, validate } from '@/lib/api/validation';
import { COPY } from '@/lib/constants';
import type { ApiResponse, FormStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface SubscribeFormProps {
  /** Recorded so we know which placement converts. */
  source?: string;
  /**
   * Which ground this sits on. Not cosmetic: gold text is 14.1:1 on the
   * inverted band and 1.4:1 on white, so the component cannot pick one set of
   * colours and be correct in both places. Defaults to `inverse` because the
   * footer is its only current home.
   */
  tone?: 'inverse' | 'light';
  className?: string;
}

/**
 * Newsletter signup.
 *
 * One field, one button, inline feedback. The copy promises two emails a year
 * and nothing else, which is the actual policy — an inflated promise here costs
 * more in unsubscribes than it gains in signups.
 */
export function SubscribeForm({
  source = 'footer',
  tone = 'inverse',
  className,
}: SubscribeFormProps) {
  const onDark = tone === 'inverse';
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');

  const isSubmitting = status === 'submitting';
  const isSuccess = status === 'success';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validate(subscribeSchema, { email, source, website });

    if (!result.success) {
      setStatus('error');
      setMessage(result.fieldErrors?.email ?? 'Check that email address and try again.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const body = (await response.json()) as ApiResponse<{ alreadySubscribed?: boolean }>;

      if (!body.success) {
        setStatus('error');
        setMessage(body.error);
        return;
      }

      setStatus('success');
      setEmail('');
      // Being told "you are already on the list" is information, not failure.
      setMessage(
        body.data?.alreadySubscribed ? COPY.subscribe.alreadySubscribed : COPY.subscribe.success,
      );
    } catch {
      setStatus('error');
      setMessage('That did not go through. Check your connection and try once more.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('relative flex flex-col gap-3', className)}
    >
      <Honeypot value={website} onChange={setWebsite} />

      <div
        className={cn(
          'flex items-end gap-3 border-b pb-1 transition-colors',
          onDark
            ? 'border-line-inverse focus-within:border-gold'
            : 'border-line-strong focus-within:border-content-primary',
        )}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="subscribe-email" className="sr-only">
            Email address
          </label>
          <input
            id="subscribe-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={COPY.subscribe.placeholder}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === 'error') setStatus('idle');
            }}
            disabled={isSubmitting || isSuccess}
            aria-invalid={status === 'error' ? true : undefined}
            aria-describedby="subscribe-feedback"
            className={cn(
              'w-full border-0 bg-transparent py-2.5 text-body-md focus:outline-none',
              onDark
                ? 'text-content-inverse placeholder:text-ink-500 disabled:text-ink-400'
                : 'text-content-primary placeholder:text-ink-400 disabled:text-content-muted',
            )}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className={cn(
            'brand-button group -mb-px flex h-11 shrink-0 items-center gap-2 px-4 text-body-sm font-medium',
            'transition-all duration-fast ease-expo',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            onDark
              ? 'text-gold hover:text-gold-200 focus-visible:outline-gold'
              : 'text-content-accent hover:text-gold-700 focus-visible:outline-content-primary',
            'disabled:opacity-50',
          )}
        >
          {isSubmitting ? COPY.subscribe.submitting : isSuccess ? 'Done' : COPY.subscribe.submit}
          {!isSubmitting && !isSuccess ? (
            <ArrowRight className="transition-transform duration-fast ease-expo group-hover:translate-x-0.5" />
          ) : null}
        </button>
      </div>

      {/* Always-mounted live region so the result is reliably announced. */}
      <div id="subscribe-feedback" aria-live="polite" className="min-h-0">
        <AnimatePresence mode="wait">
          {message ? (
            <motion.p
              key={message}
              variants={feedbackMessage}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transitions.fast}
              className={cn(
                'overflow-hidden text-caption',
                status === 'error'
                  ? onDark
                    ? 'text-danger-soft'
                    : 'text-danger'
                  : onDark
                    ? 'text-gold'
                    : 'text-content-accent',
              )}
            >
              {message}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <p className={cn('text-caption', onDark ? 'text-ink-500' : 'text-content-faint')}>
        By subscribing, you agree to our{' '}
        <Link
          href="/privacy"
          className={cn(
            'link-underline',
            onDark ? 'text-ink-300 hover:text-gold' : 'text-content-secondary',
          )}
        >
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
