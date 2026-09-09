'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { connectLenisToScrollTrigger } from '@/lib/animations/scrollTriggers';
import { registerGsap, ScrollTrigger } from '@/lib/animations/gsapAnimations';
import { isTouchDevice, prefersReducedMotion } from '@/lib/utils';

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  /** Scroll to an element, a selector or a pixel offset. */
  scrollTo: (target: string | number | HTMLElement, offset?: number, immediate?: boolean) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => undefined,
  stop: () => undefined,
  start: () => undefined,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

/**
 * Smooth scroll.
 *
 * Lenis replaces native scrolling with an interpolated one and drives
 * ScrollTrigger from the same RAF loop, so scrub animations track the content
 * exactly instead of lagging a frame behind.
 *
 * Deliberately off in three cases:
 *  - `prefers-reduced-motion`, where hijacked scrolling is actively unpleasant
 *  - touch devices, whose native momentum scrolling is better than ours
 *  - the /studio route, where Sanity manages its own scroll containers
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    registerGsap();

    // `--vh` gives CSS an honest viewport height on mobile, where 100vh
    // includes browser chrome that collapses on scroll.
    const setViewportUnit = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setViewportUnit();
    window.addEventListener('resize', setViewportUnit, { passive: true });

    const shouldSkip = prefersReducedMotion() || isTouchDevice() || pathname?.startsWith('/studio');

    if (shouldSkip) {
      // Native smooth scrolling is fine as a fallback for anchor links.
      document.documentElement.style.scrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
      return () => {
        window.removeEventListener('resize', setViewportUnit);
        document.documentElement.style.scrollBehavior = '';
      };
    }

    /**
     * Lerp rather than duration.
     *
     * `duration` restarts a fixed-length easing curve on every wheel event, so
     * a burst of events stacks curves and the page arrives with a small lurch.
     * `lerp` interpolates continuously toward the target instead: each event
     * moves the target, and the page eases toward wherever it currently is.
     * Under fast repeated scrolling that is the difference between smooth and
     * nearly smooth.
     *
     * 0.085 settles in roughly 400ms. Lower feels like syrup and makes the
     * page seem unresponsive; higher stops feeling smooth at all.
     */
    const instance = new Lenis({
      lerp: 0.085,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // Never hijack a trackpad's own momentum; it is already smooth.
      syncTouch: false,
      infinite: false,
      anchors: { offset: -100 },
    });

    lenisRef.current = instance;
    setLenis(instance);

    const disconnect = connectLenisToScrollTrigger(instance);

    return () => {
      window.removeEventListener('resize', setViewportUnit);
      disconnect();
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [pathname, reduce]);

  /**
   * On route change: jump to the top, then recompute every trigger. Without the
   * refresh, triggers keep the previous page's measurements and fire at the
   * wrong scroll positions.
   */
  useEffect(() => {
    // Components own their triggers. Killing them here also kills triggers
    // created by the new page's child effects and the persistent footer.
    let nextFrame = 0;
    const raf = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (window.location.hash) {
          const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
          if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - 100;
            if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true });
            else window.scrollTo({ top, behavior: 'instant' });
          }
        }
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(nextFrame);
    };
  }, [pathname]);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, offset = 0, immediate = false) => {
      const instance = lenisRef.current;
      if (instance) {
        instance.scrollTo(target, {
          offset,
          immediate,
          duration: 1.1,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
        return;
      }
      const element =
        typeof target === 'string'
          ? document.querySelector<HTMLElement>(target)
          : target instanceof HTMLElement
            ? target
            : null;
      const top = element
        ? element.getBoundingClientRect().top + window.scrollY + offset
        : typeof target === 'number'
          ? target + offset
          : null;
      if (top !== null)
        window.scrollTo({
          top,
          behavior: immediate || prefersReducedMotion() ? 'instant' : 'smooth',
        });
    },
    [],
  );
  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);
  const value = useMemo(() => ({ lenis, scrollTo, stop, start }), [lenis, scrollTo, stop, start]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}
