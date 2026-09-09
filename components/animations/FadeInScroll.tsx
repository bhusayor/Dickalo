'use client';

import { useReducedMotion, type Variants } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { transitions, viewportOnce } from '@/lib/animations/transitions';
import { motionTag } from './motionTag';
import { cn } from '@/lib/utils';

export interface FadeInScrollProps {
  children: ReactNode;
  /** Distance travelled, in pixels. */
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
  once?: boolean;
  as?: ElementType;
  className?: string;
}

const OFFSET = {
  up: (d: number) => ({ y: d, x: 0 }),
  down: (d: number) => ({ y: -d, x: 0 }),
  left: (d: number) => ({ x: -d, y: 0 }),
  right: (d: number) => ({ x: d, y: 0 }),
  none: () => ({ x: 0, y: 0 }),
} as const;

/**
 * The default entrance for anything that is not a heading.
 *
 * Uses Framer's `whileInView` rather than GSAP ScrollTrigger: no trigger to
 * register or clean up, and it survives React re-mounts without leaking.
 */
export function FadeInScroll({
  children,
  distance = 32,
  direction = 'up',
  delay = 0,
  duration,
  amount = 0.2,
  once = true,
  as = 'div',
  className,
}: FadeInScrollProps) {
  const reduce = useReducedMotion();
  const MotionTag = motionTag(as);

  // Reduced motion: render at the end state with no transition at all.
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const offset = OFFSET[direction](distance);

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { ...transitions.slow, ...(duration ? { duration } : {}), delay },
    },
  };

  return (
    <MotionTag
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewportOnce, once, amount }}
    >
      {children}
    </MotionTag>
  );
}
