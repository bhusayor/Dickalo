'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn, isTouchDevice } from '@/lib/utils';

export interface ParallaxSectionProps {
  children: ReactNode;
  /**
   * How far the content moves relative to the scroll, as a fraction of the
   * element's height. 0.2 is subtle; above 0.4 starts to feel unmoored.
   */
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  /** Also scale slightly, which sells depth on full-bleed images. */
  scale?: boolean;
  className?: string;
  innerClassName?: string;
}

/**
 * Parallax wrapper.
 *
 * Framer's `useScroll` rather than GSAP ScrollTrigger, because the spring
 * smoothing here matters more than timeline control, and it stays in sync with
 * Lenis without a scroller proxy.
 *
 * Disabled on touch devices: parallax on a momentum-scrolling phone reads as
 * lag, and it costs a composite layer that mobile GPUs would rather spend
 * elsewhere.
 */
export function ParallaxSection({
  children,
  speed = 0.2,
  direction = 'vertical',
  scale = false,
  className,
  innerClassName,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // From the moment the element enters the viewport to the moment it leaves.
    offset: ['start end', 'end start'],
  });

  // A light spring removes the one-frame stutter that raw scroll values show
  // on trackpads without adding perceptible lag.
  const smooth = useSpring(scrollYProgress, { stiffness: 320, damping: 44, mass: 0.4 });

  const distance = speed * 100;
  const y = useTransform(smooth, [0, 1], [`${-distance / 2}%`, `${distance / 2}%`]);
  const x = useTransform(smooth, [0, 1], [`${-distance / 2}%`, `${distance / 2}%`]);
  const scaleValue = useTransform(smooth, [0, 0.5, 1], [1.08, 1, 1.08]);

  const disabled = reduce || isTouchDevice();

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        className={cn('h-full w-full will-change-transform', innerClassName)}
        style={
          disabled
            ? undefined
            : {
                ...(direction === 'vertical' ? { y } : { x }),
                ...(scale ? { scale: scaleValue } : {}),
              }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
