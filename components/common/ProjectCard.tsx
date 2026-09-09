'use client';

import Link from 'next/link';
import { memo } from 'react';
import { ArrowRight } from '@/components/common/Button';
import { Image } from '@/components/common/Image';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/constants';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface ProjectCardProps {
  project: Project;
  /**
   * `feature` is taller and shows the excerpt; `compact` is used in the
   * "related projects" strip where space is tight.
   */
  variant?: 'default' | 'feature' | 'compact';
  /** 1-based position, rendered as an editorial index. */
  index?: number;
  priority?: boolean;
  className?: string;
}

const RATIOS = {
  default: '3/2',
  feature: '4/3',
  compact: '16/9',
} as const;

/**
 * Project card.
 *
 * Memoised because the portfolio grid re-renders on every filter change and the
 * cards themselves rarely change with it.
 */
export const ProjectCard = memo(function ProjectCard({
  project,
  variant = 'default',
  index,
  priority = false,
  className,
}: ProjectCardProps) {
  const href = `/projects/${project.slug}`;
  const isFeature = variant === 'feature';
  const isCompact = variant === 'compact';

  return (
    <article className={cn('portfolio-card group relative', className)}>
      <Link
        href={href}
        className="block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-primary"
        // The card's own markup already names the project, so the link needs no
        // extra label — but it does need to say where it goes.
        aria-label={`${project.title}, ${CATEGORY_LABELS[project.category]} in ${project.location}`}
      >
        <div className="relative overflow-hidden rounded-md">
          <Image
            source={project.coverImage}
            // Used only when Sanity is unconfigured; CMS images take priority.
            src={project.coverImageUrl}
            alt={project.coverImage?.alt || `${project.title}, ${project.location}`}
            ratio={RATIOS[variant]}
            zoom
            priority={priority}
            cdnWidth={isFeature ? 1600 : 900}
            sizes={
              isFeature
                ? '(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            wrapperClassName="rounded-md"
          />

          {/*
            Tags.

            Solid light chips with near-black text rather than dark chips with
            light text. Two reasons: it is 19:1 over any photograph, bright or
            dark, so no gradient is needed to prop it up; and on a white site a
            light chip reads as part of the page rather than as an overlay.
          */}
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 sm:left-4 sm:top-4">
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-content-primary shadow-hairline backdrop-blur-sm">
              {CATEGORY_LABELS[project.category]}
            </span>

            {project.status !== 'completed' ? (
              <span className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-950 shadow-hairline">
                {/* A live project gets a pulsing dot; a concept does not. */}
                {project.status === 'in-progress' ? (
                  <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink-950 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink-950" />
                  </span>
                ) : null}
                {STATUS_LABELS[project.status]}
              </span>
            ) : null}
          </div>

          {/* Hover affordance. Hidden from assistive tech — the link already says it. */}
          <div
            className="pointer-events-none absolute bottom-4 right-4 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-gold text-black opacity-0 transition-all duration-400 ease-expo group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden="true"
          >
            <ArrowRight />
          </div>
        </div>

        <div className={cn('flex flex-col gap-2', isCompact ? 'pt-4' : 'pt-5')}>
          <div className="flex items-baseline gap-3">
            {typeof index === 'number' ? (
              <span className="numeric shrink-0 font-display text-caption text-content-accent/60">
                {String(index).padStart(2, '0')}
              </span>
            ) : null}
            <h3
              className={cn(
                'text-balance font-display text-content-primary transition-colors duration-fast group-hover:text-content-accent',
                isFeature ? 'text-display-sm' : isCompact ? 'text-heading-md' : 'text-heading-lg',
              )}
            >
              {project.title}
            </h3>
          </div>

          {project.tagline && !isCompact ? (
            <p className="clamp-2 max-w-measure text-body-md text-content-secondary">
              {project.tagline}
            </p>
          ) : null}

          {isFeature && project.excerpt ? (
            <p className="clamp-3 max-w-prose pt-1 text-body-md text-content-muted">
              {project.excerpt}
            </p>
          ) : null}

          {/* Facts line. A dot separator, so it reads as one line not three items. */}
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-caption text-content-muted">
            <span>{project.location}</span>
            <span aria-hidden="true" className="text-content-faint">
              ·
            </span>
            <span className="numeric">{project.year}</span>
            {project.area ? (
              <>
                <span aria-hidden="true" className="text-content-faint">
                  ·
                </span>
                <span className="numeric">{project.area}</span>
              </>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
});
