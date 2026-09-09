'use client';

import { motion } from 'framer-motion';
import type { ElementType } from 'react';

/**
 * Cached motion components.
 *
 * `motion('div')` builds a brand-new component type on every call. Calling it
 * inside a render means React sees a different type each time and unmounts and
 * remounts the entire subtree — losing DOM state, restarting animations and
 * discarding scroll position.
 *
 * This module-level cache means each tag is built once for the life of the page.
 */
/**
 * Typed as `motion.div` because every tag this project passes (div, ul, li,
 * section, p) shares the same prop surface: HTML attributes plus motion props.
 */
type MotionComponent = typeof motion.div;

const cache = new Map<string, MotionComponent>();

export function motionTag(tag: ElementType): MotionComponent {
  if (typeof tag !== 'string') {
    // Custom components are rare here and already stable identities.
    return motion(tag as never) as MotionComponent;
  }

  const cached = cache.get(tag);
  if (cached) return cached;

  const created = motion(tag as never) as MotionComponent;
  cache.set(tag, created);
  return created;
}
