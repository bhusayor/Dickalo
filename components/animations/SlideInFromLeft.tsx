'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { slideInLeft, slideInRight, viewportOnce } from '@/lib/animations/transitions';
import { cn } from '@/lib/utils';

export interface SlideInProps {
  children: ReactNode;
  from?: 'left' | 'right';
  delay?: number;
  className?: string;
}

/**
 * Horizontal slide-in.
 *
 * Note the wrapper: a horizontal entrance on a full-width element can push the
 * document wider for a frame and trigger a horizontal scrollbar. The outer div
 * clips it.
 */
export function SlideInFromLeft({ children, from = 'left', delay = 0, className }: SlideInProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div className="overflow-hidden">
      <motion.div
        className={cn(className)}
        variants={from === 'left' ? slideInLeft : slideInRight}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        transition={{ delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}
