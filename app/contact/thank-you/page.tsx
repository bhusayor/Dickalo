import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';
import { buildMetadata, pageMeta } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata(pageMeta.thankYou);

/**
 * Post-submission page.
 *
 * A thank-you page has one job beyond confirming receipt: give the person
 * something to do next. Here that is the portfolio, plus a direct email address
 * in case they realise they left something out.
 */
export default function ThankYouPage() {
  return (
    <section className="flex min-h-screen items-center bg-surface-base pb-section pt-36 lg:pt-44">
      <Container>
        <div className="flex max-w-3xl flex-col gap-7">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12.5l5 5 9-10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <h1 className="text-balance font-display text-display-lg text-content-primary">
            Got it. Thank you.
          </h1>

          <p className="max-w-prose text-pretty text-body-lg text-content-secondary">
            Your enquiry is with the studio and a confirmation is on its way to your
            inbox. Someone who can actually answer it will reply{' '}
            {siteConfig.contact.responseTime}.
          </p>

          <p className="max-w-prose text-body-md text-content-muted">
            Remembered something you left out? Reply to that confirmation email, or write
            to{' '}
            <a href={`mailto:${siteConfig.contact.email}`} className="link-underline text-content-accent">
              {siteConfig.contact.email}
            </a>{' '}
            and it reaches the same person.
          </p>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
            <Button href="/projects" size="lg" iconRight={<ArrowRight />}>
              Look at our work
            </Button>
            <Button href="/" size="lg" variant="secondary">
              Back to homepage
            </Button>
          </div>

          <p className="border-t border-line pt-8 text-caption text-content-faint">
            Nothing in your inbox within an hour? Check the spam folder, then{' '}
            <Link href="/contact" className="link-underline text-content-secondary">
              send it again
            </Link>
            . We would rather have it twice than not at all.
          </p>
        </div>
      </Container>
    </section>
  );
}
