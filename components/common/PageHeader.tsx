import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
}

/**
 * Shared introduction for interior pages.
 *
 * It keeps the navigation clearance, breadcrumb, title measure and vertical
 * rhythm consistent. Pages can still add an aside when their introduction
 * needs a second piece of context, as the services page does.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  aside,
  className,
  titleClassName,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        'interior-page-header border-b border-line bg-surface-base pb-16 pt-32 sm:pt-36 lg:pb-24 lg:pt-40',
        className,
      )}
    >
      <Container>
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-10 lg:mb-12">
            <ol className="flex flex-wrap items-center gap-2 text-caption text-content-muted">
              {breadcrumbs.map((item, index) => {
                const current = index === breadcrumbs.length - 1;

                return (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? (
                      <span aria-hidden="true" className="text-content-faint">
                        /
                      </span>
                    ) : null}
                    {item.href && !current ? (
                      <Link
                        href={item.href}
                        className="transition-colors duration-fast hover:text-content-accent"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={current ? 'text-content-primary' : undefined}
                        aria-current={current ? 'page' : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div className={cn(aside && 'grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20')}>
          <div className="flex flex-col gap-6">
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-10 bg-gold-600" aria-hidden="true" />
              {eyebrow}
            </p>

            <h1
              className={cn(
                'max-w-[17ch] text-balance font-display text-display-lg text-content-primary',
                titleClassName,
              )}
            >
              {title}
            </h1>

            {typeof description === 'string' ? (
              <p className="max-w-prose text-pretty text-body-lg text-content-secondary">
                {description}
              </p>
            ) : description ? (
              <div className="max-w-prose text-pretty text-body-lg text-content-secondary">
                {description}
              </div>
            ) : null}
          </div>

          {aside ? <div className="lg:pt-16">{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}
