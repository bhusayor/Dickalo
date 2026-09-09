'use client';

import { useEffect } from 'react';
import { ArrowRight, Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';
import { COPY } from '@/lib/constants';

/**
 * Route-level error boundary.
 *
 * Must be a client component — React needs to attach it as a boundary at
 * runtime. `reset()` re-renders the segment, which clears anything transient
 * without a full page reload.
 *
 * The digest is shown deliberately: it is not sensitive, and it is the only
 * thing that lets us find the matching entry in the server logs when someone
 * reports the problem.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where an error reporter would be called.
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <section className="flex min-h-screen items-center bg-surface-base pb-section pt-36 lg:pt-44">
      <Container>
        <div className="flex max-w-3xl flex-col gap-7">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-danger/40 text-danger">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 8v5m0 3v.5M12 3l9 16H3l9-16z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <h1 className="text-balance font-display text-display-md text-content-primary">
            {COPY.errors.genericTitle}
          </h1>

          <p className="max-w-prose text-pretty text-body-lg text-content-secondary">
            {COPY.errors.genericBody}
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            <Button onClick={reset} size="lg" iconRight={<ArrowRight />}>
              {COPY.errors.retry}
            </Button>
            <Button href="/" size="lg" variant="secondary">
              {COPY.errors.goHome}
            </Button>
          </div>

          <div className="mt-6 border-t border-line pt-8">
            <p className="text-body-sm text-content-muted">
              Still broken? Email{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="link-underline text-content-accent">
                {siteConfig.contact.email}
              </a>{' '}
              and tell us what you were doing.
            </p>
            {error.digest ? (
              <p className="mt-2 font-mono text-caption text-content-faint">
                Include this reference: {error.digest}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
