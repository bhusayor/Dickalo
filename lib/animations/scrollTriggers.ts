'use client';

import type Lenis from 'lenis';
import { registerGsap, ScrollTrigger, gsap } from './gsapAnimations';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * ScrollTrigger wiring.
 *
 * Lenis takes over the scroll position, so ScrollTrigger has to be told where
 * "scroll" actually is. `connectLenisToScrollTrigger` does that handshake; skip
 * it and every scrub animation lags one frame behind the content.
 */

/** Shared start positions so sections do not each invent their own. */
export const TRIGGER_POINTS = {
  /** Element is a fifth of the way up the viewport. Default for reveals. */
  enter: 'top 85%',
  /** Later trigger for large media that should be well in view first. */
  enterLate: 'top 70%',
  /** Fires as soon as any part of the element appears. */
  enterEarly: 'top bottom',
  center: 'center center',
  pin: 'top top',
} as const;

export const SCRUB = {
  /** Tight follow, good for parallax. */
  tight: 0.4,
  /** Default. Smooths jitter without feeling laggy. */
  base: 1,
  /** Slow, cinematic follow for full-bleed media. */
  loose: 1.6,
} as const;

/**
 * Drive ScrollTrigger from Lenis's RAF loop.
 * Returns a teardown function; call it when the provider unmounts.
 */
export function connectLenisToScrollTrigger(lenis: Lenis): () => void {
  registerGsap();

  const onScroll = () => ScrollTrigger.update();
  lenis.on('scroll', onScroll);

  // Let GSAP's ticker drive Lenis so both run on one RAF, not two.
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  // Lenis updates native window scroll; a scroller proxy is unnecessary and
  // would retain a destroyed instance when switching to native touch scroll.

  ScrollTrigger.defaults({ markers: false });
  ScrollTrigger.refresh();

  return () => {
    lenis.off('scroll', onScroll);
    gsap.ticker.remove(raf);
  };
}

/**
 * Batched reveal. One ScrollTrigger for many elements instead of one each,
 * which matters on the projects grid where there can be 30+ cards.
 */
export function batchReveal(
  selector: string | Element[],
  options: {
    start?: string;
    stagger?: number;
    y?: number;
    duration?: number;
    scope?: Element;
  } = {},
): ScrollTrigger[] {
  const { start = TRIGGER_POINTS.enter, stagger = 0.08, y = 40, duration = 0.9, scope } = options;

  const elements =
    typeof selector === 'string'
      ? Array.from((scope ?? document).querySelectorAll<HTMLElement>(selector))
      : selector;

  if (elements.length === 0) return [];

  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return [];
  }

  gsap.set(elements, { opacity: 0, y });

  return ScrollTrigger.batch(elements, {
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'expo.out',
        overwrite: true,
      }),
  });
}

/**
 * Horizontal scroll section. The container scrolls sideways while the page is
 * pinned. Returns the ScrollTrigger for cleanup.
 */
export function horizontalScroll(
  container: HTMLElement,
  track: HTMLElement,
): ScrollTrigger | undefined {
  if (prefersReducedMotion()) return undefined;

  const distance = () => track.scrollWidth - window.innerWidth;

  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: TRIGGER_POINTS.pin,
      end: () => `+=${distance()}`,
      pin: true,
      scrub: SCRUB.base,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  return tween.scrollTrigger;
}

/**
 * Progress bar bound to overall page scroll. Writes `--scroll-progress` so CSS
 * can use it too, and scales an element if one is given.
 */
export function scrollProgress(bar?: HTMLElement): ScrollTrigger {
  return ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      document.documentElement.style.setProperty('--scroll-progress', String(self.progress));
      if (bar) bar.style.transform = `scaleX(${self.progress})`;
    },
  });
}

/**
 * Scroll-spy for the homepage nav. Calls `onChange` with the id of whichever
 * section currently occupies the middle of the viewport.
 */
export function sectionSpy(sectionIds: string[], onChange: (id: string) => void): ScrollTrigger[] {
  return sectionIds
    .map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => onChange(id),
        onEnterBack: () => onChange(id),
      });
    })
    .filter((t): t is ScrollTrigger => t !== null);
}

/**
 * Refresh after images load. Without this, triggers computed before images
 * have height fire at the wrong scroll position.
 */
export function refreshAfterImages(scope: ParentNode = document): () => void {
  const images = Array.from(scope.querySelectorAll('img'));
  const pending = images.filter((img) => !img.complete);

  if (pending.length === 0) {
    ScrollTrigger.refresh();
    return () => undefined;
  }

  let remaining = pending.length;
  const done = () => {
    remaining -= 1;
    if (remaining <= 0) ScrollTrigger.refresh();
  };

  pending.forEach((img) => {
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });

  return () => {
    pending.forEach((img) => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
    });
  };
}

/** Kill every ScrollTrigger. Used on route change before the next page mounts. */
export function killAllTriggers(): void {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
