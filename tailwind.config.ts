import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * DICKALO design tokens — light theme.
 *
 * The page is white. Black is the structural colour: type, rules, the inverted
 * bands. Gold is punctuation, and it has one hard rule attached to it.
 *
 * THE GOLD RULE
 * #FFD700 on white measures 1.4:1. It is unusable as text on a light ground and
 * always will be. So gold is split into two tokens with different jobs:
 *
 *   `gold`            a FILL. Black sits on top of it at 14.1:1. Buttons,
 *                     chips, rules, the hover states of dark surfaces.
 *   `content-accent`  #7A6600, a darkened gold for accent TEXT on white.
 *                     5.6:1, clears WCAG AA at body size.
 *
 * Never use `text-gold` on a light surface. The linter will not catch it; this
 * comment is the only thing standing between you and unreadable eyebrows.
 *
 * SEMANTIC TOKENS
 * Components address `content-*`, `surface-*` and `line-*`, never raw ink
 * steps. Flipping the theme again means editing this block and nothing else.
 *
 * Measured against #FFFFFF:
 *   content-primary   #0A0A09   19.6:1   headings, body
 *   content-secondary #4A4A45    8.9:1   supporting copy
 *   content-muted     #66665F    5.8:1   captions, metadata
 *   content-faint     #8A8A83    3.5:1   large text and non-text only
 *   content-accent    #7A6600    5.6:1   accent text
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './sanity/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- Raw brand ------------------------------------------------------
        black: '#000000',
        white: '#FFFFFF',

        /** Gold is a FILL. For accent text use `content-accent`. */
        gold: {
          DEFAULT: '#EDC65A',
          50: '#FFFDF2',
          100: '#FFF8D6',
          200: '#FFEFA3',
          300: '#FFE566',
          400: '#F5D578',
          500: '#EDC65A',
          600: '#D9B400',
          700: '#A88C00',
          800: '#7A6600',
          900: '#4A3E00',
        },

        // --- Warm neutral ramp, light to dark -------------------------------
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

        // --- Semantic: text -------------------------------------------------
        content: {
          primary: '#242620',
          secondary: '#4A4A45',
          muted: '#66665F',
          faint: '#8A8A83',
          /** For text sitting on an inverted (near-black) band. */
          inverse: '#FAFAF8',
          'inverse-muted': '#A3A39B',
          /** Darkened gold. The only gold that is legible as text on white. */
          accent: '#7A6600',
        },

        // --- Semantic: surfaces ---------------------------------------------
        surface: {
          base: '#F6F5F0',
          raised: '#EFEEE7',
          sunken: '#EAE9E1',
          /** Inverted band, used for the stats and CTA sections. */
          inverse: '#272B24',
          'inverse-raised': '#1F1F1C',
        },

        // --- Semantic: hairlines --------------------------------------------
        // Alpha rather than solid, so rules sit correctly on white and on the
        // off-white raised surface without a second token each.
        line: {
          DEFAULT: 'rgba(10, 10, 9, 0.11)',
          subtle: 'rgba(10, 10, 9, 0.06)',
          strong: 'rgba(10, 10, 9, 0.22)',
          inverse: 'rgba(255, 255, 255, 0.14)',
        },

        // Two tones each. The default clears AA on white (5.4:1 / 6.6:1); the
        // `soft` variant is for the inverted bands, where the dark default
        // drops to 3.0:1 and fails.
        success: {
          DEFAULT: '#127A3E',
          soft: '#6EE7A8',
        },
        danger: {
          DEFAULT: '#B42318',
          soft: '#FCA5A5',
        },
      },

      fontFamily: {
        // One family. `display` and `body` both resolve to Trueno; the two
        // names are kept so components read intentionally, not because the
        // typefaces differ.
        sans: ['Trueno', 'Trueno Fallback', 'var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['Trueno', 'Trueno Fallback', 'var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['Trueno', 'Trueno Fallback', 'var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },

      fontSize: {
        /*
         * Fluid scale, deliberately restrained.
         *
         * The previous scale topped out at 10rem, which meant the hero headline
         * dominated the viewport and every section below it had to shout to
         * keep up. Nothing now exceeds 5rem. Hierarchy is carried by weight and
         * whitespace instead of by size, which is what makes a page read as
         * calm rather than as a poster.
         *
         * The ratio between adjacent display steps is ~1.25, close enough to a
         * major third that the steps feel related rather than arbitrary.
         */
        'display-xl': [
          'clamp(2.5rem, 5.2vw, 4.5rem)',
          { lineHeight: '1.04', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
        'display-lg': [
          'clamp(2.125rem, 4.2vw, 3.5rem)',
          { lineHeight: '1.08', letterSpacing: '-0.027em', fontWeight: '600' },
        ],
        'display-md': [
          'clamp(1.75rem, 3.2vw, 2.75rem)',
          { lineHeight: '1.14', letterSpacing: '-0.023em', fontWeight: '600' },
        ],
        'display-sm': [
          'clamp(1.5rem, 2.4vw, 2.125rem)',
          { lineHeight: '1.2', letterSpacing: '-0.018em', fontWeight: '600' },
        ],
        'heading-lg': [
          'clamp(1.25rem, 1.8vw, 1.5rem)',
          { lineHeight: '1.28', letterSpacing: '-0.014em', fontWeight: '600' },
        ],
        'heading-md': [
          'clamp(1.0625rem, 1.4vw, 1.25rem)',
          { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        'body-lg': [
          'clamp(1rem, 1.1vw, 1.125rem)',
          { lineHeight: '1.62', letterSpacing: '-0.003em' },
        ],
        'body-md': ['1rem', { lineHeight: '1.65' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.005em' }],
        overline: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.16em', fontWeight: '600' }],
      },

      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        section: 'clamp(4.5rem, 10vw, 10rem)',
        gutter: 'clamp(1.25rem, 5vw, 4rem)',
      },

      maxWidth: {
        container: '90rem', // 1440px
        prose: '68ch',
        measure: '46ch',
      },

      borderRadius: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },

      boxShadow: {
        // Light-theme elevation: low alpha, wide spread, slightly warm. A
        // dark-theme shadow (high alpha, tight) reads as a smudge on white.
        glow: '0 0 0 1px rgba(255, 215, 0, 0.55), 0 10px 30px -10px rgba(217, 180, 0, 0.45)',
        lift: '0 18px 48px -20px rgba(10, 10, 9, 0.22), 0 2px 8px -2px rgba(10, 10, 9, 0.06)',
        'lift-lg': '0 32px 80px -28px rgba(10, 10, 9, 0.28), 0 4px 12px -4px rgba(10, 10, 9, 0.07)',
        hairline: '0 0 0 1px rgba(10, 10, 9, 0.09)',
        inset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',
      },

      transitionTimingFunction: {
        // Shared easing vocabulary. `expo` is the house curve — GSAP and CSS
        // animations both use it so motion feels like one system.
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        // Named steps mirror `motion.duration` in config/branding.ts, so a
        // CSS transition and a GSAP tween on the same element agree.
        instant: '150ms',
        fast: '300ms',
        base: '600ms',
        slow: '900ms',
        cinematic: '1400ms',
        250: '250ms',
        400: '400ms',
        600: '600ms',
        900: '900ms',
        1200: '1200ms',
      },

      backgroundImage: {
        'gold-sheen':
          'linear-gradient(105deg, transparent 30%, rgba(255,215,0,0.16) 45%, rgba(255,215,0,0.28) 50%, rgba(255,215,0,0.16) 55%, transparent 70%)',
        'fade-bottom': 'linear-gradient(to bottom, transparent 0%, #000000 92%)',
        'fade-top': 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 100%)',
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
        sheen: {
          from: { transform: 'translate3d(-100%, 0, 0)' },
          to: { transform: 'translate3d(100%, 0, 0)' },
        },
        'scroll-hint': {
          '0%': { transform: 'translate3d(0, -100%, 0)', opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { transform: 'translate3d(0, 100%, 0)', opacity: '0' },
        },
      },

      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        marquee: 'marquee 40s linear infinite',
        sheen: 'sheen 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'scroll-hint': 'scroll-hint 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
      },

      zIndex: {
        nav: '50',
        menu: '60',
        overlay: '70',
        toast: '80',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, addVariant }) => {
      // `motion-safe`-style variant tied to our own reduced-motion handling.
      addVariant('reduced', '@media (prefers-reduced-motion: reduce)');
      addVariant('hocus', ['&:hover', '&:focus-visible']);

      addUtilities({
        '.text-balance': { 'text-wrap': 'balance' },
        '.text-pretty': { 'text-wrap': 'pretty' },
        '.gpu': {
          transform: 'translate3d(0, 0, 0)',
          'backface-visibility': 'hidden',
        },
        // Clip that only exists while an entrance animation runs.
        '.mask-reveal': {
          'clip-path': 'inset(0 0 100% 0)',
        },
        '.no-scrollbar': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        // Focus ring. Deliberately NOT gold: #FFD700 on white is 1.4:1 and a
        // focus indicator that cannot be seen is worse than none, because it
        // looks like the feature works.
        '.focus-ring': {
          outline: '2px solid #0A0A09',
          'outline-offset': '3px',
        },
        // The inverted counterpart, for focus on the near-black bands.
        '.focus-ring-inverse': {
          outline: '2px solid #FFD700',
          'outline-offset': '3px',
        },
      });
    }),
  ],
};

export default config;
