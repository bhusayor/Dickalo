# Fonts

The redesign uses the existing size-adjusted sans-serif stack in `styles/fonts.css`: locally installed Plus Jakarta Sans, Helvetica Neue, or Arial. `next/font` also self-hosts Plus Jakarta Sans as the final webfont fallback. Italic display accents use Georgia.

Trueno remains first in the configurable font stacks for compatibility, but there are no Trueno font files in this repository. The stylesheet deliberately makes no requests to missing font URLs.

To add a licensed Trueno family, place its WOFF2 files here and add matching `@font-face` declarations for weights 300, 400, 600, and 700 in `styles/fonts.css`. Verify the licence and recheck line wrapping before switching the typography.
