'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion as motionTokens } from '@/config/branding';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * GSAP helpers.
 *
 * Every function returns the timeline or tween it created so the caller can
 * kill it on unmount. Nothing here registers a global listener that the caller
 * cannot clean up — that is the main source of GSAP leaks in React.
 */

let registered = false;

/** Register plugins exactly once, on the client only. */
export function registerGsap(): typeof gsap {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    // Fewer, larger batched reflows during scroll-driven work.
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.defaults({ ease: motionTokens.gsapEase.expo, duration: motionTokens.duration.base });
    registered = true;
  }
  return gsap;
}

export { gsap, ScrollTrigger };

/**
 * Wrap any animation so it degrades to an instant state change when the user
 * has asked for reduced motion. Callers do not have to check themselves.
 */
export function withMotionPreference<T>(
  animate: () => T,
  applyEndState: () => void,
): T | undefined {
  if (prefersReducedMotion()) {
    applyEndState();
    return undefined;
  }
  return animate();
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

export interface SplitTextResult {
  /** The wrapper elements that were created, for cleanup. */
  lines: HTMLElement[];
  /** Restores the element's original markup. */
  revert: () => void;
}

/**
 * Split an element's text into masked line wrappers without the paid SplitText
 * plugin. Words are wrapped individually, then grouped by their measured
 * `offsetTop` so the split follows the real line breaks at the current width.
 *
 * Call `revert()` on resize and re-split, otherwise the lines will be wrong.
 */
export function splitIntoLines(element: HTMLElement): SplitTextResult {
  const original = element.innerHTML;
  const text = element.textContent ?? '';
  const words = text.split(/\s+/).filter(Boolean);

  // Pass 1: wrap every word so we can measure where lines actually break.
  element.innerHTML = words
    .map((word) => `<span class="dk-word" style="display:inline-block">${word}</span>`)
    .join(' ');

  const wordEls = Array.from(element.querySelectorAll<HTMLElement>('.dk-word'));
  const rows = new Map<number, HTMLElement[]>();
  for (const el of wordEls) {
    const top = Math.round(el.offsetTop);
    const bucket = rows.get(top);
    if (bucket) bucket.push(el);
    else rows.set(top, [el]);
  }

  // Pass 2: rebuild as one mask per measured line.
  const lineHtml = Array.from(rows.values())
    .map((rowWords) => rowWords.map((w) => w.textContent).join(' '))
    .map(
      (line) =>
        `<span class="line-mask"><span class="dk-line" style="display:block;will-change:transform">${line}</span></span>`,
    )
    .join('');

  element.innerHTML = lineHtml;

  const lines = Array.from(element.querySelectorAll<HTMLElement>('.dk-line'));

  return {
    lines,
    revert: () => {
      element.innerHTML = original;
    },
  };
}

/** Staggered line rise. The classic editorial headline entrance. */
export function animateLines(
  lines: HTMLElement[],
  options: { delay?: number; stagger?: number; duration?: number; trigger?: Element } = {},
): gsap.core.Tween | undefined {
  const {
    delay = 0,
    stagger = motionTokens.stagger.loose,
    duration = motionTokens.duration.cinematic,
    trigger,
  } = options;

  return withMotionPreference(
    () =>
      gsap.fromTo(
        lines,
        { yPercent: 115, rotate: 2, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease: motionTokens.gsapEase.expo,
          // Drop the compositor hint once the tween is done.
          onComplete: () => gsap.set(lines, { clearProps: 'willChange' }),
          ...(trigger
            ? { scrollTrigger: { trigger, start: 'top 80%', once: true } }
            : {}),
        },
      ),
    () => gsap.set(lines, { yPercent: 0, rotate: 0, opacity: 1 }),
  );
}

/** Character-by-character reveal. Use sparingly — it is expensive above ~60 chars. */
export function animateChars(
  element: HTMLElement,
  options: { delay?: number; stagger?: number } = {},
): gsap.core.Tween | undefined {
  const { delay = 0, stagger = 0.018 } = options;
  const text = element.textContent ?? '';

  element.innerHTML = Array.from(text)
    .map((char) =>
      char === ' '
        ? '<span class="dk-char">&nbsp;</span>'
        : `<span class="dk-char" style="display:inline-block">${char}</span>`,
    )
    .join('');

  const chars = element.querySelectorAll<HTMLElement>('.dk-char');

  return withMotionPreference(
    () =>
      gsap.fromTo(
        chars,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: motionTokens.duration.base,
          delay,
          stagger,
          ease: motionTokens.gsapEase.expo,
        },
      ),
    () => gsap.set(chars, { yPercent: 0, opacity: 1 }),
  );
}

// ---------------------------------------------------------------------------
// Generic entrances
// ---------------------------------------------------------------------------

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: -56, y: 0 },
  right: { x: 56, y: 0 },
  none: { x: 0, y: 0 },
};

export interface RevealOptions {
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  stagger?: number;
  /** Start position for ScrollTrigger, e.g. "top 85%". */
  start?: string;
  once?: boolean;
  scale?: number;
}

/** Fade + translate on scroll. The workhorse used by most sections. */
export function revealOnScroll(
  targets: gsap.TweenTarget,
  options: RevealOptions = {},
): gsap.core.Tween | undefined {
  const {
    direction = 'up',
    distance,
    delay = 0,
    duration = motionTokens.duration.slow,
    stagger = 0,
    start = 'top 85%',
    once = true,
    scale,
  } = options;

  const base = OFFSETS[direction];
  const offset = distance
    ? { x: Math.sign(base.x) * distance, y: Math.sign(base.y) * distance }
    : base;

  return withMotionPreference(
    () =>
      gsap.fromTo(
        targets,
        { opacity: 0, x: offset.x, y: offset.y, ...(scale ? { scale } : {}) },
        {
          opacity: 1,
          x: 0,
          y: 0,
          ...(scale ? { scale: 1 } : {}),
          duration,
          delay,
          stagger,
          ease: motionTokens.gsapEase.expo,
          scrollTrigger: {
            trigger: Array.isArray(targets) ? (targets[0] as Element) : (targets as Element),
            start,
            once,
          },
        },
      ),
    () => gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1 }),
  );
}

/**
 * Parallax. `speed` is a multiplier of the element's own height:
 * 0.2 moves it 20% of its height over the full scroll through the viewport.
 * Negative values move it against the scroll.
 */
export function parallax(
  target: Element,
  options: { speed?: number; trigger?: Element; scrub?: number | boolean } = {},
): gsap.core.Tween | undefined {
  const { speed = 0.25, trigger, scrub = 1 } = options;

  return withMotionPreference(
    () =>
      gsap.to(target, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: trigger ?? (target as Element),
          start: 'top bottom',
          end: 'bottom top',
          scrub,
          invalidateOnRefresh: true,
        },
      }),
    () => gsap.set(target, { yPercent: 0 }),
  );
}

/** Number counter driven by GSAP so it shares the same scroll timeline. */
export function countUp(
  element: HTMLElement,
  end: number,
  options: { duration?: number; prefix?: string; suffix?: string; start?: string } = {},
): gsap.core.Tween | undefined {
  const { duration = 2, prefix = '', suffix = '', start = 'top 85%' } = options;
  const counter = { value: 0 };
  const format = (n: number) =>
    `${prefix}${new Intl.NumberFormat('en-NG').format(Math.round(n))}${suffix}`;

  return withMotionPreference(
    () =>
      gsap.to(counter, {
        value: end,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          element.textContent = format(counter.value);
        },
        scrollTrigger: { trigger: element, start, once: true },
      }),
    () => {
      element.textContent = format(end);
    },
  );
}

/**
 * Pin an element while its section scrolls past. Returns the ScrollTrigger so
 * the caller can kill it — pinning leaves DOM wrappers behind if it is not.
 */
export function pinSection(
  target: Element,
  options: { end?: string; pinSpacing?: boolean } = {},
): ScrollTrigger | undefined {
  if (prefersReducedMotion()) return undefined;
  return ScrollTrigger.create({
    trigger: target,
    start: 'top top',
    end: options.end ?? '+=100%',
    pin: true,
    pinSpacing: options.pinSpacing ?? true,
    anticipatePin: 1,
  });
}

/** Kill every trigger and tween owned by a container. Call this on unmount. */
export function cleanupScope(scope: Element | null): void {
  if (!scope) return;
  ScrollTrigger.getAll()
    .filter((t) => t.trigger instanceof Node && scope.contains(t.trigger))
    .forEach((t) => t.kill());
  gsap.killTweensOf(scope.querySelectorAll('*'));
}
