import type { Transition, Variants } from 'framer-motion';
import { motion as tokens } from '@/config/branding';

/**
 * Framer Motion presets.
 *
 * GSAP handles scroll-driven work; Framer handles state-driven work — page
 * transitions, menus, accordions, form feedback. Both draw their easing from
 * `config/branding.ts` so the two systems feel like one.
 */

const EASE = tokens.ease.expo as unknown as [number, number, number, number];
const EASE_IN = tokens.ease.inExpo as unknown as [number, number, number, number];

export const transitions = {
  instant: { duration: tokens.duration.instant, ease: EASE } satisfies Transition,
  fast: { duration: tokens.duration.fast, ease: EASE } satisfies Transition,
  base: { duration: tokens.duration.base, ease: EASE } satisfies Transition,
  slow: { duration: tokens.duration.slow, ease: EASE } satisfies Transition,
  cinematic: { duration: tokens.duration.cinematic, ease: EASE } satisfies Transition,
  /** For anything that should feel physical rather than timed. */
  spring: { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 } satisfies Transition,
  softSpring: { type: 'spring', stiffness: 180, damping: 26, mass: 1 } satisfies Transition,
} as const;

// ---------------------------------------------------------------------------
// Page transitions
// ---------------------------------------------------------------------------

/**
 * Route change. Deliberately short: a long exit animation on navigation feels
 * like latency, not polish.
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, when: 'beforeChildren' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: EASE_IN },
  },
};

/** Full-bleed black panel that wipes across during a route change. */
export const curtainTransition: Variants = {
  initial: { scaleY: 0, transformOrigin: 'bottom' },
  animate: { scaleY: 0, transition: { duration: 0.6, ease: EASE } },
  exit: { scaleY: 1, transformOrigin: 'top', transition: { duration: 0.5, ease: EASE_IN } },
};

// ---------------------------------------------------------------------------
// Entrances
// ---------------------------------------------------------------------------

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: transitions.slow },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -56 },
  visible: { opacity: 1, x: 0, transition: transitions.slow },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 56 },
  visible: { opacity: 1, x: 0, transition: transitions.slow },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.base },
};

/** Single line of type rising out of a mask. Parent needs `overflow: hidden`. */
export const lineRise: Variants = {
  hidden: { y: '115%', rotate: 2 },
  visible: { y: '0%', rotate: 0, transition: transitions.cinematic },
};

// ---------------------------------------------------------------------------
// Staggering
// ---------------------------------------------------------------------------

/**
 * Parent variant. Children with `hidden`/`visible` states inherit the timing,
 * so a list only needs to declare the container.
 */
export function staggerContainer(stagger: number = tokens.stagger.base, delayChildren = 0): Variants {
  return {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren },
    },
    exit: {
      opacity: 1,
      transition: { staggerChildren: stagger / 2, staggerDirection: -1 },
    },
  };
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
  exit: { opacity: 0, y: 12, transition: transitions.fast },
};

// ---------------------------------------------------------------------------
// Overlays
// ---------------------------------------------------------------------------

export const overlayBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.fast },
  exit: { opacity: 0, transition: { ...transitions.fast, delay: 0.1 } },
};

/** Mobile menu panel. Clip-path avoids animating layout. */
export const menuPanel: Variants = {
  hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 0.6, ease: EASE },
  },
  exit: {
    clipPath: 'inset(0% 0% 100% 0%)',
    transition: { duration: 0.45, ease: EASE_IN, delay: 0.15 },
  },
};

export const menuItem: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: 0.18 + i * 0.06 },
  }),
  exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
};

// ---------------------------------------------------------------------------
// Micro-interactions
// ---------------------------------------------------------------------------

export const hoverLift = {
  rest: { y: 0, transition: transitions.fast },
  hover: { y: -6, transition: transitions.fast },
  tap: { y: -2, scale: 0.99, transition: transitions.instant },
} as const;

export const hoverScale = {
  rest: { scale: 1, transition: transitions.fast },
  hover: { scale: 1.02, transition: transitions.fast },
  tap: { scale: 0.98, transition: transitions.instant },
} as const;

/** Height animation for accordions. `auto` needs the layout prop or a measured value. */
export const collapse: Variants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.35, ease: EASE_IN } },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

/** Form feedback: a message that arrives without shifting the layout hard. */
export const feedbackMessage: Variants = {
  hidden: { opacity: 0, y: -6, height: 0 },
  visible: { opacity: 1, y: 0, height: 'auto', transition: transitions.fast },
  exit: { opacity: 0, y: -4, height: 0, transition: transitions.instant },
};

// ---------------------------------------------------------------------------
// Viewport defaults
// ---------------------------------------------------------------------------

/**
 * Shared `whileInView` config. `once` stops sections re-animating on the way
 * back up, which reads as jitter rather than delight.
 */
export const viewportOnce = { once: true, amount: 0.25 } as const;
export const viewportEarly = { once: true, amount: 0.1 } as const;

/**
 * Reduced-motion fallback variants. Components swap to these when
 * `useReducedMotion()` returns true so nothing has to be conditionally rendered.
 */
export const noMotion: Variants = {
  hidden: { opacity: 1, x: 0, y: 0, scale: 1 },
  visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0 } },
  exit: { opacity: 1, transition: { duration: 0 } },
};
