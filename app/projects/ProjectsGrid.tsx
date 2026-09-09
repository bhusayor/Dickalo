'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { ProjectCard } from '@/components/common/ProjectCard';
import { transitions } from '@/lib/animations/transitions';
import { CATEGORY_LABELS, COPY, PROJECTS_PER_PAGE } from '@/lib/constants';
import type { Project, ProjectCategory } from '@/lib/types';
import { cn, pluralize } from '@/lib/utils';

export interface ProjectsGridProps {
  projects: Project[];
}

/**
 * Filterable portfolio grid.
 *
 * Filtering happens on the client over a list that was rendered on the server,
 * so switching category is instant and costs no request. The active filter is
 * mirrored into the URL, which makes a filtered view shareable and the back
 * button behave the way people expect.
 */
export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  const requestedCategory = searchParams.get('category');
  const activeCategory: ProjectCategory | 'all' =
    requestedCategory && Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, requestedCategory)
      ? (requestedCategory as ProjectCategory)
      : 'all';
  const [visibleCount, setVisibleCount] = useState(PROJECTS_PER_PAGE);

  /** Only offer filters that would actually return something. */
  const categories = useMemo(() => {
    const present = new Set(projects.map((project) => project.category));
    return (Object.keys(CATEGORY_LABELS) as ProjectCategory[]).filter((key) => present.has(key));
  }, [projects]);

  const filtered = useMemo(
    () =>
      activeCategory === 'all'
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [projects, activeCategory],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const setCategory = useCallback(
    (category: ProjectCategory | 'all') => {
      setVisibleCount(PROJECTS_PER_PAGE);

      const params = new URLSearchParams(searchParams.toString());
      if (category === 'all') params.delete('category');
      else params.set('category', category);

      const query = params.toString();
      // `scroll: false` keeps the reader where they are; jumping to the top
      // after choosing a filter loses their place for no reason.
      router.push(query ? `/projects?${query}` : '/projects', { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-col gap-10">
      {/* --- Filters ------------------------------------------------------- */}
      <div className="flex flex-col gap-5 border-b border-line pb-6">
        <div
          role="group"
          aria-label="Filter projects by category"
          className="-mx-gutter flex gap-2 overflow-x-auto px-gutter no-scrollbar"
        >
          <FilterChip
            active={activeCategory === 'all'}
            onClick={() => setCategory('all')}
            count={projects.length}
          >
            Everything
          </FilterChip>

          {categories.map((category) => (
            <FilterChip
              key={category}
              active={activeCategory === category}
              onClick={() => setCategory(category)}
              count={projects.filter((p) => p.category === category).length}
            >
              {CATEGORY_LABELS[category]}
            </FilterChip>
          ))}
        </div>

        {/* Result count, announced when the filter changes. */}
        <p className="text-caption text-content-muted" aria-live="polite">
          {pluralize(filtered.length, 'project')}
          {activeCategory !== 'all' ? ` in ${CATEGORY_LABELS[activeCategory].toLowerCase()}` : ''}
        </p>
      </div>

      {/* --- Grid ---------------------------------------------------------- */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-4 py-20">
          <p className="font-display text-heading-lg text-content-primary">{COPY.empty.projects}</p>
          <p className="text-body-md text-content-muted">{COPY.empty.projectsAction}</p>
          <Button variant="secondary" onClick={() => setCategory('all')} className="mt-2">
            Show everything
          </Button>
        </div>
      ) : (
        <motion.div layout={!reduce} className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => (
              <motion.div
                key={project._id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                transition={{ ...transitions.base, delay: reduce ? 0 : (index % 3) * 0.06 }}
              >
                <ProjectCard project={project} index={index + 1} priority={index < 3} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* --- Load more ----------------------------------------------------- */}
      {hasMore ? (
        <div className="flex flex-col items-center gap-3 pt-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setVisibleCount((count) => count + PROJECTS_PER_PAGE)}
          >
            Load more projects
          </Button>
          <p className="numeric text-caption text-content-faint">
            Showing {visible.length} of {filtered.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'filter-chip flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-body-sm transition-all duration-fast ease-expo',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary',
        active
          ? 'bg-gold font-medium text-black'
          : 'border border-line text-content-secondary hover:border-line-strong hover:text-content-primary',
      )}
    >
      {children}
      <span className={cn('numeric text-caption', active ? 'text-black/60' : 'text-content-faint')}>
        {count}
      </span>
    </button>
  );
}
