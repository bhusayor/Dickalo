/**
 * Brand tokens in TypeScript.
 *
 * Tailwind owns the classes; this file exists for the places Tailwind cannot
 * reach — canvas fills, meta theme colours and JSON-LD.
 * Keep it in sync with `tailwind.config.ts` and `styles/variables.css`.
 */

export const colors = {
  black: '#000000',
  white: '#FFFFFF',

  /** Gold is a FILL. For accent text on white use `content.accent`. */
  gold: '#EDC65A',
  goldDeep: '#D9B400',
  /** Darkened gold — the only gold legible as text on white (5.6:1). */
  goldInk: '#7A6600',

  ink: {
    50: '#FAFAF8',
    100: '#F2F2EE',
    200: '#E4E4DF',
    300: '#C9C9C2',
    400: '#A3A39B',
    500: '#8A8A83',
    600: '#66665F',
    700: '#4A4A45',
    800: '#33332F',
    900: '#1F1F1C',
    950: '#0A0A09',
  },

  content: {
    primary: '#242620',
    secondary: '#4A4A45',
    muted: '#66665F',
    faint: '#8A8A83',
    inverse: '#FAFAF8',
    accent: '#7A6600',
  },

  surface: {
    base: '#F6F5F0',
    raised: '#EFEEE7',
    sunken: '#EAE9E1',
    inverse: '#272B24',
  },

  line: {
    DEFAULT: 'rgba(10, 10, 9, 0.11)',
    subtle: 'rgba(10, 10, 9, 0.06)',
    strong: 'rgba(10, 10, 9, 0.22)',
  },

  feedback: {
    success: '#127A3E',
    danger: '#B42318',
  },
} as const;

export const fonts = {
  /** The site is set in Trueno; see public/fonts/README.md. */
  family: 'Trueno',
  /** Rendered until Trueno's files are added. Self-hosted by next/font. */
  fallback: 'Plus Jakarta Sans',
  stack: "'Trueno', 'Trueno Fallback', var(--font-body), system-ui, sans-serif",
} as const;

/**
 * The house motion vocabulary. Durations are seconds because GSAP expects
 * seconds; multiply by 1000 for Framer Motion where it expects the same unit
 * (Framer also uses seconds, so these pass straight through).
 */
export const motion = {
  duration: {
    instant: 0.15,
    fast: 0.3,
    base: 0.6,
    slow: 0.9,
    cinematic: 1.4,
  },
  stagger: {
    tight: 0.04,
    base: 0.08,
    loose: 0.14,
  },
  ease: {
    /** House curve. Matches `ease-expo` in Tailwind. */
    expo: [0.16, 1, 0.3, 1],
    inExpo: [0.7, 0, 0.84, 0],
    smooth: [0.4, 0, 0.2, 1],
    overshoot: [0.34, 1.56, 0.64, 1],
  },
  /** GSAP string equivalents of the curves above. */
  gsapEase: {
    expo: 'expo.out',
    inExpo: 'expo.in',
    smooth: 'power2.out',
    overshoot: 'back.out(1.6)',
  },
} as const;

/** Matches the Tailwind breakpoints so JS and CSS agree on "mobile". */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const layout = {
  containerMaxWidth: 1440,
  navHeight: 80,
  navHeightMobile: 64,
} as const;

export type Colors = typeof colors;
export type MotionTokens = typeof motion;
