'use client';

import { useEffect, useRef, useState, type ElementType } from 'react';
import {
  animateLines,
  registerGsap,
  splitIntoLines,
  type SplitTextResult,
} from '@/lib/animations/gsapAnimations';
import { cn, debounce, prefersReducedMotion } from '@/lib/utils';

export interface TextRevealProps {
  children: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
  duration?: number;
  /** Animate immediately on mount instead of waiting for scroll. Hero only. */
  immediate?: boolean;
  className?: string;
  id?: string;
}

/**
 * Line-by-line text reveal.
 *
 * The text is measured, split into real lines at the current width, and each
 * line is animated out of an overflow mask. On resize the split is thrown away
 * and redone, because line breaks move.
 *
 * The text is rendered as plain text first, so it is present in the HTML for
 * search engines and for anyone with JavaScript disabled.
 */
export function TextReveal({
  children,
  as: Tag = 'p',
  delay = 0,
  stagger = 0.12,
  duration,
  immediate = false,
  className,
  id,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const splitRef = useRef<SplitTextResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Reduced motion: leave the plain text exactly as rendered.
    if (prefersReducedMotion()) {
      setReady(true);
      return;
    }

    registerGsap();

    let tween: gsap.core.Tween | undefined;

    const build = () => {
      splitRef.current?.revert();
      splitRef.current = splitIntoLines(element);
      setReady(true);

      tween = animateLines(splitRef.current.lines, {
        delay,
        stagger,
        duration,
        trigger: immediate ? undefined : element,
      });
    };

    // Wait for fonts before measuring: a fallback font breaks lines differently
    // and the split would be wrong the moment the real font swaps in.
    const start = () => {
      if (document.fonts?.status === 'loaded') build();
      else document.fonts?.ready.then(build).catch(build);
    };

    start();

    // Re-split on resize. Debounced hard — this is a layout-thrashing operation.
    const onResize = debounce(() => {
      tween?.kill();
      build();
    }, 250);

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      tween?.kill();
      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, [children, delay, stagger, duration, immediate]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn(className, !ready && 'opacity-0')}
      // The DOM is rewritten by the split, so it must not be a live region.
      aria-live="off"
    >
      {children}
    </Tag>
  );
}
