'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/animations/transitions';
import { cn } from '@/lib/utils';

export interface SectionTitleProps {
  /** Small uppercase label. Never a heading — it is a signpost. */
  eyebrow?: string;
  title: ReactNode;
  /** One or two sentences. Longer belongs in the section body. */
  description?: string;
  align?: 'left' | 'center';
  /** Heading level. Set this correctly — the page must have one h1. */
  as?: 'h1' | 'h2' | 'h3';
  size?: 'lg' | 'md' | 'sm';
  action?: ReactNode;
  className?: string;
  id?: string;
}

const SIZES = {
  lg: 'text-display-md',
  md: 'text-display-sm',
  sm: 'text-heading-lg',
} as const;

/**
 * Section heading block.
 *
 * Keeps the eyebrow / heading / description rhythm identical across the site
 * and animates the three parts as a staggered group.
 */
export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  size = 'lg',
  action,
  className,
  id,
}: SectionTitleProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={reduce ? undefined : staggerContainer(0.1)}
      initial={reduce ? undefined : 'hidden'}
      whileInView={reduce ? undefined : 'visible'}
      viewport={viewportOnce}
      className={cn(
        'flex flex-col gap-5',
        align === 'center' && 'items-center text-center',
        action && 'md:flex-row md:items-end md:justify-between md:gap-12',
        className,
      )}
    >
      <div className={cn('flex flex-col gap-4', align === 'center' && 'items-center')}>
        {eyebrow ? (
          <motion.p variants={reduce ? undefined : fadeUp} className="eyebrow">
            {/* Gold rule reads as a drawing tick mark. */}
            <span className="mr-3 inline-block h-px w-8 translate-y-[-0.25em] bg-gold-600 align-middle" />
            {eyebrow}
          </motion.p>
        ) : null}

        <motion.div variants={reduce ? undefined : fadeUp}>
          <Heading id={id} className={cn(SIZES[size], 'text-balance text-content-primary')}>
            {title}
          </Heading>
        </motion.div>

        {description ? (
          <motion.p
            variants={reduce ? undefined : fadeUp}
            className={cn(
              'max-w-measure text-pretty text-body-lg text-content-secondary',
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </motion.p>
        ) : null}
      </div>

      {action ? (
        <motion.div variants={reduce ? undefined : fadeUp} className="shrink-0">
          {action}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
