import Link from 'next/link';
import { ArrowRight, Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { mainNav } from '@/config/navigation';
import { COPY } from '@/lib/constants';

/**
 * 404.
 *
 * The copy takes responsibility rather than blaming the visitor for the URL,
 * and the page gives real routes out instead of only a "go home" button —
 * someone who landed here was looking for something specific.
 */
export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center bg-surface-base pb-section pt-36 lg:pt-44">
      <Container>
        <div className="flex max-w-3xl flex-col gap-7">
          <p className="numeric font-display text-display-xl leading-none text-content-accent-600/35" aria-hidden="true">
            404
          </p>

          <h1 className="text-balance font-display text-display-lg text-content-primary">
            {COPY.errors.notFoundTitle}
          </h1>

          <p className="max-w-prose text-pretty text-body-lg text-content-secondary">
            {COPY.errors.notFoundBody}
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            <Button href="/" size="lg" iconRight={<ArrowRight />}>
              {COPY.errors.goHome}
            </Button>
            <Button href="/projects" size="lg" variant="secondary">
              Browse the projects
            </Button>
          </div>

          <nav aria-label="Site sections" className="mt-8 border-t border-line pt-8">
            <h2 className="eyebrow eyebrow--muted mb-5">Or try one of these</h2>
            <ul className="flex flex-col">
              {mainNav.map((link) => (
                <li key={link.href} className="border-b border-line">
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-6 py-4"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="font-display text-heading-md text-content-primary transition-colors group-hover:text-content-accent">
                        {link.label}
                      </span>
                      {link.description ? (
                        <span className="text-body-sm text-content-muted">{link.description}</span>
                      ) : null}
                    </span>
                    <ArrowRight className="shrink-0 text-content-faint transition-all duration-fast ease-expo group-hover:translate-x-1 group-hover:text-content-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </section>
  );
}
