'use client';

import { useReducedMotion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { staggerContainer, staggerItem, viewportOnce } from '@/lib/animations/transitions';
import { motionTag } from './motionTag';
import { cn } from '@/lib/utils';

export interface StaggerContainerProps {
  children: ReactNode;
  /** Gap between each child's start, in seconds. */
  stagger?: number;
  /** Delay before the first child starts. */
  delayChildren?: number;
  amount?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Parent that staggers its children.
 *
 * Pair with `StaggerItem`. One viewport observer serves the whole group, which
 * is why a 30-card grid using this costs far less than 30 individual observers.
 */
export function StaggerContainer({
  children,
  stagger = 0.08,
  delayChildren = 0,
  amount = 0.15,
  as = 'div',
  className,
}: StaggerContainerProps) {
  const reduce = useReducedMotion();
  const MotionTag = motionTag(as);

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...viewportOnce, amount }}
    >
      {children}
    </MotionTag>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

/** A child of `StaggerContainer`. Inherits its timing from the parent. */
export function StaggerItem({ children, as = 'div', className }: StaggerItemProps) {
  const reduce = useReducedMotion();
  const MotionTag = motionTag(as);

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag className={cn(className)} variants={staggerItem}>
      {children}
    </MotionTag>
  );
}
