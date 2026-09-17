# DICKALO

Marketing site for DICKALO, an architecture and construction studio in Lagos.

Next.js 14 App Router, Sanity for content, Supabase for form submissions, Resend
for email, deployed on Vercel.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill it in — see below
npm run dev                    # http://localhost:3000
```

The site runs with an empty `.env.local`. Sanity, Supabase and Resend all
degrade gracefully: content falls back to the sample data in
`lib/constants.ts`, and form submissions log a warning instead of throwing. You
will see a complete site before you have configured anything.

---

## Environment variables

Copy `.env.example` to `.env.local`. Anything prefixed `NEXT_PUBLIC_` ships to
the browser — never put a secret behind that prefix.

| Variable | Required for | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, OG tags, sitemap | Full `https://` URL, or omit it to use `https://dickalo.com` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | CMS content | sanity.io/manage |
| `NEXT_PUBLIC_SANITY_DATASET` | CMS content | Usually `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | CMS content | Use exactly `2024-10-01`, or omit it to use that default |
| `SANITY_API_READ_TOKEN` | Draft previews only | Sanity → API → Tokens, Viewer role |
| `NEXT_PUBLIC_SUPABASE_URL` | Forms | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Forms | Same page |
| `SUPABASE_SERVICE_ROLE_KEY` | Reading submissions server-side | Same page — **secret** |
| `RESEND_API_KEY` | Email | resend.com/api-keys |
| `EMAIL_FROM` | Email | Must be a verified domain in Resend |
| `EMAIL_TO` | Email | Where enquiries land |
| `REVALIDATE_SECRET` | Sanity webhooks | `openssl rand -hex 32` |

---

## Setting up Sanity

1. **Create the project.**

   ```bash
   npx sanity@latest login
   npx sanity@latest projects create "DICKALO"
   ```

   Copy the project ID into `NEXT_PUBLIC_SANITY_PROJECT_ID`.

2. **Allow the site to talk to it.** In sanity.io/manage → API → CORS Origins,
   add `http://localhost:3000` and your production domain. Tick *Allow
   credentials* for both.

3. **Open the Studio.** It is mounted inside this app at
   [/studio](http://localhost:3000/studio). No separate deployment.

4. **Create the settings document first.** Studio → Site settings. It is a
   singleton; the structure config stops a second one being created.

5. **Wire up revalidation** so publishing updates the live site without a
   deploy. sanity.io/manage → API → Webhooks → Create webhook:

   - **URL** — `https://your-domain.com/api/revalidate?secret=<REVALIDATE_SECRET>`
   - **Trigger on** — Create, Update, Delete
   - **Filter** — `_type in ["project","service","teamMember","testimonial","siteSettings"]`
   - **Projection** — `{"_type": _type, "slug": slug.current}`

   Verify it with `GET /api/revalidate`, which reports whether the secret is set.

### Content model

| Type | Purpose |
| --- | --- |
| `project` | Portfolio entries. Drives `/projects` and every detail page. |
| `service` | The six services. Falls back to `lib/constants.ts`. |
| `teamMember` | People in the team section on `/about`. |
| `testimonial` | Client quotes on the homepage. |
| `siteSettings` | Singleton: contact details, headline numbers, default OG image. |

Field descriptions in the Studio are written for editors, not developers — they
say how long a summary should be and what makes a good one.

---

## Setting up Supabase

1. Create a project at supabase.com.

2. Run the schema. Open SQL Editor → New query, paste all of
   [`lib/supabase/schema.sql`](lib/supabase/schema.sql), run it. It is
   idempotent, so re-running it is safe.

3. Copy the URL and both keys from Settings → API into `.env.local`.

### What the schema does

Three tables — `contact_submissions`, `project_inquiries`,
`newsletter_subscribers` — all with Row Level Security on.

The important property: **the anon key can INSERT but cannot SELECT.** A leaked
public key cannot read your enquiry list or your mailing list. Everything that
reads runs server-side with the service role key, which bypasses RLS.

IP addresses are salted and hashed before storage (`hashIp` in
`lib/supabase/server.ts`) so repeat submitters can be rate-limited without
keeping anything identifying.

### Reading submissions

Table Editor → `contact_submissions`, or query the `enquiry_summary` view for
monthly counts by type and status.

---

## Setting up Resend

1. Add and verify your sending domain at resend.com/domains. DNS propagation
   takes anywhere from minutes to a few hours.
2. Create an API key → `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on the verified domain, and `EMAIL_TO` to
   wherever enquiries should land.

Two emails go out per enquiry: a notification to the studio with reply-to set to
the sender, and an acknowledgement to the visitor quoting back what they wrote.
If email is not configured, the enquiry is still stored and the visitor still
gets a success state — the failure is logged, not shown.

---

## Deploying to Vercel

```bash
npm i -g vercel
vercel link
vercel --prod
```

Or connect the Git repository at vercel.com/new, which is the better option
because it gives you preview deployments per branch.

**Before the first production deploy:**

1. Add every variable from `.env.example` under Settings → Environment
   Variables. Set `NEXT_PUBLIC_SITE_URL` to the real domain, not the
   `.vercel.app` one, or canonical URLs and OG tags will point at the wrong
   place.
2. Add the domain under Settings → Domains and point DNS at Vercel.
3. Add the production domain to Sanity's CORS origins.
4. Create the Sanity webhook with the production URL.

`vercel.json` pins functions to `fra1` (Frankfurt). Vercel has no African
region, and Frankfurt measures faster from Lagos than the US East default.

### Performance notes

The build is set up to hit 90+ on Lighthouse:

- **No WebGL.** The hero is a video. There is no Three.js in the project and no
  canvas — the visual effect costs zero JavaScript, and the 126 kB gzipped
  renderer chunk an earlier version shipped is gone entirely.
- Fonts are self-hosted through `next/font` with matched fallback metrics, so
  there is no layout shift when they swap.
- The hero poster is the LCP element. Optimise it hard — see
  [`public/ASSETS.md`](public/ASSETS.md).
- Images go through Sanity's CDN with AVIF/WebP and a real blur placeholder from
  the asset's LQIP metadata. Local images go through `next/image`, which needs
  **`sharp`** installed to emit AVIF and WebP — it is a dependency for that
  reason. Without it Next silently serves resized JPEG, which is roughly 35%
  larger. Measured on a project cover: 331 KB original, 76 KB AVIF, 90 KB WebP,
  102 KB JPEG.
- If images ever come back 0 bytes in development, clear `.next/cache/images`.
  Next caches optimisation *failures* alongside successes, so one bad encode
  keeps being served until the cache is dropped.

Run `npm run analyze` to see the bundle breakdown.

---

## Project structure

```
app/                    Routes, layouts, API handlers
  api/                  contact, subscribe, projects, revalidate
  projects/[slug]/      Project detail, statically generated
  studio/               Sanity Studio, mounted in-app
components/
  animations/           Reusable motion wrappers
  common/               Button, Card, Image, Container, SectionTitle
  forms/                Contact and subscribe, plus field primitives
  layout/               Navbar, MobileMenu, Footer, SmoothScrollProvider
  sections/             Page sections. Hero lives here.
config/                 Site facts, brand tokens, navigation. Copy lives here.
lib/
  animations/           GSAP helpers, ScrollTrigger wiring, Framer presets
  api/                  Zod schemas, email templates, error handling
  sanity/               Client, GROQ queries, image URL builder
  seo/                  Metadata, JSON-LD, sitemap
  supabase/             Browser client, server functions, SQL schema
sanity/                 Studio schemas and structure
styles/                 Global CSS, variables, fonts, typography, keyframes
```

### Where the copy lives

All user-facing text is in three files, so a copy review does not mean opening
forty components:

- `config/site.ts` — company facts, hero copy, brand statements
- `lib/constants.ts` — services, process, stats, and the `COPY` object holding
  every form label, error message and empty state
- `lib/api/validation.ts` — validation messages, written as sentences that say
  what to do rather than what went wrong

---

## Fonts

The site is set in **Trueno**, one family throughout. Hierarchy comes from
weight and size rather than from pairing two typefaces.

**Trueno is not in the repo.** It is not on Google Fonts and not published to
any webfont CDN — it ships as a download. So it is declared with plain
`@font-face` in `styles/fonts.css` rather than `next/font/local`, which would
fail the build whenever the files are absent and make the repo unclonable.

To add it, drop four woff2/woff pairs into `public/fonts` using the exact names
in [`public/fonts/README.md`](public/fonts/README.md). No code change needed.

Until then the site renders in **Plus Jakarta Sans**, self-hosted by `next/font`
and always present. The `@font-face` rules fail silently and the browser moves
to the next family in the stack. The fallback is size-adjusted in
`styles/fonts.css` to match Trueno's metrics, so adding the real files later
will not shift the layout.

### Type scale

Nothing exceeds `3.5rem`. An earlier scale topped out at `10rem`, which meant
the hero headline dominated the fold and every section below had to compete.
Adjacent display steps sit at roughly a 1.25 ratio so they read as related.

## Theme

The site is **light**: white ground, near-black type, gold as punctuation.

Components never address raw colour steps. They use semantic tokens, so
re-theming means editing one block in `tailwind.config.ts` rather than sweeping
thirty components:

| Token | Value | Used for |
| --- | --- | --- |
| `surface-base` | `#FFFFFF` | The page |
| `surface-raised` | `#FAFAF8` | Services, CTA |
| `surface-inverse` | `#0A0A09` | Stats band, footer |
| `content-primary` | `#0A0A09` | Headings, body |
| `content-secondary` | `#4A4A45` | Supporting copy |
| `content-muted` | `#66665F` | Captions, metadata |
| `content-accent` | `#7A6600` | Accent text |
| `line` | `rgba(10,10,9,.11)` | Hairlines |

**Black is the secondary colour**, and it does structural work rather than
decorative: two inverted bands, the stats section roughly two thirds down and
the footer, break a long white scroll into readable halves.

### The gold rule

`#FFD700` on white is 1.4:1. It cannot be text on a light surface, ever. So gold
is split by job:

- `gold` — a **fill**. Black sits on it at 14.1:1. Buttons, chips, rules.
- `content-accent` — `#7A6600`, the only gold legible as **text** on white
  (5.6:1).

On the inverted bands the brand gold comes back, because on `#0A0A09` it
measures 14.1:1. Components that appear on both grounds take a `tone` or
`inverse` prop rather than guessing — see `SubscribeForm` and `CountUpStat`.

## Animation architecture

Two systems, split by what drives them:

- **GSAP + ScrollTrigger** for anything driven by scroll position: the hero's
  drift and copy fade, scrub timelines.
- **Framer Motion** for anything driven by state: page transitions, the mobile
  menu, form feedback, `whileInView` reveals.

Lenis provides smooth scrolling and drives ScrollTrigger from the same
`requestAnimationFrame` loop, so scrub animations track content exactly rather
than lagging a frame behind.

Smooth scroll is **off** for reduced-motion users, on touch devices (native
momentum scrolling is better), and inside `/studio`.

Every animation respects `prefers-reduced-motion`. The pattern is to collapse
animations to near-zero duration rather than remove them, so any layout
depending on an animation's end state still lands there.

---

## Accessibility

- Semantic HTML throughout; one `h1` per page.
- **The gold rule.** The site is white, and `#FFD700` as text on white measures
  **1.4:1** — unusable, permanently. Gold is therefore a *fill* only (black on
  gold is 14.1:1), and accent *text* uses `content-accent` (`#7A6600`, 5.6:1).
  Never write `text-gold` on a light surface; `tailwind.config.ts` documents
  this and nothing in the linter will catch it for you.
- Every foreground/background pair used in the build was measured. All 18 pass
  their WCAG target, including both inverted bands. Focus rings are near-black
  on light surfaces and gold on the inverted ones.
- Full keyboard support. The mobile menu traps focus, restores it on close, and
  closes on Escape.
- Skip link to `#main`.
- Form errors are tied to their controls with `aria-describedby` and announced
  through live regions that are mounted before the error appears.
- The testimonial carousel stops auto-advancing on hover, on focus, and
  permanently once anyone uses a control.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build, then `next-sitemap` |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier, with Tailwind class sorting |
| `npm run analyze` | Build with the bundle analyzer |

---

## Suggested commits

If you are committing this in stages:

```
chore: scaffold Next.js 14 project with TypeScript and Tailwind
feat(config): add site config, brand tokens and navigation
feat(styles): add global styles, design tokens and keyframe animations
feat(cms): add Sanity schemas, GROQ queries and Studio at /studio
feat(db): add Supabase schema, clients and RLS policies
feat(api): add contact, subscribe, projects and revalidate routes
feat(ui): add common components and animation primitives
feat(hero): add cinematic hero with WebGL, video and GSAP text reveal
feat(sections): add featured projects, services, process, stats, testimonials
feat(forms): add contact and subscribe forms with Zod validation
feat(pages): add projects, services, about, team and contact pages
feat(seo): add metadata, JSON-LD, sitemap and robots
docs: add setup and deployment guide
```
