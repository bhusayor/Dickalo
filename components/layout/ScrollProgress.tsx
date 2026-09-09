'use client';

import { useEffect, useRef } from 'react';
import { throttle } from '@/lib/utils';

/**
 * Reading-progress rule under the header.
 *
 * Written against `scrollHeight` directly rather than through ScrollTrigger, so
 * it keeps working on the routes where Lenis is disabled — touch devices and
 * reduced-motion — and costs one scroll listener instead of a trigger.
 *
 * The bar is written to via `transform: scaleX`, never `width`, so it stays on
 * the compositor and never triggers layout.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const update = throttle(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // A page shorter than the viewport has no progress to report.
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    }, 50);

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-transparent"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-gold-600 will-change-transform"
        style={{ transition: 'transform 120ms linear' }}
      />
    </div>
  );
}
