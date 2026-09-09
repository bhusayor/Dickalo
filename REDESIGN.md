# DICKALO redesign

The site now uses warm ivory, architectural charcoal, oversized upright sans-serif headings, square gold actions, and an editorial project gallery. Shared navigation, page headers, project cards, calls to action, footer, and error fallback extend the design across existing routes.

## Interactions

- GSAP scroll-controlled restoration: the hero stays in view while scrolling transforms a desolate courtyard into a warm finished residence and reveals its headline and supporting text. Scrolling upward reverses the sequence. Native sticky positioning reserves the scene space from first render.
- Lenis smooth scrolling with native touch scrolling and reduced-motion support.
- Services and studio navigation dropdowns with Escape/outside-click dismissal.
- Service and FAQ accordions with accessible expanded states and animated height.
- Project process tabs activated by mouse hover, with click/tap and arrow-key, Home, and End navigation retained.
- Portrait-based testimonial carousel, project category filters, and mobile menu focus handling.
- Licensed Akoka, Lagos construction video with viewport-aware background playback and no visible controls.

## Images

Six concept images were generated with the built-in imagegen tool and optimized as WebP:

- `public/images/generated/courtyard-residence.webp` — completed homepage hero.
- `public/images/generated/courtyard-before.webp` — matching desolate hero opening.
- `public/images/generated/sculptural-interior.webp` — services imagery.
- `public/images/generated/footer-landscape.webp` — preserved earlier footer concept.
- `public/images/generated/nigerian-garden-house.webp` — preserved previous garden-house concept.
- `public/images/generated/nigerian-garden-sky.webp` — current footer: bright Nigerian garden home with natural blue sky and lush greenery.

The exact prompts are in `public/images/generated/README.md`. These are architectural concepts; the project portfolio still consumes Sanity images and existing stock fallbacks. Existing project, company, and testimonial fallback content remains editable through the existing data sources.

## Preview and verification

Use `npm run dev` for the normal preview. To verify production without sharing the IDE's development build files:

```sh
NEXT_DIST_DIR=.next-preview npm run build
NEXT_DIST_DIR=.next-preview npm run start -- --port 3002
```

Verified with a production build, TypeScript, ESLint, and headless Chrome. Browser checks covered widths 320, 375, 390, 768, 1024, and 1440; dropdown dismissal; service/FAQ accordions; keyboard tab navigation; project filtering and invalid-filter recovery; reduced-motion reloads; mobile focus restoration; and contact-form validation and a mocked success response. No real enquiry was sent. Email delivery and CMS publishing were not exercised.


The revised header is transparent with light lettering over the homepage hero, then becomes white frosted glass on scroll. Interior routes use the glass header immediately. The marquee and newsletter have been removed. All text is upright. Portrait and Lagos film sources are recorded in `public/CREDITS.md`.

## Revision verification

The revised homepage was checked in Chrome at 320, 375, 390, 768, 1024, and 1440 pixels. Checks confirmed the hero reveal progresses from 100% masked to fully visible, the transparent header becomes frosted white after scrolling, there are no italic elements or marquee/newsletter/video controls, the Lagos video plays, hover changes process stages, portrait selection and keyboard navigation work, and reduced motion shows the completed house with the video paused. No runtime errors or failed asset requests were observed. The revised production build, TypeScript, and ESLint checks passed.

The hero now presents the restoration without a category tagline or stage labels. Fine-pointer movement adds gentle camera depth and warm light. Scroll position now controls the entire restoration and text entrance; there is no timed reveal or replay button. Reduced motion uses the completed image and visible text without the extended scroll scene. The testimonial photograph has no arrow overlay. The footer now follows the supplied landscape references: a compact brand/contact area, four open navigation columns, social icons, and full-width modern Nigerian garden-house imagery with an integrated oversized wordmark. The navbar contact button has been removed.

The latest revision passed the production build, ESLint, and TypeScript checks. Chrome verified removal of the hero labels and portrait arrow, pointer camera movement, replay from the desolate image to the finished house, loaded footer imagery, contact links, reduced-motion behavior (including changing the preference live), and layouts at 320–1440px with no horizontal overflow, clipped headings, runtime errors, or failed assets.

## Scroll-controlled hero verification

The current hero was verified in Chrome: waiting at the top does not advance the animation; scrolling to 40% partially restores the house and reveals the headline; completing the scene shows the finished image, complete headline, and CTA; returning to the top reverses the sequence. The scroll button advances the scene and then continues to the studio section. Checks passed at 320×568, 375×667, 390×844, 768×1024, 844×390, 1024×768, and 1440×1000 without clipped text or horizontal overflow. Mobile navigation, live reduced-motion changes, reduced-motion reloads, route changes, and the new footer image were checked. The production build (including lint and type validation) passed, with no browser runtime errors or failed asset requests.

The current footer uses a full opaque sky-and-garden image. A second display of the same cached image is clipped to a registered SVG roofline mask and layered above the HTML wordmark. This puts the building in front of the letters without removing the sky from the original image. Desktop and mobile screenshots were inspected; checks passed at 320, 390, 768, 1024, and 1440 pixels, with matching image/mask positions and no overflow. A pixel comparison confirmed that showing or hiding the wordmark leaves the sampled facade unchanged while changing the sky region. The production build, lint/type validation, and browser error/asset checks passed.
