/**
 * PostCSS pipeline.
 *
 * `postcss-import` must run first. Without it each @import'ed file is processed
 * on its own, and a `@layer base` in `typography.css` fails because Tailwind
 * never sees the matching `@tailwind base` from `globals.css`. Inlining first
 * means Tailwind processes one concatenated stylesheet.
 *
 * @type {import('postcss-load-config').Config}
 */
module.exports = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
